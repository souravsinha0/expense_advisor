// Simple service worker for PWA functionality
const CACHE_NAME = 'expense-advisor-v1';

// Install event - skip caching for now
self.addEventListener('install', (event) => {
  console.log('Service Worker installing');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating');
  event.waitUntil(self.clients.claim());
});

// Fetch event - just pass through for now
self.addEventListener('fetch', (event) => {
  // Just fetch from network, no caching during development
  event.respondWith(fetch(event.request));
});