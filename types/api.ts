// API Types based on API_REFERENCE.md

export interface HexCoordinate {
  q: number;
  r: number;
}

export interface Move {
  type: 'placement' | 'sacrifice';
  position?: HexCoordinate;
  sacrifice_position?: HexCoordinate;
  placements?: HexCoordinate[];
}

export interface User {
  user_id: string;
  username: string;
  display_name?: string;
  email?: string;
  elo_rating: number;
  games_played: number;
  games_won?: number;
  games_lost?: number;
  games_drawn?: number;
  win_rate?: number;
  created_at?: number;
  last_login_at?: number;
  is_online?: boolean;
  is_guest: boolean;
}

export interface AuthResponse {
  user_id: string;
  username: string;
  access_token: string;
  refresh_token?: string;
  expires_at: number;
  elo_rating: number;
  games_played: number;
  is_guest: boolean;
  warning?: string;
}

export interface GamePlayer {
  user_id: string;
  username: string;
  elo_rating: number;
  time_remaining?: number;
}

export interface BoardState {
  stones: Array<{
    player: 'white' | 'red';
    position: HexCoordinate;
  }>;
}

export interface GameState {
  game_id: string;
  white_player: GamePlayer;
  red_player: GamePlayer;
  status: 'pending' | 'active' | 'completed' | 'abandoned';
  current_turn: 'white' | 'red';
  turn_number: number;
  phase: 'placement' | 'expansion' | 'encirclement' | 'endgame';
  legal_moves: Move[];
  board_state: BoardState;
  move_history: Array<{
    move_number: number;
    player: 'white' | 'red';
    move_type: 'placement' | 'sacrifice';
    position?: HexCoordinate;
    sacrifice_position?: HexCoordinate;
    placements?: HexCoordinate[];
    time_taken?: number;
    created_at: number;
  }>;
  started_at: number;
  last_move_at?: number;
  completed_at?: number;
  winner?: 'white' | 'red' | 'draw';
  win_condition?: 'encirclement' | 'territory' | 'network' | 'isolation' | 'resignation' | 'timeout';
  websocket_url?: string;
}

export interface CreateGameRequest {
  opponent_id: string;
  player_color?: 'white' | 'red' | 'random';
  time_control?: 'blitz' | 'rapid' | 'classical';
  is_rated?: boolean;
  is_private?: boolean;
}

export interface MakeMoveRequest {
  type: 'placement' | 'sacrifice';
  position?: HexCoordinate;
  sacrifice_position?: HexCoordinate;
  placements?: HexCoordinate[];
}

export interface MoveResponse {
  move_id: number;
  game_id: string;
  move_number: number;
  player: 'white' | 'red';
  move: Move;
  game_status: 'pending' | 'active' | 'completed' | 'abandoned';
  next_turn: 'white' | 'red';
  created_at: number;
}

export interface GameListItem {
  game_id: string;
  opponent: {
    user_id: string;
    username: string;
    elo_rating: number;
  };
  player_color: 'white' | 'red';
  current_turn: 'white' | 'red';
  turn_number: number;
  last_move_at?: number;
  started_at: number;
}

export interface MatchmakingRequest {
  preferred_color?: 'white' | 'red' | 'random';
  time_control?: 'blitz' | 'rapid' | 'classical';
  is_rated?: boolean;
  elo_range?: {
    min: number;
    max: number;
  };
}

export interface MatchmakingStatus {
  in_queue: boolean;
  queue_position?: number;
  estimated_wait_time?: number;
  entered_at?: number;
  preferences?: MatchmakingRequest;
  matched_at?: number;
  status?: 'waiting' | 'matched';
  game_id?: string;
}

export interface QueueStatistics {
  queue_length: number;
  average_wait_time: number;
  median_wait_time: number;
  elo_distribution: {
    min: number;
    max: number;
    mean: number;
  };
}

