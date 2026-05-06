"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { UniroMark } from "@/components/UniroMark";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";

function GoogleMark({ className }: { className?: string }) {
  // Inline mark instead of a remote image — keeps the button working
  // offline / on captive networks.
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.28-4.74 3.28-8.07z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0012 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.12a6.6 6.6 0 010-4.24V7.04H2.18a11 11 0 000 9.92l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 002.18 7.04l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/chat";
  const { user, loading } = useSupabaseUser();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const configured = supabaseConfigured();

  // If the user lands here while already signed in, send them on. Lets
  // /login double as a "go to app" entry point for returning visitors.
  useEffect(() => {
    if (!loading && user) {
      router.replace(next);
    }
  }, [loading, user, next, router]);

  const handleGoogle = async () => {
    setError(null);
    const supabase = getSupabase();
    if (!supabase) {
      setError("Supabase isn't configured for this build.");
      return;
    }
    setSubmitting(true);
    // Build the absolute callback URL so the redirect works on both
    // localhost and the deployed origin without needing to hard-code it.
    // The `next` param is round-tripped through OAuth via the URL so the
    // callback page knows where to send the user after exchange.
    const redirectTo = new URL("/auth/callback", window.location.origin);
    if (next) redirectTo.searchParams.set("next", next);

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectTo.toString(),
        queryParams: {
          // Asking for an account-picker every time avoids the silent-
          // sign-in surprise where Chrome assumes the wrong account.
          prompt: "select_account",
        },
      },
    });
    if (authError) {
      setError(authError.message);
      setSubmitting(false);
    }
    // On success the browser navigates away to Google; no further state
    // change is needed here.
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-[380px] flex flex-col items-center">
        <Link href="/" className="mb-6 opacity-90 text-text-000" aria-label="UniRo home">
          <UniroMark size={36} />
        </Link>

        <h1 className="text-[26px] font-light tracking-[-0.01em] text-text-000 m-0 text-center">
          Sign in to UniRo
        </h1>
        <p className="mt-2 mb-7 text-[13.5px] text-text-400 text-center max-w-[36ch] leading-[1.55]">
          One sign-in across web and desktop. We never share your account
          with the models you talk to.
        </p>

        {!configured ? (
          <div className="w-full rounded-[10px] border border-[#a63a2a]/40 bg-[#a63a2a]/5 px-3.5 py-3 text-[13px] text-[#a63a2a]">
            Supabase isn&apos;t configured for this build. Set{" "}
            <code className="font-mono text-[12px]">
              NEXT_PUBLIC_SUPABASE_URL
            </code>{" "}
            and{" "}
            <code className="font-mono text-[12px]">
              NEXT_PUBLIC_SUPABASE_ANON_KEY
            </code>
            .
          </div>
        ) : (
          <button
            type="button"
            onClick={handleGoogle}
            disabled={submitting || loading}
            className="w-full inline-flex items-center justify-center gap-2.5 rounded-[12px] border border-border-300 bg-bg-000 px-4 h-[46px] text-[14px] font-medium text-text-000 transition-colors hover:bg-bg-100 disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_1px_2px_rgba(0,0,0,.04)]"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin text-text-400" />
            ) : (
              <GoogleMark className="w-[18px] h-[18px]" />
            )}
            <span>{submitting ? "Redirecting…" : "Continue with Google"}</span>
          </button>
        )}

        {error && (
          <div className="mt-3 w-full text-[12.5px] text-[#a63a2a] text-center">
            {error}
          </div>
        )}

        <p className="mt-7 text-[11.5px] text-text-400 text-center max-w-[34ch] leading-[1.55]">
          By continuing you agree to UniRo&apos;s terms of service and
          acknowledge the privacy policy.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}
