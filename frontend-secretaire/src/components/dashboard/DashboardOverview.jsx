import React, { useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import StatCards from './StatCards';

function DashboardOverview({ missions, chauffeurs, onMissionClick, loading }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const handleStatCardClick = (type) => {
    console.log('TEST 1 - StatCard cliqué:', type);
    setModalType(type);
    setModalOpen(true);
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ p: 2, bgcolor: '#e3f2fd', borderRadius: 1, mb: 2 }}>
        <strong>TEST 1 en cours</strong> - StatCards activé, Modal désactivé
      </Box>

      <StatCards missions={missions} onStatCardClick={handleStatCardClick} />
    </Box>
  );
}

export default DashboardOverview;
