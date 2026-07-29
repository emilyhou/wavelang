import { describe, expect, it } from 'vitest'
import {
  TARGET_MAX,
  TARGET_MIN,
  acceptCard,
  addPlayer,
  canStartGame,
  createRoom,
  isGameOver,
  moveGuess,
  nextPsychic,
  nextRound,
  randomRoomCode,
  randomTarget,
  otherTeam,
  revealRound,
  shuffleCard,
  scoreCounterGuess,
  scoreGuess,
  setPlayerTeam,
  shuffle,
  startGame,
  submitClue,
  submitCounterGuess,
  submitGuess,
  winner,
  type Rng,
} from './engine'
import { COOP_ROUNDS, WINNING_SCORE, type Player, type RoomState } from './types'

const CARDS = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10']

/** Deterministic rng that walks a fixed list of values, looping forever. */
function seededRng(values: number[]): Rng {
  let i = 0
  return () => values[i++ % values.length]
}

const alwaysZero: Rng = () => 0

const player = (id: string, name: string, team: Player['team']): Player => ({ id, name, team })

function fourPlayerRoom(mode: RoomState['mode'] = 'teams'): RoomState {
  let state = createRoom('TEST', player('a', 'Ana', 'left'), mode, CARDS, alwaysZero)
  state = addPlayer(state, player('b', 'Ben', 'left'))
  state = addPlayer(state, player('c', 'Cal', 'right'))
  state = addPlayer(state, player('d', 'Dee', 'right'))
  return state
}

describe('scoreGuess', () => {
  it('awards 4 in the bullseye band', () => {
    expect(scoreGuess(50, 50)).toBe(4)
    expect(scoreGuess(50, 52.5)).toBe(4)
    expect(scoreGuess(50, 47.5)).toBe(4)
  })

  it('awards 3 just outside the bullseye', () => {
    expect(scoreGuess(50, 52.6)).toBe(3)
    expect(scoreGuess(50, 57.5)).toBe(3)
    expect(scoreGuess(50, 42.5)).toBe(3)
  })

  it('awards 2 in the outer band', () => {
    expect(scoreGuess(50, 57.6)).toBe(2)
    expect(scoreGuess(50, 62.5)).toBe(2)
    expect(scoreGuess(50, 37.5)).toBe(2)
  })

  it('awards nothing outside the wedge', () => {
    expect(scoreGuess(50, 62.6)).toBe(0)
    expect(scoreGuess(50, 0)).toBe(0)
    expect(scoreGuess(50, 100)).toBe(0)
  })

  it('is symmetric around the target', () => {
    for (const offset of [0, 1, 5, 10, 12, 20]) {
      expect(scoreGuess(50, 50 + offset)).toBe(scoreGuess(50, 50 - offset))
    }
  })
})

describe('scoreCounterGuess', () => {
  it('awards a point when the side is called correctly', () => {
    expect(scoreCounterGuess(60, 50, 'right')).toBe(1)
    expect(scoreCounterGuess(40, 50, 'left')).toBe(1)
  })

  it('awards nothing when the side is wrong', () => {
    expect(scoreCounterGuess(60, 50, 'left')).toBe(0)
    expect(scoreCounterGuess(40, 50, 'right')).toBe(0)
  })

  it('awards nothing for a dead-on guess, which has no side', () => {
    expect(scoreCounterGuess(50, 50, 'left')).toBe(0)
    expect(scoreCounterGuess(50, 50, 'right')).toBe(0)
  })

  it('awards nothing when no bet was placed', () => {
    expect(scoreCounterGuess(60, 50, null)).toBe(0)
  })
})

