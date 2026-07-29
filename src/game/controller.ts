import type { RoomState } from './types'

/**
 * The single seam between the game screens and where state actually lives.
 *
 * Hotseat mode backs this with `useState`; multiplayer backs it with a Supabase
 * row. The screens can't tell the difference, which is the whole point — the UI
 * was built and debugged on hotseat before any network code existed.
 */
export interface GameController {
  state: RoomState
  /** False until the first server snapshot lands. Always true in hotseat. */
  ready: boolean
  /** Apply a pure engine function to the state. May be rejected/retried when online. */
  update: (fn: (state: RoomState) => RoomState) => void
  /** Which player *this device* is acting as. */
  playerId: string
  /** Hotseat only: swap the acting player when the phone gets passed. */
  setPlayerId?: (id: string) => void
  isHotseat: boolean
  connection: ConnectionStatus
  error: string | null
  /** Ids of players currently connected. Everyone, in hotseat. */
  onlinePlayerIds: string[]
  leave: () => void
}

export type ConnectionStatus = 'local' | 'connecting' | 'online' | 'offline' | 'error'
