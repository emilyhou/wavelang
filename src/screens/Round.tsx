import { useState } from 'react'
import { Dial } from '../components/Dial'
import { Scoreboard } from '../components/Scoreboard'
import { StartupLogo } from '../components/StartupLogo'
import { ClueInput } from '../components/ClueInput'
import { CARD_IDS, getCard } from '../data/cards'
import { getStartup } from '../data/startups'
import type { GameController } from '../game/controller'
import {
  acceptCard,
  moveGuess,
  nextRound,
  otherTeam,
  shuffleCard,
  submitClue,
  submitCounterGuess,
  submitGuess,
} from '../game/engine'
import { TEAM_NAMES, type CounterGuess, type RoomState } from '../game/types'
import './Round.css'

const rng = () => Math.random()

/** The player whose name to show, or a placeholder if they've left. */
const nameOf = (state: RoomState, id: string | null) =>
  state.players.find((p) => p.id === id)?.name ?? 'someone'

export function Round({ ctrl }: { ctrl: GameController }) {
  const { state, update, playerId } = ctrl
  const card = getCard(state.cardId)

  const isPsychic = state.psychicId === playerId
  const me = state.players.find((p) => p.id === playerId)
  // In coop everyone guesses together; in teams only the psychic's side does.
  const onActiveTeam = state.mode === 'coop' || me?.team === state.activeTeam
  const isGuesser = onActiveTeam && !isPsychic
  const isCounterGuesser = state.mode === 'teams' && !onActiveTeam

  if (!card) return <p className="muted">Dealing…</p>

  const header = (
    <>
      <Scoreboard state={state} />
      <div className="round-meta muted">
        Round {state.roundNumber} ·{' '}
        {state.mode === 'teams' ? (
          <>
            <span className={`team-${state.activeTeam}`}>{TEAM_NAMES[state.activeTeam]}</span> is
            guessing
          </>
        ) : (
          'everyone guesses'
        )}{' '}
        · psychic is <strong>{nameOf(state, state.psychicId)}</strong>
      </div>
    </>
  )

  return (
    <div className="stack">
      {header}
      {state.phase === 'pickingCard' && (
        <PickingCard state={state} update={update} isPsychic={isPsychic} />
      )}
      {state.phase === 'givingClue' && (
        <GivingClue state={state} update={update} isPsychic={isPsychic} />
      )}
      {state.phase === 'guessing' && (
        <Guessing state={state} update={update} canMove={isGuesser} isPsychic={isPsychic} />
      )}
      {state.phase === 'counterGuess' && (
        <CounterGuessPhase state={state} update={update} canBet={isCounterGuesser} />
      )}
      {state.phase === 'reveal' && <Reveal state={state} update={update} />}
    </div>
  )
}

/* ---------- phase 1: psychic looks at the card ---------- */

function PickingCard({
  state,
  update,
  isPsychic,
}: {
  state: RoomState
  update: GameController['update']
  isPsychic: boolean
}) {
  const card = getCard(state.cardId)!

  return (
    <div className="stack">
      <Dial value={50} leftLabel={card.left} rightLabel={card.right} disabled />
      {isPsychic ? (
        <div className="stack">
          <p className="muted">
            You're the psychic. Happy with this spectrum? You get one reroll's worth of mercy.
          </p>
          <div className="row">
            <button
              type="button"
              className="ghost"
              onClick={() => update((s) => shuffleCard(s, CARD_IDS, rng))}
            >
              New card
            </button>
            <button
              type="button"
              className="primary spacer"
              onClick={() => update(acceptCard)}
            >
              Show me the target
            </button>
          </div>
        </div>
      ) : (
        <p className="muted center">
          {nameOf(state, state.psychicId)} is looking at the spectrum…
        </p>
      )}
    </div>
  )
}

/* ---------- phase 2: psychic picks a startup as the clue ---------- */

function GivingClue({
  state,
  update,
  isPsychic,
}: {
  state: RoomState
  update: GameController['update']
  isPsychic: boolean
}) {
  const card = getCard(state.cardId)!
  const [clue, setClue] = useState('')

  const trimmed = clue.trim()
  const give = () => {
    if (trimmed) update((s) => submitClue(s, trimmed))
  }

  if (!isPsychic) {
    return (
      <div className="stack">
        <Dial value={50} leftLabel={card.left} rightLabel={card.right} disabled />
        <p className="muted center">
          {nameOf(state, state.psychicId)} is picking a startup. No peeking at their screen.
        </p>
      </div>
    )
  }

  return (
    <div className="stack">
      <Dial
        value={state.target ?? 50}
        target={state.target}
        showTarget
        leftLabel={card.left}
        rightLabel={card.right}
        disabled
      />
      <p className="muted">
        Only you can see the target. Name the AI startup that lands right there on this spectrum.
      </p>
      <ClueInput value={clue} onChange={setClue} onSubmit={give} autoFocus />
      <p className="muted clue-hint">
        {trimmed && !getStartup(trimmed)
          ? `“${trimmed}” isn't on our list — you can still give it.`
          : 'Not on the list? Type anything and give it anyway.'}
      </p>
      <button type="button" className="primary wide" disabled={!trimmed} onClick={give}>
        Give this clue
      </button>
    </div>
  )
}

