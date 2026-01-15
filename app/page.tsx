"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { useAuth } from '@/hooks/useAuth';
import { GameButton } from '@/components/ui/game-button';
import { gameApi } from '@/lib/api/endpoints';
import { ApiError } from '@/lib/api/client';
import Link from 'next/link';
import { GameShell, GamePage } from '@/components/layout/GameShell';
import { getErrorMessage } from '@/lib/utils/errors';
import type { BotDifficulty } from '@/types/api';

// Illustrations
import { PlacementState } from '@/components/illustrations/PlacementState';
import { ConnectivityState } from '@/components/illustrations/ConnectivityState';
import { SacrificeState } from '@/components/illustrations/SacrificeState';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { guestLogin, refreshProfile } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user?.user_id) {
      refreshProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.user_id]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [botDifficulty, setBotDifficulty] = useState<BotDifficulty>('medium');
  const [isBotLoading, setIsBotLoading] = useState(false);

  const handleQuickPlay = async () => {
    if (isAuthenticated) {
      router.push('/matchmaking');
      return;
    }
    
    setIsLoading(true);
    setError('');
    try {
      const displayName = `Guest_${Math.floor(Math.random() * 10000)}`;
      const response = await guestLogin(displayName);
      if (response) {
        router.push('/matchmaking');
      }
    } catch (err: unknown) {
      console.error('Guest login failed:', err);
      setError(getErrorMessage(err, 'Failed to start guest session. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayBot = async () => {
    setError('');
    setIsBotLoading(true);
    try {
      if (!isAuthenticated) {
        const displayName = `Guest_${Math.floor(Math.random() * 10000)}`;
        await guestLogin(displayName);
      }
      const botGame = await gameApi.createBotGame({
        player_color: 'white',
        difficulty: botDifficulty,
      });
      router.push(`/play/${botGame.game_id}`);
    } catch (err: unknown) {
      console.error('Bot game start failed:', err);
      if (err instanceof ApiError && err.status === 401) {
        useAuthStore.getState().clearAuth();
        setError('Session expired. Please try again.');
      } else {
        setError(getErrorMessage(err, 'Failed to start bot game. Please try again.'));
      }
    } finally {
      setIsBotLoading(false);
    }
  };

  return (
    <GameShell>
      <GamePage>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center min-h-[60vh]">
          {/* Left: Hero Copy */}
          <div className="space-y-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white/70 uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse"></span>
                v1.0 Live
              </div>
              <h1 className="game-title text-6xl sm:text-7xl lg:text-8xl leading-[0.9]">
                Distract<br />
                <span className="text-white">&</span> Capture
              </h1>
              <p className="game-text text-xl sm:text-2xl text-white/60 max-w-xl leading-relaxed">
                A ruthless game of connection and sacrifice. Master the hex grid to encircle your opponent before they cut your line.
              </p>
            </div>

            {error && (
              <div className="game-card p-4 bg-red-500/10 border-red-500/40 text-red-200">
                {error}
              </div>
            )}

            <div className="space-y-8">
              {/* Main Actions */}
              <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                <GameButton
                  size="lg"
                  variant="primary"
                  onClick={handleQuickPlay}
                  disabled={isLoading}
                  className="w-full sm:w-auto min-w-[200px] shadow-[0_0_40px_-10px_rgba(255,0,51,0.5)]"
                >
                  {isLoading ? 'Loading...' : isAuthenticated ? 'Play Ranked' : 'Play Guest'}
                </GameButton>
                {!isAuthenticated && (
                  <Link href="/register" className="w-full sm:w-auto">
                    <GameButton size="lg" variant="outline" className="w-full min-w-[200px]">
                      Create Account
                    </GameButton>
                  </Link>
                )}
              </div>

              {/* Bot Quick Play */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex justify-between items-baseline">
                  <div className="game-text text-xs text-white/40 uppercase tracking-widest font-bold">Training Grounds</div>
                  <div className="text-xs text-[#00F0FF] font-mono">AI_READY</div>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  {(['easy', 'medium', 'hard', 'expert'] as BotDifficulty[]).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setBotDifficulty(level)}
                      className={`px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider border transition-all ${
                        botDifficulty === level
                          ? 'border-white/80 bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                          : 'border-white/10 text-white/40 hover:border-white/30 hover:text-white'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                  <div className="flex-grow"></div>
                  <GameButton
                    size="sm"
                    variant="outline"
                    onClick={handlePlayBot}
                    disabled={isBotLoading}
                    className="w-full sm:w-auto"
                  >
                    {isBotLoading ? 'Loading...' : 'Start Match'}
                  </GameButton>
                </div>
              </div>
            </div>

            {/* User Stats */}
            {isAuthenticated && user && (
              <div className="grid grid-cols-2 gap-4">
                <div className="game-card p-5 border-l-4 border-l-[#FF0033]">
                  <div className="game-text text-[10px] text-white/40 uppercase tracking-widest">Rank Rating</div>
                  <div className="text-3xl font-black text-white mt-1">{user.elo_rating}</div>
                </div>
                <div className="game-card p-5 border-l-4 border-l-[#FFE500]">
                  <div className="game-text text-[10px] text-white/40 uppercase tracking-widest">Matches</div>
                  <div className="text-3xl font-black text-white mt-1">{user.games_played}</div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Visual */}
          <div className="hidden lg:block relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-[#FF0033]/20 via-[#7a00ff]/10 to-[#00F0FF]/20 blur-[100px] rounded-full pointer-events-none" />
            <div className="relative z-10 scale-125 origin-center">
               <ConnectivityState />
            </div>
          </div>
        </div>

        {/* Rules Section */}
        <div className="mt-24 sm:mt-32 space-y-16">
          <div className="text-center space-y-4">
            <h2 className="game-title text-4xl sm:text-5xl text-white">Rules of Engagement</h2>
            <p className="game-text text-white/50 max-w-2xl mx-auto">
              Zai is a game of perfect information. There is no luck, only strategy. 
              Master the three pillars of warfare to claim victory.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Rule 1: Placement */}
            <div className="game-card group hover:border-[#FFE500]/50 transition-colors duration-500">
              <div className="p-8 h-full flex flex-col">
                <div className="mb-6 transform group-hover:scale-105 transition-transform duration-500">
                  <PlacementState />
                </div>
                <div className="mt-auto space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded bg-[#FFE500]/10 text-[#FFE500] font-bold border border-[#FFE500]/20">1</span>
                    <h3 className="game-text text-xl text-white">The Foundation</h3>
                  </div>
                  <p className="game-text text-sm text-white/60 leading-relaxed">
                    <strong>Turns 1-12 (Phase 1):</strong> You may only place one stone per turn. Use this time to secure territory and block enemy paths.
                  </p>
                </div>
              </div>
            </div>

            {/* Rule 2: Connectivity */}
            <div className="game-card group hover:border-[#FF0033]/50 transition-colors duration-500">
              <div className="p-8 h-full flex flex-col">
                <div className="mb-6 transform group-hover:scale-105 transition-transform duration-500">
                  <ConnectivityState />
                </div>
                <div className="mt-auto space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded bg-[#FF0033]/10 text-[#FF0033] font-bold border border-[#FF0033]/20">2</span>
                    <h3 className="game-text text-xl text-white">The Golden Rule</h3>
                  </div>
                  <p className="game-text text-sm text-white/60 leading-relaxed">
                    Your stones must <strong>always</strong> form a single connected group. If you make a move that splits your group, you lose immediately.
                  </p>
                </div>
              </div>
            </div>

            {/* Rule 3: Sacrifice */}
            <div className="game-card group hover:border-[#00F0FF]/50 transition-colors duration-500">
              <div className="p-8 h-full flex flex-col">
                <div className="mb-6 transform group-hover:scale-105 transition-transform duration-500">
                  <SacrificeState />
                </div>
                <div className="mt-auto space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded bg-[#00F0FF]/10 text-[#00F0FF] font-bold border border-[#00F0FF]/20">3</span>
                    <h3 className="game-text text-xl text-white">The Surge</h3>
                  </div>
                  <p className="game-text text-sm text-white/60 leading-relaxed">
                    <strong>Turn 13+ (Phase 2):</strong> You gain the ability to <strong>Sacrifice</strong>. Remove 1 stone to place 2 new ones. Use this speed to outflank and encircle.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-24 py-16 text-center border-t border-white/5">
          <div className="max-w-xl mx-auto space-y-8">
            <h3 className="game-title text-3xl">Ready to command?</h3>
            <p className="game-text text-white/50">
              Join the leaderboard or practice against the neural network AI.
            </p>
            <GameButton
              size="lg"
              variant="primary"
              onClick={handleQuickPlay}
              className="min-w-[200px] shadow-[0_0_50px_-15px_rgba(255,0,51,0.6)]"
            >
              Enter The Arena
            </GameButton>
          </div>
        </div>
      </GamePage>
    </GameShell>
  );
}
