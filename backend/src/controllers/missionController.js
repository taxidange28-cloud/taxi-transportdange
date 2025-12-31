const Mission = require('../models/Mission');
const NotificationService = require('../services/notificationService');

class MissionController {
  // Créer une mission (secrétaire)
  static async creer(req, res) {
    try {
      const missionData = req.body;
      const mission = await Mission.create(missionData);

      // Si la mission est envoyée immédiatement, envoyer notification
      if (missionData.statut === 'envoyee') {
        await NotificationService.notifierNouvelleMission(mission);
      }

      // Émettre événement WebSocket
      const io = req.app.get('io');
      if (io) {
        io.emit('mission:nouvelle', mission);
      }

      res.status(201).json(mission);
    } catch (error) {
      console.error('Erreur création mission:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // Lister les missions (secrétaire)
  static async lister(req, res) {
    try {
      const filters = {
        date_debut: req.query.date_debut,
        date_fin: req.query.date_fin,
        chauffeur_id: req.query.chauffeur_id,
        statut: req.query.statut,
      };

      const missions = await Mission.findAll(filters);
      res.json(missions);
    } catch (error) {
      console.error('Erreur liste missions:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // Récupérer une mission
  static async obtenir(req, res) {
    try {
      const mission = await Mission.findById(req.params.id);
      
      if (!mission) {
        return res.status(404).json({ error: 'Mission non trouvée' });
      }

      res.json(mission);
    } catch (error) {
      console.error('Erreur récupération mission:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // Modifier une mission (secrétaire)
  static async modifier(req, res) {
    try {
      const missionId = req.params.id;
      const mission = await Mission.findById(missionId);

      if (!mission) {
        return res.status(404).json({ error: 'Mission non trouvée' });
      }

      // Vérifier que la mission n'est pas en PEC ou terminée
      if (mission.statut === 'pec' || mission.statut === 'terminee') {
        return res.status(400).json({ 
          error: 'Impossible de modifier une mission en cours ou terminée' 
        });
      }

      const updateData = req.body;
      const missionUpdated = await Mission.update(missionId, updateData);

      // Si la mission est envoyée, notifier le chauffeur
      if (mission.statut === 'envoyee' || mission.statut === 'confirmee') {
        await NotificationService.notifierMissionModifiee(missionUpdated);
      }

      // Émettre événement WebSocket
      const io = req.app.get('io');
      if (io) {
        io.emit('mission:modifiee', missionUpdated);
      }

      res.json(missionUpdated);
    } catch (error) {
      console.error('Erreur modification mission:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // Supprimer une mission (secrétaire)
  static async supprimer(req, res) {
    try {
      const missionId = req.params.id;
      const mission = await Mission.findById(missionId);

      if (!mission) {
        return res.status(404).json({ error: 'Mission non trouvée' });
      }

      // Notifier le chauffeur si la mission était envoyée
      if (mission.statut !== 'brouillon' && mission.chauffeur_id) {
        await NotificationService.notifierMissionSupprimee(mission.chauffeur_id, mission);
      }

      await Mission.delete(missionId);

      // Émettre événement WebSocket
      const io = req.app.get('io');
      if (io) {
        io.emit('mission:supprimee', { id: missionId });
      }

      res.json({ message: 'Mission supprimée' });
    } catch (error) {
      console.error('Erreur suppression mission:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // Envoyer une mission individuelle (secrétaire)
  static async envoyer(req, res) {
    try {
      const missionId = req.params.id;
      const mission = await Mission.envoyer(missionId);

      if (!mission) {
        return res.status(400).json({ error: 'Mission déjà envoyée ou introuvable' });
      }

      // Envoyer notification
      await NotificationService.notifierNouvelleMission(mission);

      // Émettre événement WebSocket
      const io = req.app.get('io');
      if (io) {
        io.emit('mission:envoyee', mission);
      }

      res.json(mission);
    } catch (error) {
      console.error('Erreur envoi mission:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // Envoyer toutes les missions d'une date (secrétaire)
  static async envoyerParDate(req, res) {
    try {
      const { date } = req.body;

      if (!date) {
        return res.status(400).json({ error: 'Date requise' });
      }

      const missions = await Mission.envoyerParDate(date);

      // Envoyer notifications
      await NotificationService.notifierMissionsEnvoyees(missions);

      // Émettre événement WebSocket
      const io = req.app.get('io');
      if (io) {
        io.emit('missions:envoyees', missions);
      }

      res.json({ 
        message: `${missions.length} mission(s) envoyée(s)`,
        missions 
      });
    } catch (error) {
      console.error('Erreur envoi missions par date:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // Lister les missions d'un chauffeur (chauffeur)
  static async listerParChauffeur(req, res) {
    try {
      const chauffeurId = parseInt(req.params.id);

      // Vérifier que le chauffeur accède bien à ses propres missions
      if (req.user.role === 'chauffeur' && req.user.userId !== chauffeurId) {
        return res.status(403).json({ error: 'Accès non autorisé' });
      }

      const filters = {
        date_debut: req.query.date_debut,
        date_fin: req.query.date_fin,
      };

      const missions = await Mission.findByChauffeur(chauffeurId, filters);
      res.json(missions);
    } catch (error) {
      console.error('Erreur liste missions chauffeur:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // Confirmer réception d'une mission (chauffeur)
  static async confirmer(req, res) {
    try {
      const missionId = req.params.id;
      const mission = await Mission.confirmer(missionId);

      if (!mission) {
        return res.status(400).json({ error: 'Mission déjà confirmée ou introuvable' });
      }

      // Émettre événement WebSocket
      const io = req.app.get('io');
      if (io) {
        io.emit('mission:confirmee', mission);
      }

      res.json(mission);
    } catch (error) {
      console.error('Erreur confirmation mission:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // Prise en charge (chauffeur)
  static async priseEnCharge(req, res) {
    try {
      const missionId = req.params.id;
      const mission = await Mission.priseEnCharge(missionId);

      if (!mission) {
        return res.status(400).json({ error: 'Mission déjà en cours ou introuvable' });
      }

      // Émettre événement WebSocket
      const io = req.app.get('io');
      if (io) {
        io.emit('mission:pec', mission);
      }

      res.json(mission);
    } catch (error) {
      console.error('Erreur prise en charge:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // Terminer une mission (chauffeur)
  static async terminer(req, res) {
    try {
      const missionId = req.params.id;
      const mission = await Mission.terminer(missionId);

      if (!mission) {
        return res.status(400).json({ error: 'Mission déjà terminée ou introuvable' });
      }

      // Émettre événement WebSocket
      const io = req.app.get('io');
      if (io) {
        io.emit('mission:terminee', mission);
      }

      res.json(mission);
    } catch (error) {
      console.error('Erreur terminer mission:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // Ajouter un commentaire (chauffeur)
  static async ajouterCommentaire(req, res) {
    try {
      const missionId = req.params.id;
      const { commentaire } = req.body;

      const mission = await Mission.ajouterCommentaire(missionId, commentaire);

      if (!mission) {
        return res.status(404).json({ error: 'Mission non trouvée' });
      }

      // Émettre événement WebSocket
      const io = req.app.get('io');
      if (io) {
        io.emit('mission:commentaire', mission);
      }

      res.json(mission);
    } catch (error) {
      console.error('Erreur ajout commentaire:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
}

module.exports = MissionController;
