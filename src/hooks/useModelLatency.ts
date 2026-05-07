"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useBackendUrl } from "@/hooks/useBackendUrl";

// Categorisation thresholds (ms). Tweaked to feel right for chat-style
// time-to-first-token: anything under ~800ms feels instant; past 5s the
// user has had time to alt-tab.
export const LATENCY_BUCKETS = [
  { id: "fast", label: "Fast", maxMs: 800, tone: "ok" as const },
  { id: "medium", label: "Medium", maxMs: 2000, tone: "ok" as const },
  { id: "slow", label: "Slow", maxMs: 5000, tone: "warn" as const },
  { id: "very_slow", label: "Very slow", maxMs: Infinity, tone: "warn" as const },
] as const;

export type LatencyBucketId =
  | (typeof LATENCY_BUCKETS)[number]["id"]
  | "error"
  | "unmeasured";

// Where a latency value came from. The hook itself only ever produces
// "probe"; "backend" gets tagged on entries the dashboard merges in
// from /v1/models so the badge tooltip can be honest about the source.
export type LatencySource = "probe" | "backend";

export interface LatencyResult {
  ms: number | null;
  // Set on probe failure — surfaced in tooltips / error rows.
  error: string | null;
  measuredAt: number;
  source?: LatencySource;
}

export type LatencyMap = Record<string, LatencyResult>;

/** True if a probe-cached value is still within its useful lifetime. */
export function isProbeFresh(r: LatencyResult): boolean {
  return Date.now() - r.measuredAt < LATENCY_TTL_MS;
}

const STORAGE_KEY = "uniro:latency-cache:v1";
// Cache lifetime — past this we still display the stale numbers but
// flag them, and a fresh measure clears them.
export const LATENCY_TTL_MS = 30 * 60 * 1000;

const PROBE_CONCURRENCY = 5;
const PROBE_TIMEOUT_MS = 30_000;

export function bucketFor(result: LatencyResult | undefined): LatencyBucketId {
  if (!result) return "unmeasured";
  if (result.error) return "error";
  if (result.ms == null) return "unmeasured";
  for (const b of LATENCY_BUCKETS) {
    if (result.ms <= b.maxMs) return b.id;
  }
  return "very_slow";
}

interface UseModelLatencyState {
  latencies: LatencyMap;
  // Map of modelId -> "in flight" so the UI can render a per-row spinner.
  inFlight: ReadonlySet<string>;
  // Total/done for the progress label on the Measure button.
  progress: { total: number; done: number } | null;
  measuring: boolean;
  measure: (modelIds: string[]) => Promise<void>;
  abort: () => void;
  // Wipe all cached probes (in-memory + localStorage). The dashboard
  // exposes this so users can fall back to backend-reported values
  // after a misleading stale probe.
  clear: () => void;
  // null when no measurements have ever been recorded; otherwise the
  // most recent measuredAt across the cache.
  lastMeasuredAt: number | null;
}

