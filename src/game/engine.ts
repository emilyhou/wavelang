/**
 * Pure game logic for WaveLang. No React, no network, no Date.now(), no globals.
 *
 * Every function here takes a RoomState and returns a new one, so the same code
 * drives hotseat mode and the Supabase-backed multiplayer room. Randomness is
 * injected as an `rng` argument so the tests can be deterministic.
 */

import {
  COOP_ROUNDS,
  WINNING_SCORE,
  type CounterGuess,
  type GameMode,
  type Phase,
  type Player,
  type RoomState,
  type RoundResult,
  type TeamId,
} from './types'

export type Rng = () => number

/**
 * Scoring bands, as half-widths in dial units (the dial runs 0–100).
 *
 * A guess within 2.5 of the target scores 4, within 7.5 scores 3, within 12.5
 * scores 2, and anything further scores 0. That makes the whole scoring wedge a
 * quarter of the board, which is about where the physical game sits.
 */
export const SCORING_BANDS: ReadonlyArray<{ halfWidth: number; points: number }> = [
  { halfWidth: 2.5, points: 4 },
  { halfWidth: 7.5, points: 3 },
  { halfWidth: 12.5, points: 2 },
]

/** Half-width of the entire scoring wedge — used by the UI to draw the bands. */
export const WEDGE_HALF_WIDTH = SCORING_BANDS[SCORING_BANDS.length - 1].halfWidth

/**
 * Targets are kept away from the extremes so the full wedge always fits on the
 * board. Without this, a target at 1 makes half the scoring zone unreachable.
 */
export const TARGET_MIN = WEDGE_HALF_WIDTH
export const TARGET_MAX = 100 - WEDGE_HALF_WIDTH

export const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

/** Points scored by a dial guess against the hidden target. */
export function scoreGuess(target: number, guess: number): number {
  const distance = Math.abs(target - guess)
  for (const band of SCORING_BANDS) {
    if (distance <= band.halfWidth) return band.points
  }
  return 0
}

/**
 * The opposing team's bonus point for betting which side of the guess the true
 * target falls on. A dead-on guess (target === guess) has no side, so no point.
 */
export function scoreCounterGuess(
  target: number,
  guess: number,
  counterGuess: CounterGuess | null,
): number {
  if (counterGuess === null || target === guess) return 0
  const actualSide: CounterGuess = target < guess ? 'left' : 'right'
  return counterGuess === actualSide ? 1 : 0
}

export const otherTeam = (team: TeamId): TeamId => (team === 'left' ? 'right' : 'left')

function randomInt(rng: Rng, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min
}

/** A fresh hidden target, rounded to whole dial units. */
export function randomTarget(rng: Rng): number {
  return randomInt(rng, Math.ceil(TARGET_MIN), Math.floor(TARGET_MAX))
}

/** Fisher-Yates, non-mutating. */
export function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const out = items.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** Four uppercase letters, avoiding vowels so we can't spell anything unfortunate. */
const ROOM_CODE_ALPHABET = 'BCDFGHJKLMNPQRSTVWXYZ'
export function randomRoomCode(rng: Rng): string {
  let code = ''
  for (let i = 0; i < 4; i++) {
    code += ROOM_CODE_ALPHABET[Math.floor(rng() * ROOM_CODE_ALPHABET.length)]
  }
  return code
}

/**
 * Who gives the next clue: the eligible player who has been psychic least
 * recently. `psychicHistory` is most-recent-last, so a player missing from it
 * has never gone and sorts first.
 */
export function nextPsychic(
  players: readonly Player[],
  team: TeamId,
  mode: GameMode,
  psychicHistory: readonly string[],
): string | null {
  const eligible = mode === 'coop' ? players : players.filter((p) => p.team === team)
  if (eligible.length === 0) return null

  let best = eligible[0]
  let bestRank = psychicHistory.lastIndexOf(best.id)
  for (const player of eligible.slice(1)) {
    const rank = psychicHistory.lastIndexOf(player.id)
    if (rank < bestRank) {
      best = player
      bestRank = rank
    }
  }
  return best.id
}

