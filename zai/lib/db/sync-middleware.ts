/**
 * IndexedDB persistence middleware for Zustand stores
 */

import { StateCreator, StoreMutatorIdentifier } from 'zustand';
import { db } from './indexeddb';

type IndexedDBPersist = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  config: StateCreator<T, Mps, Mcs>,
  options: {
    name: string;
    version?: number;
  }
) => StateCreator<T, Mps, Mcs>;

export const indexedDBPersist: IndexedDBPersist = (config, options) => (set, get, api) => {
  const { name } = options;

  // Initialize IndexedDB
  db.init().catch((error) => {
    console.error('Failed to initialize IndexedDB:', error);
  });

  // Load initial state from IndexedDB
  db.getSetting(name).then((savedState) => {
    if (savedState) {
      set(savedState);
    }
  }).catch((error) => {
    console.error('Failed to load state from IndexedDB:', error);
  });

  // Wrap set to persist to IndexedDB
  const persistedSet: typeof set = (partial, replace) => {
    set(partial, replace);
    
    const state = get();
    db.setSetting(name, state).catch((error) => {
      console.error('Failed to persist state to IndexedDB:', error);
    });
  };

  return config(persistedSet, get, api);
};

// Sync manager for offline operations
export class SyncManager {
  private static instance: SyncManager;

  static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  async queueOperation(url: string, method: string, data: any, headers: Record<string, string> = {}): Promise<void> {
    await db.addToSyncQueue(url, method, headers, data);
    
    // Try to sync immediately if online
    if (navigator.onLine) {
      await this.processSyncQueue();
    }
  }

  async processSyncQueue(): Promise<void> {
    const queue = await db.getSyncQueue();
    
    for (const item of queue) {
      try {
        const response = await fetch(item.url, {
          method: item.method,
          headers: item.headers,
          body: JSON.stringify(item.data),
        });

        if (response.ok) {
          // Remove from queue on success
          if (item.id) {
            await db.delete('sync_queue', item.id);
          }
        } else if (response.status >= 500) {
          // Server error, will retry later
          continue;
        } else {
          // Client error, remove from queue
          if (item.id) {
            await db.delete('sync_queue', item.id);
          }
        }
      } catch (error) {
        // Network error, will retry later
        console.error('Sync failed:', error);
      }
    }
  }

  startAutoSync(intervalMs: number = 30000): void {
    setInterval(() => {
      if (navigator.onLine) {
        this.processSyncQueue();
      }
    }, intervalMs);

    // Also sync when coming back online
    window.addEventListener('online', () => {
      this.processSyncQueue();
    });
  }
}
