const express = require('express');
const router = express.Router();
const MissionController = require('../controllers/missionController');
const { verifyToken, requireSecretaire, requireChauffeur } = require('../middleware/auth');
const { validateMission, validateMissionUpdate, validateCommentaire } = require('../middleware/validation');
const { runMigration } = require('../../migrate');

// Migration endpoint - REMOVE AFTER RUNNING MIGRATION IN PRODUCTION
// This endpoint is intentionally unauthenticated for one-time migration convenience
// TODO: Remove this endpoint after migration is complete
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
// Route pour envoyer une mission au chauffeur avec notification
router.post('/:id/envoyer', verifyToken, async (req, res) => {
  try {
    const { id } = req. params;
    
    // Récupérer la mission
    const [mission] = await pool. query(
      'SELECT * FROM missions WHERE id = ?',
      [id]
    );
    
    if (mission.length === 0) {
      return res.status(404).json({ message: 'Mission non trouvée' });
    }
    
    const missionData = mission[0];
    
    // Vérifier qu'un chauffeur est assigné
    if (! missionData.chauffeur_id) {
      return res. status(400).json({ message: 'Aucun chauffeur assigné à cette mission' });
    }
    
    // Mettre à jour le statut à "envoyee"
    await pool.query(
      'UPDATE missions SET statut = ? WHERE id = ?',
      ['envoyee', id]
    );
    
    // TODO:  Envoyer notification push au chauffeur (Firebase/OneSignal)
    // Pour l'instant, on simule le succès
    console.log(`Mission ${id} envoyée au chauffeur ${missionData.chauffeur_id}`);
    
    res.json({ 
      message: 'Mission envoyée au chauffeur avec succès',
      mission: { ...missionData, statut: 'envoyee' }
    });
    
  } catch (error) {
    console.error('Erreur envoi mission:', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'envoi de la mission' });
  }
});
module.exports = router;