/* ---------- phase 3: the team moves the dial ---------- */

function Guessing({
  state,
  update,
  canMove,
  isPsychic,
}: {
  state: RoomState
  update: GameController['update']
  canMove: boolean
  isPsychic: boolean
}) {
  const card = getCard(state.cardId)!

  return (
    <div className="stack">
      <ClueBanner clue={state.clue} />
      <Dial
        value={state.guess}
        leftLabel={card.left}
        rightLabel={card.right}
        disabled={!canMove}
        onChange={canMove ? (v) => update((s) => moveGuess(s, v)) : undefined}
      />
      {canMove ? (
        <>
          <p className="muted center">Drag the needle. Everyone on your team sees it move.</p>
          <button type="button" className="primary wide" onClick={() => update(submitGuess)}>
            Lock it in
          </button>
        </>
      ) : (
        <p className="muted center">
          {isPsychic
            ? 'Say nothing. Let them cook.'
            : `${TEAM_NAMES[state.activeTeam]} is deliberating…`}
        </p>
      )}
    </div>
  )
}

/* ---------- phase 4: opponents bet on a side ---------- */

function CounterGuessPhase({
  state,
  update,
  canBet,
}: {
  state: RoomState
  update: GameController['update']
  canBet: boolean
}) {
  const card = getCard(state.cardId)!
  const opponents = otherTeam(state.activeTeam)

  const bet = (side: CounterGuess) => update((s) => submitCounterGuess(s, side))

  return (
    <div className="stack">
      <ClueBanner clue={state.clue} />
      <Dial value={state.guess} leftLabel={card.left} rightLabel={card.right} disabled />
      {canBet ? (
        <>
          <p className="muted center">
            Is the real target to the left or the right of their guess? Worth 1 point.
          </p>
          <div className="row counter-row">
            <button type="button" className="spacer" onClick={() => bet('left')}>
              ◀ Left
            </button>
            <button type="button" className="spacer" onClick={() => bet('right')}>
              Right ▶
            </button>
          </div>
        </>
      ) : (
        <p className="muted center">{TEAM_NAMES[opponents]} is betting on a side…</p>
      )}
    </div>
  )
}

/* ---------- phase 5: reveal and score ---------- */

function Reveal({
  state,
  update,
}: {
  state: RoomState
  update: GameController['update']
}) {
  const card = getCard(state.cardId)!
  const result = state.lastResult
  if (!result) return null

  const opponents = otherTeam(result.psychicTeam)

  return (
    <div className="stack">
      <ClueBanner clue={result.clue} />
      <Dial
        value={result.target}
        target={result.target}
        showTarget
        ghostValue={result.guess}
        leftLabel={card.left}
        rightLabel={card.right}
        disabled
      />

      <div className="card stack reveal-score">
        <div className="row">
          <span className={`team-${result.psychicTeam}`}>
            {state.mode === 'coop' ? 'Everyone' : TEAM_NAMES[result.psychicTeam]}
          </span>
          <span className="spacer" />
          <strong className="reveal-points">+{result.guessPoints}</strong>
        </div>
        {state.mode === 'teams' && (
          <div className="row">
            <span className={`team-${opponents}`}>{TEAM_NAMES[opponents]}</span>
            <span className="muted">
              {result.counterGuess ? `bet ${result.counterGuess}` : 'no bet'}
            </span>
            <span className="spacer" />
            <strong className="reveal-points">+{result.counterPoints}</strong>
          </div>
        )}
        <p className="muted">
          Target was <strong>{Math.round(result.target)}</strong>, guess was{' '}
          <strong>{Math.round(result.guess)}</strong> — off by{' '}
          {Math.round(Math.abs(result.target - result.guess))}.
        </p>
      </div>

      <button
        type="button"
        className="primary wide"
        onClick={() => update((s) => nextRound(s, CARD_IDS, rng))}
      >
        Next round
      </button>
    </div>
  )
}

/* ---------- shared ---------- */

function ClueBanner({ clue }: { clue: string | null }) {
  const startup = getStartup(clue)
  if (!clue) return null

  return (
    <div className="clue-banner">
      <span className="clue-label">The clue is</span>
      <span className="clue-value">
        {startup && <StartupLogo startup={startup} size={30} />}
        {clue}
      </span>
    </div>
  )
}
