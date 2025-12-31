// Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Configuration Firebase (sera remplacée par les vraies valeurs)
firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
});

const messaging = firebase.messaging();

// Gestion des notifications en arrière-plan
messaging.onBackgroundMessage((payload) => {
  console.log('Message reçu en arrière-plan:', payload);

  const notificationTitle = payload.notification.title || 'Transport DanGE';
  const notificationOptions = {
    body: payload.notification.body || 'Nouvelle notification',
    icon: '/logo-192.png',
    badge: '/logo-192.png',
    vibrate: [500, 200, 500],
    data: payload.data,
    tag: 'transport-dange-mission',
    requireInteraction: true,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
