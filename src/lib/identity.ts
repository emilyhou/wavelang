/**
 * Who this browser is.
 *
 * The player id is persisted so a refresh (or the phone locking mid-round)
 * rejoins as the same player instead of spawning a ghost in the player list.
 * The display name is remembered purely as a convenience on the home screen.
 */

const ID_KEY = 'wavelang.playerId'
const NAME_KEY = 'wavelang.playerName'

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    // Private mode / storage disabled. Fall back to a per-session identity.
    return null
  }
}

function safeSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Nothing to do — the in-memory value still works for this session.
  }
}

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `p_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
}

let cachedId: string | null = null

export function getPlayerId(): string {
  if (cachedId) return cachedId
  const stored = safeGet(ID_KEY)
  cachedId = stored ?? newId()
  if (!stored) safeSet(ID_KEY, cachedId)
  return cachedId
}

export const getPlayerName = (): string => safeGet(NAME_KEY) ?? ''

export const setPlayerName = (name: string): void => safeSet(NAME_KEY, name)
