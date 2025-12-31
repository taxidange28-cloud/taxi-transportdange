const { body, param, query, validationResult } = require('express-validator');

// Middleware pour vérifier les résultats de validation
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Validations pour les missions
const validateMission = [
  body('date_mission').isDate().withMessage('Date de mission invalide'),
  body('heure_prevue').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Heure prévue invalide (format HH:MM)'),
  body('client').trim().notEmpty().withMessage('Client requis'),
  body('type').isIn(['CPAM', 'Privé']).withMessage('Type doit être CPAM ou Privé'),
  body('adresse_depart').trim().notEmpty().withMessage('Adresse de départ requise'),
  body('adresse_arrivee').trim().notEmpty().withMessage('Adresse d\'arrivée requise'),
  body('chauffeur_id').optional().isInt().withMessage('ID chauffeur invalide'),
  body('vehicule_id').optional().isInt().withMessage('ID véhicule invalide'),
  body('notes').optional().trim(),
  validate
];

// Validations pour la mise à jour de mission
const validateMissionUpdate = [
  body('date_mission').optional().isDate().withMessage('Date de mission invalide'),
  body('heure_prevue').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Heure prévue invalide'),
  body('client').optional().trim().notEmpty().withMessage('Client requis'),
  body('type').optional().isIn(['CPAM', 'Privé']).withMessage('Type doit être CPAM ou Privé'),
  body('adresse_depart').optional().trim().notEmpty().withMessage('Adresse de départ requise'),
  body('adresse_arrivee').optional().trim().notEmpty().withMessage('Adresse d\'arrivée requise'),
  body('chauffeur_id').optional().isInt().withMessage('ID chauffeur invalide'),
  body('vehicule_id').optional().isInt().withMessage('ID véhicule invalide'),
  body('notes').optional().trim(),
  validate
];

// Validation pour le login
const validateLogin = [
  body('username').trim().notEmpty().withMessage('Username requis'),
  body('password').notEmpty().withMessage('Mot de passe requis'),
  validate
];

// Validation pour commentaire
const validateCommentaire = [
  body('commentaire').trim().notEmpty().withMessage('Commentaire requis'),
  validate
];

// Validation pour FCM token
const validateFcmToken = [
  body('fcm_token').trim().notEmpty().withMessage('Token FCM requis'),
  validate
];

// Validation pour les paramètres de date
const validateDateParams = [
  query('date').optional().isDate().withMessage('Date invalide'),
  query('debut').optional().isDate().withMessage('Date début invalide'),
  query('fin').optional().isDate().withMessage('Date fin invalide'),
  validate
];

module.exports = {
  validate,
  validateMission,
  validateMissionUpdate,
  validateLogin,
  validateCommentaire,
  validateFcmToken,
  validateDateParams,
};
