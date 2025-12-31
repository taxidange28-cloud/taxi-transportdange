import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { enregistrerFcmToken } from './api';

// Configuration Firebase (à adapter avec vos vraies valeurs)
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

let app;
let messaging;

export const initializeFirebase = () => {
  try {
    if (!app) {
      app = initializeApp(firebaseConfig);
      messaging = getMessaging(app);
      console.log('✅ Firebase initialisé');
    }
    return { app, messaging };
  } catch (error) {
    console.error('❌ Erreur initialisation Firebase:', error);
    return { app: null, messaging: null };
  }
};

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('✅ Permission de notification accordée');
      return true;
    } else {
      console.log('❌ Permission de notification refusée');
      return false;
    }
  } catch (error) {
    console.error('Erreur demande permission:', error);
    return false;
  }
};

export const getFCMToken = async (chauffeurId) => {
  try {
    const { messaging } = initializeFirebase();
    if (!messaging) {
      console.warn('Firebase Messaging non disponible');
      return null;
    }

    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      return null;
    }

    const currentToken = await getToken(messaging, {
      vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY,
    });

    if (currentToken) {
      console.log('✅ Token FCM obtenu:', currentToken);
      
      // Enregistrer le token sur le serveur
      await enregistrerFcmToken(chauffeurId, currentToken);
      
      return currentToken;
    } else {
      console.log('❌ Aucun token FCM disponible');
      return null;
    }
  } catch (error) {
    console.error('Erreur obtention token FCM:', error);
    return null;
  }
};

export const onMessageListener = (callback) => {
  const { messaging } = initializeFirebase();
  if (!messaging) {
    return () => {};
  }

  return onMessage(messaging, (payload) => {
    console.log('Message reçu:', payload);
    
    // Afficher une notification
    if (payload.notification) {
      const notificationTitle = payload.notification.title || 'Transport DanGE';
      const notificationOptions = {
        body: payload.notification.body,
        icon: '/logo-192.png',
        badge: '/logo-192.png',
        vibrate: [500, 200, 500],
        data: payload.data,
      };

      if (Notification.permission === 'granted') {
        new Notification(notificationTitle, notificationOptions);
      }

      // Son de notification (optionnel)
      try {
        const audio = new Audio('/notification.mp3');
        audio.play().catch(e => console.log('Son non joué:', e));
      } catch (e) {
        // Ignorer si pas de fichier son
      }
    }

    callback(payload);
  });
};

export default {
  initializeFirebase,
  requestNotificationPermission,
  getFCMToken,
  onMessageListener,
};
