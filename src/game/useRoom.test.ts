import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CARD_IDS } from '../data/cards'
import { createRoom } from './engine'
import type { Player, RoomState } from './types'

/**
 * Tests for the room join/create paths against a fake Postgres.
 *
 * These cover the races that are near-impossible to reproduce by hand: two
 * people joining in the same instant, and a room code colliding on insert.
 */

/** Minimal stand-in for the `rooms` table plus the query builder we use. */
class FakeDb {
  rows = new Map<string, { code: string; state: RoomState; version: number }>()
  /** Runs before each write lands, to simulate someone else getting there first. */
  beforeWrite: (() => void) | null = null
  insertCalls = 0

  from = () => {
    const rows = this.rows
    const runBeforeWrite = () => this.beforeWrite?.()
    const countInsert = () => {
      this.insertCalls++
    }
    let filters: Record<string, unknown> = {}

    const builder = {
      insert(row: { code: string; state: RoomState; version: number }) {
        countInsert()
        if (rows.has(row.code)) {
          return Promise.resolve({ data: null, error: { code: '23505', message: 'duplicate' } })
        }
        rows.set(row.code, { ...row })
        return Promise.resolve({ data: [row], error: null })
      },

      select() {
        return builder
      },

      update(patch: { state: RoomState; version: number }) {
        builder._patch = patch
        return builder
      },

      eq(column: string, value: unknown) {
        filters[column] = value
        return builder
      },

      maybeSingle() {
        const row = rows.get(filters.code as string)
        return Promise.resolve({ data: row ? { ...row } : null, error: null })
      },

      _patch: null as { state: RoomState; version: number } | null,

      /** Awaiting the builder is what actually runs an update. */
      then(resolve: (r: { data: unknown; error: unknown }) => void) {
        runBeforeWrite()
        const row = rows.get(filters.code as string)
        const patch = builder._patch

        // No patch means this was a plain select that got awaited directly.
        if (!patch) return resolve({ data: row ? [row] : [], error: null })

        // Compare-and-set: the version filter must still match.
        if (!row || row.version !== filters.version) {
          return resolve({ data: [], error: null })
        }
        rows.set(row.code, { code: row.code, ...patch })
        return resolve({ data: [{ code: row.code }], error: null })
      },
    }

    filters = {}
    return builder
  }
}

const db = new FakeDb()

vi.mock('../lib/supabase', () => ({
  get supabase() {
    return db
  },
  isSupabaseConfigured: true,
  SUPABASE_SETUP_HINT: '',
}))

const { createRoomRow, joinRoomRow, roomExists } = await import('./useRoom')

const player = (id: string, name: string): Player => ({ id, name, team: 'left' })

beforeEach(() => {
  db.rows.clear()
  db.beforeWrite = null
  db.insertCalls = 0
})

describe('createRoomRow', () => {
  it('creates a room with the host already seated', async () => {
    const code = await createRoomRow(player('a', 'Ana'), 'teams')

    expect(code).toMatch(/^[BCDFGHJKLMNPQRSTVWXYZ]{4}$/)
    const row = db.rows.get(code)!
    expect(row.version).toBe(0)
    expect(row.state.players).toEqual([player('a', 'Ana')])
    expect(row.state.phase).toBe('lobby')
  })

  it('rolls a new code when the first one is taken', async () => {
    // Pre-fill every code the rng will produce first, forcing a collision.
    const taken = await createRoomRow(player('a', 'Ana'), 'teams')
    const originalRandom = Math.random
    let call = 0
    // First four rng draws reproduce the taken code, then go random again.
    const letters = 'BCDFGHJKLMNPQRSTVWXYZ'
    Math.random = () => {
      if (call < 4) return letters.indexOf(taken[call++]) / letters.length
      return originalRandom()
    }

    try {
      const code = await createRoomRow(player('b', 'Ben'), 'teams')
      expect(code).not.toBe(taken)
      expect(db.insertCalls).toBeGreaterThan(2)
    } finally {
      Math.random = originalRandom
    }
  })

  it('surfaces non-collision errors instead of retrying', async () => {
    db.rows.set('XXXX', { code: 'XXXX', state: {} as RoomState, version: 0 })
    const broken = new FakeDb()
    broken.from = () =>
      ({
        insert: () =>
          Promise.resolve({ data: null, error: { code: '42501', message: 'permission denied' } }),
      }) as never

    const original = db.from
    db.from = broken.from as typeof db.from
    try {
      await expect(createRoomRow(player('a', 'Ana'), 'teams')).rejects.toThrow('permission denied')
    } finally {
      db.from = original
    }
  })
})

