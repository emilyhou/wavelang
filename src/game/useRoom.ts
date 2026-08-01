import { useCallback, useEffect, useRef, useState } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { CARD_IDS } from '../data/cards'
import { supabase } from '../lib/supabase'
import type { ConnectionStatus, GameController } from './controller'
import { addPlayer, createRoom, randomRoomCode, removePlayer } from './engine'
import type { GameMode, Player, RoomState, TeamId } from './types'

const TABLE = 'rooms'
const rng = () => Math.random()

interface RoomRow {
  code: string
  state: RoomState
  version: number
}

export class RoomError extends Error {}

/* ---------------------------------------------------------------- join/create */

/** Inserts a new room, retrying if the random code happens to be taken. */
export async function createRoomRow(host: Player, mode: GameMode): Promise<string> {
  const sb = requireClient()

  for (let attempt = 0; attempt < 6; attempt++) {
    const code = randomRoomCode(rng)
    const state = createRoom(code, host, mode, CARD_IDS, rng)
    const { error } = await sb.from(TABLE).insert({ code, state, version: 0 })

    if (!error) return code
    // 23505 is a primary-key collision — just roll a different code.
    if (error.code !== '23505') throw new RoomError(error.message)
  }
  throw new RoomError('Could not find a free room code. Try again.')
}

/**
 * Does this room exist?
 *
 * Called before rendering an invite link's landing screen, so a stale or
 * mistyped link can fall back to the normal home screen instead of offering to
 * join something that isn't there. Any error counts as "no" — this is a routing
 * decision, and the home screen is the safe destination.
 */
export async function roomExists(code: string): Promise<boolean> {
  if (!supabase) return false
  const { data, error } = await supabase
    .from(TABLE)
    .select('code')
    .eq('code', code)
    .maybeSingle<{ code: string }>()

  return !error && data !== null
}

/** Adds a player to an existing room, or explains why it couldn't. */
export async function joinRoomRow(code: string, player: Player): Promise<void> {
  const sb = requireClient()

  const { data, error } = await sb
    .from(TABLE)
    .select('code, state, version')
    .eq('code', code)
    .maybeSingle<RoomRow>()

  if (error) throw new RoomError(error.message)
  if (!data) throw new RoomError(`No room called ${code}. Check the code and try again.`)

  // Rejoining after a refresh keeps the team you were already on; a genuinely
  // new player lands on whichever side is short-handed.
  const existing = data.state.players.find((p) => p.id === player.id)
  const next = addPlayer(data.state, {
    ...player,
    team: existing?.team ?? smallerTeam(data.state),
  })
  const { data: written, error: writeError } = await sb
    .from(TABLE)
    .update({ state: next, version: data.version + 1 })
    .eq('code', code)
    .eq('version', data.version)
    .select('code')

  if (writeError) throw new RoomError(writeError.message)
  // Lost the race with another joiner; their write landed, so try once more.
  if (!written || written.length === 0) return joinRoomRow(code, player)
}

/** Keeps the lobby balanced as people trickle in. Coop pools everyone on `left`. */
function smallerTeam(state: RoomState): TeamId {
  if (state.mode === 'coop') return 'left'
  const left = state.players.filter((p) => p.team === 'left').length
  const right = state.players.filter((p) => p.team === 'right').length
  return right < left ? 'right' : 'left'
}

function requireClient() {
  if (!supabase) throw new RoomError('Multiplayer is not configured on this build.')
  return supabase
}

/* ---------------------------------------------------------------- the hook */

/**
 * Live room backed by one Supabase row.
 *
 * Writes are optimistic — the local state updates immediately so dragging the
 * dial feels instant — then reconciled against the server with a compare-and-set
 * on `version`. If someone else's write landed first, the same pure function is
 * re-applied to the fresh server state and retried, which is why every mutation
 * here is a function rather than a value.
 */
