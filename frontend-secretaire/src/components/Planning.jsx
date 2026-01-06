import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  ButtonGroup,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Send as SendIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { format, addDays, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { envoyerMission, envoyerMissionsParDate, deleteMission } from '../services/api';

const getStatutInfo = (statut) => {
  const statutMap = {
    'brouillon': { label: 'Brouillon', color: '#BDBDBD', emoji: '⚪', textColor: '#424242' },
    'envoyee': { label: 'Envoyée', color: '#2196F3', emoji: '🔵', textColor: '#fff' },
    'confirmee': { label: 'Confirmée', color: '#FFC107', emoji: '🟡', textColor: '#424242' },
    'pec': { label: 'En cours', color: '#F44336', emoji: '🔴', textColor: '#fff' },
    'terminee': { label: 'Terminée', color: '#4CAF50', emoji: '🟢', textColor: '#fff' },
  };
  return statutMap[statut] || statutMap['brouillon'];
};

function Planning({ missions, chauffeurs, loading, onMissionClick, filters, onFiltersChange, onRefresh }) {
  const [sending, setSending] = useState({});

  const handleFilterChange = (type) => {
    const today = startOfDay(new Date());
    let date_debut, date_fin;

    switch (type) {
      case 'today':
        date_debut = format(today, 'yyyy-MM-dd');
        date_fin = format(today, 'yyyy-MM-dd');
        break;
      case 'tomorrow':
        const tomorrow = addDays(today, 1);
        date_debut = format(tomorrow, 'yyyy-MM-dd');
        date_fin = format(tomorrow, 'yyyy-MM-dd');
        break;
      case 'week':
        date_debut = format(today, 'yyyy-MM-dd');
        date_fin = format(addDays(today, 7), 'yyyy-MM-dd');
        break;
      default:
        date_debut = format(today, 'yyyy-MM-dd');
        date_fin = format(addDays(today, 7), 'yyyy-MM-dd');
    }

    onFiltersChange({ date_debut, date_fin });
  };

  const handleEnvoyerMission = async (e, missionId) => {
    e.stopPropagation();
    setSending({ ...sending, [missionId]: true });
    try {
      await envoyerMission(missionId);
      onRefresh();
    } catch (error) {
      console.error('Erreur envoi mission:', error);
      alert('Erreur lors de l\'envoi de la mission');
    }
    setSending({ ...sending, [missionId]: false });
  };

  const handleEnvoyerParDate = async (date) => {
    if (!window.confirm(`Envoyer toutes les missions du ${format(new Date(date), 'dd MMMM yyyy', { locale: fr })} ?`)) {
      return;
    }

    try {
      await envoyerMissionsParDate(date);
      onRefresh();
    } catch (error) {
      console.error('Erreur envoi missions par date:', error);
      alert('Erreur lors de l\'envoi des missions');
    }
  };

  const handleDeleteMission = async (e, missionId) => {
    e.stopPropagation();
    try {
      await deleteMission(missionId);
      onRefresh();
    } catch (error) {
      console.error('Erreur suppression mission:', error);
      alert('Erreur lors de la suppression');
    }
  };

  // Grouper les missions par date (en filtrant les dates invalides)
  const missionsByDate = missions.reduce((acc, mission) => {
    const date = mission.date_mission;
    
    // ✅ CORRECTION : Vérifier le type AVANT d'appeler .trim()
    if (!date || 
        typeof date !== 'string' || 
        date === 'null' || 
        date === 'undefined' || 
        date.trim() === '') {
      console.warn('⚠️ Mission sans date valide:', mission.id, mission.client, 'Date:', date);
      return acc;
    }
    
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(mission);
    return acc;
  }, {});

  const sortedDates = Object.keys(missionsByDate).sort();

  // Compter les missions en brouillon
  const brouillonCount = missions.filter(m => m.statut === 'brouillon').length;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
        <ButtonGroup variant="outlined" color="primary">
          <Button onClick={() => handleFilterChange('today')}>Aujourd'hui</Button>
          <Button onClick={() => handleFilterChange('tomorrow')}>Demain</Button>
          <Button onClick={() => handleFilterChange('week')}>Semaine</Button>
        </ButtonGroup>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {brouillonCount > 0 && (
            <Chip
              label={`${brouillonCount} brouillon(s)`}
              color="default"
              size="medium"
            />
          )}
          <IconButton onClick={onRefresh} color="primary">
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {sortedDates.length === 0 ? (
        <Card>
          <CardContent sx={{ py: 8, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              Aucune mission pour cette période
            </Typography>
          </CardContent>
        </Card>
      ) : (
        sortedDates.map((date) => {
          const dateMissions = missionsByDate[date];
          const brouillonMissions = dateMissions.filter(m => m.statut === 'brouillon');

          return (
            <Card key={date} sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" color="primary">
                    📅 {(() => {
                      try {
                        if (!date) return 'Date non définie';

                        // ✅ CORRECTION : Extraire seulement YYYY-MM-DD avant d'ajouter l'heure
                        const dateOnly = date.split('T')[0];
                        const dateObj = new Date(dateOnly + 'T00:00:00');
                        
                        if (isNaN(dateObj.getTime())) return 'Date invalide';
                        return format(dateObj, 'EEEE dd MMMM yyyy', { locale: fr });
                      } catch (e) {
                        console.error('Erreur date:', date, e);
                        return 'Date invalide';
                      }
                    })()}
                  </Typography>
                  {brouillonMissions.length > 0 && (
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      startIcon={<SendIcon />}
                      onClick={() => handleEnvoyerParDate(date)}
                    >
                      ✉️ Envoyer toutes les missions ({brouillonMissions.length})
                    </Button>
                  )}
                </Box>

                <Grid container spacing={2}>
                  {dateMissions.map((mission) => {
                    const statutInfo = getStatutInfo(mission.statut);
                    const canModify = mission.statut !== 'pec' && mission.statut !== 'terminee';

                    return (
                      <Grid item xs={12} md={6} lg={4} key={mission.id}>
                        <Card
                          sx={{
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: 4,
                            },
                            borderLeft: `4px solid ${statutInfo.color}`,
                          }}
                          onClick={() => onMissionClick(mission)}
                        >
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                  {mission.heure_prevue}
                                </Typography>
                                <Chip
                                  label={`${statutInfo.emoji} ${statutInfo.label}`}
                                  size="small"
                                  sx={{
                                    bgcolor: statutInfo.color,
                                    color: statutInfo.textColor,
                                    fontWeight: 'bold',
                                  }}
                                />
                              </Box>
                            </Box>

                            <Typography variant="body1" fontWeight="600" gutterBottom>
                              {mission.client}
                            </Typography>

                            <Chip
                              label={mission.type}
                              size="small"
                              color={mission.type === 'CPAM' ? 'info' : 'default'}
                              sx={{ mb: 1 }}
                            />

                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                              📍 {mission.adresse_depart}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              📍 {mission.adresse_arrivee}
                            </Typography>

                            <Typography variant="body2" color="primary" fontWeight="600">
                              👤 {mission.chauffeur_nom || 'Non assigné'}
                            </Typography>

                            {mission.commentaire_chauffeur && (
                              <Typography variant="body2" color="warning.main" sx={{ mt: 1, fontStyle: 'italic' }}>
                                💬 {mission.commentaire_chauffeur}
                              </Typography>
                            )}

                            <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                              {mission.statut === 'brouillon' && (
                                <Tooltip title="Envoyer la mission">
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={(e) => handleEnvoyerMission(e, mission.id)}
                                    disabled={sending[mission.id]}
                                  >
                                    <SendIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              {canModify && (
                                <Tooltip title="Modifier">
                                  <IconButton
                                    size="small"
                                    color="info"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onMissionClick(mission);
                                    }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              <Tooltip title="Supprimer">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={(e) => handleDeleteMission(e, mission.id)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </CardContent>
            </Card>
          );
        })
      )}
    </Box>
  );
}

export default Planning;
