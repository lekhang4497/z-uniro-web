"use client";

import { useState, useEffect } from "react";
import type { BackendModel } from "@/types";
import { useBackendUrl } from "@/hooks/useBackendUrl";

export function useModels() {
  const backendUrl = useBackendUrl();
  const [models, setModels] = useState<BackendModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    async function fetchModels() {
      try {
        const res = await fetch(`${backendUrl}/v1/models?detailed=true`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!cancelled) {
          setModels(json.data ?? []);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setModels([]);
          setError(err instanceof Error ? err.message : "Failed to load models");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchModels();
    return () => {
      cancelled = true;
    };
  }, [backendUrl]);

  return { models, loading, error };
}
