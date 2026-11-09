// Firebase Cloud Messaging Background Service Worker for Ananda Pathshala Kushtia
// Handles background push alerts for New Admission Applications & Urgent Pickup Requests

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let payload = {
    title: 'আনন্দ পাঠশালা (কুষ্টিয়া) — জরুরি অ্যালার্ট',
    body: 'একটি নতুন নোটিফিকেশন এসেছে।',
    icon: '/assets/fb/logo.jpg',
    badge: '/assets/fb/logo.jpg',
    data: { actionTab: 'overview' },
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      const notif = parsed.notification || parsed;
      payload = {
        title: notif.title || payload.title,
        body: notif.body || payload.body,
        icon: notif.icon || '/assets/fb/logo.jpg',
        badge: '/assets/fb/logo.jpg',
        data: parsed.data || { actionTab: 'overview' },
      };
    } catch {
      payload.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon,
      badge: payload.badge,
      data: payload.data,
      tag: 'ananda-pathshala-fcm',
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});
