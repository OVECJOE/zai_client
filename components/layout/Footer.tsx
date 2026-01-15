"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export function Footer({ className }: { className?: string }) {
  return (
    <footer
      className={cn(
        "border-t border-white/15 bg-[#05060A]/90 backdrop-blur-sm",
        className
      )}
    >
      <div className="game-container py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="game-text text-xs text-white/50">
          © {new Date().getFullYear()} Zai. All rights reserved.
        </div>
        <div className="flex gap-4 text-xs">
          <Link
            href="/leaderboard"
            className="game-text text-white/60 hover:text-white transition-colors"
          >
            Leaderboard
          </Link>
          <span className="game-text text-white/40 select-none">•</span>
          <span className="game-text text-white/50">
            Hex network strategy game.
          </span>
        </div>
      </div>
    </footer>
  );
}

