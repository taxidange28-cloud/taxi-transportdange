import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Button,
  Alert,
  Snackbar,
  Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Planning from '../components/Planning';
import FormulaireMission from '../components/FormulaireMission';
import PopupDetails from '../components/PopupDetails';
import DashboardOverview from '../components/dashboard/DashboardOverview';
import { getMissions, getChauffeurs, exportExcel } from '../services/api';
import socketService from '../services/socket';
import { format } from 'date-fns';

function Dashboard() {
  const navigate = useNavigate();
  const [missions, setMissions] = useState([]);
  const [chauffeurs, setChauffeurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [selectedMission, setSelectedMission] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [filters, setFilters] = useState({
    date_debut: format(new Date(), 'yyyy-MM-dd'),
    date_fin: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
  });

  // Afficher une notification
  const showSnackbar = useCallback((message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  // Charger les missions depuis l'API
  const loadMissions = useCallback(async () => {
    try {
      const response = await getMissions(filters);
      setMissions(response.data);
    } catch (error) {
      console.error('Error loading missions:', error);
    }
  }, [filters]);

  // Mettre à jour une mission via WebSocket
  const handleMissionUpdate = useCallback((mission) => {
    setMissions((prev) => {
      const index = prev.findIndex((m) => m.id === mission.id);
      if (index >= 0) {
        const newMissions = [...prev];
        newMissions[index] = mission;
        return newMissions;
      }
      return [mission, ...prev];
    });

    setSelectedMission((prev) => {
      if (prev?. id === mission.id) {
        return mission;
      }
      return prev;
    });
  }, []);

  // Gérer l'envoi multiple de missions
  const handleMissionsUpdate = useCallback((updatedMissions) => {
    loadMissions();
    showSnackbar(`${updatedMissions.length} mission(s) envoyée(s)`, 'success');
  }, [loadMissions, showSnackbar]);

  // Supprimer une mission
  const handleMissionDelete = useCallback((data) => {
    setMissions((prev) => prev.filter((m) => m.id !== data.id));
    setSelectedMission((prev) => {
      if (prev?.id === data.id) {
        setOpenDetails(false);
        return null;
      }
      return prev;
    });
  }, []);

  // Configurer les listeners WebSocket
  const setupSocketListeners = useCallback(() => {
    socketService.on('mission:nouvelle', handleMissionUpdate);
    socketService.on('mission:envoyee', handleMissionUpdate);
    socketService.on('missions:envoyees', handleMissionsUpdate);
    socketService.on('mission:modifiee', handleMissionUpdate);
    socketService.on('mission:supprimee', handleMissionDelete);
    socketService.on('mission:confirmee', handleMissionUpdate);
    socketService.on('mission:pec', handleMissionUpdate);
    socketService.on('mission:terminee', handleMissionUpdate);
    socketService.on('mission:commentaire', handleMissionUpdate);
  }, [handleMissionUpdate, handleMissionsUpdate, handleMissionDelete]);

  // Retirer les listeners WebSocket
  const removeSocketListeners = useCallback(() => {
    socketService.off('mission:nouvelle', handleMissionUpdate);
    socketService.off('mission:envoyee', handleMissionUpdate);
    socketService.off('missions:envoyees', handleMissionsUpdate);
    socketService.off('mission:modifiee', handleMissionUpdate);
    socketService.off('mission:supprimee', handleMissionDelete);
    socketService. off('mission:confirmee', handleMissionUpdate);
    socketService.off('mission:pec', handleMissionUpdate);
    socketService.off('mission:terminee', handleMissionUpdate);
    socketService.off('mission:commentaire', handleMissionUpdate);
  }, [handleMissionUpdate, handleMissionsUpdate, handleMissionDelete]);

  // Initialisation :  vérifier authentification et charger données (UNE SEULE FOIS)
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user. role !== 'secretaire') {
      navigate('/login');
      return;
    }

    const loadData = async () => {
      try {
        const [missionsRes, chauffeursRes] = await Promise.all([
          getMissions(filters),
          getChauffeurs(),
        ]);
        setMissions(missionsRes.data);
        setChauffeurs(chauffeursRes.data);
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        showSnackbar('Erreur de chargement', 'error');
        setLoading(false);
      }
    };

    loadData();
    setupSocketListeners();

    return () => {
      removeSocketListeners();
    };
  }, [navigate, setupSocketListeners, removeSocketListeners, showSnackbar]); // ✅ PAS filters !

  // Recharger les missions quand les filtres changent
  useEffect(() => {
    if (! loading) {
      loadMissions();
    }
  }, [filters, loadMissions, loading]);

  // Fermer la notification
  const handleCloseSnackbar = () => {
    setSnackbar({ ... snackbar, open: false });
  };

  // Callback après création de mission
  const handleMissionCreated = () => {
    loadMissions();
    setOpenForm(false);
    showSnackbar('Mission créée avec succès', 'success');
  };

  // Callback après modification de mission
  const handleMissionUpdated = () => {
    loadMissions();
    setOpenDetails(false);
    setEditMode(false);
    setSelectedMission(null);
    showSnackbar('Mission modifiée avec succès', 'success');
  };

  // Callback après suppression de mission
  const handleMissionDeleted = () => {
    loadMissions();
    setOpenDetails(false);
    setSelectedMission(null);
    showSnackbar('Mission supprimée', 'info');
  };

  // Ouvrir le popup de détails d'une mission
  const handleOpenDetails = (mission) => {
    setSelectedMission(mission);
    setOpenDetails(true);
    setEditMode(false);
  };

  // Exporter les missions en Excel
  const handleExport = async () => {
    try {
      const response = await exportExcel(filters. date_debut, filters.date_fin);
      const url = window.URL.createObjectURL(new Blob([response. data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `missions_${filters.date_debut}_${filters.date_fin}. xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showSnackbar('Export Excel réussi', 'success');
    } catch (error) {
      console.error('Export error:', error);
      showSnackbar('Erreur lors de l\'export', 'error');
    }
  };

  // Déconnexion
  const handleLogout = () => {
    localStorage. removeItem('token');
    localStorage.removeItem('user');
    socketService.disconnect();
    navigate('/login');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header onLogout={handleLogout} />
      
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Dashboard avec statistiques */}
        <DashboardOverview
          missions={missions}
          chauffeurs={chauffeurs}
          onMissionClick={handleOpenDetails}
          loading={loading}
        />

        {/* Séparateur visuel */}
        <Divider sx={{ my: 4 }} />

        {/* Boutons d'action */}
        <Box sx={{ mb: 3, display: 'flex', gap:  2, justifyContent: 'space-between' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setOpenForm(true)}
            size="large"
          >
            ➕ Nouvelle Mission
          </Button>
          
          <Button
            variant="outlined"
            color="primary"
            onClick={handleExport}
          >
            📊 Export Excel
          </Button>
        </Box>

        {/* Planning des missions */}
        <Planning
          missions={missions}
          chauffeurs={chauffeurs}
          loading={loading}
          onMissionClick={handleOpenDetails}
          filters={filters}
          onFiltersChange={setFilters}
          onRefresh={loadMissions}
        />
      </Container>

      {/* Formulaire de création de mission */}
      <FormulaireMission
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSuccess={handleMissionCreated}
        chauffeurs={chauffeurs}
      />

      {/* Popup de détails d'une mission */}
      <PopupDetails
        open={openDetails}
        onClose={() => {
          setOpenDetails(false);
          setEditMode(false);
          setSelectedMission(null);
        }}
        mission={selectedMission}
        chauffeurs={chauffeurs}
        editMode={editMode}
        onEditModeChange={setEditMode}
        onSuccess={handleMissionUpdated}
        onDelete={handleMissionDeleted}
      />

      {/* Notifications toast */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Dashboard;
