import { COOP_ROUNDS, TEAM_NAMES, WINNING_SCORE, type RoomState } from '../game/types'
import './Scoreboard.css'

/** Score header. Teams mode shows both sides; coop shows one pooled total. */
export function Scoreboard({ state }: { state: RoomState }) {
  if (state.mode === 'coop') {
    return (
      <div className="scoreboard coop">
        <div className="score-block">
          <span className="score-label">Score</span>
          <span className="score-value">{state.scores.left}</span>
        </div>
        <div className="score-block">
          <span className="score-label">Round</span>
          <span className="score-value">
            {Math.min(state.roundNumber, COOP_ROUNDS)}
            <span className="score-of">/{COOP_ROUNDS}</span>
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="scoreboard">
      <div className={`score-block ${state.activeTeam === 'left' ? 'active' : ''}`}>
        <span className="score-label team-left">{TEAM_NAMES.left}</span>
        <span className="score-value">{state.scores.left}</span>
      </div>
      <span className="score-target muted">to {WINNING_SCORE}</span>
      <div className={`score-block ${state.activeTeam === 'right' ? 'active' : ''}`}>
        <span className="score-label team-right">{TEAM_NAMES.right}</span>
        <span className="score-value">{state.scores.right}</span>
      </div>
    </div>
  )
}
