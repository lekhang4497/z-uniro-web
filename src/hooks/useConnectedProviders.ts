"use client";

import { useEffect, useState } from "react";

export const CONNECTIONS_CHANGED_EVENT = "uniro:connections-changed";

/**
 * Returns the set of connected credential keys (provider names) from the
 * desktop bridge's `auth.status()`. Refreshes on focus, every 60s, and
 * whenever a `uniro:connections-changed` event fires (e.g. after the
 * Connections tab successfully completes a login).
 *
 * Returns `null` when not running in the desktop app — callers should
 * treat that as "no gating, all providers enabled". The web build can't
 * see local credentials anyway.
 */
export function useConnectedProviders(): ReadonlySet<string> | null {
  const isDesktop =
    typeof window !== "undefined" && !!window.uniro?.isDesktop;

  const [keys, setKeys] = useState<Set<string> | null>(
    isDesktop ? new Set() : null
  );

  useEffect(() => {
    if (!isDesktop) return;
    let cancelled = false;

    const refresh = async () => {
      try {
        const res = await window.uniro!.auth.status();
        if (cancelled) return;
        const next = new Set<string>();
        for (const e of res.entries) next.add(e.provider.toLowerCase());
        setKeys(next);
      } catch {
        /* keep last good set */
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

  return keys;
}

/** Fire from ConnectionsPanel after a successful login/remove so the
 *  picker's gating updates without waiting for the next poll cycle. */
export function emitConnectionsChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CONNECTIONS_CHANGED_EVENT));
}
