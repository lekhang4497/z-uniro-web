"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { UniroMark } from "@/components/UniroMark";
import { getSupabase } from "@/lib/supabase";

// Static export → no server route handler. Two ways the user can land
// here:
//
//   1. PKCE OAuth (Google) — Supabase redirects with `?code=...`. We
//      exchange it for a session here.
//
//   2. Email confirmation / magic link — Supabase's default email
//      template puts an access token in the URL *hash* (#access_token=…).
//      The supabase-js client picks that up automatically when it boots
//      because we set `detectSessionInUrl: true`, so we just wait for
//      onAuthStateChange to fire and forward.

function CallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setError("Supabase isn't configured for this build.");
      return;
    }

    const code = searchParams.get("code");
    const oauthError =
      searchParams.get("error_description") || searchParams.get("error");
    const next = searchParams.get("next") || "/chat";

    if (oauthError) {
      setError(oauthError);
      return;
    }

    let cancelled = false;

    // Path 2 (hash-fragment) — wait for supabase-js to surface the
    // session via onAuthStateChange. If a session is already present
    // (e.g. user reloaded the callback page) forward immediately.
    const subscribeAndForward = () => {
      supabase.auth.getSession().then(({ data }) => {
        if (cancelled) return;
        if (data.session) {
          router.replace(next);
        }
      });

      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        if (cancelled || !session) return;
        router.replace(next);
      });

      // Safety net: if no session materialises within ~6s, the link is
      // probably stale or the URL is malformed. Give the user something
      // actionable rather than a permanent spinner.
      const timeout = window.setTimeout(() => {
        if (cancelled) return;
        sub.subscription.unsubscribe();
        setError(
          "We couldn't finish signing you in. The link may have expired — try again."
        );
      }, 6000);

      return () => {
        sub.subscription.unsubscribe();
        window.clearTimeout(timeout);
      };
    };

    if (code) {
      // Path 1 (PKCE) — explicit code exchange.
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (cancelled) return;
        if (error) {
          setError(error.message);
          return;
        }
        router.replace(next);
      });
      return () => {
        cancelled = true;
      };
    }

    const cleanup = subscribeAndForward();
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 py-12">
      <div className="opacity-90 text-text-000 mb-5">
        <UniroMark size={28} />
      </div>
      {error ? (
        <>
          <div className="text-[14px] font-medium text-text-000 mb-1">
            Couldn&apos;t finish signing in
          </div>
          <p className="text-[12.5px] text-[#a63a2a] text-center max-w-[40ch] mb-4">
            {error}
          </p>
          <a
            href="/login"
            className="text-[12.5px] text-text-200 hover:text-text-000 underline underline-offset-4"
          >
            Try again
          </a>
        </>
      ) : (
        <div className="flex items-center gap-2 text-text-300 text-[13px]">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Finishing sign-in…</span>
        </div>
      )}
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <CallbackInner />
    </Suspense>
  );
}
