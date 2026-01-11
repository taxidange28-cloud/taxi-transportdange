import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

/**
 * Carte de statistique individuelle cliquable
 */
function StatCard({ title, count, color, icon, onClick }) {
  return (
    <Card
      onClick={onClick}
      sx={{
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        borderLeft: `4px solid ${color}`,
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
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

        {/* Indication cliquable */}
        <Typography
          variant="caption"
          sx={{
            color: 'text.disabled',
            fontSize: '0.7rem',
            mt: 1,
            display: 'block',
          }}
        >
          Cliquer pour voir le détail
        </Typography>
      </CardContent>
    </Card>
  );
}

export default StatCard;
