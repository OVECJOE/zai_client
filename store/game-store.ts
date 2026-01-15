import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameState, Move, HexCoordinate } from '@/types/api';
import { db } from '@/lib/db/indexeddb';

interface GameStore {
  currentGame: GameState | null;
  activeGames: GameState[];
  selectedPosition: HexCoordinate | null;
  pendingMove: Move | null;
  isMakingMove: boolean;
  error: string | null;

  // Sacrifice State
  sacrificeSource: HexCoordinate | null;
  sacrificePlacements: HexCoordinate[];

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
  
  // Sacrifice Actions
  setSacrificeSource: (position: HexCoordinate | null) => void;
  setSacrificePlacements: (placements: HexCoordinate[]) => void;
  resetSacrificeState: () => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      currentGame: null,
      activeGames: [],
      selectedPosition: null,
      pendingMove: null,
      isMakingMove: false,
      error: null,
      sacrificeSource: null,
      sacrificePlacements: [],

      setCurrentGame: (game) => {
        set({ currentGame: game, error: null, sacrificeSource: null, sacrificePlacements: [] });
        if (game) {
          db.put('games', {
            game_id: game.game_id,
            white_player: game.white_player,
            red_player: game.red_player,
            status: game.status,
            board_state: game.board_state,
            legal_moves: game.legal_moves,
            current_turn: game.current_turn,
            turn_number: game.turn_number,
            phase: game.phase,
            winner: game.winner,
            win_condition: game.win_condition,
            created_at: game.started_at,
            updated_at: Date.now(),
            is_synced: true,
          }).catch(console.error);
        }
      },

      updateGameState: (updates) =>
        set((state) => {
          const updatedGame = state.currentGame
            ? { ...state.currentGame, ...updates }
            : null;
          
          if (updatedGame) {
            db.put('games', {
              game_id: updatedGame.game_id,
              white_player: updatedGame.white_player,
              red_player: updatedGame.red_player,
              status: updatedGame.status,
              board_state: updatedGame.board_state,
              legal_moves: updatedGame.legal_moves,
              current_turn: updatedGame.current_turn,
              turn_number: updatedGame.turn_number,
              phase: updatedGame.phase,
              winner: updatedGame.winner,
              win_condition: updatedGame.win_condition,
              created_at: updatedGame.started_at,
              updated_at: Date.now(),
              is_synced: true,
            }).catch(console.error);
          }
          
          return { currentGame: updatedGame, error: null };
        }),

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
      
      setSacrificeSource: (position) => set({ sacrificeSource: position }),
      setSacrificePlacements: (placements) => set({ sacrificePlacements: placements }),
      resetSacrificeState: () => set({ sacrificeSource: null, sacrificePlacements: [] }),

      clearCurrentGame: () =>
        set({
          currentGame: null,
          selectedPosition: null,
          pendingMove: null,
          error: null,
          sacrificeSource: null,
          sacrificePlacements: [],
        }),
    }),
    {
      name: 'game-storage',
      partialize: (state) => ({
        currentGame: state.currentGame,
        activeGames: state.activeGames,
      }),
    }
  )
);
