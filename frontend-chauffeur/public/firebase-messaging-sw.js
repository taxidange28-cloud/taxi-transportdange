// Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Configuration Firebase Transport DanGE
firebase.initializeApp({
  apiKey: "AIzaSyCe08U4nEDIK9COhMUAWmz8YuxoCluZKfY",
  authDomain: "transport-dange.firebaseapp.com",
  projectId: "transport-dange",
  storageBucket: "transport-dange.appspot.com",
  messagingSenderId: "86580303208",
  appId: "1:86580303208:web:7bfb08e4462a3da6dbf2dd"
});

const messaging = firebase.messaging();

// Gestion des notifications en arrière-plan
messaging.onBackgroundMessage((payload) => {
  console.log('📩 Message reçu en arrière-plan :', payload);

  const notificationTitle = payload?.notification?.title || '🚖 Transport DanGE'; // Vérifications supplémentaires
  const notificationOptions = {
    body: payload?.notification?.body || 'Nouvelle mission disponible',
    icon: '/logo192.png',
    badge: '/logo192.png',
    vibrate: [500, 200, 500, 200, 500],
    data: payload?.data || {},
    tag: 'mission-notification',
    requireInteraction: true,
    actions: [
      { action: 'view', title: '👀 Voir', icon: '/logo192.png' },
      { action: 'dismiss', title: '❌ Plus tard' }
    ]
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Gestion du clic sur la notification
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification cliquée :', event.action);
  
  event.notification.close();

  if (event.action === 'view' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes('/') && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});