describe('randomTarget', () => {
  it('stays inside the playable range for extreme rng values', () => {
    expect(randomTarget(() => 0)).toBeGreaterThanOrEqual(TARGET_MIN)
    expect(randomTarget(() => 0.999999)).toBeLessThanOrEqual(TARGET_MAX)
  })

  it('produces whole numbers across the range', () => {
    for (const r of [0, 0.25, 0.5, 0.75, 0.99]) {
      const target = randomTarget(() => r)
      expect(Number.isInteger(target)).toBe(true)
      expect(target).toBeGreaterThanOrEqual(TARGET_MIN)
      expect(target).toBeLessThanOrEqual(TARGET_MAX)
    }
  })
})

describe('shuffle', () => {
  it('keeps every element and leaves the input untouched', () => {
    const input = ['a', 'b', 'c', 'd']
    const out = shuffle(input, seededRng([0.9, 0.1, 0.7]))
    expect(out.slice().sort()).toEqual(['a', 'b', 'c', 'd'])
    expect(input).toEqual(['a', 'b', 'c', 'd'])
  })
})

describe('randomRoomCode', () => {
  it('produces four vowel-free uppercase letters', () => {
    const code = randomRoomCode(seededRng([0.1, 0.4, 0.7, 0.95]))
    expect(code).toMatch(/^[BCDFGHJKLMNPQRSTVWXYZ]{4}$/)
  })
})

describe('nextPsychic', () => {
  const players = [
    player('a', 'Ana', 'left'),
    player('b', 'Ben', 'left'),
    player('c', 'Cal', 'right'),
  ]

  it('only picks from the active team in teams mode', () => {
    expect(nextPsychic(players, 'right', 'teams', [])).toBe('c')
  })

  it('prefers whoever has never been psychic', () => {
    expect(nextPsychic(players, 'left', 'teams', ['a'])).toBe('b')
  })

  it('rotates to the least recent once everyone has gone', () => {
    expect(nextPsychic(players, 'left', 'teams', ['b', 'a'])).toBe('b')
    expect(nextPsychic(players, 'left', 'teams', ['a', 'b'])).toBe('a')
  })

  it('draws from the whole group in coop mode', () => {
    expect(nextPsychic(players, 'left', 'coop', ['a', 'b'])).toBe('c')
  })

  it('returns null when the team is empty', () => {
    expect(nextPsychic([], 'left', 'teams', [])).toBeNull()
  })
})

describe('canStartGame', () => {
  it('requires two players per side in teams mode', () => {
    expect(canStartGame(fourPlayerRoom())).toBe(true)

    const lopsided = setPlayerTeam(fourPlayerRoom(), 'c', 'left')
    expect(canStartGame(lopsided)).toBe(false)
  })

  it('only requires two players total in coop mode', () => {
    let state = createRoom('TEST', player('a', 'Ana', 'left'), 'coop', CARDS, alwaysZero)
    expect(canStartGame(state)).toBe(false)
    state = addPlayer(state, player('b', 'Ben', 'left'))
    expect(canStartGame(state)).toBe(true)
  })
})

describe('addPlayer', () => {
  it('updates the name instead of duplicating on rejoin', () => {
    let state = createRoom('TEST', player('a', 'Ana', 'left'), 'teams', CARDS, alwaysZero)
    state = addPlayer(state, player('a', 'Ana on her phone', 'left'))
    expect(state.players).toHaveLength(1)
    expect(state.players[0].name).toBe('Ana on her phone')
  })
})

