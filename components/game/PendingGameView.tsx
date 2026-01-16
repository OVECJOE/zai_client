"use client"

import { useState } from 'react';
import { GameBoard } from './GameBoard';
import { GameButton } from '@/components/ui/game-button';
import { useAuthStore } from '@/store/auth-store';
import type { GameState, HexCoordinate } from '@/types/api';
import { User, Copy, Check, Swords, Loader2, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PendingGameView({ game, onMove }: { game: GameState, onMove: (pos: HexCoordinate) => void }) {
  const { user } = useAuthStore();
  const [copied, setCopied] = useState(false);

  const copyGameId = () => {
    navigator.clipboard.writeText(game.game_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-4xl mx-auto">
      {/* Lobby Header */}
      <div className="text-center space-y-2 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 text-xs font-mono uppercase tracking-widest mb-2">
          <Loader2 className="w-3 h-3 animate-spin" />
          Lobby • Private Match
        </div>
        <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
          Waiting for Opponent
        </h1>
      </div>

      {/* VS Card */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Player (You) */}
        <div className="game-card p-6 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-white/5 to-white/0 border-white/10 relative overflow-hidden group">
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 border-2 border-white/20 flex items-center justify-center shadow-lg">
            <User className="w-10 h-10 text-white/80" />
          </div>
          <div className="text-center">
            <div className="text-white/50 text-xs uppercase tracking-wider font-bold mb-1">You</div>
            <div className="text-xl font-bold text-white">{user?.username || 'Player 1'}</div>
            <div className="text-sm font-mono text-white/40 mt-1">{user?.elo_rating || 1500} ELO</div>
          </div>
        </div>

        {/* VS Indicator */}
        <div className="flex flex-col items-center justify-center gap-4 relative">
          <div className="relative">
            <Swords className="w-16 h-16 text-white/20" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>
        </div>

        {/* Opponent (Waiting) */}
        <div className="game-card p-6 flex flex-col items-center justify-center gap-4 border-white/5 border-dashed relative overflow-hidden">
          <div className="absolute inset-0 animate-pulse bg-white/5" />
          <div className="w-20 h-20 rounded-xl bg-black/40 border-2 border-white/10 border-dashed flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-white/30 animate-spin" />
          </div>
          <div className="text-center relative z-10">
            <div className="text-white/30 text-xs uppercase tracking-wider font-bold mb-1">Opponent</div>
            <div className="text-xl font-bold text-white/50 italic">Searching...</div>
          </div>
        </div>
      </div>

      {/* Game ID Copy Section */}
      <div className="w-full max-w-md bg-black/20 backdrop-blur-md rounded-xl border border-white/10 p-4 flex flex-col items-center gap-3">
        <div className="flex items-center gap-2 text-white/50 text-xs uppercase tracking-widest">
          <Share2 className="w-3 h-3" />
          <span>Share Game ID</span>
        </div>
        <div className="flex w-full gap-2">
          <code className="flex-1 bg-black/40 rounded-lg border border-white/10 px-4 py-3 font-mono text-white/90 text-center select-all flex items-center justify-center">
            {game.game_id}
          </code>
          <GameButton onClick={copyGameId} variant="outline" size="sm" className="min-w-[100px]">
            {copied ? (
              <span className="flex items-center gap-2 text-emerald-400">
                <Check className="w-4 h-4" /> Copied
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Copy className="w-4 h-4" /> Copy
              </span>
            )}
          </GameButton>
        </div>
      </div>

      {/* Mini Board Preview */}
      <div className="opacity-50 scale-75 grayscale contrast-125 pointer-events-none absolute -z-10 blur-sm top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <GameBoard game={game} onMove={onMove} />
      </div>
    </div>
  )
}
