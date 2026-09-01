self.addEventListener('fetch', function (event) {
  // Pass through — required for iOS to consider the SW active
  event.respondWith(fetch(event.request))
})

self.addEventListener('push', function (event) {
  const data = event.data ? event.data.json() : {}
  const title = data.title || 'Eat&Fit'
  const options = {
    body: data.body || '¿Cómo ha ido el día? Recuerda registrar tus hábitos.',
    icon: '/icon.svg',
    badge: '/icon.svg',
    data: { url: data.url || '/' },
    vibrate: [200, 100, 200],
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', function (event) {
  event.notification.close()
  const url = event.notification.data?.url || '/'
  event.waitUntil(clients.openWindow(url))
})