describe('round flow', () => {
  it('walks a teams round from deal to reveal and scores both sides', () => {
    let state = startGame(fourPlayerRoom(), CARDS, alwaysZero)
    expect(state.phase).toBe('pickingCard')
    expect(state.activeTeam).toBe('left')
    expect(state.psychicId).toBe('a')
    expect(state.target).not.toBeNull()

    state = { ...state, target: 60, phase: 'givingClue' }
    state = submitClue(state, 'Anthropic')
    expect(state.phase).toBe('guessing')

    // Dead-on guess: 4 points, and the counter-guess earns nothing.
    state = { ...state, guess: 60 }
    state = submitGuess(state)
    expect(state.phase).toBe('counterGuess')

    state = submitCounterGuess(state, 'right')
    expect(state.phase).toBe('reveal')
    expect(state.scores.left).toBe(4)
    expect(state.scores.right).toBe(0)
    expect(state.lastResult).toMatchObject({ clue: 'Anthropic', guessPoints: 4, counterPoints: 0 })
  })

  it('gives the opposing team their bonus point when they call the side right', () => {
    let state = startGame(fourPlayerRoom(), CARDS, alwaysZero)
    state = { ...state, target: 70, phase: 'givingClue' }
    state = submitClue(state, 'Cursor')
    state = { ...state, guess: 60 }
    state = submitGuess(state)
    state = submitCounterGuess(state, 'right')

    expect(state.scores.left).toBe(2) // 10 away, outer band
    expect(state.scores.right).toBe(1)
  })

  it('skips the counter-guess in coop and pools the score', () => {
    let state = fourPlayerRoom('coop')
    state = startGame(state, CARDS, alwaysZero)
    state = { ...state, target: 40, phase: 'givingClue' }
    state = submitClue(state, 'Perplexity')
    state = { ...state, guess: 45 }
    state = submitGuess(state)

    expect(state.phase).toBe('reveal')
    expect(state.scores.left).toBe(3)
    expect(state.scores.right).toBe(0)
    expect(state.lastResult?.counterPoints).toBe(0)
  })

  it('hands the clue to the other team each round in teams mode', () => {
    let state = startGame(fourPlayerRoom(), CARDS, alwaysZero)
    expect(state.activeTeam).toBe('left')
    state = nextRound({ ...state, phase: 'reveal' }, CARDS, alwaysZero)
    expect(state.activeTeam).toBe('right')
    expect(state.psychicId).toBe('c')
    state = nextRound({ ...state, phase: 'reveal' }, CARDS, alwaysZero)
    expect(state.activeTeam).toBe('left')
    expect(state.psychicId).toBe('b')
  })

  it('keeps one team throughout a coop game', () => {
    let state = startGame(fourPlayerRoom('coop'), CARDS, alwaysZero)
    for (let i = 0; i < 3; i++) {
      state = nextRound({ ...state, phase: 'reveal' }, CARDS, alwaysZero)
      expect(state.activeTeam).toBe('left')
    }
  })

  it('deals a different card each round without repeating the deck', () => {
    let state = startGame(fourPlayerRoom(), CARDS, seededRng([0.13, 0.61, 0.42, 0.87, 0.29]))
    const seen = new Set<string>([state.cardId!])
    for (let i = 0; i < CARDS.length - 1; i++) {
      state = nextRound({ ...state, phase: 'reveal' }, CARDS, alwaysZero)
      expect(seen.has(state.cardId!)).toBe(false)
      seen.add(state.cardId!)
    }
    expect(seen.size).toBe(CARDS.length)
  })

  it('reshuffles rather than running dry when the deck is exhausted', () => {
    let state = startGame(fourPlayerRoom(), CARDS, alwaysZero)
    for (let i = 0; i < CARDS.length + 2; i++) {
      state = nextRound({ ...state, phase: 'reveal', scores: { left: 0, right: 0 } }, CARDS, alwaysZero)
      expect(state.cardId).not.toBeNull()
    }
  })
})

