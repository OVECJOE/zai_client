"use client"

import React from 'react';
import { MiniBoard, type Stone, type Highlight } from './MiniBoard';

export function SacrificeState() {
  const stones: Stone[] = [
    { q: 0, r: -2, color: 'white' },
    { q: 1, r: -2, color: 'white', isSacrifice: true }, // Stone being sacrificed
    { q: 2, r: -2, color: 'white' },
    { q: 0, r: 2, color: 'red' },
  ];

  const highlights: Highlight[] = [
    { q: 1, r: -1, color: '#00F0FF', type: 'placement' }, // New placement 1
    { q: 2, r: -3, color: '#00F0FF', type: 'placement' }, // New placement 2
  ];

  return (
    <div className="relative group">
       <div className="absolute inset-0 bg-gradient-to-tr from-[#00F0FF]/10 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
       <MiniBoard stones={stones} highlights={highlights} />
       <div className="absolute bottom-4 left-0 right-0 text-center">
         <span className="inline-block px-3 py-1 bg-black/60 backdrop-blur-md border border-[#00F0FF]/30 rounded-full text-[#00F0FF] text-xs font-bold uppercase tracking-widest shadow-lg">
           Phase 2: Surge
         </span>
       </div>
    </div>
  );
}
