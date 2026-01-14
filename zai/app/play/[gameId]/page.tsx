"use client"

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useGame } from '@/hooks/useGame';
import { GameBoard } from '@/components/game/GameBoard';
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
          <GameButton variant="outline" size="sm" onClick={() => router.push('/')}>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Game Board */}
        <div className="lg:col-span-2">
          <div className="game-card p-3 sm:p-4">
            <GameBoard game={game} onMove={selectPosition} />
            
            {/* Turn indicator below board - Enhanced */}
            <div className="mt-4">
              {game.status === 'active' && game.current_turn ? (
                <div className="text-center">
                  <div className="inline-flex items-center gap-3 px-6 py-3 rounded-lg bg-white/5 border border-white/10">
                    <div className={`w-3 h-3 rounded-full animate-pulse ${
                      game.current_turn === 'white' ? 'bg-white shadow-lg shadow-white/50' : 'bg-[#FF0033] shadow-lg shadow-[#FF0033]/50'
                    }`} />
                    <div className="game-text text-lg">
                      <span className="text-white/60">TURN: </span>
                      <span className={`font-bold tracking-wide ${
                        game.current_turn === 'white' ? 'text-white' : 'text-[#FF0033]'
                      }`}>
                        {game.current_turn.toUpperCase()}
                      </span>
                    </div>
                    {game.phase && (
                      <div className="text-xs text-white/40 uppercase tracking-widest border-l border-white/20 pl-3">
                        {game.phase}
                      </div>
                    )}
                  </div>
                </div>
              ) : game.status !== 'active' ? (
                <div className="text-center">
                  <div className="inline-flex flex-col items-center gap-2 px-8 py-4 rounded-lg bg-gradient-to-b from-white/10 to-transparent border border-white/20">
                    <div className="game-text text-2xl font-bold tracking-wide">
                      {game.winner ? (
                        <span className={game.winner === 'white' ? 'text-white' : 'text-[#FF0033]'}>
                          {game.winner.toUpperCase()} WINS!
                        </span>
                      ) : (
                        <span className="text-[#FFE500]">DRAW</span>
                      )}
                    </div>
                    {game.win_condition && (
                      <div className="text-sm text-white/60 uppercase tracking-wider">
                        Victory by {game.win_condition}
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Game Info Sidebar */}
        <div className="space-y-4">
          {/* Status Card - Enhanced */}
          <div className="game-card p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="game-text text-white/80 uppercase tracking-wider">Game Status</div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                game.status === 'active' ? 'bg-[#00D26A]/20 text-[#00D26A] border border-[#00D26A]/30' : 
                game.status === 'completed' ? 'bg-[#FFE500]/20 text-[#FFE500] border border-[#FFE500]/30' : 
                'bg-white/10 text-white/60 border border-white/20'
              }`}>
                {game.status}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-white">{game.turn_number}</div>
                <div className="game-text text-xs text-white/50 uppercase tracking-wider mt-1">Moves</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-white capitalize">{game.phase || 'N/A'}</div>
                <div className="game-text text-xs text-white/50 uppercase tracking-wider mt-1">Phase</div>
              </div>
            </div>
            
            {/* Stone Count */}
            {game.board_state?.stones && (
              <div className="pt-3 border-t border-white/10">
                <div className="game-text text-xs text-white/50 uppercase tracking-wider mb-3">Board Control</div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-white" />
                    <span className="text-2xl font-bold text-white">
                      {game.board_state.stones.filter((s: any) => s.player === 'white').length}
                    </span>
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-white via-white/20 to-[#FF0033]" />
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-[#FF0033]">
                      {game.board_state.stones.filter((s: any) => s.player === 'red').length}
                    </span>
                    <div className="w-3 h-3 rounded-full bg-[#FF0033]" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Players Card - Enhanced */}
          <div className="game-card p-6 space-y-5">
            <div className="game-text text-white/80 uppercase tracking-wider">Players</div>
            <div className="space-y-4">
              {/* White Player */}
              <div className={`flex items-center justify-between gap-3 p-3 rounded-lg transition-all duration-300 ${
                game.current_turn === 'white' && game.status === 'active' 
                  ? 'bg-white/10 ring-2 ring-white/30 shadow-lg shadow-white/20' 
                  : 'bg-white/5'
              }`}>
                <div className="min-w-0 flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-white shadow-md flex-shrink-0" />
                  <div>
                    <div className="game-text text-white truncate font-medium">
                      {game.white_player?.username || 'Unknown'}
                    </div>
                    <div className="game-text text-xs text-white/50">
                      ELO {game.white_player?.elo_rating || '—'}
                    </div>
                  </div>
                </div>
                {localTime.white !== null && (
                  <div className="text-right">
                    <div className={`text-lg font-extrabold ${localTime.white < 60 ? 'text-red-500' : 'text-[#FFE500]'}`}>
                      {Math.floor(localTime.white / 60)}:{Math.floor(localTime.white % 60).toString().padStart(2, '0')}
                    </div>
                    <div className="game-text text-xs text-white/50">time</div>
                  </div>
                )}
              </div>

              <div className="h-px bg-white/10" />

              {/* Red Player */}
              <div className={`flex items-center justify-between gap-3 p-3 rounded-lg transition-all duration-300 ${
                game.current_turn === 'red' && game.status === 'active' 
                  ? 'bg-[#FF0033]/10 ring-2 ring-[#FF0033]/30 shadow-lg shadow-[#FF0033]/20' 
                  : 'bg-[#FF0033]/5'
              }`}>
                <div className="min-w-0 flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-[#FF0033] shadow-md flex-shrink-0" />
                  <div>
                    <div className="game-text text-white truncate font-medium">
                      {game.red_player?.username || 'Unknown'}
                    </div>
                    <div className="game-text text-xs text-white/50">
                      ELO {game.red_player?.elo_rating || '—'}
                    </div>
                  </div>
                </div>
                {localTime.red !== null && (
                  <div className="text-right">
                    <div className={`text-lg font-extrabold ${localTime.red < 60 ? 'text-red-500' : 'text-[#FFE500]'}`}>
                      {Math.floor(localTime.red / 60)}:{Math.floor(localTime.red % 60).toString().padStart(2, '0')}
                    </div>
                    <div className="game-text text-xs text-white/50">time</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tips Card */}
          <div className="game-card p-6">
            <div className="game-text text-white/80 uppercase tracking-wider mb-3">How to Play</div>
            <ul className="space-y-2">
              <li className="game-text text-white/60 text-sm flex items-start gap-2">
                <span className="text-[#FFE500]">•</span>
                <span>Yellow-highlighted positions are legal moves</span>
              </li>
              <li className="game-text text-white/60 text-sm flex items-start gap-2">
                <span className="text-[#FFE500]">•</span>
                <span>Click a highlighted position to place your stone</span>
              </li>
              <li className="game-text text-white/60 text-sm flex items-start gap-2">
                <span className="text-[#FFE500]">•</span>
                <span>Build connected networks and encircle your opponent</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </GamePage>
  );
}
