import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Supabase client, or null when the app hasn't been configured.
 *
 * Multiplayer is optional: hotseat mode works with no backend at all, so a
 * missing config degrades to "the online buttons explain themselves" rather
 * than a blank screen.
 */

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/**
 * The literal values shipped in `.env.example`.
 *
 * These get pasted into a hosting dashboard more often than you'd think, and
 * the resulting failure is genuinely baffling — the app looks configured, then
 * every request dies with a DNS error against a domain that doesn't exist.
 * Treating them as "not configured" turns that into a readable message.
 */
const PLACEHOLDERS = new Set(['https://your-project-ref.supabase.co', 'your-anon-key'])

const isPlaceholder = (value: string | undefined) => !value || PLACEHOLDERS.has(value.trim())

const isUsableUrl = (value: string | undefined): boolean => {
  if (!value) return false
  try {
    return new URL(value).protocol.startsWith('http')
  } catch {
    return false
  }
}

export const isSupabaseConfigured =
  !isPlaceholder(url) && !isPlaceholder(anonKey) && isUsableUrl(url)

/** Set when the values are present but obviously wrong, so we can say which. */
export const supabaseConfigProblem: string | null = (() => {
  if (isSupabaseConfigured) return null
  if (!url && !anonKey) return null // Simply unconfigured; not an error.
  if (PLACEHOLDERS.has((url ?? '').trim()) || PLACEHOLDERS.has((anonKey ?? '').trim())) {
    return (
      'This build was deployed with the placeholder values from .env.example. ' +
      'Set the real VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your hosting ' +
      'provider and redeploy — Vite bakes them in at build time.'
    )
  }
  if (!isUsableUrl(url)) return `VITE_SUPABASE_URL is not a valid URL: ${url}`
  return 'Supabase is misconfigured.'
})()

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!, {
      auth: { persistSession: false },
      // The dial streams position updates while a team deliberates; the default
      // 10/sec cap would drop most of them.
      realtime: { params: { eventsPerSecond: 30 } },
    })
  : null

export const SUPABASE_SETUP_HINT =
  'Multiplayer needs VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local. ' +
  'You can still play on one device.'
