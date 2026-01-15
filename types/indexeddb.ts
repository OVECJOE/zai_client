/**
 * IndexedDB schema type definitions
 */

import type { BoardState, Move, GamePlayer, MakeMoveRequest } from './api';

export interface DBSchema {
  users: {
    key: string;
    value: {
      user_id: string;
      username: string;
      elo_rating: number;
      games_played: number;
      is_guest: boolean;
      created_at: number;
      updated_at: number;
    };
  };
  games: {
    key: string;
    value: {
      game_id: string;
      white_player: GamePlayer | null;
      red_player: GamePlayer | null;
      status: string;
      board_state: BoardState | null;
      legal_moves: Move[];
      current_turn: string;
      turn_number: number;
      phase: string;
      winner?: string;
      win_condition?: string;
      created_at: number;
      updated_at: number;
      is_synced: boolean;
    };
  };
  moves: {
    key: number;
    value: {
      id?: number;
      game_id: string;
      move_number: number;
      player: string;
      move_data: MakeMoveRequest;
      timestamp: number;
      is_synced: boolean;
    };
  };
  sync_queue: {
    key: number;
    value: {
      id?: number;
      url: string;
      method: string;
      headers: Record<string, string>;
      data: Record<string, unknown>;
      timestamp: number;
      retry_count: number;
    };
  };
  settings: {
    key: string;
    value: {
      key: string;
      value: string | number | boolean | object;
      updated_at: number;
    };
  };
}
