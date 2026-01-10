import React from 'react';
import { Box, CircularProgress } from '@mui/material';
import StatCards from './StatCards';
import MissionsEnAttente from './MissionsEnAttente';
import MissionsEnCours from './MissionsEnCours';

/**
 * Composant principal du Dashboard Overview
 * Affiche les statistiques et les missions en attente/en cours
 */
function DashboardOverview({ missions, chauffeurs, onMissionClick, onEnvoyer, loading }) {
  // Spinner pendant le chargement
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 4 }}>
      {/* Statistiques */}
      <StatCards missions={missions} />

      {/* Missions en attente */}
      <MissionsEnAttente
        missions={missions}
        chauffeurs={chauffeurs}
        onMissionClick={onMissionClick}
        onEnvoyer={onEnvoyer}
      />

      {/* Missions en cours */}
      <MissionsEnCours
        missions={missions}
        chauffeurs={chauffeurs}
        onMissionClick={onMissionClick}
      />
    </Box>
  );
}

export default DashboardOverview;
