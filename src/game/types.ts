/**
 * Core game types for WaveLang.
 *
 * The whole game lives in one `RoomState` object. In multiplayer that object is
 * a single JSONB column in Supabase; in hotseat mode it's just React state.
 * Keeping it one serializable blob is what makes those two interchangeable.
 */

/** Which team a player is on. Cooperative mode puts everyone on `left`. */
export type TeamId = 'left' | 'right'

export type GameMode = 'teams' | 'coop'

export type Phase =
  | 'lobby'
  | 'pickingCard'
  | 'givingClue'
  | 'guessing'
  | 'counterGuess'
  | 'reveal'
  | 'gameOver'

export interface Player {
  id: string
  name: string
  team: TeamId
}

/** One spectrum card. `left` and `right` are the two poles of a single axis. */
export interface SpectrumCard {
  id: string
  left: string
  right: string
}

/** An AI company that can be given as a clue. */
export interface Startup {
  name: string
  domain: string
  /** Alternate spellings/nicknames people might type. */
  aliases?: string[]
}

/** What the opposing team bets: is the true target left or right of the guess? */
export type CounterGuess = 'left' | 'right'

/** A finished round, kept so the reveal screen and recaps have something to show. */
export interface RoundResult {
  cardId: string
  psychicId: string
  psychicTeam: TeamId
  clue: string
  target: number
  guess: number
  counterGuess: CounterGuess | null
  /** Points from the dial, 0–4. */
  guessPoints: number
  /** 1 if the opposing team called the side correctly, else 0. */
  counterPoints: number
}

export interface RoomState {
  code: string
  mode: GameMode
  phase: Phase
  hostId: string
  players: Player[]
  scores: Record<TeamId, number>

  /** Card ids not yet drawn this game. Refilled when exhausted. */
  deck: string[]
  cardId: string | null

  /** Dial position 0–100 that the psychic is aiming at. Null outside a round. */
  target: number | null
  psychicId: string | null
  /** Whose turn it is to give a clue. In coop this stays 'left'. */
  activeTeam: TeamId

  clue: string | null
  /** Live dial position while the guessing team deliberates. */
  guess: number
  counterGuess: CounterGuess | null

  roundNumber: number
  lastResult: RoundResult | null
  /** Ids of players who have already been the psychic, for fair rotation. */
  psychicHistory: string[]
}

/** Score needed to win in teams mode. */
export const WINNING_SCORE = 10

/** Number of rounds a cooperative game lasts. */
export const COOP_ROUNDS = 8

/** Display names for the two sides. */
export const TEAM_NAMES: Record<TeamId, string> = {
  left: 'Left Brain',
  right: 'Right Brain',
}
