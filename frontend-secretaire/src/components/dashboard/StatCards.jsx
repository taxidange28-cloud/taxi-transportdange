import React from 'react';
import { Grid, Box, Typography } from '@mui/material';
import StatCard from './StatCard';
import { countMissionsByStatus, countMissionsEnCours } from '../../utils/missionHelpers';

/**
 * Conteneur des 3 cartes de statistiques
 * Calcule et affiche les compteurs
 */
function StatCards({ missions }) {
  // Calcul des statistiques
  const enAttente = countMissionsByStatus(missions, 'brouillon');
  const enCours = countMissionsEnCours(missions);
  const terminees = countMissionsByStatus(missions, 'terminee');

  return (
    <Box sx={{ mb: 4 }}>
      <Typography
        variant="h5"
        sx={{
          mb: 3,
          fontWeight: 'bold',
          color: 'primary.main',
        }}
      >
        📊 Vue d'ensemble
      </Typography>

      <Grid container spacing={3}>
        {/* En attente */}
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="En attente"
            count={enAttente}
            color="#FF9800"
            icon="🟠"
          />
        </Grid>

        {/* En cours */}
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="En cours"
            count={enCours}
            color="#FFC107"
            icon="🟡"
          />
        </Grid>

        {/* Terminées */}
        <Grid item xs={12} sm={12} md={4}>
          <StatCard
            title="Terminées"
            count={terminees}
            color="#4CAF50"
            icon="🟢"
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default StatCards;
