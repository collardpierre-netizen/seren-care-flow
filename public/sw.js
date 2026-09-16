/**
 * Service worker de désinstallation.
 *
 * Une ancienne version du site avait été mise en cache par un service worker
 * (vite-plugin-pwa). Les navigateurs qui l'avaient enregistré continuaient à
 * servir cette version périmée, y compris dans une nouvelle session visiteur.
 *
 * Ce fichier remplace l'ancien service worker : il vide tous les caches,
 * se désinscrit, puis recharge les onglets ouverts pour servir la version
 * réellement publiée. Il doit rester en place tant que des navigateurs
 * peuvent encore avoir l'ancien service worker enregistré.
 */
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach((client) => {
        if ('navigate' in client) {
          client.navigate(client.url);
        }
      });
    })()
  );
});

// Aucune requête n'est interceptée : tout passe par le réseau.
