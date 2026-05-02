/* IPOpulse service worker — minimal, push-focused.
 * Strategy: no offline shell yet (we'll add network-first caching for static
 * assets in a future iteration). Today's job: receive push events and show
 * the right notification.
 */

const CACHE_VERSION = "ipopulse-v1";

self.addEventListener("install", (event) => {
  // Activate immediately on install
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Claim all open clients
  event.waitUntil(self.clients.claim());
});

/**
 * Push event payload (sent from server):
 *   {
 *     title: "Tata Capital IPO opens today",
 *     body: "Subscription window 09:00–17:00 IST, GMP ₹240 (+18%)",
 *     url: "/ipo/tata-capital-ipo",
 *     tag: "ipo-open-tata-capital"
 *   }
 */
self.addEventListener("push", (event) => {
  if (!event.data) return;
  let data = {};
  try {
    data = event.data.json();
  } catch {
    data = { title: "IPOpulse", body: event.data.text() };
  }

  const title = data.title || "IPOpulse";
  const options = {
    body: data.body || "",
    icon: "/favicon.svg",
    badge: "/favicon.svg",
    tag: data.tag || undefined,
    data: { url: data.url || "/" },
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Focus existing tab if it's already open on the URL
      for (const client of clientList) {
        if (client.url.endsWith(url) && "focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    }),
  );
});
