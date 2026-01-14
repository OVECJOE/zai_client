// Matchmaking hook with WebSocket support

import { useCallback, useEffect, useState, useRef } from 'react';
import { matchmakingApi } from '@/lib/api/endpoints';
import { useUIStore } from '@/store/ui-store';
import { useAuthStore } from '@/store/auth-store';
import { WS_BASE_URL } from '@/config/constants';
import type { MatchmakingRequest, MatchmakingStatus, QueueStatistics } from '@/types/api';
import { getErrorMessage } from '@/lib/utils/errors';

export function useMatchmaking() {
  const { addToast } = useUIStore();
  const { accessToken } = useAuthStore();
  const [status, setStatus] = useState<MatchmakingStatus | null>(null);
  const [statistics, setStatistics] = useState<QueueStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load matchmaking status
  const loadStatus = useCallback(async () => {
    try {
      const currentStatus = await matchmakingApi.getStatus();
      setStatus(currentStatus);
      return currentStatus;
    } catch (error: unknown) {
      console.error('Failed to load matchmaking status:', error);
      setStatus({ in_queue: false });
    }
  }, []);

  // Load queue statistics
  const loadStatistics = useCallback(async () => {
    try {
      const stats = await matchmakingApi.getStatistics();
      setStatistics(stats);
      return stats;
    } catch (error: unknown) {
      console.error('Failed to load queue statistics:', error);
    }
  }, []);

  // Join matchmaking queue
  const joinQueue = useCallback(
    async (preferences: MatchmakingRequest = {}) => {
      setIsLoading(true);
      try {
        const newStatus = await matchmakingApi.join(preferences);
        setStatus(newStatus);
        
        await loadStatistics();
        
        addToast({
          message: 'Joined matchmaking queue',
          type: 'success',
        });
        return newStatus;
      } catch (error: unknown) {
        addToast({
          message: getErrorMessage(error, 'Failed to join queue'),
          type: 'error',
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [addToast, loadStatistics]
  );

  // Leave matchmaking queue
  const leaveQueue = useCallback(async () => {
    setIsLoading(true);
    try {
      await matchmakingApi.leave();
      setStatus({ in_queue: false });
      addToast({
        message: 'Left matchmaking queue',
        type: 'info',
      });
    } catch (error: unknown) {
      addToast({
        message: getErrorMessage(error, 'Failed to leave queue'),
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  // Connect WebSocket when in queue
  useEffect(() => {
    if (!status?.in_queue || !accessToken) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const ws = new WebSocket(`${WS_BASE_URL}/matchmaking?token=${accessToken}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'match_found') {
        addToast({
          message: 'Match found! Redirecting to game...',
          type: 'success',
        });
        window.location.href = `/play/${data.game_id}`;
      } else if (data.type === 'queue_update' || data.type === 'status') {
        setStatus(data.status);
      }
    };

    ws.onclose = () => {
      wsRef.current = null;
      
      if (status?.in_queue) {
        reconnectTimeoutRef.current = setTimeout(() => {
          setStatus((prev) => prev);
        }, 3000);
      }
    };

    return () => {
      ws.close();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [status?.in_queue, accessToken, addToast]);

  // Load initial status
  useEffect(() => {
    loadStatus();
    loadStatistics();
  }, [loadStatus, loadStatistics]);

  return {
    status,
    statistics,
    isLoading,
    joinQueue,
    leaveQueue,
    loadStatus,
    loadStatistics,
  };
}
