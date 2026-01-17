'use client';

import { Clock } from 'lucide-react';
import { cn, formatTime } from '@/lib/utils';
import { useEffect, useState, useRef } from 'react';

export interface GameTimerProps {
  player: 'white' | 'red';
  current?: 'white' | 'red';
  timeRemaining: number | null;
  countdown?: boolean;
}

export default function GameTimer({ 
  player, 
  timeRemaining, 
  current, 
  countdown = true 
}: GameTimerProps) {
  const playerColor = player === 'white' ? 'white/80' : '[#FF0033]/90';
  const isActive = current === player;
  
  const [displayTime, setDisplayTime] = useState(timeRemaining ?? 0);
  
  const anchorTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    const safeTime = timeRemaining ?? 0;
    const now = Date.now();

    if (countdown) {
      anchorTimeRef.current = now + safeTime * 1000;
    } else {
      anchorTimeRef.current = now - safeTime * 1000;
    }

    if (!isActive) {
      setDisplayTime(safeTime);
    }
  }, [timeRemaining, isActive, countdown]);

  useEffect(() => {
    if (!isActive) return;

    const tick = () => {
      const now = Date.now();
      let newValue = 0;

      if (countdown) {
        newValue = Math.max(0, Math.ceil((anchorTimeRef.current - now) / 1000));
      } else {
        newValue = Math.floor((now - anchorTimeRef.current) / 1000);
      }

      setDisplayTime(prev => (prev !== newValue ? newValue : prev));

      if (countdown && newValue <= 0) {
        return false;
      }
      return true;
    };

    if (!tick()) return;

    const interval = setInterval(() => {
      if (!tick()) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isActive, countdown]);

  return (
    <div className={cn(
      "flex items-center gap-2 font-mono text-sm lg:text-base p-2 bg-black/20 rounded",
      `text-${playerColor}`,
      { 'justify-end': player === 'red' }
    )}>
      <Clock className="w-4 h-4" />
      <span>{formatTime(displayTime)}</span>
    </div>
  );
}
