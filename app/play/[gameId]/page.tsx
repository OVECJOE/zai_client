"use client"

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useGame } from '@/hooks/useGame';
import { PendingGameView } from '@/components/game/PendingGameView';
import { ActiveGameView } from '@/components/game/ActiveGameView';
import { CompletedGameView } from '@/components/game/CompletedGameView';
import { GameButton } from '@/components/ui/game-button';
import { GameShell, GamePage } from '@/components/layout/GameShell';
import { useGameStore } from '@/store/game-store';
import { wsManager } from '@/lib/api/websocket';

export default function PlayGamePage() {
  return (
    <AuthGuard>
      <GameShell>
        <GameContent />
      </GameShell>
    </AuthGuard>
  );
}

function GameContent() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.gameId as string;
  const { game, loadGame, connectToGame, resign, selectPosition } = useGame(gameId);
  const { error, updateGameState } = useGameStore();
  const [isLoading, setIsLoading] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [localTime, setLocalTime] = useState<{white: number | null, red: number | null}>({white: null, red: null});

  useEffect(() => {
    if (!gameId) return;

    let isMounted = true;

    const initializeGame = async () => {
      setIsLoading(true);
      setInitError(null);
      try {
        await loadGame(gameId);
        if (!isMounted) return;
        await connectToGame(gameId);
      } catch (err) {
        if (!isMounted) return;
        setInitError(err instanceof Error ? err.message : 'Failed to load game');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeGame();

    return () => {
      isMounted = false;
      wsManager.disconnect();
    };
  }, [gameId, loadGame, connectToGame]);

  // Initialize local time from game state
  useEffect(() => {
    if (game?.white_player?.time_remaining !== undefined && game?.red_player?.time_remaining !== undefined) {
      setLocalTime({
        white: game.white_player.time_remaining,
        red: game.red_player.time_remaining
      });
    }
  }, [game?.white_player?.time_remaining, game?.red_player?.time_remaining]);

  // Countdown timer for active player
  useEffect(() => {
    if (!game || game.status !== 'active' || localTime.white === null || localTime.red === null) {
      return;
    }

    const interval = setInterval(() => {
      setLocalTime(prev => {
        const newTime = { ...prev };
        
        if (game.current_turn === 'white' && prev.white !== null && prev.white > 0) {
          newTime.white = Math.max(0, prev.white - 1);
          if (newTime.white === 0) {
            updateGameState({ status: 'completed', winner: 'red', win_condition: 'timeout' });
          }
        } else if (game.current_turn === 'red' && prev.red !== null && prev.red > 0) {
          newTime.red = Math.max(0, prev.red - 1);
          if (newTime.red === 0) {
            updateGameState({ status: 'completed', winner: 'white', win_condition: 'timeout' });
          }
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [game?.status, game?.current_turn, localTime.white, localTime.red]);

  if (isLoading) {
    return (
      <GamePage title="Game" subtitle="Loading…">
        <div className="game-card p-12 text-center">
          <div className="animate-pulse">
            <div className="game-text text-white/70 text-xl">Loading game…</div>
            <div className="game-text text-white/40 text-sm mt-2">Connecting to game server</div>
          </div>
        </div>
      </GamePage>
    );
  }

  if (initError) {
    return (
      <GamePage title="Error" subtitle="Failed to load game">
        <div className="game-card p-8 text-center space-y-4">
          <div className="game-text text-red-400">{initError}</div>
          <GameButton variant="outline" onClick={() => router.push('/')}>
            Return Home
          </GameButton>
        </div>
      </GamePage>
    );
  }

  if (!game) {
    return (
      <GamePage title="Game Not Found">
        <div className="game-card p-8 text-center space-y-4">
          <div className="game-text text-white/70">Game not found or has ended.</div>
          <GameButton variant="outline" onClick={() => router.push('/')}>
            Return Home
          </GameButton>
        </div>
      </GamePage>
    );
  }

  const isGameOver = game.status === 'completed' || game.status === 'abandoned';

  let gameView = null;
  if (game.status === 'pending') {
    gameView = <PendingGameView game={game} onMove={selectPosition} />;
  } else if (game.status === 'active') {
    gameView = <ActiveGameView game={game} legalMoves={game.legal_moves ?? []} onMove={selectPosition} />;
  } else if (game.status === 'completed' || game.status === 'abandoned') {
    // The CompletedGameView now handles fetching the replay data internally.
    gameView = <CompletedGameView game={game} />;
  }

  return (
    <GamePage
      title={isGameOver ? 'Game Over' : 'Live Game'}
      subtitle={`Game ID: ${game.game_id.slice(0, 8)}…`}
      actions={
        game.status === 'active' ? (
          <GameButton variant="danger" size="sm" onClick={resign}>
            Resign
          </GameButton>
        ) : (
          <GameButton variant="outline" size="sm" onClick={() => router.push('/') }>
            New Game
          </GameButton>
        )
      }
    >
      {error && (
        <div className="game-card p-4 mb-4 bg-red-500/20 border-red-500/50 text-red-200">
          {error}
        </div>
      )}
      <div className="flex flex-col gap-6">{gameView}</div>
    </GamePage>
  );
}
