import { useEffect, useMemo, useRef, useState } from 'react'
import { searchStartups } from '../data/startups'
import type { Startup } from '../game/types'
import { StartupLogo } from './StartupLogo'
import './StartupPicker.css'

/**
 * Google-search-style autocomplete over the AI startup list.
 *
 * The clue *must* be one of these companies, so free text is never accepted —
 * the value only changes when a suggestion is chosen. Once picked, the company
 * renders as a removable chip instead of raw text, which reads better on a
 * phone and makes it obvious the choice is committed.
 */

/** Breathing room between the list and the edge of the visible viewport. */
const MARGIN = 8
/** Below this, flipping the list above the input beats cramming it below. */
const MIN_LIST_HEIGHT = 132

interface DropPlacement {
  direction: 'up' | 'down'
  maxHeight: number
}

export interface StartupPickerProps {
  value: Startup | null
  onChange: (startup: Startup | null) => void
  disabled?: boolean
  autoFocus?: boolean
}

export function StartupPicker({ value, onChange, disabled, autoFocus }: StartupPickerProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(0)
  const [drop, setDrop] = useState<DropPlacement>({ direction: 'down', maxHeight: 320 })
  const wrapRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const results = useMemo(() => searchStartups(query), [query])

  // Reset the highlight whenever the result set changes under it.
  useEffect(() => setHighlight(0), [query])

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
  }, [open, query])

  // Tapping outside dismisses the dropdown without committing anything.
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  const choose = (startup: Startup) => {
    onChange(startup)
    setQuery('')
    setOpen(false)
  }

  const clear = () => {
    onChange(null)
    setQuery('')
    // Put the caret straight back so they can retype immediately.
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  if (value) {
    return (
      <div className="picker-chosen">
        <StartupLogo startup={value} size={28} />
        <span className="picker-chosen-name">{value.name}</span>
        {!disabled && (
          <button type="button" className="picker-clear ghost" onClick={clear}>
            Change
          </button>
        )}
      </div>
    )
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setOpen(false)
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
      setHighlight((h) => (h - 1 + results.length) % results.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      choose(results[highlight])
    }
  }

  const showList = open && results.length > 0

  return (
    <div className="picker" ref={wrapRef}>
      <input
        ref={inputRef}
        type="text"
        value={query}
        disabled={disabled}
        autoFocus={autoFocus}
        placeholder="Start typing an AI startup…"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        role="combobox"
        aria-expanded={showList}
        aria-controls="picker-list"
        aria-autocomplete="list"
        aria-activedescendant={showList ? `picker-option-${highlight}` : undefined}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
      />

      {showList && (
        <ul
          className={`picker-list drop-${drop.direction}`}
          id="picker-list"
          role="listbox"
          style={{ maxHeight: drop.maxHeight }}
        >
          {results.map((startup, i) => (
            <li key={startup.name}>
              <button
                type="button"
                id={`picker-option-${i}`}
                role="option"
                aria-selected={i === highlight}
                className={i === highlight ? 'picker-option active' : 'picker-option'}
                onPointerEnter={() => setHighlight(i)}
                onClick={() => choose(startup)}
              >
                <StartupLogo startup={startup} size={24} />
                <span className="picker-option-name">{startup.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && query.trim().length > 0 && results.length === 0 && (
        <p className="muted picker-empty">
          No startup matches “{query}”. Clues have to be a company on the list.
        </p>
      )}
    </div>
  )
}
