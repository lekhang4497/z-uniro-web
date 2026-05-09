"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronDown, ExternalLink, Loader2, LogOut, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { UniroMark } from "@/components/UniroMark";
import { signOut, useSupabaseUser } from "@/hooks/useSupabaseUser";

function userInitial(emailOrName: string | null | undefined): string {
  if (!emailOrName) return "?";
  const trimmed = emailOrName.trim();
  return trimmed ? trimmed[0].toUpperCase() : "?";
}

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const t = useTranslations();
  const { user, configured } = useSupabaseUser();
  const userLabel = user?.email || user?.user_metadata?.name || null;

  // Close the account popover on outside click and when the user
  // disappears (e.g. signOut completes).
  useEffect(() => {
    if (!accountOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (
        accountRef.current &&
        !accountRef.current.contains(e.target as Node)
      ) {
        setAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [accountOpen]);
  useEffect(() => {
    if (!user) setAccountOpen(false);
  }, [user]);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
    }
  };

  const links = [
    { label: "Features", href: "/#features" },
    { label: t("nav.docs"), href: "/docs" },
    { label: t("nav.pricing"), href: "/#pricing" },
    { label: "Changelog", href: "/docs" },
    { label: "Community", href: "/docs" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={
        "sticky top-0 z-50 border-b transition-colors " +
        (scrolled
          ? "bg-bg-100/85 backdrop-blur-[14px] backdrop-saturate-[1.4] border-border-200"
          : "bg-transparent border-transparent")
      }
    >
      <div className="mx-auto max-w-[1180px] h-16 px-8 max-md:px-6 flex items-center gap-7">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-[20px] tracking-tight text-text-000"
        >
          <UniroMark size={26} />
          <span className="font-semibold tracking-tight">UNIRO</span>
        </Link>

        <div className="hidden md:flex gap-6 ml-3 text-[14px]">
          {links.map((l) => (
            <Link
              key={l.href + l.label}
              href={l.href}
              className={
                pathname === l.href
                  ? "text-text-000 font-medium"
                  : "text-text-200 hover:text-text-000 transition-colors"
              }
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex-1" />

        <div className="hidden md:flex items-center gap-[18px] text-[14px]">
          {user ? (
            <div className="relative" ref={accountRef}>
              <button
                type="button"
                onClick={() => setAccountOpen((o) => !o)}
                title={userLabel ?? "Account"}
                className="inline-flex items-center gap-2 text-text-200 hover:text-text-000 transition-colors"
              >
                <span
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent-000 text-accent-fg text-[11px] font-semibold"
                  aria-hidden="true"
                >
                  {userInitial(userLabel)}
                </span>
                <span className="max-w-[140px] truncate">
                  {userLabel ?? "Account"}
                </span>
                <ChevronDown
                  className={
                    "w-3.5 h-3.5 text-text-400 transition-transform " +
                    (accountOpen ? "rotate-180" : "")
                  }
                />
              </button>
              {accountOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-[calc(100%+8px)] z-30 w-[220px] p-1.5 rounded-xl border border-border-300 bg-bg-000 shadow-[0_24px_48px_-16px_rgba(0,0,0,.18),0_2px_8px_rgba(0,0,0,.06)]"
                >
                  <Link
                    href="/chat"
                    onClick={() => setAccountOpen(false)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 hover:bg-bg-100"
                  >
                    <ExternalLink className="w-4 h-4 text-text-300" />
                    <span className="text-[13.5px] text-text-000">
                      Open app
                    </span>
                  </Link>
                  <div className="h-px bg-border-200 my-1 mx-1" />
                  <button
                    type="button"
                    onClick={handleSignOut}
                    disabled={signingOut}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-bg-100 disabled:opacity-60"
                  >
                    {signingOut ? (
                      <Loader2 className="w-4 h-4 animate-spin text-text-300" />
                    ) : (
                      <LogOut className="w-4 h-4 text-text-300" />
                    )}
                    <span className="text-[13.5px] text-text-000">
                      {signingOut ? "Signing out…" : "Sign out"}
                    </span>
                  </button>
                </div>
              )}
            </div>
          ) : configured ? (
            <Link
              href="/login"
              className="text-text-400 hover:text-text-000 transition-colors"
            >
              Sign in
            </Link>
          ) : null}
          <Link
            href="/chat"
            className="inline-flex items-center rounded-lg bg-accent-000 hover:bg-accent-100 text-accent-fg px-4 py-2 text-[13.5px] font-medium transition-colors"
          >
            Install Uniro
          </Link>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(true)}
          className="md:hidden text-text-300 hover:text-text-000"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="right" className="w-[280px] bg-bg-000">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex flex-col gap-4 pt-4 px-2">
            {/* Account block at the top of the mobile sheet so it's the
                first thing the thumb hits. Mirrors the desktop popover. */}
            {user && (
              <div className="flex items-center gap-2.5 rounded-lg bg-bg-100 px-3 py-2.5">
                <span
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent-000 text-accent-fg text-[12px] font-semibold shrink-0"
                  aria-hidden="true"
                >
                  {userInitial(userLabel)}
                </span>
                <span className="flex-1 min-w-0 truncate text-[13.5px] text-text-000">
                  {userLabel ?? "Account"}
                </span>
              </div>
            )}

            {links.map((l) => (
              <Link
                key={l.href + l.label}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="text-[15px] text-text-200 hover:text-text-000 transition-colors"
              >
                {l.label}
              </Link>
            ))}

            {user && configured ? (
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  void handleSignOut();
                }}
                disabled={signingOut}
                className="flex items-center gap-2 text-[15px] text-text-200 hover:text-text-000 transition-colors text-left disabled:opacity-60"
              >
                {signingOut ? (
                  <Loader2 className="w-4 h-4 animate-spin text-text-300" />
                ) : (
                  <LogOut className="w-4 h-4 text-text-300" />
                )}
                <span>{signingOut ? "Signing out…" : "Sign out"}</span>
              </button>
            ) : configured ? (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="text-[15px] text-text-200 hover:text-text-000 transition-colors"
              >
                Sign in
              </Link>
            ) : null}

            <Link
              href="/chat"
              onClick={() => setMobileOpen(false)}
              className="text-[15px] font-medium bg-accent-000 hover:bg-accent-100 text-accent-fg px-4 py-2 rounded-lg text-center"
            >
              {user ? "Open app" : "Install Uniro"}
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
}
