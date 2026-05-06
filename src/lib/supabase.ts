// Browser-only Supabase client. The web build is a static export to
// GitHub Pages, so we deliberately don't use @supabase/ssr — there's no
// server runtime to handle cookies. The PKCE OAuth flow finishes via a
// client-side code exchange in /auth/callback.
//
// Both env values are publishable; they're allowed in the browser bundle
// and gate access via Supabase Row Level Security on the server side.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

let cached: SupabaseClient | null = null;

/**
 * Returns a singleton Supabase client. Returns null when env vars aren't
 * configured (so dev builds without Supabase don't crash) — callers must
 * handle the null case rather than throw at import time.
 */
export function getSupabase(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  if (cached) return cached;
  cached = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      flowType: "pkce",
      // localStorage-based session persistence is fine for a static SPA
      // and lets supabase-js auto-refresh in the background.
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return cached;
}

export function supabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}
