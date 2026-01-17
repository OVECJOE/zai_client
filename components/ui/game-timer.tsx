'use client';

import { Clock } from 'lucide-react';
import { cn, formatTime } from '@/lib/utils';
import { useEffect, useState, useRef } from 'react';

export interface GameTimerProps {
  player: 'white' | 'red';
  current?: 'white' | 'red';
  timeRemaining: number;
}

export default function GameTimer({ player, timeRemaining, current }: GameTimerProps) {
  const playerColor = player === 'white' ? 'white/80' : '[#FF0033]/90';
  const isActive = current === player;
  
  const [displayTime, setDisplayTime] = useState(timeRemaining);
  const endTimeRef = useRef<number>(Date.now() + timeRemaining * 1000);

  useEffect(() => {
    setDisplayTime(timeRemaining);
    endTimeRef.current = Date.now() + timeRemaining * 1000;
  }, [timeRemaining, isActive]);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const secondsLeft = Math.max(0, Math.ceil((endTimeRef.current - now) / 1000));
      
      setDisplayTime(prev => prev !== secondsLeft ? secondsLeft : prev);
      
      if (secondsLeft <= 0) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isActive]);

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
