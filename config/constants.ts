// Application constants

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';
export const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_BASE_URL || 'ws://localhost:8000/ws';

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'zai_access_token',
  REFRESH_TOKEN: 'zai_refresh_token',
  USER_ID: 'zai_user_id',
  USERNAME: 'zai_username',
} as const;

export const GAME_CONFIG = {
  HEX_SIZE: 30,
  BOARD_RADIUS: 5,
  ANIMATION_DURATION: 300,
  MOVE_CONFIRMATION_DELAY: 100,
} as const;

export const TIME_CONTROLS = {
  blitz: 300, // 5 minutes
  rapid: 1800, // 30 minutes
  classical: 3600, // 60 minutes
} as const;

export const WS_HEARTBEAT_INTERVAL = 30000; // 30 seconds
export const WS_RECONNECT_DELAY = 1000;
export const WS_MAX_RECONNECT_ATTEMPTS = 5;

export const SYNC_INTERVAL = 30000; // 30 seconds
export const MAX_SYNC_RETRIES = 5;
