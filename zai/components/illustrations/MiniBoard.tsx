"use client"

import React from 'react';

export interface Stone {
  q: number;
  r: number;
  color: 'white' | 'red';
  isGhost?: boolean;
  isSacrifice?: boolean;
}

export interface Highlight {
  q: number;
  r: number;
  color: string;
  type?: 'move' | 'placement' | 'warning';
}

interface MiniBoardProps {
  stones?: Stone[];
  highlights?: Highlight[];
  className?: string;
}

export function MiniBoard({ stones = [], highlights = [], className = "" }: MiniBoardProps) {
  // Board constants
  const radius = 3;
  const hexSize = 32;
  const padding = 40;
  
  // Calculate viewbox
  // Width approx: (radius * 2 + 1) * sqrt(3) * size
  // Height approx: (radius * 2 + 1) * 1.5 * size
  const width = 400;
  const height = 400;
  const centerX = width / 2;
  const centerY = height / 2;

  // Generate grid
  const hexes: { q: number; r: number }[] = [];
  for (let q = -radius; q <= radius; q++) {
    const r1 = Math.max(-radius, -q - radius);
    const r2 = Math.min(radius, -q + radius);
    for (let r = r1; r <= r2; r++) {
      hexes.push({ q, r });
    }
  }

  function hexToPixel(q: number, r: number) {
    const x = hexSize * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r);
    const y = hexSize * ((3 / 2) * r);
    return { x: centerX + x, y: centerY + y };
  }

  return (
    <div className={`relative aspect-square w-full max-w-[320px] mx-auto ${className}`}>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full drop-shadow-2xl">
        {/* Board Background */}
        <circle cx={centerX} cy={centerY} r={width * 0.48} fill="rgba(0,0,0,0.3)" />

        {/* Grid Lines */}
        <g opacity="0.3" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" fill="none">
          {hexes.map(({ q, r }) => {
            const { x, y } = hexToPixel(q, r);
            const points = Array.from({ length: 6 }, (_, i) => {
              const angle = (Math.PI / 3) * i - Math.PI / 2;
              return [
                x + hexSize * 0.9 * Math.cos(angle),
                y + hexSize * 0.9 * Math.sin(angle),
              ];
            }).map((p) => p.join(',')).join(' ');
            return <polygon key={`grid-${q}-${r}`} points={points} />;
          })}
        </g>

        {/* Holes */}
        <g>
          {hexes.map(({ q, r }) => {
            const { x, y } = hexToPixel(q, r);
            const isVoid = q === 0 && r === 0;
            return (
              <circle
                key={`hole-${q}-${r}`}
                cx={x} cy={y}
                r={hexSize * 0.4}
                fill={isVoid ? "#0A0B14" : "rgba(0,0,0,0.4)"}
                stroke={isVoid ? "#7a00ff" : "rgba(255,255,255,0.1)"}
                strokeWidth={isVoid ? 3 : 1}
              />
            );
          })}
        </g>

        {/* Highlights */}
        {highlights.map((h, i) => {
          const { x, y } = hexToPixel(h.q, h.r);
          return (
            <g key={`hl-${i}`}>
              <circle
                cx={x} cy={y}
                r={hexSize * 0.55}
                fill={`${h.color}33`} // 20% opacity
                stroke={h.color}
                strokeWidth="2"
                className="animate-pulse"
              />
              {h.type === 'warning' && (
                 <text x={x} y={y} dy=".3em" textAnchor="middle" fill={h.color} fontSize="16" fontWeight="bold">!</text>
              )}
            </g>
          );
        })}

        {/* Stones */}
        {stones.map((s, i) => {
          const { x, y } = hexToPixel(s.q, s.r);
          const isWhite = s.color === 'white';
          const fill = isWhite ? '#E0E0E0' : '#FF0033';
          const stroke = isWhite ? '#FFFFFF' : '#AA0022';
          
          return (
            <g key={`stone-${i}`} opacity={s.isGhost ? 0.5 : 1}>
               {s.isSacrifice && (
                 <circle cx={x} cy={y} r={hexSize * 0.6} fill="none" stroke="#00FFFF" strokeWidth="2" strokeDasharray="4 2" className="animate-spin-slow" />
               )}
              <circle
                cx={x} cy={y}
                r={hexSize * 0.38}
                fill={fill}
                stroke={stroke}
                strokeWidth="2"
              />
              <circle
                cx={x - hexSize * 0.1}
                cy={y - hexSize * 0.1}
                r={hexSize * 0.15}
                fill="rgba(255,255,255,0.3)"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
