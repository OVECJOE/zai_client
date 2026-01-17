import { GameBoard } from './GameBoard';
import { cn, formatTime } from '@/lib/utils';
import type { GameState, HexCoordinate, Move } from '@/types/api';
import { Clock, Shield, Zap } from 'lucide-react';
import GameTimer from '../ui/game-timer';

export function ActiveGameView({ game, legalMoves, onMove }: {
  game: GameState,
  legalMoves: Move[],
  onMove: (pos: HexCoordinate) => void
}) {
  const isWhiteTurn = game.current_turn === 'white';
  const phaseLabel = game.phase === 'placement' ? 'Deployment' : 'Sacrifice';
  const isSacrificePhase = game.phase === 'expansion';

  return (
    <div className="w-full h-full flex flex-col lg:grid lg:grid-cols-[300px_1fr_300px] gap-4 lg:gap-8 max-w-[1600px] mx-auto">
      
      {/* Mobile Header / Desktop Left Panel (Player 1 - White) */}
      <div className={cn(
        "game-card p-4 flex flex-row lg:flex-col items-center lg:items-start lg:justify-center gap-4 transition-all duration-300 border-l-4",
        isWhiteTurn ? "border-l-white bg-white/5 shadow-[0_0_30px_rgba(255,255,255,0.05)] scale-[1.02]" : "border-l-transparent opacity-60 grayscale"
      )}>
        <div className="relative">
          <div className="w-12 h-12 lg:w-20 lg:h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-400 border-2 border-white shadow-inner flex items-center justify-center text-black font-black text-xl lg:text-3xl">
            W
          </div>
          {isWhiteTurn && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black animate-pulse" />}
        </div>
        
        <div className="flex-1 text-left lg:w-full">
          <div className="flex items-center gap-2 lg:justify-between">
             <h3 className="text-white font-bold text-lg lg:text-2xl tracking-tight truncate">{game.white_player.username}</h3>
             <span className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono text-white/60">WHITE</span>
          </div>
          <div className="text-white/50 font-mono text-sm mb-2">{game.white_player.elo_rating} ELO</div>
          
          <GameTimer
            player="white"
            current={game.current_turn}
            timeRemaining={game.white_player.time_remaining ?? 0}
            countdown={!!game.white_player.time_remaining}
          />
        </div>
      </div>

      {/* Center Board Area */}
      <div className="order-first lg:order-none flex-1 min-h-[400px] relative flex flex-col justify-center">
        
        {/* Game Status HUD */}
        <div className="absolute top-0 left-0 right-0 flex justify-between items-start pointer-events-none z-10 px-4">
           <div className="flex flex-col gap-1 items-start">
              <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold flex items-center gap-1">
                {isSacrificePhase ? <Zap className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                Phase
              </span>
              <div className={cn(
                 "px-3 py-1 rounded border backdrop-blur-md text-xs font-bold uppercase tracking-wider shadow-lg transition-colors duration-500",
                 isSacrificePhase ? "bg-purple-500/20 border-purple-500 text-purple-300" : "bg-blue-500/20 border-blue-500 text-blue-300"
              )}>
                 {phaseLabel}
              </div>
           </div>

           <div className="flex flex-col gap-1 items-end">
              <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Turn</span>
              <div className="font-mono text-xl font-bold text-white drop-shadow-md">
                 #{game.turn_number}
              </div>
           </div>
        </div>

        {/* The Board */}
        <div className="w-full aspect-square max-h-[70vh] relative z-0">
          <GameBoard game={game} onMove={onMove} />
        </div>

        {/* Current Turn Notification (Mobile Overlay) */}
        <div className={cn(
          "lg:hidden absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full backdrop-blur-md border text-sm font-bold uppercase tracking-widest shadow-xl pointer-events-none transition-all duration-300",
          isWhiteTurn ? "bg-white/10 border-white/50 text-white" : "bg-red-500/10 border-red-500/50 text-red-400"
        )}>
           {isWhiteTurn ? "White's Turn" : "Red's Turn"}
        </div>
      </div>

      {/* Mobile Footer / Desktop Right Panel (Player 2 - Red) */}
      <div className={cn(
        "game-card p-4 flex flex-row lg:flex-col items-center lg:items-end lg:justify-center gap-4 transition-all duration-300 border-r-4",
        !isWhiteTurn ? "border-r-[#FF0033] bg-[#FF0033]/5 shadow-[0_0_30px_rgba(255,0,51,0.05)] scale-[1.02]" : "border-r-transparent opacity-60 grayscale"
      )}>
        <div className="flex-1 text-right lg:w-full order-2 lg:order-1">
          <div className="flex items-center justify-end gap-2 lg:flex-row-reverse lg:justify-between">
             <span className="px-1.5 py-0.5 rounded bg-[#FF0033]/20 text-[#FF0033] text-[10px] font-mono">RED</span>
             <h3 className="text-white font-bold text-lg lg:text-2xl tracking-tight truncate">{game.red_player.username}</h3>
          </div>
          <div className="text-white/50 font-mono text-sm mb-2">{game.red_player.elo_rating} ELO</div>
          
          <GameTimer
            player="red"
            current={game.current_turn}
            timeRemaining={game.red_player.time_remaining ?? 0}
            countdown={!!game.red_player.time_remaining}
          />
        </div>
        
        <div className="relative order-1 lg:order-2">
          <div className="w-12 h-12 lg:w-20 lg:h-20 rounded-full bg-gradient-to-br from-red-800 to-black border-2 border-[#FF0033] shadow-[0_0_15px_rgba(255,0,51,0.4)] flex items-center justify-center text-white font-black text-xl lg:text-3xl">
            R
          </div>
          {!isWhiteTurn && <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black animate-pulse" />}
        </div>
      </div>

    </div>
  )
}
