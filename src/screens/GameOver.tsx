import { CARD_IDS } from '../data/cards'
import type { GameController } from '../game/controller'
import { returnToLobby, startGame, winner } from '../game/engine'
import { COOP_ROUNDS, TEAM_NAMES } from '../game/types'

const rng = () => Math.random()

/** Best possible coop score: 4 points a round, every round. */
const COOP_MAX = COOP_ROUNDS * 4

export function GameOver({ ctrl }: { ctrl: GameController }) {
  const { state, update, playerId } = ctrl
  const isHost = state.hostId === playerId
  const won = winner(state)

  return (
    <div className="stack center">
      <h1>Game over</h1>

      {state.mode === 'coop' ? (
        <div className="card stack">
          <h2>
            {state.scores.left} / {COOP_MAX}
          </h2>
          <p className="muted">{coopVerdict(state.scores.left)}</p>
        </div>
      ) : (
        <div className="card stack">
          <h2 className={won ? `team-${won}` : undefined}>
            {won ? `${TEAM_NAMES[won]} wins` : "It's a tie"}
          </h2>
          <p className="muted">
            {state.scores.left} – {state.scores.right}
          </p>
        </div>
      )}

      {isHost ? (
        <div className="stack">
          <button
            type="button"
            className="primary wide"
            onClick={() => update((s) => startGame(s, CARD_IDS, rng))}
          >
            Play again
          </button>
          <button type="button" className="ghost wide" onClick={() => update(returnToLobby)}>
            Back to lobby
          </button>
        </div>
      ) : (
        <p className="muted">Waiting for the host…</p>
      )}
    </div>
  )
}

function coopVerdict(score: number): string {
  const ratio = score / COOP_MAX
  if (ratio >= 0.85) return 'Genuinely telepathic. Suspiciously so.'
  if (ratio >= 0.65) return 'Strong signal. Barely any noise.'
  if (ratio >= 0.45) return 'Decent wavelength. Room to align.'
  if (ratio >= 0.25) return 'Some crossed wires in this group.'
  return 'Completely different wavelengths. Try talking more.'
}
