import React from 'react';
import { Box, CircularProgress } from '@mui/material';

function DashboardOverview({ missions, chauffeurs, loading }) {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Calculs simples SANS appeler les helpers
  const brouillon = missions.filter(m => m.statut === 'brouillon').length;
  const enCours = missions.filter(m => ['envoyee', 'confirmee'].includes(m.statut)).length;
  const pec = missions.filter(m => m.statut === 'pec').length;
  const terminee = missions.filter(m => m.statut === 'terminee').length;

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ p: 3, bgcolor: '#fff3cd', borderRadius: 2, border: '2px solid #ffc107' }}>
        <h2>🧪 TEST 2 - Debug Mode</h2>
        <p><strong>Total missions:</strong> {missions.length}</p>
        <p><strong>Chauffeurs:</strong> {chauffeurs.length}</p>
        <hr />
        <p>🟠 En attente: {brouillon}</p>
        <p>🟡 En cours: {enCours}</p>
        <p>🔴 Prise en charge: {pec}</p>
        <p>🟢 Terminées: {terminee}</p>
        <hr />
        <p><em>StatCards et MissionsModal complètement désactivés</em></p>
      </Box>
    </Box>
  );
}

export default DashboardOverview;
