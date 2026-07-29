import { useEffect, useState } from 'react'
import type { Startup } from '../game/types'
import './StartupLogo.css'

/**
 * Company logo, fetched from the domain's favicon at render time.
 *
 * No API key and no bundled assets — the tradeoff is that coverage isn't
 * perfect, so anything that fails to load falls back to a colored initial tile.
 * If we later want crisp logos, drop SVGs into `public/logos/<domain>.svg` and
 * prefer those here.
 */

const faviconUrl = (domain: string, size: number) =>
  `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=${size}`

/** Deterministic hue so a given company always gets the same fallback color. */
function hueFor(name: string): number {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) % 360
  }
  return hash
}

export function StartupLogo({ startup, size = 24 }: { startup: Startup; size?: number }) {
  const [failed, setFailed] = useState(false)

  // A different company in the same slot must retry rather than inherit a failure.
  useEffect(() => setFailed(false), [startup.domain])

  const style = { width: size, height: size } as const

  if (failed) {
    return (
      <span
        className="startup-logo fallback"
        style={{ ...style, background: `hsl(${hueFor(startup.name)} 45% 32%)` }}
        aria-hidden="true"
      >
        {startup.name.charAt(0).toUpperCase()}
      </span>
    )
  }

  return (
    <img
      className="startup-logo"
      style={style}
      src={faviconUrl(startup.domain, size <= 32 ? 32 : 64)}
      alt=""
      aria-hidden="true"
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  )
}
