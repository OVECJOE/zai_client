"use client"

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { GameButton } from '@/components/ui/game-button';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="border-b-2 border-white/20 bg-[#0A0B14]/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <Link href="/" className="game-logo text-xl sm:text-2xl">
          ZAI
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2 md:gap-3">
          {isAuthenticated ? (
            <>
              <Link href="/matchmaking">
                <GameButton variant="primary" size="sm">
                  <span className="hidden sm:inline">Play</span>
                  <span className="sm:hidden">▶</span>
                </GameButton>
              </Link>
              <Link href="/leaderboard" className="hidden md:block">
                <button className="game-text text-sm text-white/70 hover:text-white transition-colors px-2 sm:px-3 py-2">
                  Leaderboard
                </button>
              </Link>
              {user && (
                <Link href={`/profile/${user.user_id}`}>
                  <button className="game-text text-xs sm:text-sm text-white/70 hover:text-white transition-colors px-2 sm:px-3 py-2 max-w-[70px] sm:max-w-[120px] truncate">
                    {user.username}
                  </button>
                </Link>
              )}
              <button 
                onClick={handleLogout}
                className="game-text text-xs sm:text-sm text-white/70 hover:text-white transition-colors px-2 sm:px-3 py-2"
              >
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">✕</span>
              </button>
            </>
          ) : (
            <>
              <Link href="/login">
                <button className="game-text text-xs sm:text-sm text-white/70 hover:text-white transition-colors px-2 sm:px-3 py-2">
                  Login
                </button>
              </Link>
              <Link href="/register">
                <GameButton variant="outline" size="sm">
                  <span className="hidden sm:inline">Sign Up</span>
                  <span className="sm:hidden">+</span>
                </GameButton>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
