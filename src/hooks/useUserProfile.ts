"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";

export interface UserProfile {
  id: string;
  email: string | null;
  is_admin: boolean;
}

interface ProfileState {
  profile: UserProfile | null;
  // True while either auth state or the profile fetch is in flight.
  // Callers gate spinners on this so the UI doesn't flash content.
  loading: boolean;
  // Surfaced for debugging / admin gate fallback messages — not shown
  // to non-admin users.
  error: string | null;
}

/**
 * Fetches the signed-in user's row from public.profiles. Returns
 * { profile: null } when signed out, or when the profile row hasn't
 * been created yet (e.g. trigger lag right after signup).
 */
export function useUserProfile(): ProfileState {
  const { user, loading: authLoading } = useSupabaseUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setProfile(null);
      setError(null);
      setProfileLoading(false);
      return;
    }

    const supabase = getSupabase();
    if (!supabase) {
      setError("Supabase isn't configured for this build.");
      return;
    }

    let cancelled = false;
    setProfileLoading(true);
    supabase
      .from("profiles")
      .select("id, email, is_admin")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          setError(error.message);
          setProfile(null);
        } else {
          setProfile((data as UserProfile | null) ?? null);
          setError(null);
        }
        setProfileLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  return {
    profile,
    loading: authLoading || profileLoading,
    error,
  };
}

/** Convenience: true only when we've confirmed the user is admin. */
export function useIsAdmin(): { isAdmin: boolean; loading: boolean } {
  const { profile, loading } = useUserProfile();
  return { isAdmin: profile?.is_admin === true, loading };
}
