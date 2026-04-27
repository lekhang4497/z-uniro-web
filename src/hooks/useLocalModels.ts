"use client";

import { useEffect, useState } from "react";
import type { OllamaModelEntry } from "@/types/electron";

export interface LocalModelsState {
  models: OllamaModelEntry[];
  reachable: boolean;
  loading: boolean;
}

/**
 * Polls Ollama via the desktop bridge for the list of installed models,
 * plus a "reachable" flag (false = no daemon / not desktop).
 * Re-polls every 30s and on focus.
 */
export function useLocalModels(): LocalModelsState {
  const [state, setState] = useState<LocalModelsState>({
    models: [],
    reachable: false,
    loading: false,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const bridge = window.uniro;
    if (!bridge) return;

    let cancelled = false;
    const refresh = async () => {
      setState((prev) => ({ ...prev, loading: true }));
      try {
        const status = await bridge.models.ollama.status();
        if (cancelled) return;
        if (!status.daemonRunning) {
          setState({ models: [], reachable: false, loading: false });
          return;
        }
        const list = await bridge.models.ollama.list();
        if (cancelled) return;
        setState({ models: list, reachable: true, loading: false });
      } catch {
        if (cancelled) return;
        setState({ models: [], reachable: false, loading: false });
      }
    };

    refresh();
    const id = setInterval(refresh, 30_000);
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);

    return () => {
      cancelled = true;
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  return state;
}

/**
 * Encode a local Ollama model name as a "uniro:local" model ID. The prefix is
 * what ChatWindow uses to decide between the cloud backend and local Ollama.
 */
export const LOCAL_PREFIX = "local:";

export function toLocalId(name: string): string {
  return `${LOCAL_PREFIX}${name}`;
}

export function isLocalId(id: string): boolean {
  return id.startsWith(LOCAL_PREFIX);
}

export function fromLocalId(id: string): string {
  return id.startsWith(LOCAL_PREFIX) ? id.slice(LOCAL_PREFIX.length) : id;
}

/** Where to send chat completions for local models. */
export const OLLAMA_BASE_URL = "http://localhost:11434";
