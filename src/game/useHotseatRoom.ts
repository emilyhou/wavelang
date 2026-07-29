import { useCallback, useMemo, useState } from 'react'
import { CARD_IDS } from '../data/cards'
import type { GameController } from './controller'
import { createRoom } from './engine'
import type { GameMode, Player, RoomState } from './types'

const rng = () => Math.random()

/**
 * Single-device game: everyone shares one phone and passes it around.
 *
 * Same GameController contract as the multiplayer room, so every screen works
 * identically here. Since there's no per-device secrecy on one screen, the
 * header lets you switch which player you're acting as — that's the "pass the
 * phone" step, and it doubles as the fastest way to test the whole game solo.
 */
export function useHotseatRoom(hostName: string, mode: GameMode): GameController {
  const [state, setState] = useState<RoomState>(() => {
    const host: Player = { id: 'p1', name: hostName || 'Player 1', team: 'left' }
    return createRoom('SOLO', host, mode, CARD_IDS, rng)
  })
  const [playerId, setPlayerId] = useState('p1')

  const update = useCallback((fn: (s: RoomState) => RoomState) => setState(fn), [])

  const onlinePlayerIds = useMemo(() => state.players.map((p) => p.id), [state.players])

  return {
    state,
    ready: true,
    update,
    playerId,
    setPlayerId,
    isHotseat: true,
    connection: 'local',
    error: null,
    onlinePlayerIds,
    leave: () => {
      location.hash = ''
    },
  }
}

/** Next free `pN` id, so hotseat players get stable, readable ids. */
export function nextHotseatPlayerId(state: RoomState): string {
  let n = state.players.length + 1
  const taken = new Set(state.players.map((p) => p.id))
  while (taken.has(`p${n}`)) n++
  return `p${n}`
}
