/* eslint-disable no-restricted-globals */
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', () => self.clients.claim())

self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {}
  event.waitUntil(
    self.registration.showNotification(data.title || 'Kỷ Luật', {
      body: data.body || '',
      icon: '/logo192.png',
      badge: '/logo192.png',
      tag: data.tag || 'discipline',
      renotify: true,
      requireInteraction: false,
    })
  )
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clients => {
      if (clients.length > 0) return clients[0].focus()
      return self.clients.openWindow('/')
    })
  )
})
