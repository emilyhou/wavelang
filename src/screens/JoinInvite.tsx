import { useState } from 'react'
import { getPlayerName, setPlayerName } from '../lib/identity'
import './Home.css'

/**
 * Landing screen for someone who followed an invite link.
 *
 * They already know which room they want — showing them the full home screen,
 * with a "Create a room" card sitting above the join field, invites them to
 * start a second game by mistake. So this asks for one thing: a name.
 *
 * Only rendered once the room is confirmed to exist; a dead code routes to the
 * home screen instead of landing here.
 */
export interface JoinInviteProps {
  code: string
  onJoin: (name: string) => void
  /** Bail out to the home screen to start a game of their own instead. */
  onCancel: () => void
  error?: string | null
  busy?: boolean
}

export function JoinInvite({ code, onJoin, onCancel, error, busy }: JoinInviteProps) {
  const [name, setName] = useState(getPlayerName)

  const trimmed = name.trim()
  const canJoin = trimmed.length > 0 && !busy

  const remember = (value: string) => {
    setName(value)
    setPlayerName(value.trim())
  }

  return (
    <div className="stack home">
      <header className="stack center">
        <h1>WaveLang</h1>
        <p className="muted">AI startup Wavelength</p>
      </header>

      {error && <p className="error center">{error}</p>}

      <div className="card stack center">
        <h3>You're invited to</h3>
        <div className="mono room-code">{code}</div>
      </div>

      <div className="card stack">
        <div>
          <label htmlFor="name">Your name</label>
          <input
            id="name"
            value={name}
            onChange={(e) => remember(e.target.value)}
            placeholder="e.g. Emily"
            maxLength={24}
            autoComplete="nickname"
            autoFocus
            enterKeyHint="go"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && canJoin) onJoin(trimmed)
            }}
          />
        </div>
        <button
          type="button"
          className="primary wide"
          disabled={!canJoin}
          onClick={() => onJoin(trimmed)}
        >
          {busy ? 'Joining…' : `Join ${code}`}
        </button>
      </div>

      <button type="button" className="ghost wide" onClick={onCancel} disabled={busy}>
        Start a different game
      </button>
    </div>
  )
}