describe('roomExists', () => {
  /*
   * This gates which screen an invite link lands on, so a wrong answer either
   * offers to join a room that isn't there or dumps someone with a good link
   * back to the home screen.
   */
  it('is true for a room that exists', async () => {
    const code = await createRoomRow(player('a', 'Ana'), 'teams')
    await expect(roomExists(code)).resolves.toBe(true)
  })

  it('is false for a code nobody has used', async () => {
    await expect(roomExists('ZZZZ')).resolves.toBe(false)
  })

  it('is false rather than throwing when the query errors', async () => {
    const original = db.from
    db.from = (() => ({
      select: () => ({
        eq: () => ({
          maybeSingle: () =>
            Promise.resolve({ data: null, error: { code: '42501', message: 'denied' } }),
        }),
      }),
    })) as unknown as typeof db.from

    try {
      await expect(roomExists('ABCD')).resolves.toBe(false)
    } finally {
      db.from = original
    }
  })
})

describe('joinRoomRow', () => {
  async function seedRoom(code = 'ABCD'): Promise<void> {
    const state = createRoom(code, player('a', 'Ana'), 'teams', CARD_IDS, () => 0)
    db.rows.set(code, { code, state, version: 0 })
  }

  it('rejects an unknown code with a readable message', async () => {
    await expect(joinRoomRow('ZZZZ', player('b', 'Ben'))).rejects.toThrow(/No room called ZZZZ/)
  })

  it('adds a joiner and bumps the version', async () => {
    await seedRoom()
    await joinRoomRow('ABCD', player('b', 'Ben'))

    const row = db.rows.get('ABCD')!
    expect(row.version).toBe(1)
    expect(row.state.players.map((p) => p.name)).toEqual(['Ana', 'Ben'])
  })

  it('balances teams instead of piling everyone on one side', async () => {
    await seedRoom()
    await joinRoomRow('ABCD', player('b', 'Ben'))
    await joinRoomRow('ABCD', player('c', 'Cal'))
    await joinRoomRow('ABCD', player('d', 'Dee'))

    const teams = db.rows.get('ABCD')!.state.players.map((p) => p.team)
    expect(teams.filter((t) => t === 'left')).toHaveLength(2)
    expect(teams.filter((t) => t === 'right')).toHaveLength(2)
  })

  it('rejoining after a refresh updates the name without duplicating or switching teams', async () => {
    await seedRoom()
    await joinRoomRow('ABCD', player('b', 'Ben'))
    const teamBefore = db.rows.get('ABCD')!.state.players.find((p) => p.id === 'b')!.team

    await joinRoomRow('ABCD', { id: 'b', name: 'Ben on his laptop', team: 'left' })

    const players = db.rows.get('ABCD')!.state.players
    expect(players).toHaveLength(2)
    const ben = players.find((p) => p.id === 'b')!
    expect(ben.name).toBe('Ben on his laptop')
    expect(ben.team).toBe(teamBefore)
  })

  it('retries when another joiner wins the race, keeping both players', async () => {
    await seedRoom()

    // The instant before our write lands, someone else's join commits.
    let sabotaged = false
    db.beforeWrite = () => {
      if (sabotaged) return
      sabotaged = true
      const row = db.rows.get('ABCD')!
      db.rows.set('ABCD', {
        ...row,
        version: row.version + 1,
        state: { ...row.state, players: [...row.state.players, player('z', 'Zoe')] },
      })
    }

    await joinRoomRow('ABCD', player('b', 'Ben'))

    const names = db.rows.get('ABCD')!.state.players.map((p) => p.name)
    expect(names).toContain('Zoe')
    expect(names).toContain('Ben')
  })
})
