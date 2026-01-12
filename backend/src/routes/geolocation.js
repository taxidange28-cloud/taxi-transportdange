const express = require('express');
const router = express.Router();
const Location = require('../models/Location');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.post('/update', async (req, res) => {
  try {
    const { latitude, longitude, accuracy, speed, heading } = req.body;
    const chauffeurId = req.user.id;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude et longitude requises' });
    }

    if (req.user.role !== 'chauffeur') {
      return res.status(403).json({ error: 'Réservé aux chauffeurs' });
    }

    const location = await Location.create({
      chauffeur_id: chauffeurId,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      accuracy: accuracy ? parseInt(accuracy) : null,
      speed: speed ? parseFloat(speed) : null,
      heading: heading ? parseFloat(heading) : null,
      is_active: true,
    });

    const io = req.app.get('io');
    io.emit('geolocation:update', {
      chauffeur_id: chauffeurId,
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy,
      timestamp: location.timestamp,
    });

    res.json({ 
      success: true, 
      message: 'Position enregistrée',
      location 
    });
  } catch (error) {
    console.error('Erreur update position:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/active', async (req, res) => {
  try {
    if (req.user.role !== 'secretaire') {
      return res.status(403).json({ error: 'Réservé aux secrétaires' });
    }

    const positions = await Location.getAllActivePositions();
    res.json({ positions });
  } catch (error) {
    console.error('Erreur récupération positions:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/chauffeur/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== 'secretaire' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const position = await Location.getLatestByChauffeurId(id);
    
    if (!position) {
      return res.status(404).json({ error: 'Aucune position trouvée' });
    }

    res.json({ position });
  } catch (error) {
    console.error('Erreur récupération position chauffeur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/history/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    if (req.user.role !== 'secretaire') {
      return res.status(403).json({ error: 'Réservé aux secrétaires' });
    }

    const history = await Location.getHistory(id, limit);
    res.json({ history });
  } catch (error) {
    console.error('Erreur récupération historique:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/disconnect', async (req, res) => {
  try {
    const chauffeurId = req.user.id;

    if (req.user.role !== 'chauffeur') {
      return res.status(403).json({ error: 'Réservé aux chauffeurs' });
    }

    await Location.setInactive(chauffeurId);

    const io = req.app.get('io');
    io.emit('geolocation:chauffeur-offline', { chauffeur_id: chauffeurId });

    res.json({ success: true, message: 'Position marquée inactive' });
  } catch (error) {
    console.error('Erreur déconnexion:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
