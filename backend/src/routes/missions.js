const express = require('express');
const router = express.Router();
const MissionController = require('../controllers/missionController');
const { verifyToken, requireSecretaire, requireChauffeur } = require('../middleware/auth');
const { validateMission, validateMissionUpdate, validateCommentaire } = require('../middleware/validation');
const { runMigration } = require('../../migrate');

// Migration endpoint
router.get('/migrate', async (req, res) => {
  try {
    const result = await runMigration();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Routes secrétaire
router.post('/', verifyToken, requireSecretaire, validateMission, MissionController.creer);
router.get('/', verifyToken, requireSecretaire, MissionController.lister);
router.get('/:id', verifyToken, MissionController.obtenir);
router.put('/:id', verifyToken, requireSecretaire, validateMissionUpdate, MissionController.modifier);
router.delete('/:id', verifyToken, requireSecretaire, MissionController.supprimer);
router.post('/:id/envoyer', verifyToken, requireSecretaire, MissionController.envoyer);
router.post('/envoyer-date', verifyToken, requireSecretaire, MissionController.envoyerParDate);

// Routes chauffeur
router.post('/:id/confirmer', verifyToken, requireChauffeur, MissionController.confirmer);
router.post('/:id/pec', verifyToken, requireChauffeur, MissionController.priseEnCharge);
router.post('/:id/terminer', verifyToken, requireChauffeur, MissionController.terminer);
router.post('/:id/commentaire', verifyToken, validateCommentaire, MissionController.ajouterCommentaire);

module.exports = router;
