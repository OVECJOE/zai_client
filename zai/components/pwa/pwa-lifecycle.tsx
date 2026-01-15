"use client"

import { useEffect } from 'react';
import { registerServiceWorker, requestPersistentStorage } from '@/lib/pwa/register-sw';
import { db } from '@/lib/db/indexeddb';
import { SyncManager } from '@/lib/db/sync-middleware';
import { audioManager } from '@/lib/audio/audio-manager';

export function PWALifecycle() {
  useEffect(() => {
    // Register service worker
    registerServiceWorker();

    // Initialize IndexedDB
    db.init().catch((error) => {
      console.error('Failed to initialize IndexedDB:', error);
    });

    // Request persistent storage
    requestPersistentStorage().then((granted) => {
      if (granted) {
        console.log('Persistent storage granted');
      }
    });

    // Start auto-sync for offline operations
    SyncManager.getInstance().startAutoSync();

    // Initialize audio on user interaction
    audioManager.initOnUserInteraction();

    // Handle online/offline events
    const handleOnline = () => {
      console.log('Back online - syncing data...');
      SyncManager.getInstance().processSyncQueue();
    };

    const handleOffline = () => {
      console.log('Gone offline - queueing operations...');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return null;
}
