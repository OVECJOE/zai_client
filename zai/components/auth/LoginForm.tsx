"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { GameButton } from '@/components/ui/game-button';
import { getErrorMessage } from '@/lib/utils/errors';

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(username, password);
      router.push('/');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Login failed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl game-card p-6 sm:p-8">
      <div className="space-y-2 mb-6">
        <div className="game-title text-3xl">Login</div>
        <div className="game-text text-white/70">Continue your progress.</div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="game-card p-3 bg-red-500/20 border-red-500/50 text-red-200 text-sm">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label htmlFor="username" className="game-text text-sm text-white/80 uppercase tracking-wider">
              Username
            </label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              className="game-input"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="game-text text-sm text-white/80 uppercase tracking-wider">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="game-input"
            />
          </div>
          <GameButton type="submit" className="w-full" disabled={isLoading} size="lg">
            {isLoading ? 'Logging in...' : 'Login'}
          </GameButton>
      </form>
    </div>
  );
}