export interface Invitation {
  invitation_id: string;
  inviter_user_id: string;
  invitee_user_id?: string;
  inviter_color: 'white' | 'red' | 'random';
  time_control?: 'blitz' | 'rapid' | 'classical';
  is_rated: boolean;
  is_public: boolean;
  expires_at: number;
  created_at?: number;
  invitation_url?: string;
}

export interface CreateInvitationRequest {
  invitee_user_id?: string;
  inviter_color?: 'white' | 'red' | 'random';
  time_control?: 'blitz' | 'rapid' | 'classical';
  is_rated?: boolean;
  is_public?: boolean;
  max_uses?: number;
  expires_in?: number;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  elo_rating: number;
  games_played: number;
  win_rate: number;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  total: number;
  updated_at: number;
}

export interface GameHistoryItem {
  game_id: string;
  opponent: {
    user_id: string;
    username: string;
    elo_rating: number;
  };
  player_color: 'white' | 'red';
  result: 'win' | 'loss' | 'draw' | 'ongoing';
  win_condition?: string;
  elo_change?: number;
  total_moves?: number;
  started_at: number;
  completed_at?: number;
}

export interface GameHistoryResponse {
  games: GameHistoryItem[];
  total: number;
  has_more: boolean;
  next_offset: number;
}

export interface ErrorResponse {
  error: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: number;
  request_id?: string;
}

// WebSocket Message Types
export interface WSMessage {
  type: string;
  game_id: string;
  payload?: unknown;
  state?: unknown;
  players?: Record<string, GamePlayer>;
  timestamp: number;
  sequence?: number;
}

export interface WSGameState extends WSMessage {
  type: 'game_state';
  state: {
    current_turn: 'white' | 'red';
    turn_number: number;
    board_state: BoardState;
    legal_moves: Move[];
    phase: string;
  };
  players: {
    white: GamePlayer;
    red: GamePlayer;
  };
}

export interface WSMoveAccepted extends WSMessage {
  type: 'move_accepted';
  payload: {
    move_number: number;
    player: 'white' | 'red';
    move: Move;
    game_status: string;
    next_turn: 'white' | 'red';
  };
}

export interface WSMoveRejected extends WSMessage {
  type: 'move_rejected';
  payload: {
    reason: string;
    message: string;
    attempted_move: Move;
  };
}

export interface WSStateUpdate extends WSMessage {
  type: 'state_update';
  payload: {
    current_turn: 'white' | 'red';
    turn_number: number;
    board_state: BoardState;
    legal_moves: Move[];
    last_move?: {
      move_number: number;
      player: 'white' | 'red';
      position: HexCoordinate;
    };
    phase: 'placement' | 'expansion' | 'encirclement' | 'endgame';
  };
}

export interface WSGameEnd extends WSMessage {
  type: 'game_end';
  payload: {
    status: 'completed' | 'abandoned';
    winner?: 'white' | 'red' | 'draw';
    win_condition?: string;
    final_state: {
      board_state: BoardState;
    };
    elo_changes?: {
      white: number;
      red: number;
    };
  };
}

export interface WSError extends WSMessage {
  type: 'error';
  payload: {
    error_code: string;
    message: string;
    received_type?: string;
  };
}

// Bot games
export type BotDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface CreateBotGameRequest {
  player_color?: 'white' | 'red' | 'random';
  difficulty?: BotDifficulty;
}

export interface CreateBotGameResponse {
  game_id: string;
  player_color: 'white' | 'red';
  bot_color: 'white' | 'red';
  difficulty: BotDifficulty;
  status: 'active' | 'pending' | 'completed' | 'abandoned';
  current_turn: 'white' | 'red';
  started_at: number;
}

export interface ReplaySnapshot {
  turn_number: number;
  board_state: {
    stones: Array<{
      player: 'white' | 'red';
      position: HexCoordinate;
    }>;
  };
  legal_moves: Move[];
  current_turn: 'white' | 'red';
  last_move?: {
    player: 'white' | 'red';
    move: Move;
    move_number: number;
  };
}

export interface GameReplayResponse {
  game_id: string;
  snapshots: ReplaySnapshot[];
  total_moves: number;
}
