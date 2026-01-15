/**
 * Service Worker registration
 */

import type { ExtendedServiceWorkerRegistration } from '@/types/pwa';

export function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker available
            if (confirm('A new version is available. Reload to update?')) {
              window.location.reload();
            }
          }
        });
      });

      // Check for updates every hour
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000);

    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  });
}

// Request persistent storage
export async function requestPersistentStorage(): Promise<boolean> {
  if ('storage' in navigator && 'persist' in navigator.storage) {
    const isPersisted = await navigator.storage.persisted();
    if (!isPersisted) {
      const result = await navigator.storage.persist();
      return result;
    }
    return true;
  }
  return false;
}

// Background sync registration
export async function registerBackgroundSync(tag: string): Promise<void> {
  if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
    const registration = await navigator.serviceWorker.ready;
    const syncRegistration = registration as ExtendedServiceWorkerRegistration;
    await syncRegistration.sync.register(tag);
  }
}
