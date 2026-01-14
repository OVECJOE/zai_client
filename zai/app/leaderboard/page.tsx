"use client"

import { useEffect, useMemo, useState } from 'react';
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

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const response = await leaderboardApi.getLeaderboard({ limit: 100 });
        setEntries(response.entries);
        setTotal(response.total);
      } catch (error) {
        console.error('Failed to load leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLeaderboard();
  }, []);

  const filteredEntries = useMemo(() => {
    let list = [...entries];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((e) => e.username.toLowerCase().includes(q));
    }

    if (minGames > 0) {
      list = list.filter((e) => e.games_played >= minGames);
    }

    list.sort((a, b) => {
      let av: number;
      let bv: number;
      switch (sortBy) {
        case 'games':
          av = a.games_played;
          bv = b.games_played;
          break;
        case 'win':
          av = a.win_rate;
          bv = b.win_rate;
          break;
        case 'elo':
        default:
          av = a.elo_rating;
          bv = b.elo_rating;
      }
      if (av === bv) return 0;
      const cmp = av < bv ? -1 : 1;
      return direction === 'desc' ? -cmp : cmp;
    });

    return list;
  }, [entries, search, minGames, sortBy, direction]);

  if (isLoading) {
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
          <div className="flex flex-col items-end gap-2">
            <div className="game-text text-white/60 text-xs sm:text-sm">
              {filteredEntries.length} / {total} players
            </div>
            <div className="flex flex-wrap gap-2 justify-end">
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
          {/* Filters row */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex-1 max-w-xs space-y-1">
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
            <div className="flex items-center gap-2">
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

          {/* List */}
          <div className="divide-y divide-white/10">
            {filteredEntries.map((entry, index) => (
              <div
                key={entry.user_id}
                className="flex items-center justify-between gap-4 px-2 sm:px-4 py-3 hover:bg-white/5 transition-colors"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div className="w-10 text-right game-text text-white/50">
                    #{entry.rank}
                  </div>
                  <div className="min-w-0">
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
          </div>
        </div>
      </GamePage>
    </GameShell>
  );
}
