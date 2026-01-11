import React from 'react';
import { Grid, Box, Typography } from '@mui/material';
import StatCard from './StatCard';

/**
 * Conteneur des 4 cartes de statistiques
 */
function StatCards({ missions, onStatCardClick }) {
  // Calcul des statistiques
  const enAttente = missions.filter(m => m.statut === 'brouillon').length;
  const enCours = missions.filter(m => ['envoyee', 'confirmee'].includes(m.statut)).length;
  const pec = missions.filter(m => m.statut === 'pec').length;
  const terminees = missions.filter(m => m.statut === 'terminee').length;

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
```

---

## ✅ **RÉCAPITULATIF**

**3 fichiers à remplacer :**

1. `frontend-secretaire/src/components/dashboard/DashboardOverview.jsx`
2. `frontend-secretaire/src/components/dashboard/StatCard.jsx`
3. `frontend-secretaire/src/components/dashboard/StatCards.jsx`

**Commit message suggéré :**
```
fix: Add useCallback to prevent infinite re-render loop in Dashboard
