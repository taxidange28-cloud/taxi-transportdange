const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcrypt');
require('dotenv').config();

const { pool } = require('./config/database');
const { initializeFirebase } = require('./config/firebase');

const authRoutes = require('./routes/auth');
const missionRoutes = require('./routes/missions');
const chauffeurRoutes = require('./routes/chauffeurs');
const chauffeurMissionsRoutes = require('./routes/chauffeurs-missions');
const exportRoutes = require('./routes/export');
const initRoutes = require('./routes/initRoutes');
const adminRoutes = require('./routes/admin');
const notificationRoutes = require('./routes/notifications');
const geolocationRoutes = require('./routes/geolocation');
const { runMigrations } = require('./utils/runMigrations');

const app = express();
const server = http.createServer(app);
const chauffeursManageRoutes = require('./routes/chauffeurs-manage');

const corsOptions = {
  origin:  process.env.CORS_ORIGINS?.split(',') || [
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:5173',
    'http://localhost:3000',
    'https://transport-dange-frontend.onrender.com',
    'https://transport-dange-chauffeur.onrender.com',
    'https://taxi-transportdange.onrender.com',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

const io = socketIo(server, {
  cors: corsOptions,
});

// Sécurité via HelmetJS
app.use(helmet({
  contentSecurityPolicy: false,
}));

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Rate limiters par route (CORRIGÉ pour GPS 5 minutes)

// Rate limiter strict pour le login (éviter les attaques brute force)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 tentatives de login max
  message: 'Trop de tentatives de connexion, veuillez réessayer dans 15 minutes.',
  skipSuccessfulRequests: true, // Ne compte pas les connexions réussies
  standardHeaders: true,
  legacyHeaders: false,
});

// ✅ Rate limiter souple pour le GPS (CORRIGÉ :  10 positions / 30 min)
const gpsLimiter = rateLimit({
  windowMs:  30 * 60 * 1000, // ✅ 30 minutes (au lieu de 15)
  max: 10, // ✅ 10 positions max (au lieu de 5)
  message: 'Trop de mises à jour GPS, veuillez patienter.',
  standardHeaders: true,
  legacyHeaders: false,
  handler:  (req, res) => {
    console.warn(`⚠️ Rate limit GPS atteint pour IP ${req.ip}`);
    res.status(429).json({
      success: false,
      error: 'Trop de mises à jour GPS, veuillez patienter.',
      retryAfter: 300, // 5 minutes
    });
  },
});

// Rate limiter général (très souple)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // 300 requêtes en 15 min (beaucoup plus souple)
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.',
  standardHeaders: true,
  legacyHeaders:  false,
});

// Application des limiters par route (AVANT les autres routes)
app.use('/api/auth/login', loginLimiter);
app.use('/api/geolocation/position', gpsLimiter);
app.use('/api/geolocation/update', gpsLimiter);
app.use('/api/', generalLimiter);

// Configuration de Socket.io
app.set('io', io);

// Initialisation des routes
app.use('/api/auth', authRoutes);
app.use('/api/missions', missionRoutes);
app.use('/api/chauffeurs', chauffeurRoutes);
app.use('/api/chauffeurs', chauffeurMissionsRoutes);
app.use('/api/chauffeurs/manage', chauffeursManageRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/geolocation', geolocationRoutes);
app.use('/api', initRoutes);

// Contrôle de santé API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Transport DanGE API is running',
    timestamp: new Date().toISOString(),
  });
});

// Middleware pour les routes non trouvées
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Gestionnaire global des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Erreur serveur interne',
  });
});

// Configuration des événements WebSocket
io.on('connection', (socket) => {
  console.log('✅ Client WebSocket connecté:', socket.id);

  socket.on('disconnect', () => {
    console.log('❌ Client WebSocket déconnecté:', socket.id);
  });

  socket.on('join-room', (room) => {
    socket.join(room);
    console.log(`Client ${socket.id} a rejoint la room ${room}`);
  });

  // ✅ Répondre aux pings pour maintenir la connexion
  socket.on('ping', () => {
    socket.emit('pong');
    console.log('💚 Pong envoyé au client', socket.id);
  });
});

// Initialisation de Firebase
initializeFirebase();

// Création automatique d'un compte administrateur (s'il n'existe pas)
const createAdminIfNotExists = async () => {
  try {
    const result = await pool.query("SELECT * FROM utilisateurs WHERE username = 'admin' AND role = 'admin'");
    
    if (result.rows.length === 0) {
      const hashedPassword = await bcrypt. hash('admin77281670', 10);
      await pool.query(
        "INSERT INTO utilisateurs (username, password, role, created_at) VALUES ($1, $2, $3, NOW())",
        ['admin', hashedPassword, 'admin']
      );
      console.log('\n═══════════════════════════════════════════════');
      console.log('✅ Compte administrateur créé automatiquement');
      console.log('   Username: admin');
      console.log('   Password: admin77281670');
      console.log('⚠️  IMPORTANT: Changez ce mot de passe immédiatement !');
      console.log('═══════════════════════════════════════════════\n');
    } else {
      console.log('ℹ️  Compte administrateur existe déjà');
    }
  } catch (error) {
    console.error('❌ Erreur lors de la création du compte admin:', error);
  }
};

// Démarrage du serveur
createAdminIfNotExists()
  .then(() => runMigrations())
  .then(() => {
    server.listen(process. env.PORT || 3000, () => {
      console. log('\n═══════════════════════════════════════════════');
      console.log('🚕 Transport DanGE - Backend API');
      console.log(`✅ Serveur démarré sur le port ${process.env.PORT || 3000}`);
      console.log('📊 Rate limiting configuré: ');
      console.log('   - Login: 10 tentatives / 15 min');
      console.log('   - GPS: 10 positions / 30 min');
      console.log('   - Général: 300 requêtes / 15 min');
      console.log('═══════════════════════════════════════════════\n');
    });
  })
  .catch((error) => {
    console.error('❌ Erreur au démarrage du serveur:', error);
    process.exit(1);
  });

// Gestion des interruptions (SIGTERM et SIGINT)
const gracefulShutdown = () => {
  console.log('Arrêt du serveur en cours...');
  server.close(() => {
    console.log('Serveur arrêté.');
    pool.end(() => {
      console.log('Connexion PostgreSQL fermée.');
      process.exit(0);
    });
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

module.exports = { app, server, io };
