import { useState, useEffect } from 'react'
import { GameBoard } from './GameBoard'
import { gameApi } from '@/lib/api/endpoints'
import type { GameState, GameReplayResponse } from '@/types/api'

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
          // Set initial step to the end of the game
          setStep(data.total_moves);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Failed to fetch replay", error);
        if (mounted) setIsLoading(false);
      }
    }
    fetchReplay();
    return () => { mounted = false; };
  }, [game.game_id]);

  if (isLoading) {
    return <div className="p-8 text-center animate-pulse">Loading replay data...</div>;
  }

  if (!replayData) {
    return <div className="p-8 text-center text-red-400">Failed to load replay.</div>;
  }

  const currentSnapshot = replayData.snapshots[step];
  
  // Construct a temporary GameState for the Board component
  const snapshotGame: GameState = {
    ...game,
    board_state: currentSnapshot.board_state,
    current_turn: currentSnapshot.current_turn,
    turn_number: currentSnapshot.turn_number,
    legal_moves: [], // Disable interaction in replay
    status: 'completed' // Ensure board is read-only/static
  };

  return (
    <div className="game-card p-4 flex flex-col items-center">
      <div className="w-full max-w-2xl aspect-square relative">
         <GameBoard 
           game={snapshotGame} 
           legalMoves={[]} 
           onMove={() => {}} 
         />
      </div>
      
      <div className="mt-6 w-full max-w-xl flex flex-col gap-4 bg-black/20 p-4 rounded-xl backdrop-blur-sm border border-white/10">
        {/* Controls */}
        <div className="flex justify-center items-center gap-4">
          <button 
            onClick={() => setStep(0)} 
            disabled={step === 0}
            className="p-2 hover:bg-white/10 rounded disabled:opacity-30 disabled:hover:bg-transparent"
          >
            ⏮
          </button>
          <button 
            onClick={() => setStep(s => Math.max(0, s - 1))} 
            disabled={step === 0}
            className="p-2 hover:bg-white/10 rounded disabled:opacity-30 disabled:hover:bg-transparent"
          >
            ◀
          </button>
          
          <span className="font-mono text-lg min-w-[100px] text-center">
             {step} / {replayData.total_moves}
          </span>
          
          <button 
            onClick={() => setStep(s => Math.min(replayData.total_moves, s + 1))} 
            disabled={step === replayData.total_moves}
            className="p-2 hover:bg-white/10 rounded disabled:opacity-30 disabled:hover:bg-transparent"
          >
            ▶
          </button>
          <button 
            onClick={() => setStep(replayData.total_moves)} 
            disabled={step === replayData.total_moves}
            className="p-2 hover:bg-white/10 rounded disabled:opacity-30 disabled:hover:bg-transparent"
          >
            ⏭
          </button>
        </div>

        {/* Info Display */}
        <div className="text-center space-y-1">
          <div className="text-white/90 text-lg font-medium">
             Winner: <span className="text-emerald-400 capitalize">{game.winner || 'Draw'}</span>
          </div>
          <div className="text-white/60 text-sm capitalize">
             Condition: {game.win_condition?.replace('_', ' ') || 'Normal'}
          </div>
        </div>

        {/* Move Description */}
        <div className="bg-black/40 p-3 rounded text-center min-h-[3rem] flex items-center justify-center">
          {currentSnapshot.last_move ? (
            <span className="text-white/80">
              <span className={currentSnapshot.last_move.player === 'white' ? 'text-white font-bold' : 'text-red-400 font-bold'}>
                {currentSnapshot.last_move.player.toUpperCase()}
              </span>
              : {currentSnapshot.last_move.move.type} 
              {currentSnapshot.last_move.move.position 
                ? ` at (${currentSnapshot.last_move.move.position.q},${currentSnapshot.last_move.move.position.r})` 
                : ''}
            </span>
          ) : (
            <span className="text-white/40 italic">Game Start</span>
          )}
        </div>
      </div>
    </div>
  );
}
