"use client"

import { AuthGuard } from '@/components/auth/AuthGuard';
import { useMatchmaking } from '@/hooks/useMatchmaking';
import { GameButton } from '@/components/ui/game-button';
import { useState, useEffect } from 'react';
import { GamePage, GameShell } from '@/components/layout/GameShell';
import { useRouter } from 'next/navigation';

export default function MatchmakingPage() {
  return (
    <AuthGuard>
      <GameShell>
        <MatchmakingContent />
      </GameShell>
    </AuthGuard>
  );
}

function MatchmakingContent() {
  const router = useRouter();
  const [isInitializing, setIsInitializing] = useState(true);
  const { status, statistics, isLoading, joinQueue, leaveQueue, loadStatus } = useMatchmaking();
  const [preferredColor, setPreferredColor] = useState<'white' | 'red' | 'random'>('random');
  const [timeControl, setTimeControl] = useState<'blitz' | 'rapid' | 'classical' | undefined>(undefined);
  const [isRated, setIsRated] = useState(true);

  // Initial load check
  useEffect(() => {
    loadStatus().finally(() => setIsInitializing(false));
  }, [loadStatus]);

  const handleJoin = async () => {
    await joinQueue({
      preferred_color: preferredColor,
      time_control: timeControl,
      is_rated: isRated,
    });
  };

  // Calculate if queue is empty
  const isQueueEmpty = statistics && statistics.queue_length === 0;

  if (isInitializing) {
    return (
      <GamePage title="Matchmaking" subtitle="Connecting...">
         <div className="game-card p-12 text-center">
            <div className="animate-pulse text-white/60">Checking queue status...</div>
         </div>
      </GamePage>
    );
  }

  return (
    <GamePage
      title="Matchmaking"
      subtitle={isQueueEmpty ? "No players currently online. Try playing against the AI!" : "Configure your game preferences and join the queue."}
    >

        {status?.in_queue ? (
          <div className="game-card p-8">
            <div className="text-center space-y-8">
              <div className="text-xl text-white/90 font-semibold mb-4">
                Searching for opponent...
              </div>
              <div>
                <div className="text-6xl font-bold text-[#FF0033] mb-2">{status.queue_position || 1}</div>
                <div className="game-text text-white/60 uppercase tracking-wider">Position in queue</div>
              </div>
              {status.estimated_wait_time !== undefined && (
                <div>
                  <div className="text-3xl font-bold text-[#FFE500] mb-1">{status.estimated_wait_time}s</div>
                  <div className="game-text text-white/60 uppercase tracking-wider">Estimated wait</div>
                </div>
              )}
              
              {/* FIX: Warning text updated to reflect reality */}
              <div className="text-sm text-yellow-400/80 max-w-md mx-auto bg-yellow-400/10 p-3 rounded border border-yellow-400/20">
                ⚠️ Please stay on this page. Leaving will remove you from the queue.
              </div>

              {/* FIX: Add "Play vs Bot" option if queue is empty */}
              {isQueueEmpty && (
                <div className="pt-4 border-t border-white/10">
                    <p className="text-white/60 mb-4 text-sm">Tired of waiting?</p>
                    <GameButton 
                        onClick={() => {
                            leaveQueue();
                            router.push('/#training-grounds'); // Assuming this anchor exists on home
                        }} 
                        variant="outline" 
                        size="md" 
                        className="w-full"
                    >
                        Play vs AI Bot
                    </GameButton>
                </div>
              )}

              <GameButton onClick={leaveQueue} variant="danger" size="lg" className="w-full">
                Leave Queue
              </GameButton>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="game-card p-8 space-y-8">
              <div>
                <label className="game-text text-white/80 mb-3 block uppercase tracking-wider">Color</label>
                <div className="flex gap-3">
                  <GameButton
                    variant={preferredColor === 'white' ? 'primary' : 'outline'}
                    onClick={() => setPreferredColor('white')}
                    size="md"
                    className="flex-1"
                  >
                    White
                  </GameButton>
                  <GameButton
                    variant={preferredColor === 'red' ? 'accent' : 'outline'}
                    onClick={() => setPreferredColor('red')}
                    size="md"
                    className="flex-1"
                  >
                    Red
                  </GameButton>
                  <GameButton
                    variant={preferredColor === 'random' ? 'primary' : 'outline'}
                    onClick={() => setPreferredColor('random')}
                    size="md"
                    className="flex-1"
                  >
                    Random
                  </GameButton>
                </div>
              </div>

              <div>
                <label className="game-text text-white/80 mb-3 block uppercase tracking-wider">Time Control</label>
                <div className="grid grid-cols-2 gap-3">
                  <GameButton
                    variant={timeControl === 'blitz' ? 'primary' : 'outline'}
                    onClick={() => setTimeControl('blitz')}
                    size="sm"
                  >
                    Blitz (5 min)
                  </GameButton>
                  <GameButton
                    variant={timeControl === 'rapid' ? 'primary' : 'outline'}
                    onClick={() => setTimeControl('rapid')}
                    size="sm"
                  >
                    Rapid (30 min)
                  </GameButton>
                  <GameButton
                    variant={timeControl === 'classical' ? 'primary' : 'outline'}
                    onClick={() => setTimeControl('classical')}
                    size="sm"
                  >
                    Classical (60 min)
                  </GameButton>
                  <GameButton
                    variant={timeControl === undefined ? 'primary' : 'outline'}
                    onClick={() => setTimeControl(undefined)}
                    size="sm"
                  >
                    No Limit
                  </GameButton>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="rated"
                  checked={isRated}
                  onChange={(e) => setIsRated(e.target.checked)}
                  className="w-5 h-5 rounded border-2 border-white/30 bg-transparent checked:bg-[#0066FF]"
                />
                <label htmlFor="rated" className="game-text text-white/80 cursor-pointer uppercase tracking-wider">
                  Rated Game
                </label>
              </div>

              <GameButton
                onClick={handleJoin}
                disabled={isLoading}
                size="lg"
                className="w-full"
              >
                {isLoading ? 'Joining Queue...' : 'Join Matchmaking'}
              </GameButton>
            </div>

            {statistics && (
              <div className="game-card p-6">
                <h3 className="game-text text-white font-semibold mb-3 uppercase tracking-wider">Queue Status</h3>
                <div className="game-text text-sm space-y-3 text-white/60">
                  <div className="flex justify-between items-center">
                    <span>Players online:</span>
                    <span className={`font-bold text-lg ${statistics.queue_length > 0 ? 'text-green-400' : 'text-yellow-400'}`}>
                      {statistics.queue_length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Avg. wait time:</span>
                    <span className="font-bold text-white">{statistics.average_wait_time.toFixed(0)}s</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
    </GamePage>
  );
}
