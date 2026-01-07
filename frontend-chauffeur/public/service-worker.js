/* eslint-disable no-restricted-globals */
import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';

clientsClaim();

// Precache des fichiers générés par le build
precacheAndRoute(self.__WB_MANIFEST);

// App Shell style routing
const fileExtensionRegexp = new RegExp('/[^/?]+\\.[^/]+$');
registerRoute(
  ({ request, url }) => {
    if (request.mode !== 'navigate') {
      return false;
    }
    if (url.pathname.startsWith('/_')) {
      return false;
    }
    if (url.pathname.match(fileExtensionRegexp)) {
      return false;
    }
    return true;
  },
  createHandlerBoundToURL(process.env.PUBLIC_URL + '/index.html')
);

// Cache des images
registerRoute(
  ({ url }) => url.origin === self.location.origin && url.pathname.endsWith('.png'),
  new StaleWhileRevalidate({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({ maxEntries: 50 }),
    ],
  })
);

// Message handling
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // ✅ Gestion du KEEP-ALIVE
  if (event.data && event.data.type === 'KEEP_ALIVE') {
    if (event.ports && event.ports[0]) {
      event.ports[0].postMessage({ type: 'ALIVE', timestamp: Date.now() });
    }
  }
});

// ✅ Gestion des Push Notifications
self.addEventListener('push', (event) => {
  console.log('📩 Push notification reçue :', event);
  
  let notificationData = {
    title: '🚖 Transport DanGE',
    body: 'Nouvelle mission disponible',
    icon: '/logo192.png',
    badge: '/logo192.png',
    vibrate: [500, 200, 500, 200, 500],
    data: {},
    actions: [
      { action: 'view', title: '👀 Voir', icon: '/logo192.png' },
      { action: 'dismiss', title: '❌ Plus tard' }
    ]
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      console.log('📩 Payload reçu :', payload);
      
      if (payload.notification) {
        notificationData.title = payload.notification.title || notificationData.title;
        notificationData.body = payload.notification.body || notificationData.body;
        notificationData.data = payload.data || {};
      }
    } catch (e) {
      console.error('❌ Erreur parsing push data :', e);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// ✅ Gestion des clics sur notifications
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification cliquée :', event.action);
  
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Si l'app est ouverte, la mettre au premier plan
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes('/') && 'focus' in client) {
          return client.focus();
        }
      }
      // Sinon, ouvrir une nouvelle fenêtre
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// ✅ Gestion des erreurs générales
self.addEventListener('error', (error) => {
  console.error('Erreur dans Service Worker :', error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Rejection non gérée :', event.reason);
});