export function createRoom(
  code: string,
  host: Player,
  mode: GameMode,
  cardIds: readonly string[],
  rng: Rng,
): RoomState {
  return {
    code,
    mode,
    phase: 'lobby',
    hostId: host.id,
    players: [host],
    scores: { left: 0, right: 0 },
    deck: shuffle(cardIds, rng),
    cardId: null,
    target: null,
    psychicId: null,
    activeTeam: 'left',
    clue: null,
    guess: 50,
    counterGuess: null,
    roundNumber: 0,
    lastResult: null,
    psychicHistory: [],
  }
}

/** Adds a player, or updates their name if they're rejoining with the same id. */
export function addPlayer(state: RoomState, player: Player): RoomState {
  const existing = state.players.find((p) => p.id === player.id)
  if (existing) {
    return {
      ...state,
      players: state.players.map((p) => (p.id === player.id ? { ...p, name: player.name } : p)),
    }
  }
  return { ...state, players: [...state.players, player] }
}

export function removePlayer(state: RoomState, playerId: string): RoomState {
  const players = state.players.filter((p) => p.id !== playerId)
  return {
    ...state,
    players,
    // Don't leave the room headless if the host walks away.
    hostId: state.hostId === playerId && players.length > 0 ? players[0].id : state.hostId,
  }
}

export function setPlayerTeam(state: RoomState, playerId: string, team: TeamId): RoomState {
  return {
    ...state,
    players: state.players.map((p) => (p.id === playerId ? { ...p, team } : p)),
  }
}

/**
 * Whether the lobby has enough players to start. Teams mode needs at least one
 * player on each side plus a teammate for the psychic to talk to.
 */
export function canStartGame(state: RoomState): boolean {
  if (state.mode === 'coop') return state.players.length >= 2
  const left = state.players.filter((p) => p.team === 'left').length
  const right = state.players.filter((p) => p.team === 'right').length
  return left >= 2 && right >= 2
}

/** Draws the next card, reshuffling the full deck when we run out. */
function drawCard(
  deck: readonly string[],
  allCardIds: readonly string[],
  rng: Rng,
): { cardId: string; deck: string[] } {
  const source = deck.length > 0 ? deck.slice() : shuffle(allCardIds, rng)
  const cardId = source[0]
  return { cardId, deck: source.slice(1) }
}

/** Sets up the next round: new card, new hidden target, next psychic. */
export function startRound(
  state: RoomState,
  allCardIds: readonly string[],
  rng: Rng,
): RoomState {
  const { cardId, deck } = drawCard(state.deck, allCardIds, rng)
  const psychicId = nextPsychic(state.players, state.activeTeam, state.mode, state.psychicHistory)

  return {
    ...state,
    phase: 'pickingCard',
    cardId,
    deck,
    target: randomTarget(rng),
    psychicId,
    psychicHistory: psychicId ? [...state.psychicHistory, psychicId] : state.psychicHistory,
    clue: null,
    guess: 50,
    counterGuess: null,
    roundNumber: state.roundNumber + 1,
    lastResult: null,
  }
}

export function startGame(
  state: RoomState,
  allCardIds: readonly string[],
  rng: Rng,
): RoomState {
  if (state.phase !== 'lobby' && state.phase !== 'gameOver') return state
  const fresh: RoomState = {
    ...state,
    scores: { left: 0, right: 0 },
    roundNumber: 0,
    psychicHistory: [],
    deck: shuffle(allCardIds, rng),
    activeTeam: 'left',
  }
  return startRound(fresh, allCardIds, rng)
}

/** Psychic didn't like the card and wants a different one. */
export function shuffleCard(
  state: RoomState,
  allCardIds: readonly string[],
  rng: Rng,
): RoomState {
  if (state.phase !== 'pickingCard') return state
  const { cardId, deck } = drawCard(state.deck, allCardIds, rng)
  return { ...state, cardId, deck }
}

/*
 * Phase transitions below are all guarded on the phase they advance *from*.
 *
 * That guard is what makes them safe to re-apply. When two players act at the
 * same instant, the write that loses the compare-and-set re-applies its
 * function on top of the winner's state — without these guards, two people
 * tapping "Next round" together would advance the game two rounds. Applying a
 * transition from the wrong phase is now a no-op instead.
 */

