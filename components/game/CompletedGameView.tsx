import { useState, useEffect } from 'react'
import { GameBoard } from './GameBoard'
import { gameApi } from '@/lib/api/endpoints'
import { cn } from '@/lib/utils'
import type { GameState, GameReplayResponse } from '@/types/api'
import { Trophy, SkipForward, ChevronLeft, ChevronRight, Play, Info, RotateCcw, Loader2 } from 'lucide-react';

export function CompletedGameView({ game }: { game: GameState }) {
  const [replayData, setReplayData] = useState<GameReplayResponse | null>(null);
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function fetchReplay() {
      try {
        const data = await gameApi.getReplay(game.game_id);
        if (mounted) {
          setReplayData(data);
          setStep(data.total_moves);
          setIsLoading(false);
        }
      } catch (error) {
        if (mounted) setIsLoading(false);
      }
    }
    fetchReplay();
    return () => { mounted = false; };
  }, [game.game_id]);

  if (isLoading) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <Loader2 className="w-12 h-12 text-white/20 animate-spin" />
          <div className="text-white/50 font-mono text-sm uppercase tracking-widest">Loading Replay...</div>
        </div>
      </div>
    );
  }

  if (!replayData) {
    return (
      <div className="game-card p-8 text-center border-red-500/30 bg-red-500/10 flex flex-col items-center gap-2">
        <Info className="w-8 h-8 text-red-400" />
        <span className="text-red-200">Failed to load replay data.</span>
      </div>
    );
  }

  const currentSnapshot = replayData.snapshots[step];

  const snapshotGame: GameState = {
    ...game,
    board_state: currentSnapshot.board_state,
    current_turn: currentSnapshot.current_turn,
    turn_number: currentSnapshot.turn_number,
    legal_moves: [],
    status: 'completed'
  };

  const winnerName = game.winner === 'white' ? game.white_player.username : (game.winner === 'red' ? game.red_player.username : null);
  const winColor = game.winner === 'white' ? 'text-white' : 'text-[#FF0033]';

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto gap-6">

      {/* Victory Banner */}
      <div className="w-full text-center space-y-4 py-8 relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="flex items-center justify-center gap-2 text-white/50">
          <Trophy className="w-4 h-4" />
          <h2 className="text-xs font-mono uppercase tracking-[0.3em]">Match Result</h2>
        </div>

        <div className="flex flex-col items-center gap-2">
          <h1 className={cn("text-4xl md:text-6xl font-black italic uppercase tracking-tighter drop-shadow-2xl scale-100 group-hover:scale-105 transition-transform duration-500", winColor)}>
            {game.winner === 'draw' ? 'Draw' : `${winnerName} Wins`}
          </h1>
          <div className="px-3 py-1 bg-white/10 rounded text-xs font-mono uppercase tracking-widest text-white/80">
            {game.win_condition?.replace('_', ' ') || 'Resignation'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6 w-full">

        {/* Main Board View */}
        <div className="game-card p-4 lg:p-8 flex items-center justify-center bg-black/20 aspect-square lg:aspect-auto min-h-[400px]">
          <div className="w-full max-w-[600px] pointer-events-none">
            {/* Note: pointer-events-none ensures user cannot interact with the board during replay */}
            <GameBoard game={snapshotGame} onMove={() => { }} />
          </div>
        </div>

        {/* Replay Controls Panel */}
        <div className="game-card p-0 flex flex-col overflow-hidden h-full max-h-[500px] lg:max-h-none">
          {/* Move Info Header */}
          <div className="p-4 border-b border-white/10 bg-white/5">
            <div className="flex justify-between items-end">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1">Turn</div>
                <div className="text-2xl font-mono font-bold text-white leading-none">
                  {currentSnapshot.turn_number}
                  <span className="text-white/30 text-base ml-1">/ {replayData.total_moves}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1">Action</div>
                <div className={cn("text-lg font-bold capitalize leading-none", currentSnapshot.last_move?.player === 'white' ? 'text-white' : 'text-[#FF0033]')}>
                  {currentSnapshot.last_move?.move.type || "Start"}
                </div>
              </div>
            </div>
          </div>

          {/* Move Description Body */}
          <div className="flex-1 bg-black/40 relative flex items-center justify-center p-6">
            {currentSnapshot.last_move ? (
              <div className="text-center space-y-2">
                <div className={cn("text-sm font-bold uppercase tracking-wider", currentSnapshot.last_move.player === 'white' ? 'text-white' : 'text-[#FF0033]')}>
                  {currentSnapshot.last_move.player}
                </div>
                <div className="text-white/80 text-lg">
                  {currentSnapshot.last_move.move.type === 'placement' ? 'Placed Stone' : 'Sacrificed Stone'}
                </div>
                {currentSnapshot.last_move.move.position && (
                  <div className="font-mono text-white/40 text-sm">
                    @ {currentSnapshot.last_move.move.position.q}, {currentSnapshot.last_move.move.position.r}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-white/30 italic flex flex-col items-center gap-2">
                <Play className="w-8 h-8 opacity-50" />
                <span>Game Start</span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="p-4 bg-white/5 border-t border-white/10 space-y-4">
            {/* Progress Bar */}
            <input
              type="range"
              min="0"
              max={replayData.total_moves}
              value={step}
              onChange={(e) => setStep(parseInt(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white hover:accent-[#FFE500]"
            />

            <div className="grid grid-cols-5 gap-2">
              <button onClick={() => setStep(0)} disabled={step === 0} className="p-2 flex items-center justify-center rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 border border-white/10 transition-colors">
                <RotateCcw className="w-4 h-4" />
              </button>
              <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} className="p-2 flex items-center justify-center rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 border border-white/10 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center justify-center text-xs font-mono text-white/30">
                {step === replayData.total_moves ? 'END' : 'PLAY'}
              </div>
              <button onClick={() => setStep(s => Math.min(replayData.total_moves, s + 1))} disabled={step === replayData.total_moves} className="p-2 flex items-center justify-center rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 border border-white/10 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
              <button onClick={() => setStep(replayData.total_moves)} disabled={step === replayData.total_moves} className="p-2 flex items-center justify-center rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 border border-white/10 transition-colors">
                <SkipForward className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
