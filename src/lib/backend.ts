// Resolves the UniRo backend origin used for /v1/* fetches.
//
// Resolution order (first match wins):
//   1. window.localStorage["uniro:backendUrl"]  — user override in Settings
//   2. process.env.NEXT_PUBLIC_BACKEND_URL      — baked at build time
//   3. http://localhost:8857                     — dev fallback
//
// Call getBackendUrl() for one-shot reads. Use useBackendUrl() in components
// that should re-render when the user changes the URL in Settings.

const STORAGE_KEY = "uniro:backendUrl";
const CHANGE_EVENT = "uniro:backend-url-change";
const DEFAULT_URL = "http://localhost:8857";

function normalize(url: string): string {
  const trimmed = url.trim().replace(/\/+$/, "");
  return trimmed || DEFAULT_URL;
}

function readStored(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v ? normalize(v) : null;
  } catch {
    return null;
  }
}

function readEnv(): string | null {
  const v = process.env.NEXT_PUBLIC_BACKEND_URL;
  return v ? normalize(v) : null;
}

export function getBackendUrl(): string {
  return readStored() ?? readEnv() ?? DEFAULT_URL;
}

export function getDefaultBackendUrl(): string {
  return readEnv() ?? DEFAULT_URL;
}

export function setBackendUrl(url: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (url === null || url.trim() === "") {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      window.localStorage.setItem(STORAGE_KEY, normalize(url));
    }
  } catch {
    /* ignore quota / privacy errors */
  }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

export function onBackendUrlChange(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CHANGE_EVENT, cb);
  // Also react to other tabs changing it via the Storage event.
  const storageHandler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) cb();
  };
  window.addEventListener("storage", storageHandler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, cb);
    window.removeEventListener("storage", storageHandler);
  };
}