export function useRoom(code: string, self: Player): GameController {
  const [state, setState] = useState<RoomState | null>(null)
  const [connection, setConnection] = useState<ConnectionStatus>('connecting')
  const [error, setError] = useState<string | null>(null)
  const [onlinePlayerIds, setOnlinePlayerIds] = useState<string[]>([])

  // Refs, not state: the write loop needs the newest values without re-subscribing.
  const stateRef = useRef<RoomState | null>(null)
  const versionRef = useRef(0)
  const pendingRef = useRef<((s: RoomState) => RoomState) | null>(null)
  const flushingRef = useRef(false)
  const channelRef = useRef<RealtimeChannel | null>(null)

  const applyLocal = useCallback((next: RoomState) => {
    stateRef.current = next
    setState(next)
  }, [])

  /**
   * Drains the pending mutation to Postgres.
   *
   * Only the newest pending function is kept, so a burst of dial movements
   * collapses into one write per round-trip instead of flooding the socket.
   */
  const flush = useCallback(async () => {
    if (flushingRef.current || !supabase) return
    flushingRef.current = true

    try {
      while (pendingRef.current) {
        const fn = pendingRef.current
        pendingRef.current = null

        let landed = false
        for (let attempt = 0; attempt < 3 && !landed; attempt++) {
          const local = stateRef.current
          if (!local) break

          const { data, error: writeError } = await supabase
            .from(TABLE)
            .update({ state: local, version: versionRef.current + 1 })
            .eq('code', code)
            .eq('version', versionRef.current)
            .select('code')

          if (writeError) {
            setError(writeError.message)
            break
          }

          if (data && data.length > 0) {
            versionRef.current += 1
            landed = true
            setError(null)
            break
          }

          // Someone else wrote first. Re-apply our intent on top of theirs.
          const { data: fresh } = await supabase
            .from(TABLE)
            .select('state, version')
            .eq('code', code)
            .maybeSingle<RoomRow>()

          if (!fresh) break
          versionRef.current = fresh.version
          applyLocal(fn(fresh.state))
        }
      }
    } finally {
      flushingRef.current = false
    }
  }, [code, applyLocal])

  const update = useCallback(
    (fn: (s: RoomState) => RoomState) => {
      const current = stateRef.current
      if (!current) return
      applyLocal(fn(current))
      pendingRef.current = fn
      void flush()
    },
    [applyLocal, flush],
  )

  /* ---------- subscribe ---------- */

  useEffect(() => {
    if (!supabase) {
      setConnection('error')
      setError('Multiplayer is not configured on this build.')
      return
    }

    let cancelled = false

    const adopt = (row: Pick<RoomRow, 'state' | 'version'>) => {
      // Never let a server echo stomp a write we're still reconciling — the
      // flush loop's conflict path is what merges those.
      if (flushingRef.current || pendingRef.current) return
      if (row.version <= versionRef.current) return
      versionRef.current = row.version
      applyLocal(row.state)
    }

    const channel = supabase
      .channel(`room:${code}`, { config: { presence: { key: self.id } } })
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: TABLE, filter: `code=eq.${code}` },
        (payload) => adopt(payload.new as RoomRow),
      )
      .on('presence', { event: 'sync' }, () => {
        setOnlinePlayerIds(Object.keys(channel.presenceState()))
      })

    channelRef.current = channel

    channel.subscribe(async (status) => {
      if (cancelled) return

      if (status === 'SUBSCRIBED') {
        // Read *after* subscribing, so nothing that happens during the initial
        // fetch is missed.
        const { data, error: readError } = await supabase!
          .from(TABLE)
          .select('state, version')
          .eq('code', code)
          .maybeSingle<RoomRow>()

        if (cancelled) return
        if (readError || !data) {
          setConnection('error')
          setError(readError?.message ?? `Room ${code} no longer exists.`)
          return
        }

        versionRef.current = data.version
        applyLocal(data.state)
        setConnection('online')
        setError(null)
        await channel.track({ playerId: self.id })
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        setConnection('offline')
      } else if (status === 'CLOSED') {
        setConnection('offline')
      }
    })

    return () => {
      cancelled = true
      channelRef.current = null
      void supabase!.removeChannel(channel)
    }
  }, [code, self.id, applyLocal])

  // Best-effort tidy-up. Routing is App's job, so this only touches the room.
  const leave = useCallback(() => {
    update((s) => removePlayer(s, self.id))
  }, [update, self.id])

  return {
    state: state ?? PLACEHOLDER,
    ready: state !== null,
    update,
    playerId: self.id,
    isHotseat: false,
    connection,
    error,
    onlinePlayerIds,
    leave,
  }
}

/** Rendered only in the brief window before the first fetch lands. */
const PLACEHOLDER: RoomState = createRoom(
  '····',
  { id: '', name: '', team: 'left' },
  'teams',
  CARD_IDS,
  () => 0,
)
