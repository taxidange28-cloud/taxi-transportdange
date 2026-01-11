import React, { useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import StatCards from './StatCards';
import MissionsModal from './MissionsModal';
import {
  filterMissionsEnAttente,
  filterMissionsEnCours,
  filterMissionsPEC,
} from '../../utils/missionHelpers';

/**
 * Composant principal du Dashboard Overview
 * TEST 1 : SEULEMENT StatCards activé
 */
function DashboardOverview({ missions, chauffeurs, onMissionClick, loading }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);

  // Spinner pendant le chargement
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Gestion du clic sur un StatCard
  const handleStatCardClick = (type) => {
    console.log('🔍 TEST 1 - StatCard cliqué:', type);
    setModalType(type);
    setModalOpen(true);
  };

  // Fermer le modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setModalType(null);
  };

  // Obtenir les missions filtrées selon le type
  const getFilteredMissions = () => {
    switch (modalType) {
      case 'brouillon':
        return filterMissionsEnAttente(missions);
      case 'en_cours':
        return filterMissionsEnCours(missions);
      case 'pec':
        return filterMissionsPEC(missions);
      case 'terminee':
        return missions.filter(m => m.statut === 'terminee');
      default:
        return [];
    }
  };

  // Obtenir les infos du modal selon le type
  const getModalInfo = () => {
    switch (modalType) {
      case 'brouillon':
        return {
          title: 'Missions en attente',
          color: '#FF9800',
          icon: '🟠',
        };
      case 'en_cours':
        return {
          title: 'Missions en cours',
          color: '#FFC107',
          icon: '🟡',
        };
      case 'pec':
        return {
          title: 'Missions en prise en charge',
          color: '#F44336',
          icon: '🔴',
        };
      case 'terminee':
        return {
          title: 'Missions terminées',
          color: '#4CAF50',
          icon: '🟢',
        };
      default:
        return {
          title: '',
          color: '#000',
          icon: '',
        };
    }
  };

  const modalInfo = getModalInfo();
  const filteredMissions = getFilteredMissions();

  return (
    <Box sx={{ mb: 4 }}>
      {/* ========== TEST 1 : SEULEMENT STATCARDS ========== */}
      
      <Box sx={{ p: 2, bgcolor: '#e3f2fd', borderRadius: 1, mb: 2 }}>
        <strong>🧪 TEST 1 en cours</strong> - StatCards activé, Modal désactivé
      </Box>

      {/* Statistiques cliquables - ACTIVÉ */}
      <StatCards missions={missions} onStatCardClick={handleStatCardClick} />

      {/* Modal avec liste des missions - DÉSACTIVÉ POUR TEST */}
      {/* <MissionsModal
        open={modalOpen}
        onClose={handleCloseModal}
        missions={filteredMissions}
        chauffeurs={chauffeurs}
        title={modalInfo.title}
        color={modalInfo.color}
        icon={modalInfo.icon}
        onMissionClick={onMissionClick}
        type={modalType}
      /> */}
    </Box>
  );
}

export default DashboardOverview;
```

**1.5** Scrollez en bas

**1.6** Dans "Commit message" écrivez :
```
TEST 1 - Enable StatCards only
