import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

function StatCard({ title, count, color, icon, onClick }) {
  return (
    <Card
      onClick={onClick}
      sx={{
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        borderLeft: `4px solid ${color}`,
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
        '&:hover':  {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        },
      }}
    >
      <CardContent sx={{ textAlign: 'center', py:  1.5 }}>
        <Typography variant="h2" sx={{ fontSize: '1.5rem', mb: 0.5 }}>
          {icon}
        </Typography>
        <Typography variant="h3" sx={{ fontWeight: 'bold', color: color, mb: 0.25, fontSize: '2rem' }}>
          {count}
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.875rem' }}>
          {title}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.65rem', mt: 0.5, display: 'block' }}>
          Cliquer pour voir le détail
        </Typography>
      </CardContent>
    </Card>
  );
}

export default StatCard;
