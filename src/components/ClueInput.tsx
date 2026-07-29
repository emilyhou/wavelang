import { useEffect, useMemo, useRef, useState } from 'react'
import { getStartup, searchStartups } from '../data/startups'
import { StartupLogo } from './StartupLogo'
import './ClueInput.css'

/**
 * The clue field: free text, with the AI startup list as autocomplete.
 *
 * The text is the source of truth, not the suggestion list. The list will never
 * cover every company worth naming, so anything typed can be given as a clue —
 * suggestions exist to save typing and to settle spelling, not to gate what's
 * allowed. When the text happens to name a company we know, its logo appears in
 * the field.
 *
 * Choosing a suggestion fills the box rather than submitting. A clue can't be
 * taken back once given, so committing it stays an explicit second action.
 */

/** Breathing room between the list and the edge of the visible viewport. */
const MARGIN = 8
/** Below this, flipping the list above the input beats cramming it below. */
const MIN_LIST_HEIGHT = 132
/** Wavelength clues are a word or two; this just stops someone pasting an essay. */
export const MAX_CLUE_LENGTH = 40

interface DropPlacement {
  direction: 'up' | 'down'
  maxHeight: number
}

export interface ClueInputProps {
  value: string
  onChange: (value: string) => void
  /** Fired by Enter when no suggestion is actively highlighted. */
  onSubmit: () => void
  disabled?: boolean
  autoFocus?: boolean
}

export function ClueInput({ value, onChange, onSubmit, disabled, autoFocus }: ClueInputProps) {
  const [open, setOpen] = useState(false)
  /** -1 means "nothing actively chosen", so Enter submits instead of picking. */
  const [highlight, setHighlight] = useState(-1)
  const [drop, setDrop] = useState<DropPlacement>({ direction: 'down', maxHeight: 320 })
  const wrapRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const results = useMemo(() => searchStartups(value), [value])
  /** Only an exact name match earns a logo; a prefix isn't a commitment. */
  const matched = useMemo(() => getStartup(value.trim()), [value])

  // Reset the highlight whenever the result set changes under it.
  useEffect(() => setHighlight(-1), [value])

  /**
   * Keep the list on screen when the software keyboard is up.
   *
   * `visualViewport` is the only thing that actually shrinks when the keyboard
   * opens on iOS, so it — not `innerHeight` — decides whether there's room
   * below the input or whether the list has to flip above it.
   */
  useEffect(() => {
    if (!open) return

    const place = () => {
      const input = inputRef.current
      if (!input) return
      const rect = input.getBoundingClientRect()
      const vv = window.visualViewport
      const viewportHeight = vv?.height ?? window.innerHeight
      // visualViewport coordinates are offset from the layout viewport.
      const top = rect.top - (vv?.offsetTop ?? 0)

      const below = viewportHeight - (top + rect.height) - MARGIN
      const above = top - MARGIN
      const direction: DropPlacement['direction'] =
        below < MIN_LIST_HEIGHT && above > below ? 'up' : 'down'

      setDrop({
        direction,
        maxHeight: Math.max(MIN_LIST_HEIGHT, Math.floor(direction === 'up' ? above : below)),
      })
    }

    place()
    const vv = window.visualViewport
    vv?.addEventListener('resize', place)
    vv?.addEventListener('scroll', place)
    window.addEventListener('resize', place)
    return () => {
      vv?.removeEventListener('resize', place)
      vv?.removeEventListener('scroll', place)
      window.removeEventListener('resize', place)
    }
  }, [open, value])

  // Tapping outside dismisses the suggestions without changing the text.
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  const choose = (name: string) => {
    onChange(name)
    setOpen(false)
    // Keep focus so the submit button is one tap away, not one tap plus a scroll.
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setOpen(false)
      return
    }

    if (e.key === 'Enter') {
      e.preventDefault()
      // Arrowed onto a suggestion? Take it. Otherwise give what's typed.
      if (open && highlight >= 0 && results[highlight]) choose(results[highlight].name)
      else if (value.trim()) onSubmit()
      return
    }

    if (results.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      setHighlight((h) => (h + 1) % results.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setOpen(true)
      setHighlight((h) => (h <= 0 ? results.length - 1 : h - 1))
    }
  }

  const trimmed = value.trim()
  // Hide suggestions once the text already names the company exactly — the only
  // row left would repeat what's in the box.
  const showList =
    open && results.length > 0 && trimmed.length > 0 && !(matched && results.length === 1)

  return (
    <div className="clue-input" ref={wrapRef}>
      <div className="clue-field">
        {matched && <StartupLogo startup={matched} size={26} />}
        <input
          ref={inputRef}
          type="text"
          value={value}
          disabled={disabled}
          autoFocus={autoFocus}
          placeholder="Name an AI startup…"
          maxLength={MAX_CLUE_LENGTH}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="words"
          spellCheck={false}
          enterKeyHint="go"
          role="combobox"
          aria-expanded={showList}
          aria-controls="clue-suggestions"
          aria-autocomplete="list"
          aria-activedescendant={
            showList && highlight >= 0 ? `clue-suggestion-${highlight}` : undefined
          }
          onChange={(e) => {
            onChange(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
        {trimmed.length > 0 && !disabled && (
          <button
            type="button"
            className="clue-clear ghost"
            aria-label="Clear clue"
            onClick={() => {
              onChange('')
              inputRef.current?.focus()
            }}
          >
            ×
          </button>
        )}
      </div>

      {showList && (
        <ul
          className={`clue-suggestions drop-${drop.direction}`}
          id="clue-suggestions"
          role="listbox"
          style={{ maxHeight: drop.maxHeight }}
        >
          {results.map((startup, i) => (
            <li key={startup.name}>
              <button
                type="button"
                id={`clue-suggestion-${i}`}
                role="option"
                aria-selected={i === highlight}
                className={i === highlight ? 'clue-suggestion active' : 'clue-suggestion'}
                onPointerEnter={() => setHighlight(i)}
                onClick={() => choose(startup.name)}
              >
                <StartupLogo startup={startup} size={24} />
                <span className="clue-suggestion-name">{startup.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
