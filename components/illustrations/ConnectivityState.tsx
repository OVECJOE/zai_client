"use client"

import React from 'react';
import { MiniBoard, type Stone, type Highlight } from './MiniBoard';

export function ConnectivityState() {
  const stones: Stone[] = [
    { q: -2, r: 0, color: 'white' },
    { q: -1, r: 0, color: 'white' }, // Articulation point
    { q: 0, r: -1, color: 'white' },
    { q: 1, r: -1, color: 'white' },
    { q: 0, r: 1, color: 'red' },
    { q: 1, r: 0, color: 'red' },
  ];

  const highlights: Highlight[] = [
    { q: -1, r: 1, color: '#FF0033', type: 'warning' } // Dangerous spot
  ];

  return (
    <div className="relative group">
       <div className="absolute inset-0 bg-gradient-to-tr from-[#FF0033]/10 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
       <MiniBoard stones={stones} highlights={highlights} />
       <div className="absolute bottom-4 left-0 right-0 text-center">
         <span className="inline-block px-3 py-1 bg-black/60 backdrop-blur-md border border-[#FF0033]/30 rounded-full text-[#FF0033] text-xs font-bold uppercase tracking-widest shadow-lg">
           Stay Connected
         </span>
       </div>
    </div>
  );
}
