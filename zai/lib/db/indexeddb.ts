/**
 * IndexedDB Manager for offline-first data storage
 */

import type { DBSchema } from '@/types/indexeddb';

const DB_NAME = 'zai-game-db';
const DB_VERSION = 1;

class IndexedDBManager {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Users store
        if (!db.objectStoreNames.contains('users')) {
          const usersStore = db.createObjectStore('users', { keyPath: 'user_id' });
          usersStore.createIndex('username', 'username', { unique: true });
        }

        // Games store
        if (!db.objectStoreNames.contains('games')) {
          const gamesStore = db.createObjectStore('games', { keyPath: 'game_id' });
          gamesStore.createIndex('status', 'status', { unique: false });
          gamesStore.createIndex('updated_at', 'updated_at', { unique: false });
          gamesStore.createIndex('is_synced', 'is_synced', { unique: false });
        }

        // Moves store
        if (!db.objectStoreNames.contains('moves')) {
          const movesStore = db.createObjectStore('moves', { keyPath: 'id', autoIncrement: true });
          movesStore.createIndex('game_id', 'game_id', { unique: false });
          movesStore.createIndex('is_synced', 'is_synced', { unique: false });
        }

        // Sync queue store
        if (!db.objectStoreNames.contains('sync_queue')) {
          const syncStore = db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };
    });

    return this.initPromise;
  }

  private async getDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    return this.db!;
  }

  // Generic CRUD operations
  async get<K extends keyof DBSchema>(
    storeName: K,
    key: DBSchema[K]['key']
  ): Promise<DBSchema[K]['value'] | undefined> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll<K extends keyof DBSchema>(
    storeName: K
  ): Promise<DBSchema[K]['value'][]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async put<K extends keyof DBSchema>(
    storeName: K,
    value: DBSchema[K]['value']
  ): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.put(value);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async delete<K extends keyof DBSchema>(
    storeName: K,
    key: DBSchema[K]['key']
  ): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear<K extends keyof DBSchema>(storeName: K): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Specialized queries
  async getGamesByStatus(status: string): Promise<DBSchema['games']['value'][]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('games', 'readonly');
      const store = tx.objectStore('games');
      const index = store.index('status');
      const request = index.getAll(status);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getMovesByGame(gameId: string): Promise<DBSchema['moves']['value'][]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('moves', 'readonly');
      const store = tx.objectStore('moves');
      const index = store.index('game_id');
      const request = index.getAll(gameId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getUnsyncedGames(): Promise<DBSchema['games']['value'][]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('games', 'readonly');
      const store = tx.objectStore('games');
      const request = store.getAll();

      request.onsuccess = () => {
        const allGames = request.result;
        const unsyncedGames = allGames.filter(game => !game.is_synced);
        resolve(unsyncedGames);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getUnsyncedMoves(): Promise<DBSchema['moves']['value'][]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('moves', 'readonly');
      const store = tx.objectStore('moves');
      const request = store.getAll();

      request.onsuccess = () => {
        const allMoves = request.result;
        const unsyncedMoves = allMoves.filter(move => !move.is_synced);
        resolve(unsyncedMoves);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async addToSyncQueue(
    url: string,
    method: string,
    headers: Record<string, string>,
    data: Record<string, unknown>
  ): Promise<void> {
    await this.put('sync_queue', {
      url,
      method,
      headers,
      data,
      timestamp: Date.now(),
      retry_count: 0,
    });
  }

  async getSyncQueue(): Promise<DBSchema['sync_queue']['value'][]> {
    return this.getAll('sync_queue');
  }

  // Settings helpers
  async getSetting<T = string | number | boolean | object>(key: string): Promise<T | undefined> {
    const setting = await this.get('settings', key);
    return setting?.value as T | undefined;
  }

  async setSetting(key: string, value: string | number | boolean | object): Promise<void> {
    await this.put('settings', {
      key,
      value,
      updated_at: Date.now(),
    });
  }
}

export const db = new IndexedDBManager();
