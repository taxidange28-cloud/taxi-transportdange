import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { enregistrerFcmToken } from './api';

// Configuration Firebase (à adapter avec vos vraies valeurs)
const firebaseConfig = {
  apiKey: process. env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env. REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env. REACT_APP_FIREBASE_APP_ID,
};

let app;
let messaging;

export const initializeFirebase = () => {
  try {
    if (! app) {
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

// ✅ FONCTION AMÉLIORÉE POUR JOUER LE SON 3 FOIS
const playNotificationSound = () => {
  try {
    console.log('🔊 Tentative de lecture du son...');
    
    const audio = new Audio('/notification-sound.mp3'); // ✅ Nom corrigé
    audio.volume = 1. 0;
    
    let playCount = 0;
    const maxPlays = 3;
    
    const playNext = () => {
      if (playCount < maxPlays) {
        audio.currentTime = 0;
        audio.play()
          .then(() => {
            console.log(`✅ Son joué ${playCount + 1}/${maxPlays}`);
            playCount++;
          })
          .catch(err => {
            console.error(`❌ Erreur lecture son: `, err);
          });
      }
    };
    
    audio.addEventListener('ended', playNext);
    audio.addEventListener('error', (e) => {
      console.error('❌ Erreur chargement audio:', e);
    });
    
    playNext();
    
  } catch (error) {
    console.error('❌ Erreur son:', error);
  }
};

export const onMessageListener = (callback) => {
  const { messaging } = initializeFirebase();
  if (!messaging) {
    return () => {};
  }

  return onMessage(messaging, (payload) => {
    console.log('📩 Message reçu:', payload);
    
    // ✅ JOUER LE SON EN PREMIER
    playNotificationSound();
    
    // Afficher une notification
    if (payload.notification) {
      const notificationTitle = payload. notification.title || '🚖 Transport DanGE';
      const notificationOptions = {
        body: payload.notification.body,
        icon: '/logo192.png', // ✅ Nom corrigé
        badge: '/logo192.png', // ✅ Nom corrigé
        vibrate: [1000, 500, 1000, 500, 1000], // ✅ Vibration plus longue
        requireInteraction: true, // ✅ La notification reste visible
        tag: 'mission-' + Date.now(), // ✅ Tag unique
        data: payload.data,
      };

      if (Notification. permission === 'granted') {
        new Notification(notificationTitle, notificationOptions);
      }
    }

    callback(payload);
  });
};

// ✅ EXPORTER LA FONCTION playNotificationSound POUR LES TESTS
export { playNotificationSound };

export default {
  initializeFirebase,
  requestNotificationPermission,
  getFCMToken,
  onMessageListener,
  playNotificationSound, // ✅ Ajouté
};
