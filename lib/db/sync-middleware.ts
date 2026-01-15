/**
 * IndexedDB persistence utilities for Zustand stores
 */

import { db } from './indexeddb';

// Sync manager for offline operations
export class SyncManager {
  private static instance: SyncManager;

  static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  async queueOperation(url: string, method: string, data: Record<string, unknown>, headers: Record<string, string> = {}): Promise<void> {
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
