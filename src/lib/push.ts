/**
 * Web Push helper utilities. Uses the standard Web Push Protocol with VAPID.
 *
 * Setup:
 *   1. Generate VAPID keys once: `npx web-push generate-vapid-keys`
 *   2. Set NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in .env
 *   3. Set VAPID_SUBJECT to a mailto:address (required by spec)
 *
 * Browser side calls subscribePush() to register; server stores the
 * subscription endpoint and sends pushes via the `web-push` package
 * (added in a follow-up if/when the user wants real pushes).
 */

export interface PushSubscriptionPayload {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const base64Padded = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = typeof window !== "undefined" ? window.atob(base64Padded) : Buffer.from(base64Padded, "base64").toString("binary");
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export async function subscribePush(vapidPublicKey: string): Promise<PushSubscriptionPayload | null> {
  if (typeof window === "undefined") return null;
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    throw new Error("Push notifications not supported in this browser.");
  }
  // Register SW
  const registration = await navigator.serviceWorker.register("/sw.js");
  // Wait until ready
  await navigator.serviceWorker.ready;

  // Ask permission
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error(permission === "denied" ? "You blocked notifications." : "Permission dismissed.");
  }

  // Subscribe — applicationServerKey accepts a BufferSource; ensure underlying
  // buffer is a plain ArrayBuffer (some lib.dom typings reject a generic
  // ArrayBufferLike).
  const keyBytes = urlBase64ToUint8Array(vapidPublicKey);
  const buf = keyBytes.buffer.slice(keyBytes.byteOffset, keyBytes.byteOffset + keyBytes.byteLength) as ArrayBuffer;
  const sub = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: buf,
  });

  const json = sub.toJSON();
  if (!json.endpoint || !json.keys) return null;
  return {
    endpoint: json.endpoint,
    keys: { p256dh: json.keys.p256dh ?? "", auth: json.keys.auth ?? "" },
  };
}

export async function unsubscribePush(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (!("serviceWorker" in navigator)) return false;
  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) return false;
  const sub = await registration.pushManager.getSubscription();
  if (!sub) return false;
  return sub.unsubscribe();
}
