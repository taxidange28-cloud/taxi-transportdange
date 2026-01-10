import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

/**
 * Carte de statistique individuelle (réutilisable)
 * Affiche un compteur avec icône et label
 */
function StatCard({ title, count, color, icon }) {
  return (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        borderLeft: `4px solid ${color}`,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <CardContent sx={{ textAlign: 'center', py: 3 }}>
        {/* Icône */}
        <Typography
          variant="h2"
          sx={{
            fontSize: '3rem',
            mb: 1,
          }}
        >
          {icon}
        </Typography>

        {/* Compteur */}
        <Typography
          variant="h3"
          sx={{
            fontWeight: 'bold',
            color: color,
            mb: 0.5,
          }}
        >
          {count}
        </Typography>

        {/* Label */}
        <Typography
          variant="body1"
          sx={{
            color: 'text.secondary',
            fontWeight: 500,
          }}
        >
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default StatCard;
