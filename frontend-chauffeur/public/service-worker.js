/* eslint-disable no-restricted-globals */

// Service Worker pour PWA et notifications
const CACHE_NAME = 'transport-dange-chauffeur-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/css/main.css',
  '/static/js/main.js',
  '/logo192.png',
  '/logo512.png',
  '/manifest.json'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker : Installation...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Cache ouvert');
        return cache.addAll(urlsToCache).catch(err => {
          console.warn('⚠️ Plusieurs fichiers n\'ont pas pu être mis en cache :', err);
          throw err; // Assurez-vous que l'erreur remonte
        });
      })
      .then(() => {
        console.log('✅ Service Worker installé');
        return self.skipWaiting();
      })
  );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker : Activation...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Suppression de l\'ancien cache :', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker activé');
      return self.clients.claim();
    })
  );
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.ok) { // Vérifiez que la réponse est valide
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Retourne une réponse du cache si disponible, sinon échoue silencieusement
        return caches.match(event.request);
      })
  );
});

// Gestion des Push Notifications
self.addEventListener('push', (event) => {
  console.log('📩 Push notification reçue :', event);
  
  const notificationData = {
    title: '🚖 Transport DanGE',
    body: 'Nouvelle mission disponible',
    icon: '/logo192.png',
    badge: '/logo192.png',
    tag: 'mission-notification',
    requireInteraction: true,
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
      console.error('❌ Erreur lors du parsing des données push :', e);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification cliquée :', event.action);
  
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('/') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// Gestion des messages
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'KEEP_ALIVE') {
    if (event.ports && event.ports[0]) {
      event.ports[0].postMessage({ type: 'ALIVE', timestamp: Date.now() });
    }
  }
});
