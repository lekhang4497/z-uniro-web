"use client";

import { useEffect, useState } from "react";

export const CONNECTIONS_CHANGED_EVENT = "uniro:connections-changed";

export interface ConnectionState {
  /** Set of connected credential keys (provider names lowercased), or
   *  `null` when not in the desktop app (web can't see local creds). */
  keys: ReadonlySet<string> | null;
  /** Subset of `keys` whose credential entry has source==="oauth" — i.e.
   *  providers connected via subscription login, eligible for direct
   *  subscription dispatch from the main process. Null on web. */
  oauth: ReadonlySet<string> | null;
  /** True if at least one stored credential is an API key (source ===
   *  "manual"). Null when not in the desktop app. */
  hasApiKey: boolean | null;
}

/**
 * Polls the desktop bridge's `auth.status()` and exposes a snapshot of
 * the user's stored credentials. Refreshes on focus, every 60s, and
 * whenever a `uniro:connections-changed` event fires (e.g. after the
 * Connections tab successfully completes a login).
 *
 * In the web build returns `{ keys: null, hasApiKey: null }` — callers
 * should treat null as "unknown / no gating".
 */
export function useConnectedProviders(): ConnectionState {
  const isDesktop =
    typeof window !== "undefined" && !!window.uniro?.isDesktop;

  const [state, setState] = useState<ConnectionState>(() =>
    isDesktop
      ? { keys: new Set<string>(), oauth: new Set<string>(), hasApiKey: false }
      : { keys: null, oauth: null, hasApiKey: null }
  );

  useEffect(() => {
    if (!isDesktop) return;
    let cancelled = false;

    const refresh = async () => {
      try {
        const res = await window.uniro!.auth.status();
        if (cancelled) return;
        const keys = new Set<string>();
        const oauth = new Set<string>();
        let hasApiKey = false;
        for (const e of res.entries) {
          const p = e.provider.toLowerCase();
          keys.add(p);
          if (e.source === "manual") hasApiKey = true;
          if (e.source === "oauth") oauth.add(p);
        }
        setState({ keys, oauth, hasApiKey });
      } catch {
        /* keep last good state */
      }
    };

    refresh();
    const id = setInterval(refresh, 60_000);
    const onFocus = () => refresh();
    const onChanged = () => refresh();
    window.addEventListener("focus", onFocus);
    window.addEventListener(CONNECTIONS_CHANGED_EVENT, onChanged);

    return () => {
      cancelled = true;
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener(CONNECTIONS_CHANGED_EVENT, onChanged);
    };
  }, [isDesktop]);

  return state;
}

/** Fire from ConnectionsPanel after a successful login/remove so the
 *  picker's gating updates without waiting for the next poll cycle. */
export function emitConnectionsChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CONNECTIONS_CHANGED_EVENT));
}
