"use client"

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { userApi } from '@/lib/api/endpoints';
import type { User, GameHistoryItem } from '@/types/api';
import { GameShell, GamePage } from '@/components/layout/GameShell';

export default function ProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  const [user, setUser] = useState<User | null>(null);
  const [gameHistory, setGameHistory] = useState<GameHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const [profileData, historyData] = await Promise.all([
          userApi.getProfile(userId),
          userApi.getGameHistory(userId, { limit: 20 }),
        ]);
        setUser(profileData);
        setGameHistory(historyData.games);
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      loadProfile();
    }
  }, [userId]);

  if (isLoading) {
    return (
      <GameShell>
      <GamePage title="Profile" subtitle="Loading…">
          <div className="game-card p-8 text-center text-white/70">Loading profile…</div>
        </GamePage>
      </GameShell>
    );
  }

  if (!user) {
    return (
      <GameShell>
        <GamePage title="Profile" subtitle="User not found">
          <div className="game-card p-8 text-center text-white/70">User not found</div>
        </GamePage>
      </GameShell>
    );
  }

  return (
    <GameShell>
      <GamePage
        title={user.username}
        subtitle={user.is_guest ? 'Guest account' : 'Registered account'}
      >
        <div className="grid grid-cols-1 gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="game-card p-6">
              <div className="game-text text-white/60 uppercase tracking-wider text-xs">ELO</div>
              <div className="text-4xl font-extrabold text-[#FFE500]">{user.elo_rating}</div>
            </div>
            <div className="game-card p-6">
              <div className="game-text text-white/60 uppercase tracking-wider text-xs">Games</div>
              <div className="text-4xl font-extrabold text-white">{user.games_played}</div>
            </div>
            <div className="game-card p-6">
              <div className="game-text text-white/60 uppercase tracking-wider text-xs">Win rate</div>
              <div className="text-4xl font-extrabold text-[#00FF88]">
                {user.win_rate !== undefined ? `${(user.win_rate * 100).toFixed(1)}%` : '—'}
              </div>
            </div>
          </div>

          {(user.games_won !== undefined || user.games_lost !== undefined) && (
            <div className="game-card p-6">
              <div className="game-text text-white/80 uppercase tracking-wider mb-4">Stats</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <div className="game-text text-xs text-white/50 uppercase">Wins</div>
                  <div className="text-2xl font-bold text-white">{user.games_won ?? '—'}</div>
                </div>
                <div>
                  <div className="game-text text-xs text-white/50 uppercase">Losses</div>
                  <div className="text-2xl font-bold text-white">{user.games_lost ?? '—'}</div>
                </div>
                <div>
                  <div className="game-text text-xs text-white/50 uppercase">Draws</div>
                  <div className="text-2xl font-bold text-white">{user.games_drawn ?? '—'}</div>
                </div>
              </div>
            </div>
          )}

          <div className="game-card p-2 sm:p-3">
            <div className="px-4 py-3 flex items-end justify-between gap-4">
              <div>
                <div className="game-text text-white/80 uppercase tracking-wider">Recent Games</div>
                <div className="game-text text-white/50 text-sm">Last 20 games</div>
              </div>
            </div>
            <div className="divide-y divide-white/10">
              {gameHistory.length === 0 ? (
                <div className="px-4 py-10 text-center game-text text-white/60">No games yet</div>
              ) : (
                gameHistory.map((game) => (
                  <a
                    key={game.game_id}
                    href={`/play/${game.game_id}`}
                    className="block px-4 py-3 flex items-center justify-between gap-4 hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <div className="min-w-0">
                      <div className="game-text text-white truncate">vs {game.opponent.username}</div>
                      <div className="game-text text-xs text-white/50">
                        {game.player_color} • {game.result}
                        {game.win_condition ? ` • ${game.win_condition}` : ''}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      {game.elo_change !== undefined ? (
                        <div className={`text-lg font-extrabold ${game.elo_change > 0 ? 'text-[#00FF88]' : 'text-[#FF0033]'}`}>
                          {game.elo_change > 0 ? '+' : ''}{game.elo_change}
                        </div>
                      ) : (
                        <div className="text-lg font-extrabold text-white/50">—</div>
                      )}
                      <div className="game-text text-xs text-white/50">
                        {game.completed_at ? new Date(game.completed_at * 1000).toLocaleDateString() : 'Ongoing'}
                      </div>
                    </div>
                  </a>
                ))
              )}
            </div>
          </div>
        </div>
      </GamePage>
    </GameShell>
  );
}
