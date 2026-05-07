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

type Mode = "signin" | "signup";

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/chat";
  const { user, loading } = useSupabaseUser();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState<"google" | "email" | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Set to a friendly notice (not an error) when sign-up succeeds but the
  // session is null because email confirmation is required.
  const [notice, setNotice] = useState<string | null>(null);
  const configured = supabaseConfigured();

  // If the user lands here while already signed in, send them on. Lets
  // /login double as a "go to app" entry point for returning visitors.
  useEffect(() => {
    if (!loading && user) {
      router.replace(next);
    }
  }, [loading, user, next, router]);

  // Reset transient banners when switching modes — leftover errors from
  // the other tab are confusing.
  useEffect(() => {
    setError(null);
    setNotice(null);
  }, [mode]);

  const handleGoogle = async () => {
    setError(null);
    setNotice(null);
    const supabase = getSupabase();
    if (!supabase) {
      setError("Supabase isn't configured for this build.");
      return;
    }
    setSubmitting("google");
    const redirectTo = new URL("/auth/callback", window.location.origin);
    if (next) redirectTo.searchParams.set("next", next);

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectTo.toString(),
        queryParams: { prompt: "select_account" },
      },
    });
    if (authError) {
      setError(authError.message);
      setSubmitting(null);
    }
    // On success the browser navigates away; no further state change here.
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    const supabase = getSupabase();
    if (!supabase) {
      setError("Supabase isn't configured for this build.");
      return;
    }
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    if (mode === "signup" && password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setSubmitting("email");
    try {
      if (mode === "signin") {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (authError) {
          setError(humanizeAuthError(authError.message));
          return;
        }
        // Auth state change handler will pick up the user and the
        // already-signed-in effect above will redirect.
      } else {
        // emailRedirectTo is where Supabase sends the user after they
        // click the confirmation link — make it the same callback as
        // OAuth so they land back in the app.
        const emailRedirectTo = new URL(
          "/auth/callback",
          window.location.origin
        );
        if (next) emailRedirectTo.searchParams.set("next", next);

        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: emailRedirectTo.toString() },
        });
        if (authError) {
          setError(humanizeAuthError(authError.message));
          return;
        }
        // If session is null, Supabase requires email confirmation
        // (default for new projects). Tell the user what to do.
        if (!data.session) {
          setNotice(
            `Almost there — we sent a confirmation link to ${email}. Click it to finish signing up.`
          );
          setPassword("");
          return;
        }
        // Otherwise the user is signed in immediately (email confirmation
        // is disabled in the project's auth settings).
      }
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-[380px] flex flex-col items-center">
        <Link href="/" className="mb-6 opacity-90 text-text-000" aria-label="UniRo home">
          <UniroMark size={36} />
        </Link>

        <h1 className="text-[26px] font-light tracking-[-0.01em] text-text-000 m-0 text-center">
          {mode === "signin" ? "Sign in to UniRo" : "Create your UniRo account"}
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
          <>
            <button
              type="button"
              onClick={handleGoogle}
              disabled={submitting !== null || loading}
              className="w-full inline-flex items-center justify-center gap-2.5 rounded-[12px] border border-border-300 bg-bg-000 px-4 h-[46px] text-[14px] font-medium text-text-000 transition-colors hover:bg-bg-100 disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_1px_2px_rgba(0,0,0,.04)]"
            >
              {submitting === "google" ? (
                <Loader2 className="w-4 h-4 animate-spin text-text-400" />
              ) : (
                <GoogleMark className="w-[18px] h-[18px]" />
              )}
              <span>
                {submitting === "google" ? "Redirecting…" : "Continue with Google"}
              </span>
            </button>

            <div className="my-5 w-full flex items-center gap-3">
              <div className="flex-1 h-px bg-border-200" />
              <span className="text-[11px] tracking-[.08em] uppercase text-text-400">
                or
              </span>
              <div className="flex-1 h-px bg-border-200" />
            </div>

            <form onSubmit={handleEmail} className="w-full flex flex-col gap-2.5">
              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] text-text-300">Email</span>
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="rounded-[10px] border border-border-300 bg-bg-000 px-3.5 py-2.5 text-[14px] text-text-000 outline-none placeholder:text-text-400 focus:border-text-200 transition-colors"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] text-text-300">Password</span>
                <input
                  type="password"
                  autoComplete={
                    mode === "signin" ? "current-password" : "new-password"
                  }
                  required
                  minLength={mode === "signup" ? 8 : undefined}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={
                    mode === "signup" ? "At least 8 characters" : "Your password"
                  }
                  className="rounded-[10px] border border-border-300 bg-bg-000 px-3.5 py-2.5 text-[14px] text-text-000 outline-none placeholder:text-text-400 focus:border-text-200 transition-colors"
                />
              </label>
              <button
                type="submit"
                disabled={submitting !== null}
                className="mt-1 inline-flex items-center justify-center gap-2 rounded-[12px] bg-accent-000 hover:bg-accent-100 text-accent-fg px-4 h-[44px] text-[14px] font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting === "email" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : null}
                <span>
                  {mode === "signin"
                    ? submitting === "email"
                      ? "Signing in…"
                      : "Sign in"
                    : submitting === "email"
                      ? "Creating account…"
                      : "Create account"}
                </span>
              </button>
            </form>

            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="mt-4 text-[12.5px] text-text-300 hover:text-text-000 transition-colors"
            >
              {mode === "signin"
                ? "Don't have an account? Create one"
                : "Already have an account? Sign in"}
            </button>
          </>
        )}

        {error && (
          <div className="mt-3 w-full text-[12.5px] text-[#a63a2a] text-center">
            {error}
          </div>
        )}
        {notice && (
          <div className="mt-3 w-full rounded-[10px] border border-border-200 bg-bg-100 px-3.5 py-3 text-[12.5px] text-text-200 text-center leading-[1.55]">
            {notice}
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

// Supabase's wire-level error messages are inconsistent and sometimes
// reveal too much (e.g. distinguishing "wrong password" from "no such
// user" enables enumeration). Map known cases to friendlier copy and
// leave anything else verbatim.
function humanizeAuthError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login credentials")) {
    return "That email and password don't match an account.";
  }
  if (m.includes("email not confirmed")) {
    return "Please confirm your email first — check your inbox for the link.";
  }
  if (m.includes("user already registered")) {
    return "An account with that email already exists. Try signing in.";
  }
  if (m.includes("password should be") || m.includes("weak password")) {
    return "Password must be at least 8 characters.";
  }
  if (
    m.includes("email address") &&
    (m.includes("invalid") || m.includes("not allowed"))
  ) {
    // Supabase blocks a handful of "test" addresses (test@gmail.com etc.)
    // server-side. Make this obvious instead of looking like a typo.
    return "That email address isn't accepted. Try a real address — Supabase blocks common test addresses like test@gmail.com.";
  }
  if (m.includes("rate limit") || m.includes("over_email_send_rate_limit")) {
    return "Too many emails sent in a short window. Wait an hour and try again, or disable email confirmation in your Supabase project for testing.";
  }
  if (m.includes("signup") && m.includes("disabled")) {
    return "Sign-up is disabled for this project. Ask the project owner to enable it in Supabase.";
  }
  if (m.includes("email provider") && m.includes("disabled")) {
    return "Email sign-in isn't enabled on this project. Enable it in Supabase under Auth → Providers → Email.";
  }
  return msg;
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}
