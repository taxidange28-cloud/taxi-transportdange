// Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Configuration Firebase - Transport DanGE
firebase.initializeApp({
  apiKey: "AIzaSyCe08U4nEDIK9COhMUAWmz8YuxoCluZKfY",
  authDomain: "transport-dange.firebaseapp.com",
  projectId: "transport-dange",
  storageBucket: "transport-dange.appspot.com",
  messagingSenderId: "86580303208",
  appId: "1:86580303208:web:7bfb08e4462a3da6dbf2dd"
});

const messaging = firebase.messaging();

// Gestion des messages en arrière-plan
messaging.onBackgroundMessage((payload) => {
  try {
    console.log('📩 Message reçu en arrière-plan :', payload);

    const notificationTitle = payload.notification?.title || '🚖 Nouvelle Mission';
    const notificationOptions = {
      body: payload.notification?.body || 'Une nouvelle mission vous attend',
      icon: '/logo192.png',
      badge: '/logo192.png',
      vibrate: [500, 200, 500, 200, 500],
      sound: '/audio/mission.mp3', // Ajout du son
      tag: 'mission-notification',
      requireInteraction: true,
      actions: [
        { action: 'view', title: '👀 Voir', icon: '/logo192.png' },
        { action: 'dismiss', title: '❌ Plus tard' }
      ]
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
  } catch (error) {
    console.error('Erreur lors de la réception du message en arrière-plan :', error);
  }
});
