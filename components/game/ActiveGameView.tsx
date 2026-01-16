import { GameBoard } from './GameBoard'
import type { GameState, HexCoordinate, Move } from '@/types/api'

export function ActiveGameView({ game, legalMoves, onMove }: {
  game: GameState,
  legalMoves: Move[],
  onMove: (pos: HexCoordinate) => void
}) {
  return (
    <div className="game-card p-4">
      {/* Note: Ensure GameBoard accepts legalMoves if you intended to pass them, 
          otherwise rely on game.legal_moves inside GameBoard */}
      <GameBoard game={game} onMove={onMove} />
      
      <div className="mt-4 flex justify-between text-white/70 text-lg">
        <span className="capitalize">Turn: {game.current_turn}</span>
        <span>Move: {game.turn_number}</span>
      </div>
    </div>
  )
}
