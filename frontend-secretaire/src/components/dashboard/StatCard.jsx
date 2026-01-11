import React from 'react';
import { Grid, Box, Typography } from '@mui/material';
import StatCard from './StatCard';
import { countMissionsByStatus, countMissionsEnCours, filterMissionsPEC } from '../../utils/missionHelpers';

/**
 * Conteneur des 4 cartes de statistiques
 */
function StatCards({ missions, onStatCardClick }) {
  // Calcul des statistiques
  const enAttente = countMissionsByStatus(missions, 'brouillon');
  const enCours = countMissionsEnCours(missions);
  const pec = filterMissionsPEC(missions).length;
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
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="En attente"
            count={enAttente}
            color="#FF9800"
            icon="🟠"
            onClick={() => onStatCardClick('brouillon')}
          />
        </Grid>

        {/* En cours */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="En cours"
            count={enCours}
            color="#FFC107"
            icon="🟡"
            onClick={() => onStatCardClick('en_cours')}
          />
        </Grid>

        {/* Prise en charge */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Prise en charge"
            count={pec}
            color="#F44336"
            icon="🔴"
            onClick={() => onStatCardClick('pec')}
          />
        </Grid>

        {/* Terminées */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Terminées"
            count={terminees}
            color="#4CAF50"
            icon="🟢"
            onClick={() => onStatCardClick('terminee')}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default StatCards;
