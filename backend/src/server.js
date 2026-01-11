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

const app = express();
const server = http.createServer(app);

const corsOptions = {
  origin: process.env.CORS_ORIGINS?.split(',') || [
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
  allowedHeaders:  ['Content-Type', 'Authorization'],
};

const io = socketIo(server, {
  cors: corsOptions,
});

app.use(helmet({
  contentSecurityPolicy: false,
}));

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard',
});

app.use('/api/', limiter);

app.set('io', io);

app.use('/api/auth', authRoutes);
app.use('/api/missions', missionRoutes);
app.use('/api/chauffeurs', chauffeurRoutes);
app.use('/api/chauffeurs', chauffeurMissionsRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api', initRoutes);

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Transport DanGE API is running',
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

app.use((err, req, res, next) => {
  console.error('Erreur:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Erreur serveur interne',
  });
});

io.on('connection', (socket) => {
  console.log('✅ Client WebSocket connecté:', socket.id);

  socket.on('disconnect', () => {
    console.log('❌ Client WebSocket déconnecté:', socket.id);
  });

  socket.on('join-room', (room) => {
    socket.join(room);
    console.log(`Client ${socket.id} a rejoint la room ${room}`);
  });
});

initializeFirebase();

const createAdminIfNotExists = async () => {
  try {
    const result = await pool.query("SELECT * FROM utilisateurs WHERE username = 'admin' AND role = 'admin'");
    
    if (result.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin77281670', 10);
      await pool.query(
        "INSERT INTO utilisateurs (username, password, role, created_at) VALUES ($1, $2, $3, NOW())",
        ['admin', hashedPassword, 'admin']
      );
      console.log('');
      console.log('═══════════════════════════════════════════════');
      console.log('✅ Compte administrateur créé automatiquement');
      console.log('═══════════════════════════════════════════════');
      console.log('   Username: admin');
      console.log('   Password: admin77281670');
      console.log('⚠️  IMPORTANT: Changez ce mot de passe !');
      console.log('═══════════════════════════════════════════════');
      console.log('');
    } else {
      console.log('ℹ️  Compte administrateur existe déjà');
    }
  } catch (error) {
    console.error('❌ Erreur lors de la création du compte admin:', error);
  }
};

const PORT = process.env.PORT || 3000;

createAdminIfNotExists().then(() => {
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
});

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
