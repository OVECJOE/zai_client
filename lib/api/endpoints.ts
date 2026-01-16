// API Endpoint definitions

import { apiClient } from './client';
import type {
  AuthResponse,
  User,
  GameState,
  CreateGameRequest,
  MakeMoveRequest,
  MoveResponse,
  GameListItem,
  MatchmakingRequest,
  MatchmakingStatus,
  QueueStatistics,
  CreateBotGameRequest,
  CreateBotGameResponse,
  Invitation,
  CreateInvitationRequest,
  LeaderboardResponse,
  GameHistoryResponse,
  GameReplayResponse,
} from '@/types/api';

// Authentication endpoints
export const authApi = {
  register: async (data: {
    username: string;
    password: string;
    email?: string;
  }): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/register', data);
  },

  login: async (data: {
    username: string;
    password: string;
  }): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/login', data);
  },

  guestLogin: async (data: {
    display_name: string;
  }): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/guest', data);
  },

  convertGuest: async (data: {
    username: string;
    password: string;
    email?: string;
  }): Promise<{ user_id: string; username: string; is_guest: boolean; message: string }> => {
    return apiClient.post('/auth/convert-guest', data);
  },

  refresh: async (refreshToken: string): Promise<{
    access_token: string;
    expires_at: number;
  }> => {
    return apiClient.post('/auth/refresh', { refresh_token: refreshToken });
  },

  logout: async (): Promise<void> => {
    return apiClient.post('/auth/logout');
  },
};

// User endpoints
export const userApi = {
  getProfile: async (userId: string): Promise<User> => {
    return apiClient.get<User>(`/users/${userId}`);
  },

  updateProfile: async (userId: string, data: {
    display_name?: string;
    email?: string;
  }): Promise<User> => {
    return apiClient.patch<User>(`/users/${userId}`, data);
  },

  getGameHistory: async (
    userId: string,
    params?: {
      limit?: number;
      offset?: number;
      status?: 'completed' | 'active' | 'abandoned';
    }
  ): Promise<GameHistoryResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.offset) queryParams.set('offset', params.offset.toString());
    if (params?.status) queryParams.set('status', params.status);
    
    const query = queryParams.toString();
    return apiClient.get<GameHistoryResponse>(
      `/users/${userId}/games${query ? `?${query}` : ''}`
    );
  },
};

// Game endpoints
export const gameApi = {
  createGame: async (data: CreateGameRequest): Promise<GameState> => {
    return apiClient.post<GameState>('/games', data);
  },

  getGame: async (gameId: string): Promise<GameState> => {
    return apiClient.get<GameState>(`/games/${gameId}`);
  },

  makeMove: async (gameId: string, move: MakeMoveRequest): Promise<MoveResponse> => {
    return apiClient.post<MoveResponse>(`/games/${gameId}/moves`, move);
  },

  resign: async (gameId: string): Promise<{
    game_id: string;
    status: string;
    winner: string;
    resignation: boolean;
    resigned_by: string;
    elo_changes: { white: number; red: number };
    completed_at: number;
  }> => {
    return apiClient.post(`/games/${gameId}/resign`);
  },

  getMoveHistory: async (
    gameId: string,
    params?: {
      limit?: number;
      offset?: number;
    }
  ): Promise<{
    game_id: string;
    moves: Array<{
      move_number: number;
      player: 'white' | 'red';
      move_type: 'placement' | 'sacrifice';
      position?: { q: number; r: number };
      sacrifice_position?: { q: number; r: number };
      placements?: Array<{ q: number; r: number }>;
      time_taken?: number;
      created_at: number;
    }>;
    total: number;
    has_more: boolean;
  }> => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.offset) queryParams.set('offset', params.offset.toString());
    
    const query = queryParams.toString();
    return apiClient.get(`/games/${gameId}/moves${query ? `?${query}` : ''}`);
  },

  getActiveGames: async (params?: {
    limit?: number;
  }): Promise<{
    games: GameListItem[];
    total: number;
  }> => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    
    const query = queryParams.toString();
    return apiClient.get(`/games/active${query ? `?${query}` : ''}`);
  },

  createBotGame: async (data: CreateBotGameRequest): Promise<CreateBotGameResponse> => {
    return apiClient.post<CreateBotGameResponse>('/games/bot', data);
  },

  getReplay: async (gameId: string): Promise<GameReplayResponse> => {
    return apiClient.get<GameReplayResponse>(`/games/${gameId}/replay`);
  },
};

// Matchmaking endpoints
export const matchmakingApi = {
  join: async (data: MatchmakingRequest): Promise<MatchmakingStatus> => {
    return apiClient.post<MatchmakingStatus>('/matchmaking/join', data);
  },

  leave: async (): Promise<void> => {
    return apiClient.post('/matchmaking/leave');
  },

  getStatus: async (): Promise<MatchmakingStatus> => {
    return apiClient.get<MatchmakingStatus>('/matchmaking/status');
  },

  getStatistics: async (): Promise<QueueStatistics> => {
    return apiClient.get<QueueStatistics>('/matchmaking/statistics');
  },
};

// Invitation endpoints
export const invitationApi = {
  create: async (data: CreateInvitationRequest): Promise<Invitation> => {
    return apiClient.post<Invitation>('/invitations', data);
  },

  list: async (params?: {
    limit?: number;
    offset?: number;
  }): Promise<{
    invitations: Invitation[];
    total: number;
  }> => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.offset) queryParams.set('offset', params.offset.toString());
    
    const query = queryParams.toString();
    return apiClient.get(`/invitations${query ? `?${query}` : ''}`);
  },

  accept: async (invitationId: string): Promise<{
    invitation_id: string;
    game_id: string;
    status: string;
  }> => {
    return apiClient.post(`/invitations/${invitationId}/accept`);
  },

  decline: async (invitationId: string): Promise<{
    invitation_id: string;
    status: string;
  }> => {
    return apiClient.post(`/invitations/${invitationId}/decline`);
  },
};

// Leaderboard endpoints
export const leaderboardApi = {
  getLeaderboard: async (params?: {
    limit?: number;
    offset?: number;
  }): Promise<LeaderboardResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.offset) queryParams.set('offset', params.offset.toString());
    
    const query = queryParams.toString();
    return apiClient.get<LeaderboardResponse>(`/leaderboard${query ? `?${query}` : ''}`);
  },
};
