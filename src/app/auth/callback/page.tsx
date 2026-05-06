"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { UniroMark } from "@/components/UniroMark";
import { getSupabase } from "@/lib/supabase";

// Static export → no server route handler. The PKCE code arrives as a
// `?code=...` query param on this page; the browser bundle exchanges it
// for a session, then forwards the user wherever they were headed.

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
    const oauthError = searchParams.get("error_description") || searchParams.get("error");
    const next = searchParams.get("next") || "/chat";

    if (oauthError) {
      setError(oauthError);
      return;
    }
    if (!code) {
      setError("No authorization code on the callback URL.");
      return;
    }

    let cancelled = false;
    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (cancelled) return;
      if (error) {
        setError(error.message);
        return;
      }
      // Strip query params from history before forwarding so the code
      // doesn't sit around in the back-button stack.
      router.replace(next);
    });
    return () => {
      cancelled = true;
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
