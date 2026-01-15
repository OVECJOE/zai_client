import { useCallback, useEffect, useRef } from 'react';
import { useGameStore } from '@/store/game-store';
import { gameApi } from '@/lib/api/endpoints';
import { wsManager } from '@/lib/api/websocket';
import { useUIStore } from '@/store/ui-store';
import { useAuthStore } from '@/store/auth-store';
import { audioManager } from '@/lib/audio/audio-manager';
import type { GameState, MakeMoveRequest, HexCoordinate } from '@/types/api';
import type { WSMessage, WSGameState, WSMoveAccepted, WSMoveRejected, WSStateUpdate, WSGameEnd } from '@/types/api';
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
  } = useGameStore();
  const { addToast } = useUIStore();
  const { user } = useAuthStore();
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Load initial game state via HTTP (before WebSocket connects)
  const loadGame = useCallback(async (id: string): Promise<GameState> => {
    try {
      const game = await gameApi.getGame(id);
      setCurrentGame(game);
      return game;
    } catch (error: unknown) {
      const msg = getErrorMessage(error, 'Failed to load game');
      setError(msg);
      addToast({
        message: msg,
        type: 'error',
      });
      throw error;
    }
  }, [setCurrentGame, setError, addToast]);

  // Connect to WebSocket for real-time game updates
  const connectToGame = useCallback(
    async (id: string) => {
      try {
        // Connect to WebSocket
        await wsManager.connect(id);

        // Set up message handler
        const unsubscribe = wsManager.onMessage((message: WSMessage) => {
          const gameState = useGameStore.getState().currentGame;
          
          switch (message.type) {
            // Initial game state sent by server on connection
            case 'game_state': {
              const wsGameState = message as WSGameState;
              if (gameState) {
                setCurrentGame({
                  ...gameState,
                  current_turn: wsGameState.state.current_turn,
                  turn_number: wsGameState.state.turn_number,
                  board_state: wsGameState.state.board_state,
                  legal_moves: wsGameState.state.legal_moves,
                  phase: wsGameState.state.phase as GameState['phase'],
                  white_player: wsGameState.players.white,
                  red_player: wsGameState.players.red,
                } as GameState);
              } else {
                // If no game state yet, create from WS message
                setCurrentGame({
                  game_id: wsGameState.game_id,
                  current_turn: wsGameState.state.current_turn,
                  turn_number: wsGameState.state.turn_number,
                  board_state: wsGameState.state.board_state,
                  legal_moves: wsGameState.state.legal_moves,
                  phase: wsGameState.state.phase as GameState['phase'],
                  white_player: wsGameState.players.white,
                  red_player: wsGameState.players.red,
                  status: 'active',
                  move_history: [],
                  started_at: Math.floor(Date.now() / 1000),
                } as GameState);
              }
              setPendingMove(null);
              setIsMakingMove(false);
              break;
            }

            // Server accepted our move
            case 'move_accepted': {
              const moveAccepted = message as WSMoveAccepted;
              // Update turn info - full board update comes via state_update
              updateGameState({
                current_turn: moveAccepted.payload.next_turn,
                turn_number: moveAccepted.payload.move_number + 1,
                status: moveAccepted.payload.game_status as GameState['status'],
              });
              setPendingMove(null);
              setIsMakingMove(false);
              break;
            }

            // Server rejected our move
            case 'move_rejected': {
              const moveRejected = message as WSMoveRejected;
              setError(moveRejected.payload.message);
              setIsMakingMove(false);
              setPendingMove(null);
              audioManager.play('invalid_move');
              addToast({
                message: moveRejected.payload.message,
                type: 'error',
              });
              break;
            }

            // Board state update (after any move, including opponent/bot moves)
            case 'state_update': {
              const stateUpdate = message as WSStateUpdate;
              updateGameState({
                current_turn: stateUpdate.payload.current_turn,
                turn_number: stateUpdate.payload.turn_number,
                board_state: stateUpdate.payload.board_state,
                legal_moves: stateUpdate.payload.legal_moves,
              });
              setPendingMove(null);
              setIsMakingMove(false);
              break;
            }

            // Game ended
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
              addToast({
                message: winnerMsg,
                type: 'info',
              });
              break;
            }

            // Heartbeat response
            case 'pong':
              break;

            // Server error
            case 'error': {
              const wsError = message as { payload?: { message?: string; error_code?: string } };
              const errorMsg = wsError.payload?.message || 'WebSocket error';
              setError(errorMsg);
              addToast({
                message: errorMsg,
                type: 'error',
              });
              break;
            }
          }
        });

        // Store unsubscribe for cleanup
        unsubscribeRef.current = unsubscribe;

        // Handle connection errors
        wsManager.onError((error) => {
          setError(error.message);
          addToast({
            message: 'Connection error. Trying to reconnect...',
            type: 'error',
          });
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
        addToast({
          message: errorMessage,
          type: 'error',
        });
        throw error;
      }
    },
    [setCurrentGame, updateGameState, setIsMakingMove, setPendingMove, setError, addToast]
  );

  // Make a move via WebSocket ONLY
  const makeMove = useCallback(
    async (move: MakeMoveRequest) => {
      if (!gameId) {
        return;
      }
      
      const currentGameState = useGameStore.getState().currentGame;
      if (!currentGameState) {
        return;
      }

      // Check if WebSocket is connected
      if (!wsManager.isConnected) {
        addToast({
          message: 'Not connected to game server. Please refresh.',
          type: 'error',
        });
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
        addToast({
          message: errorMessage,
          type: 'error',
        });
      }
    },
    [gameId, setIsMakingMove, setPendingMove, setError, addToast]
  );

  const resign = useCallback(async () => {
    if (!gameId) return;

    if (!wsManager.isConnected) {
      addToast({
        message: 'Not connected to game server',
        type: 'error',
      });
      return;
    }

    try {
      wsManager.sendResign();
      addToast({
        message: 'Resigned from game',
        type: 'info',
      });
    } catch (error: unknown) {
      addToast({
        message: getErrorMessage(error, 'Failed to resign'),
        type: 'error',
      });
    }
    // @eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

  // Select position and make placement move
  const selectPosition = useCallback(
    async (position: HexCoordinate) => {
      const currentGameState = useGameStore.getState().currentGame;
      if (!currentGameState || currentGameState.status !== 'active') {
        return;
      }
      if (!user) {
        return;
      }

      // Determine player color
      const playerColor =
        currentGameState.white_player?.user_id === user.user_id ? 'white' : 'red';
      
      // Check if it's our turn
      if (currentGameState.current_turn !== playerColor) {
        addToast({
          message: "It's not your turn",
          type: 'warning',
        });
        return;
      }

      setSelectedPosition(position);

      // Check if this is a valid placement move
      const legalMoves = currentGameState.legal_moves ?? [];
      const isValidMove = legalMoves.some(
        (move) =>
          move.type === 'placement' &&
          move.position?.q === position.q &&
          move.position?.r === position.r
      );

      if (isValidMove) {
        await makeMove({
          type: 'placement',
          position,
        });
      } else {
        addToast({
          message: 'Invalid move position',
          type: 'warning',
        });
      }
    },
    [gameId, user, setSelectedPosition, makeMove, addToast]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
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
  };
}
