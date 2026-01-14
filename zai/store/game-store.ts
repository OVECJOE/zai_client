// Game state store using Zustand

import { create } from 'zustand';
import type { GameState, Move, HexCoordinate } from '@/types/api';

interface GameStore {
  currentGame: GameState | null;
  activeGames: GameState[];
  selectedPosition: HexCoordinate | null;
  pendingMove: Move | null;
  isMakingMove: boolean;
  error: string | null;

  // Actions
  setCurrentGame: (game: GameState | null) => void;
  updateGameState: (updates: Partial<GameState>) => void;
  setActiveGames: (games: GameState[]) => void;
  addActiveGame: (game: GameState) => void;
  removeActiveGame: (gameId: string) => void;
  setSelectedPosition: (position: HexCoordinate | null) => void;
  setPendingMove: (move: Move | null) => void;
  setIsMakingMove: (isMakingMove: boolean) => void;
  setError: (error: string | null) => void;
  clearCurrentGame: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  currentGame: null,
  activeGames: [],
  selectedPosition: null,
  pendingMove: null,
  isMakingMove: false,
  error: null,

  setCurrentGame: (game) => set({ currentGame: game, error: null }),

  updateGameState: (updates) =>
    set((state) => ({
      currentGame: state.currentGame
        ? { ...state.currentGame, ...updates }
        : null,
      error: null,
    })),

  setActiveGames: (games) => set({ activeGames: games }),

  addActiveGame: (game) =>
    set((state) => ({
      activeGames: [...state.activeGames.filter((g) => g.game_id !== game.game_id), game],
    })),

  removeActiveGame: (gameId) =>
    set((state) => ({
      activeGames: state.activeGames.filter((g) => g.game_id !== gameId),
      currentGame: state.currentGame?.game_id === gameId ? null : state.currentGame,
    })),

  setSelectedPosition: (position) => set({ selectedPosition: position }),

  setPendingMove: (move) => set({ pendingMove: move }),

  setIsMakingMove: (isMakingMove) => set({ isMakingMove }),

  setError: (error) => set({ error }),

  clearCurrentGame: () =>
    set({
      currentGame: null,
      selectedPosition: null,
      pendingMove: null,
      error: null,
    }),
}));
