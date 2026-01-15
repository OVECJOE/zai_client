"use client"

import React from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useGameStore } from '@/store/game-store';
import type { GameState, HexCoordinate } from '@/types/api';

interface GameBoardProps {
  game: GameState;
  onMove: (position: HexCoordinate) => void;
}

// Convert hex coordinates to pixel coordinates (pointy-top hexagons)
function hexToPixel(q: number, r: number, size: number = 30) {
  const x = size * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r);
  const y = size * ((3 / 2) * r);
  return { x, y };
}

// Get all hexes in a radius
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
  const { selectedPosition, pendingMove, isMakingMove } = useGameStore();

  // Board radius should be 3 for 37 spaces
  const boardRadius = 3;
  const hexSize = 28;
  const holeRadius = hexSize * 0.45;
  const stoneRadius = hexSize * 0.38;
  const hexes = getHexesInRadius(boardRadius);

  // Determine player color with robust comparison
  const playerColor = React.useMemo(() => {
    if (!user?.user_id) return null;
    
    if (game.white_player?.user_id === user.user_id) {
      return 'white';
    }
    
    if (game.red_player?.user_id === user.user_id) {
      return 'red';
    }
    
    return null;
  }, [user?.user_id, game.white_player?.user_id, game.red_player?.user_id]);

  const isPlayerTurn = Boolean(playerColor && game.current_turn === playerColor);
  const canInteract = game.status === 'active' && isPlayerTurn && !isMakingMove && !pendingMove;


  // Create a map of positions to stones (guard against missing board_state)
  const stoneMap = new Map<string, 'white' | 'red'>();
  const stones = game.board_state?.stones ?? [];
  stones.forEach((stone) => {
    const key = `${stone.position.q},${stone.position.r}`;
    stoneMap.set(key, stone.player);
  });

  // Define the Void Stone key for logic and rendering
  const VOID_KEY = '0,0';

  // Add pending move as optimistic update
  if (pendingMove && pendingMove.position && playerColor) {
    const pendingKey = `${pendingMove.position.q},${pendingMove.position.r}`;
    // Prevent pending move on the Void Stone
    if (!stoneMap.has(pendingKey) && pendingKey !== VOID_KEY) {
      stoneMap.set(pendingKey, playerColor);
    }
  }

  // Create a set of legal move positions (guard against missing legal_moves)
  const legalMovePositions = new Set<string>();
  const legalMoves = game.legal_moves ?? [];
  legalMoves.forEach((move) => {
    if (move.type === 'placement' && move.position) {
      const key = `${move.position.q},${move.position.r}`;
      // Prevent legal move on the Void Stone
      if (key !== VOID_KEY) {
        legalMovePositions.add(key);
      }
    }
  });

  // Calculate board dimensions
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

  const handleHexClick = (hex: HexCoordinate) => {
    if (!canInteract) {
      return;
    }
    const key = `${hex.q},${hex.r}`;
    if (!legalMovePositions.has(key)) {
      return;
    }
    
    onMove(hex);
  };

  return (
    <div className="flex justify-center items-center p-4 overflow-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', maxWidth: width, maxHeight: '70vh' }}
        className="drop-shadow-2xl"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Background */}
        <rect x="0" y="0" width={width} height={height} fill="rgba(0,0,0,0.4)" rx="16" />

        {/* Hex grid outlines */}
        <g opacity="0.25" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" fill="none">
          {hexes.map((hex) => {
            const { x, y } = hexToPixel(hex.q, hex.r, hexSize);
            const cx = x + offsetX;
            const cy = y + offsetY;
            const key = `hex-outline-${hex.q},${hex.r}`;
            
            // Pointy-top hexagon
            const points = Array.from({ length: 6 }, (_, i) => {
              const angle = (Math.PI / 3) * i - Math.PI / 2;
              const px = cx + hexSize * 0.85 * Math.cos(angle);
              const py = cy + hexSize * 0.85 * Math.sin(angle);
              return `${px},${py}`;
            }).join(' ');

            return <polygon key={key} points={points} />;
          })}
        </g>

        {/* Holes - clickable areas */}
        <g>
          {hexes.map((hex) => {
            const { x, y } = hexToPixel(hex.q, hex.r, hexSize);
            const cx = x + offsetX;
            const cy = y + offsetY;
            const key = `${hex.q},${hex.r}`;
            const isVoid = key === VOID_KEY;
            const isLegalMove = legalMovePositions.has(key);
            const hasStone = stoneMap.has(key) && !isVoid;
            const isSelected = selectedPosition?.q === hex.q && selectedPosition?.r === hex.r;
            const isPending = pendingMove?.position?.q === hex.q && pendingMove?.position?.r === hex.r;

            return (
              <g key={`hole-${key}`}>
                {/* Void Stone visual */}
                {isVoid ? (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={holeRadius}
                    fill="#222"
                    stroke="#7a00ff"
                    strokeWidth="3.5"
                    style={{ pointerEvents: 'none' }}
                  />
                ) : (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={holeRadius}
                    fill={isLegalMove && canInteract && !hasStone ? "rgba(255,229,0,0.2)" : "rgba(0,0,0,0.5)"}
                    stroke={isLegalMove && canInteract && !hasStone ? "#FFE500" : "rgba(255,255,255,0.15)"}
                    strokeWidth={isLegalMove && canInteract && !hasStone ? "2.5" : "2"}
                    style={{ cursor: isLegalMove && canInteract && !hasStone ? 'pointer' : 'default' }}
                    onClick={() => handleHexClick(hex)}
                  />
                )}

                {/* Legal move outer glow */}
                {isLegalMove && canInteract && !hasStone && !isVoid && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={holeRadius + 4}
                    fill="none"
                    stroke="#FFE500"
                    strokeWidth="2"
                    opacity="0.5"
                    style={{ pointerEvents: 'none' }}
                  />
                )}

                {/* Selected highlight */}
                {isSelected && !isVoid && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={holeRadius + 5}
                    fill="none"
                    stroke="#00F0FF"
                    strokeWidth="3"
                    opacity="0.9"
                    style={{ pointerEvents: 'none' }}
                  />
                )}

                {/* Pending move indicator */}
                {isPending && !isVoid && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={holeRadius + 4}
                    fill="none"
                    stroke="#00F0FF"
                    strokeWidth="2"
                    opacity="0.6"
                    className="animate-pulse"
                    style={{ pointerEvents: 'none' }}
                  />
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
            const isVoid = key === VOID_KEY;
            const isPending = pendingMove?.position?.q === hex.q && pendingMove?.position?.r === hex.r;

            if (!stone || isVoid) return null;

            const gradientId = `stone-gradient-${key}`;

            return (
              <g key={`stone-${key}`} opacity={isPending ? 0.6 : 1} style={{ pointerEvents: 'none' }}>
                {/* Stone gradient for 3D effect */}
                <defs>
                  <radialGradient id={gradientId} cx="35%" cy="35%">
                    <stop offset="0%" stopColor={stone === 'white' ? '#FFFFFF' : '#FF4466'} />
                    <stop offset="100%" stopColor={stone === 'white' ? '#CCCCCC' : '#AA0022'} />
                  </radialGradient>
                </defs>
                {/* Stone shadow */}
                <circle
                  cx={cx + 2}
                  cy={cy + 2}
                  r={stoneRadius}
                  fill="rgba(0,0,0,0.4)"
                />
                {/* Stone */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={stoneRadius}
                  fill={`url(#${gradientId})`}
                  stroke={stone === 'white' ? 'rgba(200,200,200,0.8)' : 'rgba(180,0,30,0.8)'}
                  strokeWidth="1"
                />
                {/* Stone highlight */}
                <circle
                  cx={cx - stoneRadius * 0.3}
                  cy={cy - stoneRadius * 0.3}
                  r={stoneRadius * 0.2}
                  fill={stone === 'white' ? 'rgba(255,255,255,0.8)' : 'rgba(255,150,150,0.5)'}
                />
              </g>
            );
          })}
        </g>

        {/* Turn indicator overlay when not player's turn */}
        {game.status === 'active' && !isPlayerTurn && (
          <g style={{ pointerEvents: 'none' }}>
            <rect x="0" y="0" width={width} height={height} fill="rgba(0,0,0,0.15)" rx="16" />
          </g>
        )}
      </svg>
    </div>
  );
}
