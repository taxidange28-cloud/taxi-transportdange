
import React from 'react';
import { Box, CircularProgress } from '@mui/material';
import StatCards from './StatCards';

/**
 * Composant principal du Dashboard Overview
 * Affiche les statistiques et les missions en attente/en cours
 */
function DashboardOverview({ missions, chauffeurs, onMissionClick, onRefresh, loading }) {
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

      {/* Les listes de missions seront ajoutées en Phase 3 et 4 */}
    </Box>
  );
}

export default DashboardOverview;
```

---

## ✅ **PHASE 2 TERMINÉE !**

**Fichiers créés :**
- ✅ `StatCard.jsx` (60 lignes - composant réutilisable)
- ✅ `StatCards.jsx` (55 lignes - les 3 compteurs)
- ✅ `DashboardOverview.jsx` (mis à jour avec StatCards)

**Résultat actuel :**
```
┌──────────────────────────────────────┐
│ 📊 Vue d'ensemble                    │
│                                      │
│ ┌────────┐ ┌────────┐ ┌────────┐   │
│ │  🟠    │ │  🟡    │ │  🟢    │   │
│ │   5    │ │   3    │ │  12    │   │
│ │En att. │ │En cours│ │Term.   │   │
│ └────────┘ └────────┘ └────────┘   │
└──────────────────────────────────────┘
