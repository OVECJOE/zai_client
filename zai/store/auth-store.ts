// Authentication store using Zustand

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, AuthResponse } from '@/types/api';
import { STORAGE_KEYS } from '@/config/constants';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  
  // Actions
  setAuth: (authData: AuthResponse) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      isAuthenticated: false,
      isGuest: false,

      setAuth: (authData: AuthResponse) => {
        const user: User = {
          user_id: authData.user_id,
          username: authData.username,
          elo_rating: authData.elo_rating,
          games_played: authData.games_played,
          is_guest: authData.is_guest,
        };

        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, authData.access_token);
          if (authData.refresh_token) {
            localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, authData.refresh_token);
          }
          localStorage.setItem(STORAGE_KEYS.USER_ID, authData.user_id);
          localStorage.setItem(STORAGE_KEYS.USERNAME, authData.username);
        }

        set({
          user,
          accessToken: authData.access_token,
          refreshToken: authData.refresh_token || null,
          expiresAt: authData.expires_at,
          isAuthenticated: true,
          isGuest: authData.is_guest,
        });
      },

      setUser: (user: User) => {
        set({ user });
      },

      updateUser: (updates: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }));
      },

      clearAuth: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER_ID);
          localStorage.removeItem(STORAGE_KEYS.USERNAME);
        }

        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          expiresAt: null,
          isAuthenticated: false,
          isGuest: false,
        });
      },
    }),
    {
      name: 'zai-auth-storage',
      storage: typeof window !== 'undefined' ? createJSONStorage(() => localStorage) : undefined,
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        expiresAt: state.expiresAt,
        isAuthenticated: state.isAuthenticated,
        isGuest: state.isGuest,
      }),
    }
  )
);
