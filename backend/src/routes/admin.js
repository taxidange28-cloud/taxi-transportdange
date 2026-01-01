const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { pool } = require('../config/database');
const adminAuth = require('../middleware/adminAuth');

// Toutes les routes admin sont protégées
router.use(adminAuth);

// GET /api/admin/users - Récupérer tous les utilisateurs
router.get('/users', async (req, res) => {
  try {
    // Récupérer les secrétaires et l'admin depuis la table utilisateurs
    const utilisateursResult = await pool.query(
      'SELECT id, username, role, created_at, NULL as nom FROM utilisateurs WHERE role IN ($1, $2) ORDER BY created_at DESC',
      ['secretaire', 'admin']
    );

    // Récupérer les chauffeurs depuis la table chauffeurs
    const chauffeursResult = await pool.query(
      'SELECT id, username, nom, created_at, $1 as role FROM chauffeurs ORDER BY created_at DESC',
      ['chauffeur']
    );

    // Combiner les résultats
    const allUsers = [
      ...utilisateursResult.rows.map(u => ({
        id: u.id,
        username: u.username,
        nom: u.nom || u.username,
        role: u.role,
        created_at: u.created_at,
        table: 'utilisateurs'
      })),
      ...chauffeursResult.rows.map(c => ({
        id: c.id,
        username: c.username,
        nom: c.nom,
        role: 'chauffeur',
        created_at: c.created_at,
        table: 'chauffeurs'
      }))
    ];

    // Trier par date de création
    allUsers.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json(allUsers);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/admin/users - Créer un nouvel utilisateur
router.post('/users', async (req, res) => {
  try {
    const { username, password, nom, role } = req.body;

    // Validation
    if (!username || !password || !role) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    if (!['secretaire', 'chauffeur', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Rôle invalide' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insérer selon le rôle
    if (role === 'chauffeur') {
      const result = await pool.query(
        'INSERT INTO chauffeurs (username, password, nom) VALUES ($1, $2, $3) RETURNING id, username, nom, created_at',
        [username, hashedPassword, nom || username]
      );
      res.status(201).json({
        ...result.rows[0],
        role: 'chauffeur',
        table: 'chauffeurs'
      });
    } else {
      const result = await pool.query(
        'INSERT INTO utilisateurs (username, password, role) VALUES ($1, $2, $3) RETURNING id, username, role, created_at',
        [username, hashedPassword, role]
      );
      res.status(201).json({
        ...result.rows[0],
        nom: username,
        table: 'utilisateurs'
      });
    }
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    if (error.code === '23505') {
      res.status(400).json({ error: 'Ce nom d\'utilisateur existe déjà' });
    } else {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
});

// PUT /api/admin/users/:id/password - Changer le mot de passe
router.put('/users/:id/password', async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword, table } = req.body;

    if (!newPassword) {
      return res.status(400).json({ error: 'Nouveau mot de passe requis' });
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour selon la table
    const tableName = table === 'chauffeurs' ? 'chauffeurs' : 'utilisateurs';
    const result = await pool.query(
      `UPDATE ${tableName} SET password = $1 WHERE id = $2 RETURNING id`,
      [hashedPassword, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({ message: 'Mot de passe modifié avec succès' });
  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/admin/users/:id - Modifier un utilisateur
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, nom, table } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Nom d\'utilisateur requis' });
    }

    // Mettre à jour selon la table
    if (table === 'chauffeurs') {
      const result = await pool.query(
        'UPDATE chauffeurs SET username = $1, nom = $2 WHERE id = $3 RETURNING id, username, nom, created_at',
        [username, nom || username, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }
      res.json({ ...result.rows[0], role: 'chauffeur', table: 'chauffeurs' });
    } else {
      const result = await pool.query(
        'UPDATE utilisateurs SET username = $1 WHERE id = $2 RETURNING id, username, role, created_at',
        [username, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }
      res.json({ ...result.rows[0], nom: username, table: 'utilisateurs' });
    }
  } catch (error) {
    console.error('Erreur lors de la modification de l\'utilisateur:', error);
    if (error.code === '23505') {
      res.status(400).json({ error: 'Ce nom d\'utilisateur existe déjà' });
    } else {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
});

// DELETE /api/admin/users/:id - Supprimer un utilisateur
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { table } = req.query;

    // Vérifier qu'on ne supprime pas le dernier admin
    if (table === 'utilisateurs') {
      const adminCount = await pool.query(
        'SELECT COUNT(*) FROM utilisateurs WHERE role = $1',
        ['admin']
      );
      if (parseInt(adminCount.rows[0].count) === 1) {
        const user = await pool.query('SELECT role FROM utilisateurs WHERE id = $1', [id]);
        if (user.rows[0]?.role === 'admin') {
          return res.status(400).json({ error: 'Impossible de supprimer le dernier administrateur' });
        }
      }
    }

    // Supprimer selon la table
    const tableName = table === 'chauffeurs' ? 'chauffeurs' : 'utilisateurs';
    const result = await pool.query(
      `DELETE FROM ${tableName} WHERE id = $1 RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/admin/stats - Statistiques globales
router.get('/stats', async (req, res) => {
  try {
    // Nombre total d'utilisateurs
    const utilisateursCount = await pool.query('SELECT COUNT(*) FROM utilisateurs');
    const chauffeursCount = await pool.query('SELECT COUNT(*) FROM chauffeurs');
    
    // Nombre de secrétaires
    const secretairesCount = await pool.query(
      'SELECT COUNT(*) FROM utilisateurs WHERE role = $1',
      ['secretaire']
    );
    
    // Nombre de missions
    const missionsCount = await pool.query('SELECT COUNT(*) FROM missions');
    
    // Chiffre d'affaires total
    const caResult = await pool.query(
      'SELECT COALESCE(SUM(montant), 0) as total FROM missions WHERE statut = $1',
      ['terminee']
    );

    res.json({
      totalUsers: parseInt(utilisateursCount.rows[0].count) + parseInt(chauffeursCount.rows[0].count),
      secretaires: parseInt(secretairesCount.rows[0].count),
      chauffeurs: parseInt(chauffeursCount.rows[0].count),
      missions: parseInt(missionsCount.rows[0].count),
      chiffreAffaires: parseFloat(caResult.rows[0].total)
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
