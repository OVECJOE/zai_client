"use client"

import React from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useGameStore } from '@/store/game-store';
import type { GameState, HexCoordinate } from '@/types/api';

interface GameBoardProps {
  game: GameState;
  onMove: (position: HexCoordinate) => void;
  legalMoves?: HexCoordinate[];
}

function hexToPixel(q: number, r: number, size: number = 30) {
  const x = size * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r);
  const y = size * ((3 / 2) * r);
  return { x, y };
}

function getHexesInRadius(radius: number): HexCoordinate[] {
  const hexes: HexCoordinate[] = [];
  for (let q = -radius; q <= radius; q++) {
    const r1 = Math.max(-radius, -q - radius);
    const r2 = Math.min(radius, -q + radius);
    for (let r = r1; r <= r2; r++) {
      hexes.push({ q, r });
    }
  }
  return hexes;
}

export function GameBoard({ game, onMove }: GameBoardProps) {
  const { user } = useAuthStore();
  const { 
    selectedPosition, 
    pendingMove, 
    isMakingMove,
    sacrificeSource,
    sacrificePlacements 
  } = useGameStore();

  const boardRadius = 3;
  const hexSize = 28;
  const holeRadius = hexSize * 0.45;
  const stoneRadius = hexSize * 0.38;
  const hexes = getHexesInRadius(boardRadius);
  const VOID_KEY = '0,0';

  const playerColor = React.useMemo(() => {
    if (!user?.user_id) return null;
    if (game.white_player?.user_id === user.user_id) return 'white';
    if (game.red_player?.user_id === user.user_id) return 'red';
    return null;
  }, [user?.user_id, game.white_player?.user_id, game.red_player?.user_id]);

  const isPlayerTurn = Boolean(playerColor && game.current_turn === playerColor);
  const canInteract = game.status === 'active' && isPlayerTurn && !isMakingMove && !pendingMove;
  const isSacrificePhase = game.phase === 'expansion';

  // --- Data Preparation ---
  const stoneMap = new Map<string, 'white' | 'red'>();
  game.board_state?.stones?.forEach((stone) => {
    stoneMap.set(`${stone.position.q},${stone.position.r}`, stone.player);
  });

  if (pendingMove && playerColor) {
    if (pendingMove.type === 'placement' && pendingMove.position) {
      stoneMap.set(`${pendingMove.position.q},${pendingMove.position.r}`, playerColor);
    } else if (pendingMove.type === 'sacrifice' && pendingMove.sacrifice_position && pendingMove.placements) {
      stoneMap.delete(`${pendingMove.sacrifice_position.q},${pendingMove.sacrifice_position.r}`);
      pendingMove.placements.forEach(p => {
        stoneMap.set(`${p.q},${p.r}`, playerColor);
      });
    }
  }

  const validPlacements = new Set<string>();
  const validSacrificeSources = new Set<string>();

  (game.legal_moves ?? []).forEach((move) => {
    if (move.type === 'placement' && move.position) {
       if (`${move.position.q},${move.position.r}` !== VOID_KEY) {
         validPlacements.add(`${move.position.q},${move.position.r}`);
       }
    } else if (move.type === 'sacrifice' && move.sacrifice_position) {
       validSacrificeSources.add(`${move.sacrifice_position.q},${move.sacrifice_position.r}`);
       
       if (sacrificeSource && 
           move.sacrifice_position.q === sacrificeSource.q && 
           move.sacrifice_position.r === sacrificeSource.r && 
           move.placements) {
         move.placements.forEach(p => {
           validPlacements.add(`${p.q},${p.r}`);
         });
       }
    }
  });

  // --- Dimensions ---
  const allPositions = hexes.map((h) => hexToPixel(h.q, h.r, hexSize));
  const minX = Math.min(...allPositions.map((p) => p.x));
  const maxX = Math.max(...allPositions.map((p) => p.x));
  const minY = Math.min(...allPositions.map((p) => p.y));
  const maxY = Math.max(...allPositions.map((p) => p.y));
  const padding = hexSize * 1.5;
  const width = maxX - minX + padding * 2;
  const height = maxY - minY + padding * 2;
  const offsetX = -minX + padding;
  const offsetY = -minY + padding;

  // --- Handlers ---
  const handleHexClick = (hex: HexCoordinate) => {
    if (!canInteract) return;
    const key = `${hex.q},${hex.r}`;

    // FIX: Check for standard placement FIRST.
    // If we are not actively building a sacrifice chain (no source selected),
    // and the user clicks a valid placement spot, treat it as a placement.
    if (!sacrificeSource && validPlacements.has(key)) {
       onMove(hex);
       return;
    }

    if (isSacrificePhase) {
      // 1. Selecting own stone (Source)
      if (validSacrificeSources.has(key)) {
        onMove(hex);
        return;
      }
      // 2. Selecting empty spot (Sacrifice Placement) - requires source to be selected
      if (sacrificeSource && !stoneMap.has(key) && key !== VOID_KEY) {
         onMove(hex); 
      }
    }
  };

  return (
    <div className="flex justify-center items-center p-4 overflow-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', maxWidth: width, maxHeight: '70vh' }}
        className="drop-shadow-2xl"
        preserveAspectRatio="xMidYMid meet"
      >
        <rect x="0" y="0" width={width} height={height} fill="rgba(0,0,0,0.4)" rx="16" />

        {/* Grid Lines */}
        <g opacity="0.25" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" fill="none">
          {hexes.map((hex) => {
            const { x, y } = hexToPixel(hex.q, hex.r, hexSize);
            const cx = x + offsetX;
            const cy = y + offsetY;
            const points = Array.from({ length: 6 }, (_, i) => {
              const angle = (Math.PI / 3) * i - Math.PI / 2;
              return `${cx + hexSize * 0.85 * Math.cos(angle)},${cy + hexSize * 0.85 * Math.sin(angle)}`;
            }).join(' ');
            return <polygon key={`hex-outline-${hex.q},${hex.r}`} points={points} />;
          })}
        </g>

        {/* Interactive Holes */}
        <g>
          {hexes.map((hex) => {
            const { x, y } = hexToPixel(hex.q, hex.r, hexSize);
            const cx = x + offsetX;
            const cy = y + offsetY;
            const key = `${hex.q},${hex.r}`;
            const isVoid = key === VOID_KEY;
            const hasStone = stoneMap.has(key) && !isVoid;

            // --- State Flags ---
            const isSource = sacrificeSource?.q === hex.q && sacrificeSource?.r === hex.r;
            const isSacrificePlacement = sacrificePlacements.some(p => p.q === hex.q && p.r === hex.r);
            const isLegalPlacement = validPlacements.has(key);
            const isLegalSource = validSacrificeSources.has(key);
            
            // Interaction visual logic
            let fillColor = "rgba(0,0,0,0.5)";
            let strokeColor = "rgba(255,255,255,0.15)";
            let cursor = "default";
            
            if (canInteract && !isVoid) {
               if (isSacrificePhase) {
                  if (isLegalSource) {
                     // Highlight valid sources
                     strokeColor = "#FF00FF"; 
                     cursor = "pointer";
                  }
                  if (sacrificeSource && !hasStone && !isVoid) {
                     // Highlight empty spots once source is selected
                     fillColor = "rgba(255,229,0,0.1)";
                     strokeColor = isSacrificePlacement ? "#00FF00" : "#FFE500";
                     cursor = "pointer";
                  } else if (!sacrificeSource && isLegalPlacement) {
                     // FIX: Ensure simple placements are highlighted even in Phase 2 if no source selected
                     fillColor = "rgba(255,229,0,0.2)";
                     strokeColor = "#FFE500";
                     cursor = "pointer";
                  }
               } else if (isLegalPlacement) {
                  // Standard Placement (Phase 1)
                  fillColor = "rgba(255,229,0,0.2)";
                  strokeColor = "#FFE500";
                  cursor = "pointer";
               }
            }

            if (isSource) {
               strokeColor = "#00FFFF";
               fillColor = "rgba(0,255,255,0.2)";
            }

            return (
              <g key={`hole-${key}`}>
                {isVoid ? (
                  <circle cx={cx} cy={cy} r={holeRadius} fill="#222" stroke="#7a00ff" strokeWidth="3.5" />
                ) : (
                  <circle
                    cx={cx} cy={cy} r={holeRadius}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={isSource || isSacrificePlacement ? 3 : 2}
                    style={{ cursor }}
                    onClick={() => handleHexClick(hex)}
                  />
                )}

                {isSacrificePlacement && (
                   <text x={cx} y={cy} dy=".3em" textAnchor="middle" fill="#00FF00" fontSize="12" fontWeight="bold" pointerEvents="none">
                      {sacrificePlacements.findIndex(p => p.q === hex.q && p.r === hex.r) + 1}
                   </text>
                )}
              </g>
            );
          })}
        </g>

        {/* Stones */}
        <g>
          {hexes.map((hex) => {
            const { x, y } = hexToPixel(hex.q, hex.r, hexSize);
            const cx = x + offsetX;
            const cy = y + offsetY;
            const key = `${hex.q},${hex.r}`;
            const stone = stoneMap.get(key);
            
            if (!stone || key === VOID_KEY) return null;

            const isSource = sacrificeSource?.q === hex.q && sacrificeSource?.r === hex.r;
            const opacity = isSource || pendingMove ? 0.6 : 1;

            const gradientId = `stone-gradient-${key}`;

            return (
              <g key={`stone-${key}`} opacity={opacity} style={{ pointerEvents: 'none' }}>
                <defs>
                  <radialGradient id={gradientId} cx="35%" cy="35%">
                    <stop offset="0%" stopColor={stone === 'white' ? '#FFFFFF' : '#FF4466'} />
                    <stop offset="100%" stopColor={stone === 'white' ? '#CCCCCC' : '#AA0022'} />
                  </radialGradient>
                </defs>
                <circle cx={cx + 2} cy={cy + 2} r={stoneRadius} fill="rgba(0,0,0,0.4)" />
                <circle
                  cx={cx} cy={cy} r={stoneRadius}
                  fill={`url(#${gradientId})`}
                  stroke={stone === 'white' ? 'rgba(200,200,200,0.8)' : 'rgba(180,0,30,0.8)'}
                  strokeWidth={isSource ? 3 : 1}
                />
                <circle
                  cx={cx - stoneRadius * 0.3} cy={cy - stoneRadius * 0.3}
                  r={stoneRadius * 0.2}
                  fill={stone === 'white' ? 'rgba(255,255,255,0.8)' : 'rgba(255,150,150,0.5)'}
                />
              </g>
            );
          })}
        </g>

        {game.status === 'active' && !isPlayerTurn && (
          <rect x="0" y="0" width={width} height={height} fill="rgba(0,0,0,0.15)" rx="16" pointerEvents="none" />
        )}
      </svg>
    </div>
  );
}
