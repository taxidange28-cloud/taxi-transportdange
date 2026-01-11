import React from 'react';
import { Grid, Box, Typography } from '@mui/material';
import StatCard from './StatCard';

function StatCards({ missions }) {
  const enAttente = missions.filter(m => m.statut === 'brouillon').length;
  const enCours = missions.filter(m => ['envoyee', 'confirmee'].includes(m.statut)).length;
  const pec = missions.filter(m => m.statut === 'pec').length;
  const terminees = missions.filter(m => m.statut === 'terminee').length;

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
        📊 Vue d'ensemble (TEST 4 - Pas de clic)
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="En attente" count={enAttente} color="#FF9800" icon="🟠" />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="En cours" count={enCours} color="#FFC107" icon="🟡" />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Prise en charge" count={pec} color="#F44336" icon="🔴" />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Terminées" count={terminees} color="#4CAF50" icon="🟢" />
        </Grid>
      </Grid>
    </Box>
  );
}

export default StatCards;
