"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { GameButton } from '@/components/ui/game-button';
import { getErrorMessage } from '@/lib/utils/errors';

export function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await register(username, password, email || undefined);
      router.push('/');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Registration failed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl game-card p-6 sm:p-8">
      <div className="space-y-2 mb-6">
        <div className="game-title text-3xl">Create Account</div>
        <div className="game-text text-white/70">Save progress, track rating, play rated.</div>
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
              minLength={3}
              maxLength={20}
              pattern="[a-zA-Z0-9_]+"
              autoComplete="username"
              className="game-input"
            />
            <p className="game-text text-xs text-white/50">
              3-20 characters, alphanumeric and underscore only
            </p>
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="game-text text-sm text-white/80 uppercase tracking-wider">
              Email (optional)
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
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
              minLength={8}
              maxLength={128}
              autoComplete="new-password"
              className="game-input"
            />
            <p className="game-text text-xs text-white/50">
              8-128 characters, must include at least 3 of: uppercase, lowercase, digits, special characters
            </p>
          </div>
          <GameButton type="submit" className="w-full" disabled={isLoading} size="lg">
            {isLoading ? 'Creating account...' : 'Create Account'}
          </GameButton>
      </form>
    </div>
  );
}
