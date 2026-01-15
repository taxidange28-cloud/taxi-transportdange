const jwt = require('jsonwebtoken');
const Utilisateur = require('../models/Utilisateur');
const Chauffeur = require('../models/Chauffeur');

// Middleware pour vérifier le token JWT
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token non fourni' });
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Token invalide ou expiré' });
    }
  } catch (error) {
    console.error('Erreur middleware auth:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Middleware pour vérifier que l'utilisateur est une secrétaire
const requireSecretaire = (req, res, next) => {
  if (req.user.role !== 'secretaire') {
    return res.status(403).json({ error: 'Accès réservé à la secrétaire' });
  }
  next();
};

// Middleware pour vérifier que l'utilisateur est un chauffeur
const requireChauffeur = (req, res, next) => {
  if (req.user.role !== 'chauffeur') {
    return res.status(403).json({ error: 'Accès réservé aux chauffeurs' });
  }
  next();
};

// Middleware pour charger les informations utilisateur complètes
const loadUserData = async (req, res, next) => {
  try {
    if (req.user.role === 'secretaire') {
      const utilisateur = await Utilisateur.findById(req.user.userId);
      req.userData = utilisateur;
    } else if (req.user.role === 'chauffeur') {
      const chauffeur = await Chauffeur.findById(req.user.userId);
      req.userData = chauffeur;
    }
    next();
  } catch (error) {
    console.error('Erreur chargement données utilisateur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

module.exports = {
  verifyToken,
  requireSecretaire,
  requireChauffeur,
  loadUserData,
};
