const admin = require('firebase-admin');
require('dotenv').config();

let firebaseApp = null;

const initializeFirebase = () => {
  try {
    // Vérifier si Firebase est déjà initialisé
    if (firebaseApp) {
      return firebaseApp;
    }

    // Configuration depuis les variables d'environnement
    const serviceAccount = {
      type: 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
    };

    // Vérifier que les variables sont définies
    if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
      console.warn('⚠️  Firebase non configuré - Les notifications push ne fonctionneront pas');
      return null;
    }

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log('✅ Firebase Admin SDK initialisé');
    return firebaseApp;

  } catch (error) {
    console.error('❌ Erreur initialisation Firebase:', error.message);
    return null;
  }
};

const getMessaging = () => {
  if (!firebaseApp) {
    initializeFirebase();
  }
  return firebaseApp ? admin.messaging() : null;
};

module.exports = {
  initializeFirebase,
  getMessaging,
};