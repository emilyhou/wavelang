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

export const isSupabaseConfigured = Boolean(url && anonKey)

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
