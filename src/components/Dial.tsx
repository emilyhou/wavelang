import { useCallback, useId, useRef } from 'react'
import { SCORING_BANDS, clamp } from '../game/engine'
import './Dial.css'

/**
 * The Wavelength dial: a semicircular gauge running 0 (left pole) to 100 (right).
 *
 * Drawn as SVG so it scales to any phone width. Values map to angles with 0 at
 * due west and 100 at due east, sweeping over the top.
 */

const VIEW_W = 320
const CX = 160
const CY = 168
const R_OUTER = 152
const R_INNER = 86
/** Needles start here so they read as one continuous pointer out of the hub. */
const R_HUB = 10
const VIEW_H = CY + 16

const toRadians = (value: number) => ((180 - (value / 100) * 180) * Math.PI) / 180

function pointAt(value: number, radius: number): [number, number] {
  const a = toRadians(value)
  return [CX + radius * Math.cos(a), CY - radius * Math.sin(a)]
}

/** Annular sector between two dial values. */
function bandPath(from: number, to: number, rInner: number, rOuter: number): string {
  const [x1, y1] = pointAt(from, rOuter)
  const [x2, y2] = pointAt(to, rOuter)
  const [x3, y3] = pointAt(to, rInner)
  const [x4, y4] = pointAt(from, rInner)
  const largeArc = (to - from) / 100 > 0.5 ? 1 : 0
  return [
    `M ${x1} ${y1}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x2} ${y2}`,
    `L ${x3} ${y3}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 0 ${x4} ${y4}`,
    'Z',
  ].join(' ')
}

/** The 2/3/4-point wedge around a target, outermost band first so 4 paints last. */
function wedgeBands(target: number) {
  return SCORING_BANDS.slice()
    .sort((a, b) => b.halfWidth - a.halfWidth)
    .map((band) => ({
      points: band.points,
      // Clipped to the board so a near-edge target doesn't draw off-canvas.
      from: clamp(target - band.halfWidth, 0, 100),
      to: clamp(target + band.halfWidth, 0, 100),
    }))
}

const BAND_FILL: Record<number, string> = {
  4: '#5aa9ff',
  3: '#3d7fc4',
  2: '#2b5885',
}

export interface DialProps {
  /** Where the needle sits, 0–100. */
  value: number
  /** Hidden target. Pass null to keep it secret. */
  target?: number | null
  /** Draw the scoring wedge. Needs `target`. */
  showTarget?: boolean
  onChange?: (value: number) => void
  disabled?: boolean
  leftLabel: string
  rightLabel: string
  /** A second, dimmed needle — used on the reveal to show where the team guessed. */
  ghostValue?: number | null
}

export function Dial({
  value,
  target = null,
  showTarget = false,
  onChange,
  disabled = false,
  leftLabel,
  rightLabel,
  ghostValue = null,
}: DialProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const labelId = useId()
  const interactive = !disabled && !!onChange

  /** Converts a pointer position into a dial value via the angle from the hub. */
  const valueFromEvent = useCallback((clientX: number, clientY: number): number | null => {
    const svg = svgRef.current
    if (!svg) return null
    const rect = svg.getBoundingClientRect()
    // The viewBox is letterboxed into the element; convert back to viewBox units.
    const scale = rect.width / VIEW_W
    const x = (clientX - rect.left) / scale
    const y = (clientY - rect.top) / scale
    // atan2 with y flipped, because SVG y grows downward.
    const angle = (Math.atan2(CY - y, x - CX) * 180) / Math.PI
    return clamp(((180 - angle) / 180) * 100, 0, 100)
  }, [])

  const handlePointer = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!interactive) return
      const next = valueFromEvent(e.clientX, e.clientY)
      if (next !== null) onChange!(Math.round(next * 10) / 10)
    },
    [interactive, onChange, valueFromEvent],
  )

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!interactive) return
    e.currentTarget.setPointerCapture(e.pointerId)
    handlePointer(e)
  }

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    // buttons === 0 means the finger/mouse is up; only track actual drags.
    if (e.buttons === 0) return
    handlePointer(e)
  }

  const onKeyDown = (e: React.KeyboardEvent<SVGSVGElement>) => {
    if (!interactive) return
    const step = e.shiftKey ? 10 : 1
    const deltas: Record<string, number> = {
      ArrowLeft: -step,
      ArrowDown: -step,
      ArrowRight: step,
      ArrowUp: step,
    }
    const delta = deltas[e.key]
    if (delta === undefined) return
    e.preventDefault()
    onChange!(clamp(value + delta, 0, 100))
  }

  const [needleX, needleY] = pointAt(value, R_OUTER - 6)
  const [needleBaseX, needleBaseY] = pointAt(value, R_HUB)

  return (
    <div className="dial">
      <svg
        ref={svgRef}
        className={interactive ? 'dial-svg interactive' : 'dial-svg'}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        role={interactive ? 'slider' : 'img'}
        aria-labelledby={labelId}
        aria-valuemin={interactive ? 0 : undefined}
        aria-valuemax={interactive ? 100 : undefined}
        aria-valuenow={interactive ? Math.round(value) : undefined}
        aria-valuetext={interactive ? `${Math.round(value)} of 100` : undefined}
        tabIndex={interactive ? 0 : -1}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onKeyDown={onKeyDown}
      >
        <title id={labelId}>{`Spectrum from ${leftLabel} to ${rightLabel}`}</title>

        <path d={bandPath(0, 100, R_INNER, R_OUTER)} className="dial-track" />

        {showTarget &&
          target !== null &&
          wedgeBands(target).map((band) => (
            <path
              key={band.points}
              d={bandPath(band.from, band.to, R_INNER, R_OUTER)}
              fill={BAND_FILL[band.points]}
            />
          ))}

        {/* Tick every 10 units, for a rough sense of scale. */}
        {Array.from({ length: 11 }, (_, i) => i * 10).map((tick) => {
          const [tx1, ty1] = pointAt(tick, R_OUTER)
          const [tx2, ty2] = pointAt(tick, R_OUTER - 8)
          return <line key={tick} x1={tx1} y1={ty1} x2={tx2} y2={ty2} className="dial-tick" />
        })}

        {ghostValue !== null && (
          <line
            x1={pointAt(ghostValue, R_HUB)[0]}
            y1={pointAt(ghostValue, R_HUB)[1]}
            x2={pointAt(ghostValue, R_OUTER - 6)[0]}
            y2={pointAt(ghostValue, R_OUTER - 6)[1]}
            className="dial-needle ghost"
          />
        )}

        <line
          x1={needleBaseX}
          y1={needleBaseY}
          x2={needleX}
          y2={needleY}
          className="dial-needle"
        />
        <circle cx={CX} cy={CY} r={12} className="dial-hub" />
      </svg>

      <div className="dial-labels">
        <span className="dial-label left">{leftLabel}</span>
        <span className="dial-label right">{rightLabel}</span>
      </div>
    </div>
  )
}
