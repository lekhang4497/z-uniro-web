"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, RefreshCw } from "lucide-react";
import {
  getBackendUrl,
  getDefaultBackendUrl,
  setBackendUrl,
} from "@/lib/backend";
import { useBackendUrl } from "@/hooks/useBackendUrl";
import { cn } from "@/lib/utils";

type HealthState = "idle" | "checking" | "ok" | "fail";

function HealthDot({ state }: { state: HealthState }) {
  const cls = {
    idle: "bg-text-400 shadow-[0_0_0_3px_color-mix(in_oklab,var(--text-400)_15%,transparent)]",
    checking:
      "bg-text-400 shadow-[0_0_0_3px_color-mix(in_oklab,var(--text-400)_15%,transparent)] animate-pulse",
    ok: "bg-[#4aa86f] shadow-[0_0_0_3px_rgba(74,168,111,.18)]",
    fail: "bg-[#a63a2a] shadow-[0_0_0_3px_rgba(166,58,42,.18)]",
  }[state];
  return <span className={cn("inline-block h-[7px] w-[7px] rounded-full", cls)} />;
}

export default function BackendPanel() {
  const current = useBackendUrl();
  const [value, setValue] = useState(current);
  const [saved, setSaved] = useState(false);
  const [health, setHealth] = useState<HealthState>("idle");
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Sync local input when an external change (e.g. another tab) updates the URL.
  useEffect(() => {
    setValue(current);
  }, [current]);

  const check = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setHealth("checking");
    setError(null);
    const url = getBackendUrl();
    const t0 = performance.now();
    try {
      const res = await fetch(`${url}/health`, {
        signal: controller.signal,
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setHealth("ok");
      setLatencyMs(Math.round(performance.now() - t0));
    } catch (err) {
      if (controller.signal.aborted) return;
      setHealth("fail");
      setLatencyMs(null);
      setError(err instanceof Error ? err.message : "Connection failed");
    } finally {
      setLastChecked(new Date());
    }
  }, []);

  // Initial check + poll every 15s (lighter than the original 5s — health is sticky).
  useEffect(() => {
    check();
    const id = setInterval(check, 15_000);
    return () => {
      clearInterval(id);
      abortRef.current?.abort();
    };
  }, [check, current]);

  const save = () => {
    const trimmed = value.trim().replace(/\/+$/, "");
    if (!trimmed) return;
    setBackendUrl(trimmed);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const reset = () => {
    setBackendUrl(null);
    const defaultUrl = getDefaultBackendUrl();
    setValue(defaultUrl);
  };

  const dirty = value.trim().replace(/\/+$/, "") !== current;

  return (
    <div className="flex flex-col">
      <section className="pt-1 pb-2">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[17px] font-semibold tracking-tight text-text-000 m-0">
            Backend
          </h2>
          <div className="flex items-center gap-2 text-[12px] text-text-400">
            <HealthDot state={health} />
            {health === "ok" && <span>Online · {latencyMs}ms</span>}
            {health === "fail" && <span className="text-[#a63a2a]">Offline</span>}
            {health === "checking" && <span>Checking…</span>}
            {health === "idle" && <span>Not checked</span>}
          </div>
        </div>
        <p className="text-[13px] text-text-400 mb-5 max-w-[62ch] leading-[1.55]">
          The UniRo server that handles model routing and streaming. Change this
          only if you&apos;re self-hosting — the default points at the public
          deployment.
        </p>

        <label className="flex flex-col gap-1.5">
          <span className="text-[12.5px] text-text-200">Server URL</span>
          <div className="flex items-center gap-2">
            <input
              type="url"
              inputMode="url"
              spellCheck={false}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") save();
              }}
              placeholder="https://api.uniro.example.com"
              className="flex-1 min-w-0 rounded-[10px] border border-border-300 bg-bg-000 px-3 py-2.5 text-[14px] text-text-000 outline-none placeholder:text-text-400 focus:border-text-200 transition-colors font-mono"
            />
            <button
              type="button"
              onClick={save}
              disabled={!dirty}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 h-[42px] text-[13px] font-medium transition-colors",
                dirty
                  ? "bg-accent-000 text-accent-fg hover:bg-accent-100"
                  : "bg-bg-300 text-text-400 cursor-not-allowed"
              )}
            >
              {saved ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Saved
                </>
              ) : (
                "Save"
              )}
            </button>
          </div>
          <div className="mt-2 flex items-center gap-3 text-[12px] text-text-400">
            <button
              type="button"
              onClick={check}
              className="inline-flex items-center gap-1.5 hover:text-text-000 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Check now
            </button>
            {lastChecked && (
              <span>
                Last checked {lastChecked.toLocaleTimeString()}
              </span>
            )}
            {current !== getDefaultBackendUrl() && (
              <button
                type="button"
                onClick={reset}
                className="hover:text-text-000 transition-colors"
              >
                Reset to default
              </button>
            )}
          </div>
        </label>

        {health === "fail" && (
          <div className="mt-4 rounded-[10px] border border-[#a63a2a]/40 bg-[#a63a2a]/5 px-3.5 py-2.5 text-[13px] text-[#a63a2a]">
            Can&apos;t reach <span className="font-mono">{current}</span>
            {error ? ` — ${error}` : "."}{" "}
            <span className="text-text-300">
              Start the server with{" "}
              <code className="font-mono text-[12px]">uniro serve</code>, or point
              at a different URL above.
            </span>
          </div>
        )}
      </section>

      <div className="h-16" />
    </div>
  );
}
