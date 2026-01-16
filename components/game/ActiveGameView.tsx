import { GameBoard } from './GameBoard'
import type { GameState, HexCoordinate } from '@/types/api'

export function ActiveGameView({ game, legalMoves, onMove }: {
  game: GameState,
  legalMoves: HexCoordinate[],
  onMove: (pos: HexCoordinate) => void
}) {
  return (
    <div className="game-card p-4">
      <GameBoard game={game} legalMoves={legalMoves} onMove={onMove} />
      <div className="mt-4 flex justify-between text-white/70 text-lg">
        <span>Turn: {game.currentPlayer}</span>
        <span>Move: {game.moveNumber}</span>
      </div>
    </div>
  )
}
