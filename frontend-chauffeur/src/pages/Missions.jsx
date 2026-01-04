import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Alert,
  Snackbar,
  CircularProgress,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import ListeMissions from '../components/ListeMissions';
import { getMissionsChauffeur } from '../services/api';
import socketService from '../services/socket';
import { onMessageListener } from '../services/notifications';
import { format, addDays } from 'date-fns';

function Missions() {
  const navigate = useNavigate();
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [user, setUser] = useState(null);

  // useCallback pour éviter de recréer la fonction à chaque render
  const loadMissions = useCallback(async (chauffeurId) => {
    try {
      // Charger les missions pour aujourd'hui et les 7 prochains jours
      const today = format(new Date(), 'yyyy-MM-dd');
      const nextWeek = format(addDays(new Date(), 7), 'yyyy-MM-dd');

      const response = await getMissionsChauffeur(chauffeurId, {
        date_debut: today,
        date_fin: nextWeek,
      });
      
      setMissions(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement missions:', error);
      setSnackbar({ open: true, message: 'Erreur de chargement', severity: 'error' });
      setLoading(false);
    }
  }, []); // Pas de dépendances car utilise seulement les paramètres

  const showSnackbar = useCallback((message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const handleMissionUpdate = useCallback((mission) => {
    // Vérifier si c'est une mission pour ce chauffeur
    if (!user || mission.chauffeur_id !== user.id) {
      return;
    }

    setMissions((prev) => {
      const index = prev.findIndex((m) => m.id === mission.id);
      if (index >= 0) {
        const newMissions = [...prev];
        newMissions[index] = mission;
        return newMissions;
      }
      // Si la mission est envoyée (pas brouillon), l'ajouter
      if (mission.statut !== 'brouillon') {
        return [mission, ...prev];
      }
      return prev;
    });

    showSnackbar('Mission mise à jour', 'info');
  }, [user, showSnackbar]);

  const handleMissionsUpdate = useCallback(() => {
    if (user) {
      loadMissions(user.id);
    }
    showSnackbar('Nouvelles missions reçues', 'success');
  }, [user, loadMissions, showSnackbar]);

  const handleMissionDelete = useCallback((data) => {
    setMissions((prev) => prev.filter((m) => m.id !== data.id));
    showSnackbar('Mission supprimée', 'warning');
  }, [showSnackbar]);

  const setupSocketListeners = useCallback(() => {
    socketService.on('mission:nouvelle', handleMissionUpdate);
    socketService.on('mission:envoyee', handleMissionUpdate);
    socketService.on('missions:envoyees', handleMissionsUpdate);
    socketService.on('mission:modifiee', handleMissionUpdate);
    socketService.on('mission:supprimee', handleMissionDelete);
  }, [handleMissionUpdate, handleMissionsUpdate, handleMissionDelete]);

  const removeSocketListeners = useCallback(() => {
    socketService.off('mission:nouvelle', handleMissionUpdate);
    socketService.off('mission:envoyee', handleMissionUpdate);
    socketService.off('missions:envoyees', handleMissionsUpdate);
    socketService.off('mission:modifiee', handleMissionUpdate);
    socketService.off('mission:supprimee', handleMissionDelete);
  }, [handleMissionUpdate, handleMissionsUpdate, handleMissionDelete]);

  const setupNotificationListener = useCallback(() => {
    onMessageListener((payload) => {
      console.log('Notification reçue:', payload);
      
      // Recharger les missions
      if (user) {
        loadMissions(user.id);
      }

      // Afficher un snackbar
      const title = payload.notification?.title || 'Nouvelle notification';
      const body = payload.notification?.body || '';
      showSnackbar(`${title}: ${body}`, 'info');
    });
  }, [user, loadMissions, showSnackbar]);

  // useEffect pour initialiser l'utilisateur (une seule fois)
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData || userData.role !== 'chauffeur') {
      navigate('/login');
      return;
    }

    setUser(userData);
  }, [navigate]);

  // useEffect pour charger les missions quand user change
  useEffect(() => {
    if (user) {
      loadMissions(user.id);
      setupSocketListeners();
      setupNotificationListener();

      return () => {
        removeSocketListeners();
      };
    }
  }, [user, loadMissions, setupSocketListeners, setupNotificationListener, removeSocketListeners]);

  const handleMissionUpdated = useCallback(() => {
    if (user) {
      loadMissions(user.id);
    }
  }, [user, loadMissions]);

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    socketService.disconnect();
    navigate('/login');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header user={user} onLogout={handleLogout} />
      
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
          📋 Mes Missions
        </Typography>

        <ListeMissions
          missions={missions}
          onMissionUpdated={handleMissionUpdated}
        />
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Missions;
