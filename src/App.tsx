import { useCallback, useEffect, useState } from 'react'
import { GameOver } from './screens/GameOver'
import { Home } from './screens/Home'
import { JoinInvite } from './screens/JoinInvite'
import { Lobby } from './screens/Lobby'
import { Round } from './screens/Round'
import type { GameController } from './game/controller'
import { useHotseatRoom } from './game/useHotseatRoom'
import { RoomError, createRoomRow, joinRoomRow, roomExists, useRoom } from './game/useRoom'
import { getPlayerId, setPlayerName } from './lib/identity'
import { SUPABASE_SETUP_HINT, isSupabaseConfigured, supabaseConfigProblem } from './lib/supabase'
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

/** null when there's no invite to check. */
type InviteCheck = 'checking' | 'valid' | 'missing' | null

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
  const [invite, setInvite] = useState<InviteCheck>(null)

  const asPlayer = useCallback((name: string): Player => {
    setPlayerName(name)
    return { id: getPlayerId(), name, team: 'left' }
  }, [])

  const goHome = useCallback(() => {
    setError(null)
    location.hash = ''
  }, [])

  /**
   * Verify an invite link's room before showing anything about it.
   *
   * A dead or mistyped code drops straight to the home screen rather than
   * offering to join a room that doesn't exist. Clearing the hash is what
   * actually routes there — this effect re-runs with no code and stands down.
   */
  useEffect(() => {
    if (!roomCode || self) {
      setInvite(null)
      return
    }

    if (!isSupabaseConfigured) {
      goHome()
      return
    }

    let cancelled = false
    setInvite('checking')

    roomExists(roomCode)
      .then((exists) => {
        if (cancelled) return
        setInvite(exists ? 'valid' : 'missing')
        if (!exists) goHome()
      })
      .catch(() => {
        if (cancelled) return
        setInvite('missing')
        goHome()
      })

    return () => {
      cancelled = true
    }
  }, [roomCode, self, goHome])

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

  if (roomCode && self) {
    return <OnlineGame code={roomCode} self={self} onLeft={() => setSelf(null)} />
  }

  // Invite link, room confirmed: ask for a name and nothing else.
  if (roomCode && invite === 'valid') {
    return (
      <main className="app">
        <JoinInvite
          code={roomCode}
          error={error}
          busy={busy}
          onJoin={(name) => join(name, roomCode)}
          onCancel={goHome}
        />
      </main>
    )
  }

  if (roomCode && invite === 'checking') {
    return (
      <main className="app">
        <p className="muted center">Looking for room {roomCode}…</p>
      </main>
    )
  }

  return (
    <main className="app">
      <Home
        error={error ?? supabaseConfigProblem ?? (isSupabaseConfigured ? null : SUPABASE_SETUP_HINT)}
        busy={busy}
        multiplayerEnabled={isSupabaseConfigured}
        onCreate={create}
        onJoin={join}
        onHotseat={(name, mode) => setHotseat({ name, mode })}
      />
    </main>
  )
}

function describe(e: unknown): string {
  if (e instanceof RoomError) return e.message
  // A failed fetch here means the Supabase host is unreachable — almost always
  // a wrong URL baked into the build rather than anything the player did.
  if (e instanceof TypeError && /fetch/i.test(e.message)) {
    return "Couldn't reach the server. Check the Supabase URL this build was deployed with."
  }
  return 'Something went wrong. Try again.'
}

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
