/**
 * Audio system type definitions
 */

export type SoundEffect = 
  | 'stone_place'
  | 'stone_capture'
  | 'invalid_move'
  | 'game_start'
  | 'game_end'
  | 'match_found'
  | 'turn_change'
  | 'timer_warning';

export interface AudioManagerConfig {
  volume?: number;
  musicVolume?: number;
  enabled?: boolean;
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
