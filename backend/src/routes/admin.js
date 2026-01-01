const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/adminAuth');

// Toutes les routes admin sont protégées
router.use(requireAdmin);

// Gestion des utilisateurs
router.get('/users', AdminController.getAllUsers);
router.post('/users', AdminController.createUser);
router.put('/users/:id', AdminController.updateUser);
router.put('/users/:id/password', AdminController.changeUserPassword);
router.delete('/users/:id', AdminController.deleteUser);

// Statistiques
router.get('/stats', AdminController.getStats);

module.exports = router;
