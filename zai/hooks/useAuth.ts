// Authentication hook

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { authApi, userApi } from '@/lib/api/endpoints';
import { useUIStore } from '@/store/ui-store';
import { getErrorMessage } from '@/lib/utils/errors';

export function useAuth() {
  const router = useRouter();
  const {
    user,
    accessToken,
    isAuthenticated,
    isGuest,
    setAuth,
    setUser,
    clearAuth,
    updateUser,
  } = useAuthStore();
  const { addToast } = useUIStore();

  const login = useCallback(
    async (username: string, password: string) => {
      try {
        const response = await authApi.login({ username, password });
        setAuth(response);
        addToast({
          message: 'Successfully logged in',
          type: 'success',
        });
        return response;
      } catch (error: unknown) {
        addToast({
          message: getErrorMessage(error, 'Login failed'),
          type: 'error',
        });
        throw error;
      }
    },
    [setAuth, addToast]
  );

  const register = useCallback(
    async (username: string, password: string, email?: string) => {
      try {
        const response = await authApi.register({ username, password, email });
        setAuth(response);
        addToast({
          message: 'Account created successfully',
          type: 'success',
        });
        return response;
      } catch (error: unknown) {
        addToast({
          message: getErrorMessage(error, 'Registration failed'),
          type: 'error',
        });
        throw error;
      }
    },
    [setAuth, addToast]
  );

  const guestLogin = useCallback(
    async (displayName: string) => {
      try {
        const response = await authApi.guestLogin({ display_name: displayName });
        setAuth(response);
        addToast({
          message: 'Guest session started',
          type: 'info',
        });
        return response;
      } catch (error: unknown) {
        addToast({
          message: getErrorMessage(error, 'Guest login failed'),
          type: 'error',
        });
        throw error;
      }
    },
    [setAuth, addToast]
  );

  const convertGuest = useCallback(
    async (username: string, password: string, email?: string) => {
      try {
        await authApi.convertGuest({ username, password, email });
        addToast({
          message: 'Account converted successfully',
          type: 'success',
        });
        // Refresh user data
        if (user) {
          const updatedUser = await userApi.getProfile(user.user_id);
          setUser(updatedUser);
        }
      } catch (error: unknown) {
        addToast({
          message: getErrorMessage(error, 'Account conversion failed'),
          type: 'error',
        });
        throw error;
      }
    },
    [user, setUser, addToast]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
      router.push('/');
    }
  }, [clearAuth, router]);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    try {
      const updatedUser = await userApi.getProfile(user.user_id);
      setUser(updatedUser);
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    }
  }, [user, setUser]);

  return {
    user,
    accessToken,
    isAuthenticated,
    isGuest,
    login,
    register,
    guestLogin,
    convertGuest,
    logout,
    refreshProfile,
    updateUser,
  };
}
