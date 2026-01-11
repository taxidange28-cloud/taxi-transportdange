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
 * Affiche les statistiques cliquables
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
          icon:  '🟡',
        };
      case 'pec': 
        return {
          title:  'Missions en prise en charge',
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
          title:  '',
          color: '#000',
          icon: '',
        };
    }
  };

  const modalInfo = getModalInfo();
  const filteredMissions = getFilteredMissions();

  return (
    <Box sx={{ mb: 4 }}>
      {/* ========== TEST :  COMPOSANTS COMMENTÉS ========== */}
      
      {/* Statistiques cliquables - COMMENTÉ POUR TEST */}
      {/* <StatCards missions={missions} onStatCardClick={handleStatCardClick} /> */}

      {/* Affichage de debug temporaire */}
      <Box sx={{ p: 3, bgcolor:  '#f5f5f5', borderRadius: 2, mb: 3 }}>
        <h3>🧪 Dashboard Overview - Mode Test</h3>
        <p>✅ Missions chargées :  {missions.length}</p>
        <p>✅ Chauffeurs : {chauffeurs.length}</p>
        <p>⚠️ StatCards et MissionsModal désactivés temporairement</p>
      </Box>

      {/* Modal avec liste des missions - COMMENTÉ POUR TEST */}
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
