/**
 * Fonctions utilitaires pour la gestion des missions
 * Transport DanGE - Frontend Secrétaire
 */

/**
 * Compter les missions par statut
 */
export const countMissionsByStatus = (missions, status) => {
  if (!Array.isArray(missions)) return 0;
  return missions.filter(m => m.statut === status).length;
};

/**
 * Compter les missions en cours (envoyée, confirmée, prise en charge)
 */
export const countMissionsEnCours = (missions) => {
  if (!Array.isArray(missions)) return 0;
  return missions.filter(m => 
    ['envoyee', 'confirmee', 'pec'].includes(m.statut)
  ).length;
};

/**
 * Filtrer les missions en attente (brouillon)
 */
export const filterMissionsEnAttente = (missions) => {
  if (!Array.isArray(missions)) return [];
  return missions.filter(m => m.statut === 'brouillon');
};

/**
 * Filtrer les missions en cours
 */
export const filterMissionsEnCours = (missions) => {
  if (!Array.isArray(missions)) return [];
  return missions.filter(m => 
    ['envoyee', 'confirmee', 'pec'].includes(m.statut)
  );
};

/**
 * Obtenir la couleur selon le statut
 */
export const getStatusColor = (statut) => {
  const colors = {
    'brouillon': '#FF9800',   // Orange
    'envoyee': '#2196F3',     // Bleu
    'confirmee': '#FFC107',   // Jaune
    'pec': '#4CAF50',         // Vert
    'terminee': '#9E9E9E'     // Gris
  };
  return colors[statut] || '#000000';
};

/**
 * Obtenir le libellé selon le statut
 */
export const getStatusLabel = (statut) => {
  const labels = {
    'brouillon': 'Brouillon',
    'envoyee': 'Envoyée',
    'confirmee': 'Confirmée',
    'pec': 'Prise en charge',
    'terminee': 'Terminée'
  };
  return labels[statut] || statut;
};

/**
 * Obtenir l'icône selon le statut
 */
export const getStatusIcon = (statut) => {
  const icons = {
    'brouillon': '🟠',
    'envoyee': '🔵',
    'confirmee': '🟡',
    'pec': '🟢',
    'terminee': '⚫'
  };
  return icons[statut] || '⚪';
};

/**
 * Vérifier si une mission est récente (moins de 5 minutes)
 */
export const isMissionRecente = (mission) => {
  if (!mission.created_at && !mission.updated_at) return false;
  
  const dateRef = new Date(mission.updated_at || mission.created_at);
  const now = new Date();
  const diffMinutes = (now - dateRef) / (1000 * 60);
  
  return diffMinutes < 5;
};

/**
 * Trier les missions par date et heure
 */
export const sortMissionsByDateTime = (missions) => {
  if (!Array.isArray(missions)) return [];
  
  return [...missions].sort((a, b) => {
    // Tri par date
    const dateCompare = a.date_mission.localeCompare(b.date_mission);
    if (dateCompare !== 0) return dateCompare;
    
    // Si même date, tri par heure
    return a.heure_prevue.localeCompare(b.heure_prevue);
  });
};

/**
 * Vérifier si une mission est assignée
 */
export const isMissionAssignee = (mission) => {
  return mission.chauffeur_id !== null && mission.chauffeur_id !== undefined;
};

/**
 * Obtenir le nom complet du chauffeur ou "Non assigné"
 */
export const getChauffeurName = (mission, chauffeurs = []) => {
  if (!isMissionAssignee(mission)) {
    return 'Non assigné';
  }
  
  const chauffeur = chauffeurs.find(c => c.id === mission.chauffeur_id);
  return chauffeur ? chauffeur.nom : 'Chauffeur inconnu';
};
