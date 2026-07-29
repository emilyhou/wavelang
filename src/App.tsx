import { useCallback, useEffect, useState } from 'react'
import { GameOver } from './screens/GameOver'
import { Home } from './screens/Home'
import { Lobby } from './screens/Lobby'
import { Round } from './screens/Round'
import type { GameController } from './game/controller'
import { useHotseatRoom } from './game/useHotseatRoom'
import { RoomError, createRoomRow, joinRoomRow, useRoom } from './game/useRoom'
import { getPlayerId, setPlayerName } from './lib/identity'
import { SUPABASE_SETUP_HINT, isSupabaseConfigured } from './lib/supabase'
import type { GameMode, Player } from './game/types'
import './App.css'

/**
 * Hash routing, deliberately.
 *
 * `#/room/ABCD` works on any static host without rewrite rules, and an invite
 * link survives being pasted into a group chat. No router dependency needed.
 */
function useHashRoute(): string {
  const [hash, setHash] = useState(() => location.hash)
  useEffect(() => {
    const onChange = () => setHash(location.hash)
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return hash
}

const parseRoomCode = (hash: string): string | null => {
  const match = /^#\/room\/([A-Z]{4})$/i.exec(hash)
  return match ? match[1].toUpperCase() : null
}

export default function App() {
  const hash = useHashRoute()
  const roomCode = parseRoomCode(hash)

  const [hotseat, setHotseat] = useState<{ name: string; mode: GameMode } | null>(null)
  const [self, setSelf] = useState<Player | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const asPlayer = useCallback((name: string): Player => {
    setPlayerName(name)
    return { id: getPlayerId(), name, team: 'left' }
  }, [])

  const create = async (name: string, mode: GameMode) => {
    setBusy(true)
    setError(null)
    try {
      const player = asPlayer(name)
      const code = await createRoomRow(player, mode)
      setSelf(player)
      location.hash = `#/room/${code}`
    } catch (e) {
      setError(describe(e))
    } finally {
      setBusy(false)
    }
  }

  const join = async (name: string, code: string) => {
    setBusy(true)
    setError(null)
    try {
      const player = asPlayer(name)
      await joinRoomRow(code, player)
      setSelf(player)
      location.hash = `#/room/${code}`
    } catch (e) {
      setError(describe(e))
    } finally {
      setBusy(false)
    }
  }

  if (hotseat) {
    return <HotseatGame name={hotseat.name} mode={hotseat.mode} onExit={() => setHotseat(null)} />
  }

  // An invite link lands here with a code but no identity yet, so the home
  // screen shows with the code prefilled until they've entered a name.
  if (roomCode && self) {
    return <OnlineGame code={roomCode} self={self} onLeft={() => setSelf(null)} />
  }

  return (
    <main className="app">
      <Home
        initialCode={roomCode ?? undefined}
        error={error ?? (isSupabaseConfigured ? null : SUPABASE_SETUP_HINT)}
        busy={busy}
        multiplayerEnabled={isSupabaseConfigured}
        onCreate={create}
        onJoin={join}
        onHotseat={(name, mode) => setHotseat({ name, mode })}
      />
    </main>
  )
}

const describe = (e: unknown) =>
  e instanceof RoomError ? e.message : 'Something went wrong. Try again.'

function OnlineGame({
  code,
  self,
  onLeft,
}: {
  code: string
  self: Player
  onLeft: () => void
}) {
  const ctrl = useRoom(code, self)

  return (
    <main className="app">
      <TopBar
        ctrl={ctrl}
        onExit={() => {
          ctrl.leave()
          location.hash = ''
          onLeft()
        }}
      />
      {ctrl.error && <p className="error">{ctrl.error}</p>}
      {ctrl.ready ? (
        <GameScreen ctrl={ctrl} />
      ) : (
        <p className="muted center">Connecting to {code}…</p>
      )}
    </main>
  )
}

function HotseatGame({
  name,
  mode,
  onExit,
}: {
  name: string
  mode: GameMode
  onExit: () => void
}) {
  const ctrl = useHotseatRoom(name, mode)
  return (
    <main className="app">
      <TopBar ctrl={ctrl} onExit={onExit} />
      <GameScreen ctrl={ctrl} />
    </main>
  )
}

/** Routes on phase. Every screen takes the same controller. */
export function GameScreen({ ctrl }: { ctrl: GameController }) {
  switch (ctrl.state.phase) {
    case 'lobby':
      return <Lobby ctrl={ctrl} />
    case 'gameOver':
      return <GameOver ctrl={ctrl} />
    default:
      return <Round ctrl={ctrl} />
  }
}

/**
 * Room title bar. In hotseat this also carries the "pass the phone" selector,
 * since one screen can't keep secrets from the person holding it.
 */
export function TopBar({ ctrl, onExit }: { ctrl: GameController; onExit: () => void }) {
  const { state, playerId, setPlayerId, isHotseat, connection } = ctrl

  return (
    <div className="topbar">
      <button type="button" className="ghost topbar-exit" onClick={onExit}>
        ← Leave
      </button>

      {isHotseat && setPlayerId && state.players.length > 1 && (
        <label className="topbar-actor">
          <span className="muted">Phone is with</span>
          <select value={playerId} onChange={(e) => setPlayerId(e.target.value)}>
            {state.players.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
      )}

      {!isHotseat && (
        <span className="topbar-status muted">
          <span className={`status-dot ${connection}`} aria-hidden="true" />
          {connection === 'online' ? state.code : connection}
        </span>
      )}
    </div>
  )
}
