import { useState } from 'react'
import { getPlayerName, setPlayerName } from '../lib/identity'
import type { GameMode } from '../game/types'
import './Home.css'

export interface HomeProps {
  onCreate: (name: string, mode: GameMode) => void
  onJoin: (name: string, code: string) => void
  onHotseat: (name: string, mode: GameMode) => void
  /** Set when a join attempt bounced (bad code, room gone). */
  error?: string | null
  busy?: boolean
  /** False when the build has no Supabase config; online buttons go dead. */
  multiplayerEnabled?: boolean
}

export function Home({
  onCreate,
  onJoin,
  onHotseat,
  error,
  busy,
  multiplayerEnabled = true,
}: HomeProps) {
  const [name, setName] = useState(getPlayerName)
  const [mode, setMode] = useState<GameMode>('teams')
  const [code, setCode] = useState('')

  const trimmedName = name.trim()
  const trimmedCode = code.trim().toUpperCase()
  const canPlay = trimmedName.length > 0 && !busy
  const canPlayOnline = canPlay && multiplayerEnabled

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
          />
        </div>

        <div>
          <label htmlFor="mode">Game mode</label>
          <select id="mode" value={mode} onChange={(e) => setMode(e.target.value as GameMode)}>
            <option value="teams">Teams — two sides, first to 10</option>
            <option value="coop">Cooperative — one team, 8 rounds</option>
          </select>
        </div>

        <button
          type="button"
          className="primary wide"
          disabled={!canPlayOnline}
          onClick={() => onCreate(trimmedName, mode)}
        >
          {busy ? 'Creating…' : 'Create a room'}
        </button>
      </div>

      <div className="card stack">
        <label htmlFor="code">Join a room</label>
        <div className="row">
          <input
            id="code"
            className="mono code-input"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 4))}
            placeholder="ABCD"
            maxLength={4}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && canPlayOnline && trimmedCode.length === 4) {
                onJoin(trimmedName, trimmedCode)
              }
            }}
          />
          <button
            type="button"
            disabled={!canPlayOnline || trimmedCode.length !== 4}
            onClick={() => onJoin(trimmedName, trimmedCode)}
          >
            Join
          </button>
        </div>
      </div>

      <button
        type="button"
        className="ghost wide"
        disabled={!canPlay}
        onClick={() => onHotseat(trimmedName, mode)}
      >
        Play on one device
      </button>
    </div>
  )
}