export function useModelLatency(): UseModelLatencyState {
  const backendUrl = useBackendUrl();
  const [latencies, setLatencies] = useState<LatencyMap>(() => loadCache());
  const [inFlight, setInFlight] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState<{ total: number; done: number } | null>(
    null
  );
  const abortRef = useRef<AbortController | null>(null);

  // Persist to localStorage whenever the in-memory map changes. Keeps the
  // cache fresh across reloads without needing an explicit save call.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(latencies));
    } catch {
      /* quota exceeded / private mode — fine to ignore */
    }
  }, [latencies]);

  const measure = useCallback(
    async (modelIds: string[]) => {
      // Drop any in-flight previous run so the new one owns the spinners.
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const queue = [...modelIds];
      const total = queue.length;
      let done = 0;
      setProgress({ total, done });
      setInFlight(new Set(queue));

      const updateOne = (id: string, result: LatencyResult) => {
        setLatencies((prev) => ({ ...prev, [id]: result }));
        setInFlight((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        done += 1;
        setProgress({ total, done });
      };

      const worker = async () => {
        while (queue.length && !controller.signal.aborted) {
          const id = queue.shift();
          if (!id) break;
          const result = await probeOnce(id, backendUrl, controller.signal);
          updateOne(id, result);
        }
      };

      const workers = Array.from(
        { length: Math.min(PROBE_CONCURRENCY, total) },
        () => worker()
      );
      await Promise.all(workers);

      if (!controller.signal.aborted) {
        setProgress(null);
      } else {
        // On abort, drop the spinner state so abandoned models don't
        // look stuck.
        setInFlight(new Set());
        setProgress(null);
      }
    },
    [backendUrl]
  );

  const abort = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const clear = useCallback(() => {
    abortRef.current?.abort();
    setLatencies({});
    setInFlight(new Set());
    setProgress(null);
  }, []);

  const lastMeasuredAt = useMemoLastMeasured(latencies);

  return {
    latencies,
    inFlight,
    progress,
    measuring: progress !== null,
    measure,
    abort,
    clear,
    lastMeasuredAt,
  };
}

function useMemoLastMeasured(latencies: LatencyMap): number | null {
  // Cheap derive — the map is small. Skip useMemo machinery for clarity.
  let max = 0;
  for (const r of Object.values(latencies)) {
    if (r.measuredAt > max) max = r.measuredAt;
  }
  return max || null;
}

function loadCache(): LatencyMap {
  if (typeof localStorage === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as LatencyMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

async function probeOnce(
  modelId: string,
  backendUrl: string,
  signal: AbortSignal
): Promise<LatencyResult> {
  // Hard timeout in addition to the user-driven abort — protects against
  // backends that hang the connection without ever sending a token.
  const timeout = new AbortController();
  const t = setTimeout(() => timeout.abort(), PROBE_TIMEOUT_MS);
  const linkedAbort = anySignal([signal, timeout.signal]);

  const start = performance.now();
  try {
    const res = await fetch(`${backendUrl}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: modelId,
        // Smallest viable prompt + 1-token cap to keep cost negligible.
        messages: [{ role: "user", content: "Hi" }],
        max_tokens: 1,
        stream: true,
      }),
      signal: linkedAbort,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const detail =
        (() => {
          try {
            return (JSON.parse(text) as { detail?: string }).detail;
          } catch {
            return undefined;
          }
        })() || `HTTP ${res.status}`;
      return {
        ms: null,
        error: String(detail).slice(0, 200),
        measuredAt: Date.now(),
        source: "probe",
      };
    }

    if (!res.body) {
      return {
        ms: null,
        error: "Streaming not supported",
        measuredAt: Date.now(),
        source: "probe",
      };
    }

    const reader = res.body.getReader();
    // Wait for the first non-empty chunk — that's the time-to-first-token
    // we care about. Some backends emit a keepalive newline first; skip
    // those.
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        return {
          ms: null,
          error: "Stream closed before any data",
          measuredAt: Date.now(),
        };
      }
      const text = decoder.decode(value, { stream: true });
      if (text.trim().length > 0) {
        const ttfb = performance.now() - start;
        // Best-effort cancel — we don't need the rest of the response.
        await reader.cancel().catch(() => {});
        return {
          ms: Math.round(ttfb),
          error: null,
          measuredAt: Date.now(),
          source: "probe",
        };
      }
    }
  } catch (err) {
    if (signal.aborted) {
      return {
        ms: null,
        error: "aborted",
        measuredAt: Date.now(),
        source: "probe",
      };
    }
    if (timeout.signal.aborted) {
      return {
        ms: null,
        error: `Timeout after ${PROBE_TIMEOUT_MS / 1000}s`,
        measuredAt: Date.now(),
        source: "probe",
      };
    }
    return {
      ms: null,
      error: err instanceof Error ? err.message : String(err),
      measuredAt: Date.now(),
      source: "probe",
    };
  } finally {
    clearTimeout(t);
  }
}

// Tiny polyfill for AbortSignal.any (Safari < 17 / older Node).
function anySignal(signals: AbortSignal[]): AbortSignal {
  if (typeof AbortSignal !== "undefined" && "any" in AbortSignal) {
    return AbortSignal.any(signals);
  }
  const controller = new AbortController();
  for (const s of signals) {
    if (s.aborted) {
      controller.abort();
      break;
    }
    s.addEventListener("abort", () => controller.abort(), { once: true });
  }
  return controller.signal;
}
