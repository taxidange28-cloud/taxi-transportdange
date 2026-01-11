import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

/**
 * TEST 4 - StatCard SANS onClick
 */
function StatCard({ title, count, color, icon }) {
  return (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        borderLeft: `4px solid ${color}`,
        transition: 'transform 0.2s',
      }}
    >
      <CardContent sx={{ textAlign: 'center', py: 3 }}>
        {/* Icône */}
        <Typography variant="h2" sx={{ fontSize: '3rem', mb: 1 }}>
          {icon}
        </Typography>

        {/* Compteur */}
        <Typography variant="h3" sx={{ fontWeight: 'bold', color: color, mb: 0.5 }}>
          {count}
        </Typography>

        {/* Label */}
        <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
          {title}
        </Typography>

        {/* Note de test */}
        <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.7rem', mt: 1, display: 'block' }}>
          (TEST 4 - Clic désactivé)
        </Typography>
      </CardContent>
    </Card>
  );
}

export default StatCard;
