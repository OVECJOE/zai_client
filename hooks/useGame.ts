import { useCallback, useEffect, useRef } from 'react';
import { useGameStore } from '@/store/game-store';
import { gameApi } from '@/lib/api/endpoints';
import { wsManager } from '@/lib/api/websocket';
import { useUIStore } from '@/store/ui-store';
import { useAuthStore } from '@/store/auth-store';
import { audioManager } from '@/lib/audio/audio-manager';
import type { GameState, MakeMoveRequest, HexCoordinate, WSMessage, WSGameState, WSMoveAccepted, WSMoveRejected, WSStateUpdate, WSGameEnd } from '@/types/api';
import { getErrorMessage } from '@/lib/utils/errors';

export function useGame(gameId?: string) {
  const {
    currentGame,
    setCurrentGame,
    updateGameState,
    setError,
    setIsMakingMove,
    setSelectedPosition,
    setPendingMove,
    sacrificeSource,
    sacrificePlacements,
    setSacrificeSource,
    setSacrificePlacements,
    resetSacrificeState,
  } = useGameStore();
  const { addToast } = useUIStore();
  const { user } = useAuthStore();
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const loadGame = useCallback(async (id: string): Promise<GameState> => {
    try {
      const game = await gameApi.getGame(id);
      setCurrentGame(game);
      return game;
    } catch (error: unknown) {
      const msg = getErrorMessage(error, 'Failed to load game');
      setError(msg);
      addToast({ message: msg, type: 'error' });
      throw error;
    }
  }, [setCurrentGame, setError, addToast]);

  const connectToGame = useCallback(
    async (id: string) => {
      try {
        await wsManager.connect(id);
        const unsubscribe = wsManager.onMessage((message: WSMessage) => {
          const gameState = useGameStore.getState().currentGame;
          
          switch (message.type) {
            case 'game_state': {
              const wsGameState = message as WSGameState;
              const newState = {
                ...(gameState || {}),
                game_id: wsGameState.game_id,
                current_turn: wsGameState.state.current_turn,
                turn_number: wsGameState.state.turn_number,
                board_state: wsGameState.state.board_state,
                legal_moves: wsGameState.state.legal_moves,
                phase: wsGameState.state.phase as GameState['phase'],
                white_player: wsGameState.players.white,
                red_player: wsGameState.players.red,
                status: 'active' as const,
              };
              if (!gameState) {
                Object.assign(newState, {
                   move_history: [],
                   started_at: Math.floor(Date.now() / 1000),
                });
              }
              setCurrentGame(newState as GameState);
              setPendingMove(null);
              setIsMakingMove(false);
              break;
            }
            case 'move_accepted': {
              const moveAccepted = message as WSMoveAccepted;
              updateGameState({
                current_turn: moveAccepted.payload.next_turn,
                turn_number: moveAccepted.payload.move_number + 1,
                status: moveAccepted.payload.game_status as GameState['status'],
                // Phase might change here too, but state_update usually follows
              });
              setPendingMove(null);
              setIsMakingMove(false);
              resetSacrificeState();
              break;
            }
            case 'move_rejected': {
              const moveRejected = message as WSMoveRejected;
              setError(moveRejected.payload.message);
              setIsMakingMove(false);
              setPendingMove(null);
              audioManager.play('invalid_move');
              addToast({ message: moveRejected.payload.message, type: 'error' });
              break;
            }
            case 'state_update': {
              const stateUpdate = message as WSStateUpdate;
              updateGameState({
                current_turn: stateUpdate.payload.current_turn,
                turn_number: stateUpdate.payload.turn_number,
                board_state: stateUpdate.payload.board_state,
                legal_moves: stateUpdate.payload.legal_moves,
                phase: stateUpdate.payload.phase as GameState['phase'], 
              });
              setPendingMove(null);
              setIsMakingMove(false);
              break;
            }
            case 'game_end': {
              const gameEnd = message as WSGameEnd;
              updateGameState({
                status: gameEnd.payload.status,
                winner: gameEnd.payload.winner,
                win_condition: gameEnd.payload.win_condition as GameState['win_condition'],
                board_state: gameEnd.payload.final_state?.board_state,
                completed_at: Math.floor(Date.now() / 1000),
              });
              setPendingMove(null);
              setIsMakingMove(false);
              audioManager.play('game_end');
              const winnerMsg = gameEnd.payload.winner 
                ? `Game over! ${gameEnd.payload.winner.toUpperCase()} wins by ${gameEnd.payload.win_condition}!`
                : 'Game ended in a draw';
              addToast({ message: winnerMsg, type: 'info' });
              break;
            }
            case 'error': {
              const wsError = message as { payload?: { message?: string } };
              const errorMsg = wsError.payload?.message || 'WebSocket error';
              setError(errorMsg);
              addToast({ message: errorMsg, type: 'error' });
              break;
            }
          }
        });

        unsubscribeRef.current = unsubscribe;
        wsManager.onError((error) => {
          setError(error.message);
          addToast({ message: 'Connection error. Trying to reconnect...', type: 'error' });
        });

        return () => {
          if (unsubscribeRef.current) {
            unsubscribeRef.current();
            unsubscribeRef.current = null;
          }
        };
      } catch (error: unknown) {
        const errorMessage = getErrorMessage(error, 'Failed to connect to game');
        setError(errorMessage);
        addToast({ message: errorMessage, type: 'error' });
        throw error;
      }
    },
    [setCurrentGame, updateGameState, setIsMakingMove, setPendingMove, setError, addToast, resetSacrificeState]
  );

  const makeMove = useCallback(
    async (move: MakeMoveRequest) => {
      if (!gameId || !useGameStore.getState().currentGame) return;
      if (!wsManager.isConnected) {
        addToast({ message: 'Not connected to game server. Please refresh.', type: 'error' });
        return;
      }

      setIsMakingMove(true);
      setPendingMove(move);
      setError(null);

      try {
        wsManager.sendMove(move);
      } catch (error: unknown) {
        setIsMakingMove(false);
        setPendingMove(null);
        const errorMessage = getErrorMessage(error, 'Failed to send move');
        setError(errorMessage);
        addToast({ message: errorMessage, type: 'error' });
      }
    },
    [gameId, setIsMakingMove, setPendingMove, setError, addToast]
  );

  const resign = useCallback(async () => {
    if (!gameId || !wsManager.isConnected) return;
    try {
      wsManager.sendResign();
      addToast({ message: 'Resigned from game', type: 'info' });
    } catch (error: unknown) {
      addToast({ message: getErrorMessage(error, 'Failed to resign'), type: 'error' });
    }
  }, [gameId, addToast]);

  const selectPosition = useCallback(
    async (position: HexCoordinate) => {
      const currentGameState = useGameStore.getState().currentGame;
      if (!currentGameState || currentGameState.status !== 'active' || !user) return;

      const playerColor = currentGameState.white_player?.user_id === user.user_id ? 'white' : 'red';
      if (currentGameState.current_turn !== playerColor) {
        addToast({ message: "It's not your turn", type: 'warning' });
        return;
      }

      // We check for placement first if no sacrifice sequence is active
      const { sacrificeSource: currentSource } = useGameStore.getState();
      
      // If we are NOT in the middle of a sacrifice sequence (source selected)
      // Check if this click is a valid simple placement
      if (!currentSource) {
         const legalMoves = currentGameState.legal_moves ?? [];
         const isPlacement = legalMoves.some(
           m => m.type === 'placement' && m.position?.q === position.q && m.position?.r === position.r
         );
         
         // If it's a valid placement, do it immediately (unless it's also a sacrifice source?)
         // In Zai, a stone is either own (sacrifice source) or empty (placement). They are mutually exclusive.
         if (isPlacement) {
            setSelectedPosition(position);
            await makeMove({ type: 'placement', position });
            return;
         }
      }

      // Phase 2: Sacrifice Logic
      if (currentGameState.phase === 'expansion') {
        const legalMoves = currentGameState.legal_moves ?? [];
        const { sacrificeSource: currentSource, sacrificePlacements: currentPlacements } = useGameStore.getState();

        // 1. Select Source (Own Stone)
        const isOwnStone = currentGameState.board_state.stones.some(
          s => s.position.q === position.q && s.position.r === position.r && s.player === playerColor
        );

        if (isOwnStone) {
          const canSacrifice = legalMoves.some(
            m => m.type === 'sacrifice' && m.sacrifice_position?.q === position.q && m.sacrifice_position?.r === position.r
          );
          
          if (canSacrifice) {
            setSacrificeSource(position);
            setSacrificePlacements([]); // Reset placements when switching source
            setSelectedPosition(position);
          } else {
            addToast({ message: 'This stone cannot be sacrificed (connectivity rules)', type: 'warning' });
          }
          return;
        }

        // 2. Select Placements (Empty Spots) for Sacrifice
        if (currentSource) {
          // Check if spot is occupied (and not by Void)
          const isOccupied = currentGameState.board_state.stones.some(
            s => s.position.q === position.q && s.position.r === position.r
          );
          if (isOccupied) return;

          // Toggle placement
          const existsIdx = currentPlacements.findIndex(p => p.q === position.q && p.r === position.r);
          let newPlacements = [...currentPlacements];
          
          if (existsIdx >= 0) {
            newPlacements.splice(existsIdx, 1);
          } else {
            if (newPlacements.length < 2) {
              newPlacements.push(position);
            } else {
              // Replace oldest selection if trying to select a 3rd
              newPlacements = [newPlacements[1], position];
            }
          }

          setSacrificePlacements(newPlacements);

          // If we have 2 placements, check validity and auto-submit
          if (newPlacements.length === 2) {
             const isValidCombination = legalMoves.some(m => 
                m.type === 'sacrifice' &&
                m.sacrifice_position?.q === currentSource.q &&
                m.sacrifice_position?.r === currentSource.r &&
                m.placements?.some(p => p.q === newPlacements[0].q && p.r === newPlacements[0].r) &&
                m.placements?.some(p => p.q === newPlacements[1].q && p.r === newPlacements[1].r)
             );

             if (isValidCombination) {
                await makeMove({
                   type: 'sacrifice',
                   sacrifice_position: currentSource,
                   placements: newPlacements
                });
             } else {
                addToast({ message: 'Invalid sacrifice combination', type: 'warning' });
             }
          }
        }
      }
    },
    [gameId, user, makeMove, addToast, setSelectedPosition, setSacrificeSource, setSacrificePlacements]
  );

  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current();
      wsManager.disconnect();
    };
  }, []);

  return {
    game: currentGame,
    loadGame,
    connectToGame,
    makeMove,
    resign,
    selectPosition,
    sacrificeSource,
    sacrificePlacements, 
  };
}