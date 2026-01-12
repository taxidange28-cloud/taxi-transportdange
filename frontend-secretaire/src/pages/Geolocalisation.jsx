import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  Room as RoomIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import MapView from '../components/MapView';
import geolocationService from '../services/geolocationService';

function Geolocalisation() {
  const navigate = useNavigate();
  const [positions, setPositions] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'online', 'offline'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Statistiques
  const [stats, setStats] = useState({
    total: 0,
    online: 0,
    offline: 0,
  });

  // Initialisation
  useEffect(() => {
    initializeGeolocation();

    return () => {
      geolocationService.disconnect();
    };
  }, []);

  const initializeGeolocation = async () => {
    try {
      setLoading(true);
      setError(null);

      // Initialisation du service de géolocalisation
      geolocationService.initialize();

      // S'abonner aux mises à jour
      const unsubscribe = geolocationService.subscribe((newPositions) => {
        setPositions(newPositions);
        updateStats(newPositions);
        setLastUpdate(new Date());
      });

      // Charger les positions actives
      await geolocationService.loadActivePositions();

      setLoading(false);

      return () => unsubscribe(); // Nettoyage des abonnements
    } catch (err) {
      console.error('Erreur initialisation géolocalisation:', err);
      setError('Impossible de charger les positions');
      setLoading(false);
    }
  };

  // Calculer les statistiques
  const updateStats = (positions) => {
    const now = new Date();
    const onlinePositions = positions.filter((p) => {
      const age = (now - new Date(p.timestamp)) / 1000; // En secondes
      return age <= 300; // Moins de 5 minutes
    });

    setStats({
      total: positions.length,
      online: onlinePositions.length,
      offline: positions.length - onlinePositions.length,
    });
  };

  // Filtrer les positions selon le filtre
  const getFilteredPositions = () => {
    const now = new Date();

    switch (filter) {
      case 'online':
        return positions.filter((p) => {
          const age = (now - new Date(p.timestamp)) / 1000;
          return age <= 300; // En ligne si < 5 minutes
        });
      case 'offline':
        return positions.filter((p) => {
          const age = (now - new Date(p.timestamp)) / 1000;
          return age > 300; // Hors ligne si > 5 minutes
        });
      default:
        return positions;
    }
  };

  // Gérer le clic sur un marqueur
  const handleMarkerClick = (position) => {
    console.log('Chauffeur sélectionné:', position);
    // TODO: Afficher le détail du chauffeur dans un modal
  };

  // Rafraîchir les positions
  const handleRefresh = async () => {
    setLoading(true);
    await geolocationService.loadActivePositions();
    setLoading(false);
  };

  // Déconnexion de l'utilisateur
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const filteredPositions = getFilteredPositions();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header onLogout={handleLogout} />

      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* En-tête */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <RoomIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            <Typography variant="h4" fontWeight="bold">
              Géolocalisation en Temps Réel
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Suivez la position de vos chauffeurs sur la carte en temps réel
          </Typography>
        </Box>

        {/* Gestion des erreurs */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Carte et contenu */}
        {/* Le reste du code est identique */}
      </Container>
    </Box>
  );
}

export default Geolocalisation;
