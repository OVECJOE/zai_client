import { useState } from 'react'
import { GameBoard } from './GameBoard'
import type { GameState, HexCoordinate, Move } from '@/types/api'

function getBoardAtMove(game: GameState, moveIndex: number): GameState {
  // This function should reconstruct the board at a given move index.
  // For now, assume game.history is an array of GameState snapshots per move.
  // If not, you will need to reconstruct from initial state and moves.
  return game.history?.[moveIndex] || game
}

export function CompletedGameView({ game, moves, legalMovesPerMove, boardSnapshots }: {
  game: GameState,
  moves: Move[],
  legalMovesPerMove: HexCoordinate[][],
  boardSnapshots: GameState[]
}) {
  const [step, setStep] = useState(moves.length);
  const board = boardSnapshots[step] || game;
  return (
    <div className="game-card p-4">
      <GameBoard game={board} legalMoves={legalMovesPerMove[step] || []} onMove={() => {}} />
      <div className="mt-4 flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <button onClick={() => setStep(0)} disabled={step === 0}>⏮</button>
          <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>◀</button>
          <span>Move {step} / {moves.length}</span>
          <button onClick={() => setStep(s => Math.min(moves.length, s + 1))} disabled={step === moves.length}>▶</button>
          <button onClick={() => setStep(moves.length)} disabled={step === moves.length}>⏭</button>
        </div>
        <div className="text-white/70 text-lg">
          Winner: {game.winner || '—'} | Win Condition: {game.win_condition || '—'}
        </div>
        <ol className="move-list mt-2">
          {moves.map((move, i) => (
            <li key={i} className={i === step ? 'font-bold' : ''}>
              {move.player}: {move.move_type} {move.position ? `(${move.position.q},${move.position.r})` : ''}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
