"use client"

import { useEffect, useState } from 'react';
import { leaderboardApi } from '@/lib/api/endpoints';
import type { LeaderboardEntry } from '@/types/api';
import { GameShell, GamePage } from '@/components/layout/GameShell';

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [minGames, setMinGames] = useState(0);
  const [sortBy, setSortBy] = useState<'elo' | 'games' | 'win'>('elo');
  const [direction, setDirection] = useState<'desc' | 'asc'>('desc');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Load leaderboard with filters and pagination
  const loadLeaderboard = async (reset = false) => {
    setIsLoading(true);
    try {
      const params: any = {
        limit: 50,
        offset: reset ? 0 : offset,
        search: search.trim() || undefined,
        min_games: minGames > 0 ? minGames : undefined,
        sort_by: sortBy,
        direction,
      };
      const response = await leaderboardApi.getLeaderboard(params);
      setTotal(response.total);
      setHasMore(response.entries.length + (reset ? 0 : entries.length) < response.total);
      setEntries(reset ? response.entries : [...entries, ...response.entries]);
      setOffset(reset ? response.entries.length : offset + response.entries.length);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load and filter/sort changes
  useEffect(() => {
    loadLeaderboard(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, minGames, sortBy, direction]);

  // Infinite scroll
  useEffect(() => {
    if (!hasMore || isLoading) return;
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 300 &&
        hasMore && !isLoading
      ) {
        loadLeaderboard();
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoading, offset, search, minGames, sortBy, direction]);

  if (isLoading && entries.length === 0) {
    return (
      <GameShell>
        <GamePage title="Leaderboard" subtitle="Top players across all queues.">
          <div className="game-card p-8 text-center text-white/70">Loading…</div>
        </GamePage>
      </GameShell>
    );
  }

  return (
    <GameShell>
      <GamePage
        title="Leaderboard"
        subtitle="Top players across all queues."
        actions={
          <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
            <div className="game-text text-white/60 text-xs sm:text-sm">
              {entries.length} / {total} players
            </div>
            <div className="flex flex-wrap gap-2 justify-end w-full">
              <button
                type="button"
                className={`px-3 py-1 rounded-full text-xs game-text ${
                  sortBy === 'elo' ? 'bg-white/20 text-white' : 'bg-white/5 text-white/60'
                }`}
                onClick={() => setSortBy('elo')}
              >
                ELO
              </button>
              <button
                type="button"
                className={`px-3 py-1 rounded-full text-xs game-text ${
                  sortBy === 'games' ? 'bg-white/20 text-white' : 'bg-white/5 text-white/60'
                }`}
                onClick={() => setSortBy('games')}
              >
                Games
              </button>
              <button
                type="button"
                className={`px-3 py-1 rounded-full text-xs game-text ${
                  sortBy === 'win' ? 'bg-white/20 text-white' : 'bg-white/5 text-white/60'
                }`}
                onClick={() => setSortBy('win')}
              >
                Win%
              </button>
              <button
                type="button"
                className={`px-3 py-1 rounded-full text-xs game-text ${
                  direction === 'desc' ? 'bg-white/20 text-white' : 'bg-white/5 text-white/60'
                }`}
                onClick={() => setDirection(direction === 'desc' ? 'asc' : 'desc')}
                aria-label="Toggle sort direction"
              >
                {direction === 'desc' ? '↓' : '↑'}
              </button>
            </div>
          </div>
        }
      >
        <div className="game-card p-4 sm:p-5 space-y-4">
          {/* Filters row - fully responsive */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between w-full">
            <div className="flex-1 max-w-xs space-y-1 w-full">
              <label className="game-text text-xs text-white/60 uppercase tracking-wider">
                Search player
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="game-input w-full text-sm"
                placeholder="Username…"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="game-text text-xs text-white/60 uppercase tracking-wider">
                Min games
              </label>
              <input
                type="number"
                min={0}
                value={minGames}
                onChange={(e) => setMinGames(Number(e.target.value) || 0)}
                className="game-input w-24 text-sm"
              />
            </div>
          </div>

          {/* List - infinite scroll, responsive */}
          <div className="divide-y divide-white/10">
            {entries.map((entry, index) => (
              <div
                key={entry.user_id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 px-2 sm:px-4 py-3 hover:bg-white/5 transition-colors"
              >
                <div className="flex min-w-0 items-center gap-2 sm:gap-4 w-full">
                  <div className="w-10 text-right game-text text-white/50">
                    #{entry.rank}
                  </div>
                  <div className="min-w-0 w-full">
                    <div className="game-text text-white truncate flex items-center gap-2">
                      {index === 0 && (
                        <span className="inline-block h-5 w-5 rounded-full bg-[#FFEB3B] shadow-md" />
                      )}
                      {index === 1 && (
                        <span className="inline-block h-5 w-5 rounded-full bg-[#B0BEC5] shadow-md" />
                      )}
                      {index === 2 && (
                        <span className="inline-block h-5 w-5 rounded-full bg-[#FFB74D] shadow-md" />
                      )}
                      <span className="truncate">{entry.username}</span>
                    </div>
                    <div className="game-text text-xs text-white/50">
                      {entry.games_played} games • {(entry.win_rate * 100).toFixed(1)}% win rate
                    </div>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-xl font-extrabold text-[#FFE500]">{entry.elo_rating}</div>
                  <div className="game-text text-xs text-white/50">ELO</div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="text-center py-4 text-white/60">Loading…</div>
            )}
            {!hasMore && entries.length > 0 && (
              <div className="text-center py-4 text-white/40">End of leaderboard</div>
            )}
          </div>
        </div>
      </GamePage>
    </GameShell>
  );
}
