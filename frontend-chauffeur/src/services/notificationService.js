import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Jouer le son de notification (3 fois)
export const playNotificationSound = async () => {
  try {
    console.log('🔊 Tentative de lecture du son...');
    
    const audio = new Audio('/notification-sound.mp3'); // Corrigé : espace dans le chemin
    audio.volume = 1.0;
    
    let playCount = 0;
    const maxPlays = 3; // Nombre maximum de répétitions

    const playNext = () => {
      if (playCount < maxPlays) {
        audio.currentTime = 0; // Remet à 0 pour rejouer le son
        audio
          .play() // Corrigé : espace avant `.play`
          .then(() => {
            console.log(`✅ Son joué ${playCount + 1}/${maxPlays}`);
            playCount++;
          })
          .catch((err) => {
            console.error('❌ Erreur lecture audio:', err);
          });
      }
    };

    // Écouteur d'événement pour rejouer le son lorsqu'il s'est terminé
    audio.addEventListener('ended', playNext);
    audio.addEventListener('error', (e) => {
      console.error('❌ Erreur chargement audio:', e);
    });

    // Jouer la première instance du son
    playNext();

  } catch (error) {
    console.error('❌ Erreur son:', error);
  }
};

// Initialiser les notifications Firebase
export const initializeNotifications = (app) => {
  const messaging = getMessaging(app); // Récupérer le service de messagerie de Firebase
  
  // Écouter les messages quand l'app est ouverte
  onMessage(messaging, (payload) => {
    console.log('📩 Message reçu (app ouverte):', payload);

    // ✅ JOUER LE SON
    playNotificationSound();

    // ✅ AFFICHER LA NOTIFICATION
    if (Notification.permission === 'granted') {
      const notificationTitle = payload.notification?.title || '🚖 Nouvelle Mission';
      const notificationOptions = {
        body: payload.notification?.body || 'Une nouvelle mission vous attend',
        icon: '/logo192.png',
        badge: '/logo192.png',
        tag: 'mission-' + Date.now(), // Unique tag basé sur l'heure
        requireInteraction: true, // Garde la notification visible tant qu'elle n'est pas cliquée
        vibrate: [1000, 500, 1000], // vibration sur appareils compatibles
        data: payload.data || {},
        actions: [
          { action: 'view', title: '✅ VOIR' },
          { action: 'dismiss', title: '❌ REFUSER' }
        ]
      };

      // Créer et afficher la notification
      new Notification(notificationTitle, notificationOptions);
    }
  });

  return messaging; // Retourne l'instance de messagerie
};

// Demander la permission et obtenir le token
export const requestNotificationPermission = async (messaging) => {
  try {
    console.log('🔔 Demande de permission...');
    
    // Demande à l'utilisateur la permission d'afficher les notifications
    const permission = await Notification.requestPermission(); // Corrigé : espace avant `.requestPermission`
    
    if (permission === 'granted') {
      console.log('✅ Permission accordée');

      // Obtenir le token de notification Firebase
      const token = await getToken(messaging, {
        vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY // VAPID key spécifiée dans .env
      });

      if (token) {
        console.log('✅ Token FCM:', token);
        return token; // Retourne le token
      } else {
        console.error('❌ Aucun token disponible');
        return null;
      }
    } else {
      console.warn('⚠️ Permission refusée');
      return null; // Permission refusée
    }
  } catch (error) {
    console.error('❌ Erreur permission:', error);
    return null;
  }
};
