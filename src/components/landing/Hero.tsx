"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowUp, ChevronDown, Mic, Plus } from "lucide-react";
import ProviderOrbit from "./ProviderOrbit";

export default function Hero() {
  const t = useTranslations();
  const router = useRouter();
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const ta = ref.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 180) + "px";
  }, [value]);

  const submit = () => {
    const v = value.trim();
    if (!v) return;
    try {
      window.localStorage.setItem("uniro:pendingPrompt", v);
    } catch {
      /* ignore */
    }
    router.push(`/chat?q=${encodeURIComponent(v)}`);
  };

  const hasText = !!value.trim();

  return (
    <header className="pt-16 pb-10 px-8 max-md:px-6">
      <div className="mx-auto max-w-[1180px]">
        {/* 2-panel hero */}
        <div className="grid grid-cols-[1.05fr_1fr] max-lg:grid-cols-1 gap-12 max-lg:gap-10 items-center">
          {/* Left: headline + chatbox + CTAs */}
          <div className="min-w-0">
            <h1 className="font-semibold tracking-[-0.035em] leading-[1.02] text-text-000 text-[clamp(40px,5.5vw,60px)] m-0 max-w-[640px] text-balance">
              {t("hero.titleLine1")} {t("hero.titleLine2")}
            </h1>

            <p className="mt-6 text-[17px] leading-[1.5] text-text-200 max-w-[560px]">
              {t("hero.subtitle")}
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
              className="mt-8 max-w-[720px] rounded-2xl border border-border-300 bg-bg-000 px-4 pt-3.5 pb-2.5 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.08)]"
            >
              <textarea
                ref={ref}
                rows={1}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit();
                  }
                }}
                placeholder={t("chat.placeholder")}
                className="w-full resize-none border-0 outline-none bg-transparent text-[15.5px] leading-[1.5] text-text-000 placeholder:text-text-400 min-h-[48px] max-h-[180px] py-0.5"
              />
              <div className="flex items-center justify-between mt-1.5">
                <button
                  type="button"
                  title="Attach"
                  aria-label="Attach"
                  className="inline-flex items-center justify-center w-[30px] h-[30px] rounded-lg text-text-200 hover:bg-bg-200 hover:text-text-000 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12.5px] text-text-200 bg-bg-200 hover:bg-bg-300 hover:text-text-000 transition-colors"
                  >
                    <span>uniro-pro</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  {hasText ? (
                    <button
                      type="submit"
                      aria-label="Send"
                      className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-accent-000 text-accent-fg hover:bg-accent-100 shadow-sm transition-colors"
                    >
                      <ArrowUp className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      aria-label="Voice"
                      className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-text-300 hover:bg-bg-300 hover:text-text-000 transition-colors"
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </form>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/chat"
                className="inline-flex items-center gap-2 rounded-lg bg-accent-000 hover:bg-accent-100 text-accent-fg px-[22px] h-[50px] text-[14.5px] font-medium transition-colors"
              >
                {t("hero.ctaPrimary")} &nbsp;→
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 rounded-lg border border-border-300 bg-transparent hover:bg-bg-200 hover:border-text-400 text-text-000 px-[22px] h-[50px] text-[14.5px] font-medium transition-colors"
              >
                {t("hero.ctaSecondary")}
              </Link>
            </div>
          </div>

          {/* Right: animated provider orbit */}
          <div className="relative min-w-0 max-lg:hidden">
            <ProviderOrbit />
          </div>
        </div>

        {/* Hero meta KPI strip (full width below the 2-panel grid) */}
        <div className="mt-16 grid grid-cols-4 max-md:grid-cols-2 border-t border-border-200 border-b">
          {[
            ["11", "k★", "On GitHub, first 90 days"],
            ["0.4", "s", "Cold-start, median"],
            ["14", " models", "Providers supported out of the box"],
            ["100", "%", "Local — no telemetry by default"],
          ].map(([num, unit, label], i) => (
            <div
              key={i}
              className="px-6 py-[22px] border-r border-border-200 last:border-r-0 max-md:[&:nth-child(2)]:border-r-0 max-md:[&:nth-child(-n+2)]:border-b max-md:[&:nth-child(-n+2)]:border-border-200"
            >
              <div className="text-[38px] leading-none tracking-tight text-text-000">
                {num}
                <span className="text-[16px] text-text-400 ml-1">{unit}</span>
              </div>
              <div className="mt-2 text-[12.5px] text-text-400 tracking-[.02em]">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
