/**
 * Ancien point d'entrée du service worker (vite-plugin-pwa).
 * Conservé uniquement pour les pages HTML encore en cache qui le référencent :
 * il ne réenregistre plus rien et supprime les anciens caches.
 */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => registration.unregister());
  });
  if (window.caches) {
    caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
  }
}
