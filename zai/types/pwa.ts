/**
 * Progressive Web App type definitions
 */

export interface SyncManager {
  register(tag: string): Promise<void>;
  getTags(): Promise<string[]>;
}

export interface ExtendedServiceWorkerRegistration extends ServiceWorkerRegistration {
  readonly sync: SyncManager;
}

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}
