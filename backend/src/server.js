const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Importer les configurations
const { pool } = require('./config/database');
const { initializeFirebase } = require('./config/firebase');

// Importer les routes
const authRoutes = require('./routes/auth');
const missionRoutes = require('./routes/missions');
const chauffeurRoutes = require('./routes/chauffeurs');
const chauffeurMissionsRoutes = require('./routes/chauffeurs-missions');
const exportRoutes = require('./routes/export');
const initRoutes = require('./routes/initRoutes');
const adminRoutes = require('./routes/admin');

// Initialiser l'application
const app = express();
const server = http.createServer(app);

// Configuration CORS
const corsOptions = {
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3001', 'http://localhost:3002'],
  credentials: true,
};

// Initialiser Socket.io avec CORS
const io = socketIo(server, {
  cors: corsOptions,
});

// Middleware de sécurité
app.use(helmet({
  contentSecurityPolicy: false, // Désactiver pour permettre les connexions WebSocket
}));

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite de 100 requêtes par fenêtre
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard',
});

app.use('/api/', limiter);

// Stocker l'instance Socket.io pour l'utiliser dans les contrôleurs
app.set('io', io);

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/missions', missionRoutes);
app.use('/api/chauffeurs', chauffeurRoutes);
app.use('/api/chauffeurs', chauffeurMissionsRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', initRoutes);

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Transport DanGE API is running',
    timestamp: new Date().toISOString(),
  });
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Gestion globale des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Erreur serveur interne',
  });
});

// Configuration WebSocket
io.on('connection', (socket) => {
  console.log('✅ Client WebSocket connecté:', socket.id);

  socket.on('disconnect', () => {
    console.log('❌ Client WebSocket déconnecté:', socket.id);
  });

  // Événements personnalisés peuvent être ajoutés ici
  socket.on('join-room', (room) => {
    socket.join(room);
    console.log(`Client ${socket.id} a rejoint la room ${room}`);
  });
});

// Initialiser Firebase
// initializeFirebase();

// Démarrer le serveur
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log('');
  console.log('═══════════════════════════════════════════════');
  console.log('🚕 Transport DanGE - Backend API');
  console.log('═══════════════════════════════════════════════');
  console.log(`✅ Serveur démarré sur le port ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('═══════════════════════════════════════════════');
  console.log('');
});

// Gestion de l'arrêt propre
process.on('SIGTERM', () => {
  console.log('SIGTERM reçu, fermeture du serveur...');
  server.close(() => {
    console.log('Serveur fermé');
    pool.end(() => {
      console.log('Connexion PostgreSQL fermée');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT reçu, fermeture du serveur...');
  server.close(() => {
    console.log('Serveur fermé');
    pool.end(() => {
      console.log('Connexion PostgreSQL fermée');
      process.exit(0);
    });
  });
});

module.exports = { app, server, io };
