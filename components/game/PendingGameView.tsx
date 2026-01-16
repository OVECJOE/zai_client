import { GameBoard } from './GameBoard'
import type { GameState, HexCoordinate } from '@/types/api'

export function PendingGameView({ game, onMove }: { game: GameState, onMove: (pos: HexCoordinate) => void }) {
  return (
    <div className="game-card p-4">
      <GameBoard game={game} onMove={onMove} />
      <div className="mt-4 text-center text-white/70 text-lg">Waiting for players to join…</div>
    </div>
  )
}
