// WebSocket client for real-time game communication

import { WS_BASE_URL, WS_HEARTBEAT_INTERVAL, WS_RECONNECT_DELAY, WS_MAX_RECONNECT_ATTEMPTS, STORAGE_KEYS } from '@/config/constants';
import type {
  WSMessage,
  MakeMoveRequest,
} from '@/types/api';

type MessageHandler = (message: WSMessage) => void;
type ErrorHandler = (error: Error) => void;

class WebSocketManager {
  private ws: WebSocket | null = null;
  private gameId: string | null = null;
  private reconnectAttempts = 0;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();
  private errorHandlers: Set<ErrorHandler> = new Set();
  private connectPromise: Promise<void> | null = null;
  private shouldReconnect = true;

  async connect(gameId: string): Promise<void> {
    // Already connected to this game
    if (this.ws?.readyState === WebSocket.OPEN && this.gameId === gameId) {
      return;
    }

    // If already connecting, wait for that connection
    if (this.connectPromise && this.gameId === gameId) {
      return this.connectPromise;
    }

    // Clean up any existing connection
    this.cleanup();

    this.gameId = gameId;
    this.shouldReconnect = true;

    this.connectPromise = new Promise((resolve, reject) => {
      const token = typeof window !== 'undefined' 
        ? localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
        : null;

      if (!token) {
        this.connectPromise = null;
        reject(new Error('No access token available'));
        return;
      }

      const url = `${WS_BASE_URL}/game/${gameId}?token=${encodeURIComponent(token)}`;
      
      try {
        this.ws = new WebSocket(url);
      } catch (error) {
        this.connectPromise = null;
        reject(error);
        return;
      }

      const connectionTimeout = setTimeout(() => {
        if (this.ws?.readyState !== WebSocket.OPEN) {
          this.cleanup();
          reject(new Error('Connection timeout'));
        }
      }, 10000);

      this.ws.onopen = () => {
        clearTimeout(connectionTimeout);
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        resolve();
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onerror = () => {
        clearTimeout(connectionTimeout);
        this.handleError(new Error('WebSocket connection error'));
      };

      this.ws.onclose = (event) => {
        clearTimeout(connectionTimeout);
        this.stopHeartbeat();
        this.connectPromise = null;

        // Only reject if we haven't resolved yet (connection failed during handshake)
        if (this.ws?.readyState !== WebSocket.OPEN) {
          // Don't reject if this was intentional disconnect
          if (this.shouldReconnect) {
            reject(new Error(`Connection closed: ${event.code}`));
          }
        }

        // Attempt reconnection if appropriate
        if (this.shouldReconnect && this.reconnectAttempts < WS_MAX_RECONNECT_ATTEMPTS && this.gameId) {
          this.reconnectAttempts++;
          const delay = WS_RECONNECT_DELAY * this.reconnectAttempts;
          setTimeout(() => {
            if (this.gameId && this.shouldReconnect) {
              this.connect(this.gameId).catch(console.error);
            }
          }, delay);
        }
      };
    });

    return this.connectPromise;
  }

  private cleanup(): void {
    this.stopHeartbeat();
    if (this.ws) {
      // Remove event handlers to prevent callbacks after cleanup
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onerror = null;
      this.ws.onclose = null;
      
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close(1000, 'Client disconnect');
      }
      this.ws = null;
    }
    this.connectPromise = null;
  }

  disconnect(): void {
    this.shouldReconnect = false;
    this.cleanup();
    this.gameId = null;
    this.reconnectAttempts = 0;
  }

  sendMove(move: MakeMoveRequest): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.gameId) {
      throw new Error('WebSocket is not connected');
    }

    const message: WSMessage = {
      type: 'move',
      game_id: this.gameId,
      payload: move,
      timestamp: Math.floor(Date.now() / 1000),
    };

    this.ws.send(JSON.stringify(message));
  }

  sendResign(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.gameId) {
      throw new Error('WebSocket is not connected');
    }

    const message: WSMessage = {
      type: 'resign',
      game_id: this.gameId,
      payload: {},
      timestamp: Math.floor(Date.now() / 1000),
    };

    this.ws.send(JSON.stringify(message));
  }

  requestState(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.gameId) {
      return; // Silently ignore if not connected
    }

    const message: WSMessage = {
      type: 'get_state',
      game_id: this.gameId,
      payload: {},
      timestamp: Math.floor(Date.now() / 1000),
    };

    this.ws.send(JSON.stringify(message));
  }

  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => {
      this.messageHandlers.delete(handler);
    };
  }

  onError(handler: ErrorHandler): () => void {
    this.errorHandlers.add(handler);
    return () => {
      this.errorHandlers.delete(handler);
    };
  }

  private handleMessage(message: WSMessage): void {
    this.messageHandlers.forEach(handler => {
      try {
        handler(message);
      } catch (error) {
        console.error('Error in message handler:', error);
      }
    });
  }

  private handleError(error: Error): void {
    this.errorHandlers.forEach(handler => {
      try {
        handler(error);
      } catch (err) {
        console.error('Error in error handler:', err);
      }
    });
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN && this.gameId) {
        const ping: WSMessage = {
          type: 'ping',
          game_id: this.gameId,
          payload: {},
          timestamp: Math.floor(Date.now() / 1000),
        };
        this.ws.send(JSON.stringify(ping));
      }
    }, WS_HEARTBEAT_INTERVAL);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  get readyState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED;
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const wsManager = new WebSocketManager();
