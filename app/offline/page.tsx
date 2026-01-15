"use client"

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0B14] p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="text-6xl mb-4">🔌</div>
        <h1 className="game-logo text-4xl text-white">You're Offline</h1>
        <p className="text-white/60 text-lg">
          You've lost your internet connection. Some features may be limited until you're back online.
        </p>
        <div className="game-card p-6 space-y-4">
          <h2 className="text-white font-bold">You can still:</h2>
          <ul className="text-left text-white/70 space-y-2">
            <li>✓ View your profile</li>
            <li>✓ Review past games</li>
            <li>✓ Practice against AI (coming soon)</li>
          </ul>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-[#FF0033] text-white rounded-lg font-bold hover:bg-[#CC0029] transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
