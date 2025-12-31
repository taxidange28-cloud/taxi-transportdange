import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import CarteMission from './CarteMission';

function ListeMissions({ missions, onMissionUpdated }) {
  if (missions.length === 0) {
    return (
      <Card>
        <CardContent sx={{ py: 8, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Aucune mission assignée pour le moment
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Les nouvelles missions apparaîtront ici dès qu'elles vous seront envoyées
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Grouper les missions par date
  const missionsByDate = missions.reduce((acc, mission) => {
    const date = mission.date_mission;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(mission);
    return acc;
  }, {});

  const sortedDates = Object.keys(missionsByDate).sort();

  return (
    <Box>
      {sortedDates.map((date) => {
        const dateMissions = missionsByDate[date];

        return (
          <Box key={date} sx={{ mb: 4 }}>
            <Typography 
              variant="h6" 
              color="primary" 
              sx={{ mb: 2, fontWeight: 'bold' }}
            >
              📅 {format(new Date(date + 'T00:00:00'), 'EEEE dd MMMM yyyy', { locale: fr })}
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {dateMissions.map((mission) => (
                <CarteMission
                  key={mission.id}
                  mission={mission}
                  onUpdated={onMissionUpdated}
                />
              ))}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

export default ListeMissions;
