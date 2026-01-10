import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  Typography,
  Box,
  Chip,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {
  sortMissionsByDateTime,
  getChauffeurName,
  getStatusIcon,
} from '../../utils/missionHelpers';

/**
 * Modal affichant la liste des missions d'un statut donné
 */
function MissionsModal({ open, onClose, missions, chauffeurs, title, color, icon, onMissionClick }) {
  // Trier les missions
  const sortedMissions = sortMissionsByDateTime(missions);

  const handleMissionClick = (mission) => {
    onClose(); // Fermer le modal
    onMissionClick(mission); // Ouvrir PopupDetails
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderTop: `4px solid ${color}`,
        },
      }}
    >
      {/* Titre */}
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: color }}>
            {icon} {title}
          </Typography>
          <Chip
            label={sortedMissions.length}
            size="small"
            sx={{
              bgcolor: color,
              color: title === 'Missions en cours' ? '#000' : '#fff',
              fontWeight: 'bold',
            }}
          />
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      {/* Liste des missions */}
      <DialogContent sx={{ p: 0 }}>
        {sortedMissions.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              Aucune mission {title.toLowerCase()}
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {sortedMissions.map((mission, index) => {
              const chauffeurNom = getChauffeurName(mission, chauffeurs);
              const dateFormatted = new Date(mission.date_mission).toLocaleDateString('fr-FR', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              });

              return (
                <React.Fragment key={mission.id}>
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => handleMissionClick(mission)}
                      sx={{
                        py: 2,
                        px: 3,
                        '&:hover': {
                          bgcolor: `${color}10`,
                        },
                      }}
                    >
                      <Box sx={{ width: '100%' }}>
                        {/* Ligne 1 : Date • Heure • Client */}
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 'bold',
                            mb: 0.5,
                          }}
                        >
                          {dateFormatted} • {mission.heure_prevue} • {mission.client}
                        </Typography>

                        {/* Ligne 2 : Adresses */}
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mb: 0.5,
                            fontSize: '0.85rem',
                          }}
                        >
                          📍 {mission.adresse_depart} → {mission.adresse_arrivee}
                        </Typography>

                        {/* Ligne 3 : Chauffeur + Type + Statut */}
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              color: 'primary.main',
                              fontSize: '0.85rem',
                            }}
                          >
                            👤 {chauffeurNom}
                          </Typography>

                          <Chip
                            label={mission.type}
                            size="small"
                            color={mission.type === 'CPAM' ? 'info' : 'default'}
                            sx={{ height: '20px', fontSize: '0.7rem' }}
                          />

                          {mission.statut !== 'brouillon' && mission.statut !== 'terminee' && (
                            <Chip
                              label={`${getStatusIcon(mission.statut)} ${mission.statut}`}
                              size="small"
                              sx={{
                                height: '20px',
                                fontSize: '0.7rem',
                                bgcolor: color,
                                color: title === 'Missions en cours' ? '#000' : '#fff',
                              }}
                            />
                          )}
                        </Box>
                      </Box>
                    </ListItemButton>
                  </ListItem>
                  {index < sortedMissions.length - 1 && <Divider />}
                </React.Fragment>
              );
            })}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default MissionsModal;
