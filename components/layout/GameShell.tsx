"use client"

import * as React from "react";
import { cn } from "@/lib/utils";

export function GameShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-h-[calc(100vh-4rem)] game-bg", className)}>
      {children}
    </div>
  );
}

export function GamePage({
  title,
  subtitle,
  children,
  actions,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="game-container game-section">
      <div className="mx-auto w-full">
        {(title || subtitle || actions) && (
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              {title && <h1 className="game-title text-4xl sm:text-5xl">{title}</h1>}
              {subtitle && <p className="game-text text-white/70">{subtitle}</p>}
            </div>
            {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
