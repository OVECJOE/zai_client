"use client"

import React from 'react';
import { MiniBoard, type Stone, type Highlight } from './MiniBoard';

export function PlacementState() {
  const stones: Stone[] = [
    { q: 0, r: -1, color: 'white' },
    { q: -1, r: 0, color: 'red' },
    { q: 1, r: -1, color: 'white' },
  ];

  const highlights: Highlight[] = [
    { q: -1, r: 1, color: '#FFE500', type: 'placement' } // Valid placement
  ];

  return (
    <div className="relative group">
       <div className="absolute inset-0 bg-gradient-to-tr from-[#FFE500]/10 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
       <MiniBoard stones={stones} highlights={highlights} />
       <div className="absolute bottom-4 left-0 right-0 text-center">
         <span className="inline-block px-3 py-1 bg-black/60 backdrop-blur-md border border-[#FFE500]/30 rounded-full text-[#FFE500] text-xs font-bold uppercase tracking-widest shadow-lg">
           Phase 1: Build
         </span>
       </div>
    </div>
  );
}