/** Psychic has seen the card and is ready to look at the target. */
export function acceptCard(state: RoomState): RoomState {
  if (state.phase !== 'pickingCard') return state
  return { ...state, phase: 'givingClue' }
}

export function submitClue(state: RoomState, clue: string): RoomState {
  if (state.phase !== 'givingClue') return state
  return { ...state, phase: 'guessing', clue }
}

/**
 * Live dial movement while the team deliberates.
 *
 * Safe to re-apply by construction: it sets an absolute position rather than a
 * delta, so a replayed move lands in the same place.
 */
export function moveGuess(state: RoomState, guess: number): RoomState {
  if (state.phase !== 'guessing') return state
  return { ...state, guess: clamp(guess, 0, 100) }
}

/**
 * Guessing team locks in. Teams mode hands off to the opponents for their
 * left/right bet; coop goes straight to the reveal.
 */
export function submitGuess(state: RoomState): RoomState {
  if (state.phase !== 'guessing') return state
  if (state.mode === 'coop') return revealRound(state)
  return { ...state, phase: 'counterGuess' }
}

export function submitCounterGuess(state: RoomState, counterGuess: CounterGuess): RoomState {
  if (state.phase !== 'counterGuess') return state
  return revealRound({ ...state, counterGuess })
}

/**
 * Scores the round and moves to the reveal screen.
 *
 * Scoring is additive, so unlike the other transitions this one would double a
 * team's points if it ran twice — hence the guard against re-entering from
 * `reveal`.
 */
export function revealRound(state: RoomState): RoomState {
  if (state.phase === 'reveal' || state.phase === 'gameOver') return state
  const target = state.target ?? 50
  const guessPoints = scoreGuess(target, state.guess)
  const counterPoints = scoreCounterGuess(target, state.guess, state.counterGuess)
  const opponents = otherTeam(state.activeTeam)

  const scores: Record<TeamId, number> = {
    ...state.scores,
    [state.activeTeam]: state.scores[state.activeTeam] + guessPoints,
  }
  if (state.mode === 'teams') {
    scores[opponents] = scores[opponents] + counterPoints
  }

  const result: RoundResult = {
    cardId: state.cardId ?? '',
    psychicId: state.psychicId ?? '',
    psychicTeam: state.activeTeam,
    clue: state.clue ?? '',
    target,
    guess: state.guess,
    counterGuess: state.counterGuess,
    guessPoints,
    counterPoints: state.mode === 'teams' ? counterPoints : 0,
  }

  return { ...state, phase: 'reveal', scores, lastResult: result }
}

/** In coop the whole group shares one score; `left` is the shared bucket. */
export const coopScore = (state: RoomState) => state.scores.left

export function isGameOver(state: RoomState): boolean {
  if (state.mode === 'coop') return state.roundNumber >= COOP_ROUNDS
  return state.scores.left >= WINNING_SCORE || state.scores.right >= WINNING_SCORE
}

/** Null on a tie, or in coop where there is no winning side. */
export function winner(state: RoomState): TeamId | null {
  if (state.mode === 'coop') return null
  if (state.scores.left === state.scores.right) return null
  return state.scores.left > state.scores.right ? 'left' : 'right'
}

/** Advances past the reveal: either end the game or deal the next round. */
export function nextRound(
  state: RoomState,
  allCardIds: readonly string[],
  rng: Rng,
): RoomState {
  // Only the reveal advances. Without this, two players tapping "Next round"
  // at the same moment would skip a round between them.
  if (state.phase !== 'reveal') return state
  if (isGameOver(state)) {
    return { ...state, phase: 'gameOver' as Phase }
  }
  const handedOff: RoomState = {
    ...state,
    activeTeam: state.mode === 'coop' ? state.activeTeam : otherTeam(state.activeTeam),
  }
  return startRound(handedOff, allCardIds, rng)
}

export function returnToLobby(state: RoomState): RoomState {
  return {
    ...state,
    phase: 'lobby',
    cardId: null,
    target: null,
    psychicId: null,
    clue: null,
    counterGuess: null,
    lastResult: null,
  }
}
