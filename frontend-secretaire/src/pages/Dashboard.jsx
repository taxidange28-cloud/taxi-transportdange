import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Button,
  Alert,
  Snackbar,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Planning from '../components/Planning';
import FormulaireMission from '../components/FormulaireMission';
import PopupDetails from '../components/PopupDetails';
import AlertSonButton from '../components/AlertSonButton';
import { getMissions, getChauffeurs, exportExcel } from '../services/api';
import socketService from '../services/socket';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'secretaire') {
      navigate('/login');
      return;
    }

    loadData();
    setupSocketListeners();

    return () => {
      removeSocketListeners();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadMissions();
  }, [filters]);

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
      console.error('Erreur chargement données:', error);
      showSnackbar('Erreur de chargement', 'error');
      setLoading(false);
    }
  };

  const loadMissions = async () => {
    try {
      const response = await getMissions(filters);
      setMissions(response.data);
    } catch (error) {
      console.error('Erreur chargement missions:', error);
    }
  };

  const setupSocketListeners = () => {
    socketService.on('mission:nouvelle', handleMissionUpdate);
    socketService.on('mission:envoyee', handleMissionUpdate);
    socketService.on('missions:envoyees', handleMissionsUpdate);
    socketService.on('mission:modifiee', handleMissionUpdate);
    socketService.on('mission:supprimee', handleMissionDelete);
    socketService.on('mission:confirmee', handleMissionUpdate);
    socketService.on('mission:pec', handleMissionUpdate);
    socketService.on('mission:terminee', handleMissionUpdate);
    socketService.on('mission:commentaire', handleMissionUpdate);
  };

  const removeSocketListeners = () => {
    socketService.off('mission:nouvelle', handleMissionUpdate);
    socketService.off('mission:envoyee', handleMissionUpdate);
    socketService.off('missions:envoyees', handleMissionsUpdate);
    socketService.off('mission:modifiee', handleMissionUpdate);
    socketService.off('mission:supprimee', handleMissionDelete);
    socketService.off('mission:confirmee', handleMissionUpdate);
    socketService.off('mission:pec', handleMissionUpdate);
    socketService.off('mission:terminee', handleMissionUpdate);
    socketService.off('mission:commentaire', handleMissionUpdate);
  };

  const handleMissionUpdate = (mission) => {
    setMissions((prev) => {
      const index = prev.findIndex((m) => m.id === mission.id);
      if (index >= 0) {
        const newMissions = [...prev];
        newMissions[index] = mission;
        return newMissions;
      }
      return [mission, ...prev];
    });

    // Si c'est la mission actuellement affichée, mettre à jour
    if (selectedMission?.id === mission.id) {
      setSelectedMission(mission);
    }
  };

  const handleMissionsUpdate = (updatedMissions) => {
    loadMissions();
    showSnackbar(`${updatedMissions.length} mission(s) envoyée(s)`, 'success');
  };

  const handleMissionDelete = (data) => {
    setMissions((prev) => prev.filter((m) => m.id !== data.id));
    if (selectedMission?.id === data.id) {
      setOpenDetails(false);
      setSelectedMission(null);
    }
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleMissionCreated = () => {
    loadMissions();
    setOpenForm(false);
    showSnackbar('Mission créée avec succès', 'success');
  };

  const handleMissionUpdated = () => {
    loadMissions();
    setOpenDetails(false);
    setEditMode(false);
    setSelectedMission(null);
    showSnackbar('Mission modifiée avec succès', 'success');
  };

  const handleMissionDeleted = () => {
    loadMissions();
    setOpenDetails(false);
    setSelectedMission(null);
    showSnackbar('Mission supprimée', 'info');
  };

  const handleOpenDetails = (mission) => {
    setSelectedMission(mission);
    setOpenDetails(true);
    setEditMode(false);
  };

  const handleExport = async () => {
    try {
      const response = await exportExcel(filters.date_debut, filters.date_fin);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `missions_${filters.date_debut}_${filters.date_fin}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showSnackbar('Export Excel réussi', 'success');
    } catch (error) {
      console.error('Erreur export:', error);
      showSnackbar('Erreur lors de l\'export', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    socketService.disconnect();
    navigate('/login');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header onLogout={handleLogout} />
      
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={{ mb: 3, display: 'flex', gap: 2, justifyContent: 'space-between' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setOpenForm(true)}
            size="large"
          >
            ➕ Nouvelle Mission
          </Button>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          color="primary"
          onClick={handleExport}
        >
          📊 Export Excel
        </Button>
        
        <AlertSonButton />
      </Box>
    </Box>

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

      <FormulaireMission
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSuccess={handleMissionCreated}
        chauffeurs={chauffeurs}
      />

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