describe('game end', () => {
  it('ends a teams game once someone reaches the winning score', () => {
    const state = startGame(fourPlayerRoom(), CARDS, alwaysZero)
    expect(isGameOver({ ...state, scores: { left: WINNING_SCORE - 1, right: 3 } })).toBe(false)
    expect(isGameOver({ ...state, scores: { left: WINNING_SCORE, right: 3 } })).toBe(true)
    expect(isGameOver({ ...state, scores: { left: 3, right: WINNING_SCORE } })).toBe(true)
  })

  it('moves to gameOver instead of dealing another round', () => {
    let state = startGame(fourPlayerRoom(), CARDS, alwaysZero)
    state = { ...state, phase: 'reveal', scores: { left: WINNING_SCORE, right: 4 } }
    state = nextRound(state, CARDS, alwaysZero)
    expect(state.phase).toBe('gameOver')
    expect(winner(state)).toBe('left')
  })

  it('ends a coop game after the fixed number of rounds', () => {
    const state = startGame(fourPlayerRoom('coop'), CARDS, alwaysZero)
    expect(isGameOver({ ...state, roundNumber: COOP_ROUNDS - 1 })).toBe(false)
    expect(isGameOver({ ...state, roundNumber: COOP_ROUNDS })).toBe(true)
  })

  it('reports no winner on a tie', () => {
    const state = startGame(fourPlayerRoom(), CARDS, alwaysZero)
    expect(winner({ ...state, scores: { left: 10, right: 10 } })).toBeNull()
  })
})

/**
 * The multiplayer write path re-applies a mutation on top of fresh server state
 * when it loses a compare-and-set race. That only works if applying a
 * transition from the wrong phase does nothing — otherwise two players tapping
 * the same button together advance the game twice. This was a real bug, caught
 * by two browser tabs clicking "Next round" at the same instant.
 */
describe('phase transitions are safe to re-apply', () => {
  function atReveal(): RoomState {
    let state = startGame(fourPlayerRoom(), CARDS, alwaysZero)
    state = { ...state, target: 50, phase: 'givingClue' }
    state = submitClue(state, 'Ramp')
    state = { ...state, guess: 50 }
    state = submitGuess(state)
    return submitCounterGuess(state, 'left')
  }

  it('does not skip a round when nextRound runs twice', () => {
    const once = nextRound(atReveal(), CARDS, alwaysZero)
    const twice = nextRound(once, CARDS, alwaysZero)

    expect(once.roundNumber).toBe(2)
    expect(twice.roundNumber).toBe(2)
    expect(twice).toEqual(once)
  })

  it('does not double-score when revealRound runs twice', () => {
    const revealed = atReveal()
    const again = revealRound(revealed)

    expect(revealed.scores.left).toBe(4)
    expect(again.scores.left).toBe(4)
    expect(again).toEqual(revealed)
  })

  it('ignores a stale counter-guess arriving after the reveal', () => {
    const revealed = atReveal()
    expect(submitCounterGuess(revealed, 'right')).toEqual(revealed)
  })

  it('ignores a stale clue or guess submitted from the wrong phase', () => {
    const state = startGame(fourPlayerRoom(), CARDS, alwaysZero) // phase: pickingCard
    expect(submitClue(state, 'Cursor')).toEqual(state)
    expect(submitGuess(state)).toEqual(state)
    expect(moveGuess(state, 80)).toEqual(state)
  })

  it('ignores a second acceptCard', () => {
    const state = acceptCard(startGame(fourPlayerRoom(), CARDS, alwaysZero))
    expect(state.phase).toBe('givingClue')
    expect(acceptCard(state)).toEqual(state)
  })

  it('does not restart a game already in progress', () => {
    const running = startGame(fourPlayerRoom(), CARDS, alwaysZero)
    expect(startGame(running, CARDS, alwaysZero)).toEqual(running)
  })

  it('ignores a card shuffle once the psychic has moved on', () => {
    const state = acceptCard(startGame(fourPlayerRoom(), CARDS, alwaysZero))
    expect(shuffleCard(state, CARDS, alwaysZero)).toEqual(state)
  })

  it('still allows a rematch from the game-over screen', () => {
    const finished = { ...startGame(fourPlayerRoom(), CARDS, alwaysZero), phase: 'gameOver' as const }
    const rematch = startGame(finished, CARDS, alwaysZero)
    expect(rematch.phase).toBe('pickingCard')
    expect(rematch.scores).toEqual({ left: 0, right: 0 })
  })
})

describe('otherTeam', () => {
  it('flips sides', () => {
    expect(otherTeam('left')).toBe('right')
    expect(otherTeam('right')).toBe('left')
  })
})
