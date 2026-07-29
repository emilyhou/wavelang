import { useState } from 'react'
import { PlayerList } from '../components/PlayerList'
import { CARD_IDS } from '../data/cards'
import type { GameController } from '../game/controller'
import { addPlayer, canStartGame, removePlayer, setPlayerTeam, startGame } from '../game/engine'
import { nextHotseatPlayerId } from '../game/useHotseatRoom'
import { COOP_ROUNDS, WINNING_SCORE, type TeamId } from '../game/types'

const rng = () => Math.random()

export function Lobby({ ctrl }: { ctrl: GameController }) {
  const { state, update, playerId, onlinePlayerIds, isHotseat } = ctrl
  const isHost = state.hostId === playerId
  const ready = canStartGame(state)

  return (
    <div className="stack">
      {!isHotseat && <ShareRoom code={state.code} />}

      <PlayerList
        state={state}
        playerId={playerId}
        onlinePlayerIds={onlinePlayerIds}
        onSetTeam={(id, team) => update((s) => setPlayerTeam(s, id, team))}
      />

      {isHotseat && <AddHotseatPlayer ctrl={ctrl} />}

      <p className="muted">
        {state.mode === 'teams' ? (
          <>
            Two teams. Each round one player sees a hidden target on a spectrum and names an AI
            startup as the clue; their team moves the dial, the other team bets on which side the
            target is really on. First to {WINNING_SCORE} wins.
          </>
        ) : (
          <>
            Everyone's on one team. Each round one player names an AI startup as the clue and the
            rest move the dial together. {COOP_ROUNDS} rounds, one shared score.
          </>
        )}
      </p>

      {isHost ? (
        <>
          <button
            type="button"
            className="primary wide"
            disabled={!ready}
            onClick={() => update((s) => startGame(s, CARD_IDS, rng))}
          >
            Start game
          </button>
          {!ready && (
            <p className="muted center">
              {state.mode === 'teams'
                ? 'Need at least 2 players on each team.'
                : 'Need at least 2 players.'}
            </p>
          )}
        </>
      ) : (
        <p className="muted center">Waiting for the host to start…</p>
      )}
    </div>
  )
}

/**
 * Hotseat has no join flow, so the host types everyone in. Alternates teams by
 * default, which is what you'd do by hand anyway.
 */
function AddHotseatPlayer({ ctrl }: { ctrl: GameController }) {
  const { state, update } = ctrl
  const [name, setName] = useState('')

  const add = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    update((s) => {
      const team: TeamId = s.mode === 'coop' || s.players.length % 2 === 0 ? 'left' : 'right'
      return addPlayer(s, { id: nextHotseatPlayerId(s), name: trimmed, team })
    })
    setName('')
  }

  return (
    <div className="card stack">
      <h3>Add a player</h3>
      <div className="row">
        <input
          value={name}
          placeholder="Name"
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
        />
        <button type="button" onClick={add} disabled={!name.trim()}>
          Add
        </button>
      </div>
      {state.players.length > 1 && (
        <button
          type="button"
          className="ghost danger"
          onClick={() =>
            update((s) => removePlayer(s, s.players[s.players.length - 1].id))
          }
        >
          Remove last
        </button>
      )}
    </div>
  )
}

/** Room code plus the two ways people actually share it: copy link, or read it out. */
function ShareRoom({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  const url = `${location.origin}${location.pathname}#/room/${code}`

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard blocked (insecure origin, or the user said no) — the code is
      // on screen anyway, so this is a nice-to-have.
      setCopied(false)
    }
  }

  return (
    <div className="card stack center">
      <h3>Room code</h3>
      <div className="mono room-code">{code}</div>
      <button type="button" onClick={copy}>
        {copied ? 'Link copied' : 'Copy invite link'}
      </button>
    </div>
  )
}
