"use client"

import { useState } from 'react';
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

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { guestLogin } = useAuth();
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
      
      // Handle stale token (401) by clearing auth and retrying as guest
      if (err instanceof ApiError && err.status === 401) {
        // Clear stale auth state
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left: Hero copy */}
          <div className="space-y-8">
            <div className="space-y-5">
              <h1 className="game-title text-5xl sm:text-6xl">Hex Network Strategy</h1>
              <p className="game-text text-xl sm:text-2xl text-white/80 max-w-xl">
                Strategic hex warfare on a living hex-grid. Build networks, deny space, and encircle to win.
              </p>
            </div>

            {error && (
              <div className="game-card p-4 bg-red-500/20 border-red-500/50 text-red-200">
                {error}
              </div>
            )}

            {/* Primary CTA */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <GameButton
                size="lg"
                variant="primary"
                onClick={handleQuickPlay}
                disabled={isLoading}
                className="min-w-[240px]"
              >
                {isLoading ? 'Starting...' : isAuthenticated ? 'Play Now' : 'Play as Guest'}
              </GameButton>
              {!isAuthenticated && (
                <Link href="/register">
                  <GameButton size="lg" variant="outline" className="min-w-[240px]">
                    Create Account
                  </GameButton>
                </Link>
              )}
            </div>

            {/* Bot CTA */}
            <div className="space-y-2 pt-4">
              <div className="game-text text-xs text-white/55 uppercase tracking-wider">
                Practice vs Bot
              </div>
              <div className="flex flex-wrap gap-3 items-center">
                <div className="flex flex-wrap gap-2">
                  {(['easy', 'medium', 'hard', 'expert'] as BotDifficulty[]).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setBotDifficulty(level)}
                      className={`px-3 py-1 rounded-full text-xs game-text border transition-colors ${
                        botDifficulty === level
                          ? 'border-white/70 bg-white/15 text-white'
                          : 'border-white/20 text-white/60 hover:border-white/50 hover:text-white'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
                <GameButton
                  size="sm"
                  variant="outline"
                  onClick={handlePlayBot}
                  disabled={isBotLoading}
                  className="ml-1"
                >
                  {isBotLoading ? 'Starting Bot…' : 'Play vs Bot'}
                </GameButton>
              </div>
            </div>

            {/* Quick Stats for Authenticated Users */}
            {isAuthenticated && user && (
              <div className="grid grid-cols-2 gap-4 max-w-md">
                <div className="game-card p-6">
                  <div className="game-text text-xs text-white/50 uppercase tracking-wider">Rating</div>
                  <div className="text-4xl font-extrabold text-[#FF0033]">{user.elo_rating}</div>
                </div>
                <div className="game-card p-6">
                  <div className="game-text text-xs text-white/50 uppercase tracking-wider">Games</div>
                  <div className="text-4xl font-extrabold text-[#FFE500]">{user.games_played}</div>
                </div>
              </div>
            )}

          </div>

          {/* Right: Visual + explainer cards */}
          <div className="space-y-4">
            <div className="game-card p-5 sm:p-6">
              <div className="game-text text-white/80 uppercase tracking-wider mb-3">How it plays</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="game-card p-4">
                  <div className="text-[#FFE500] font-extrabold text-2xl">1</div>
                  <div className="game-text text-white mt-1">Place stones</div>
                  <div className="game-text text-xs text-white/50 mt-1">Expand your network legally.</div>
                </div>
                <div className="game-card p-4">
                  <div className="text-[#FFE500] font-extrabold text-2xl">2</div>
                  <div className="game-text text-white mt-1">Create threats</div>
                  <div className="game-text text-xs text-white/50 mt-1">Cut routes & deny space.</div>
                </div>
                <div className="game-card p-4">
                  <div className="text-[#FFE500] font-extrabold text-2xl">3</div>
                  <div className="game-text text-white mt-1">Encircle</div>
                  <div className="game-text text-xs text-white/50 mt-1">Trap to secure the win.</div>
                </div>
              </div>
            </div>

            <div className="game-card p-5 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="game-text text-white/80 uppercase tracking-wider">Board preview</div>
                <div className="game-text text-white/50 text-xs">Hex grid • legal moves glow</div>
              </div>
              <div className="rounded-xl overflow-hidden border border-white/10 bg-black/20">
                <svg viewBox="0 0 800 340" className="w-full h-auto">
                  <rect x="0" y="0" width="800" height="340" fill="rgba(0,0,0,0.25)" />
                  {(() => {
                    const rows = 10;
                    const cols = 16;
                    const dx = 46;
                    const dy = 30;
                    const ox = 30;
                    const oy = 40;
                    const hexR = 14; // outline radius
                    const holeR = 8.5; // hole radius
                    const stoneR = 7.5; // stone radius (must be smaller than hole)

                    const centers: Array<{ x: number; y: number; key: string }> = [];
                    for (let row = 0; row < rows; row++) {
                      for (let col = 0; col < cols; col++) {
                        const x = ox + col * dx + (row % 2 ? dx / 2 : 0);
                        const y = oy + row * dy;
                        centers.push({ x, y, key: `${row}-${col}` });
                      }
                    }

                    // Pick some known centers for stones so they're aligned to holes.
                    const pick = (row: number, col: number) =>
                      centers.find((c) => c.key === `${row}-${col}`) ?? centers[0];

                    const s1 = pick(4, 7);
                    const s2 = pick(5, 8);
                    const s3 = pick(4, 9);
                    const s4 = pick(5, 10);
                    const s5 = pick(4, 11);
                    const glow = pick(3, 9);

                    return (
                      <>
                        <g opacity="0.4" stroke="rgba(255,255,255,0.30)" strokeWidth="2" fill="none">
                          {centers.map((c) => (
                            <polygon
                              key={`hex-${c.key}`}
                              points={[
                                [c.x, c.y - hexR],
                                [c.x + hexR * 0.86, c.y - hexR * 0.5],
                                [c.x + hexR * 0.86, c.y + hexR * 0.5],
                                [c.x, c.y + hexR],
                                [c.x - hexR * 0.86, c.y + hexR * 0.5],
                                [c.x - hexR * 0.86, c.y - hexR * 0.5],
                              ]
                                .map((p) => p.join(','))
                                .join(' ')}
                            />
                          ))}
                        </g>

                        {/* holes */}
                        <g opacity="0.55">
                          {centers.map((c) => (
                            <circle
                              key={`hole-${c.key}`}
                              cx={c.x}
                              cy={c.y}
                              r={holeR}
                              fill="rgba(0,0,0,0.35)"
                              stroke="rgba(255,255,255,0.18)"
                              strokeWidth="2"
                            />
                          ))}
                        </g>

                        {/* stones (aligned + smaller than holes) */}
                        <circle cx={s1.x} cy={s1.y} r={stoneR} fill="#FFFFFF" />
                        <circle cx={s2.x} cy={s2.y} r={stoneR} fill="#FF0033" />
                        <circle cx={s3.x} cy={s3.y} r={stoneR} fill="#FFFFFF" />
                        <circle cx={s4.x} cy={s4.y} r={stoneR} fill="#FF0033" />
                        <circle cx={s5.x} cy={s5.y} r={stoneR} fill="#FFFFFF" />

                        {/* legal move highlight (aligned to a hole) */}
                        <circle
                          cx={glow.x}
                          cy={glow.y}
                          r={holeR + 3.5}
                          fill="rgba(255,229,0,0.18)"
                          stroke="#FFE500"
                          strokeWidth="3"
                        />
                      </>
                    );
                  })()}
                </svg>
              </div>
              <div className="mt-3 game-text text-white/60 text-sm">
                Clean rules, tactical depth. Perfect for quick guest play or long-term ranked climbing.
              </div>
            </div>
          </div>
        </div>

        {/* Lower sections */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="game-card p-6">
            <div className="game-text text-white/80 uppercase tracking-wider mb-2">Instant</div>
            <div className="game-text text-white text-lg">Guest-first onboarding</div>
            <div className="game-text text-white/60 text-sm mt-2">
              Tap “Play as Guest” and you’re queued. Create an account only if you want to.
            </div>
          </div>
          <div className="game-card p-6">
            <div className="game-text text-white/80 uppercase tracking-wider mb-2">Skill</div>
            <div className="game-text text-white text-lg">ELO-ranked competition</div>
            <div className="game-text text-white/60 text-sm mt-2">
              Rated matchmaking for serious games. Track progress and climb the leaderboard.
            </div>
          </div>
          <div className="game-card p-6">
            <div className="game-text text-white/80 uppercase tracking-wider mb-2">Live</div>
            <div className="game-text text-white text-lg">Real-time updates</div>
            <div className="game-text text-white/60 text-sm mt-2">
              WebSocket gameplay with responsive move feedback and state updates.
            </div>
          </div>
        </div>
        <div className="mt-8 flex justify-center">
          <Link href="/leaderboard">
            <GameButton variant="outline" size="sm">
              View Leaderboard
            </GameButton>
          </Link>
    </div>
      </GamePage>
    </GameShell>
  );
}
