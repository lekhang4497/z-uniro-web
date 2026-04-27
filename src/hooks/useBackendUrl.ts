"use client";

import { useEffect, useState } from "react";
import { getBackendUrl, onBackendUrlChange } from "@/lib/backend";

export function useBackendUrl(): string {
  // SSR: return the env default so the initial markup is deterministic.
  // Client: swap to the persisted value after hydration.
  const [url, setUrl] = useState<string>(() => {
    if (typeof window === "undefined") {
      return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8857";
    }
    return getBackendUrl();
  });

  useEffect(() => {
    setUrl(getBackendUrl());
    return onBackendUrlChange(() => setUrl(getBackendUrl()));
  }, []);

  return url;
}
