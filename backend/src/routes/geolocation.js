const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Location = require('../models/Location');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// Recevoir la position du chauffeur
router.post('/update', authMiddleware, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const userId = req.user.id;

    // Vérifier que c'est un chauffeur
    if (req.user.role !== 'chauffeur') {
      return res.status(403).json({ error: 'Accès réservé aux chauffeurs' });
    }

    // Validation des coordonnées
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Coordonnées manquantes' });
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({ error: 'Coordonnées invalides' });
    }

    // Créer ou mettre à jour la position
    const [location] = await Location.upsert(
      {
        userId,
        latitude,
        longitude,
        timestamp: new Date(),
      },
      { returning: true }
    );

    // Émettre via WebSocket aux secrétaires
    const io = req.app.get('io');
    if (io) {
      io.emit('location-update', {
        userId,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        timestamp: new Date(),
      });
    }

    res.json({
      success: true,
      message: 'Position mise à jour',
    });
  } catch (error) {
    console.error('Erreur update location:', error);
    res.status(500).json({ error: error.message });
  }
});

// Récupérer toutes les positions actives
router.get('/all', authMiddleware, async (req, res) => {
  try {
    // Vérifier que c'est un secrétaire ou admin
    if (req.user.role === 'chauffeur') {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    // Récupérer positions des 5 dernières minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const locations = await Location.findAll({
      where: {
        timestamp: {
          [Op.gte]: fiveMinutesAgo,
        },
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'nom', 'prenom'],
          where: { role: 'chauffeur' },
        },
      ],
      order: [['timestamp', 'DESC']],
    });

    // Grouper par userId (garder seulement la plus récente)
    const latestLocations = {};
    locations.forEach((loc) => {
      if (!latestLocations[loc.userId]) {
        latestLocations[loc.userId] = {
          userId: loc.userId,
          nom: loc.user.nom,
          prenom: loc.user.prenom,
          latitude: parseFloat(loc.latitude),
          longitude: parseFloat(loc.longitude),
          timestamp: loc.timestamp,
        };
      }
    });

    res.json(Object.values(latestLocations));
  } catch (error) {
    console.error('Erreur get locations:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
