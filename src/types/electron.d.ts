// Ambient types for the window.uniro bridge installed by the Electron preload.
// Must stay in sync with electron/src/ipc-contract.ts.

export type SubscriptionProviderId =
  | "openai"
  | "anthropic"
  | "gemini"
  | "antigravity"
  | "github-copilot";

export type ApiKeyProviderId =
  | "anthropic"
  | "openai"
  | "google"
  | "nvidia"
  | "groq"
  | "xai"
  | "mistral"
  | "deepseek"
  | "openrouter"
  | "cohere";

export interface CredentialEntry {
  provider: string;
  maskedToken: string;
  source: string;
}

export interface AuthStatusResult {
  entries: CredentialEntry[];
  raw: string;
}

export interface CliStatusResult {
  installed: boolean;
  version: string | null;
  binary: string;
  error: string | null;
}

export interface LoginProgressEvent {
  provider: string;
  channel: "stdout" | "stderr" | "event";
  line: string;
  authUrl?: string;
  userCode?: string;
  verificationUri?: string;
}

export interface LoginResult {
  ok: boolean;
  code: number | null;
  output: string;
}

// ---------- Models / local runtime ----------

export interface SystemInfo {
  platform: NodeJS.Platform;
  arch: string;
  cpuCores: number;
  cpuModel: string;
  totalRamGB: number;
  freeRamGB: number;
  gpu: {
    detected: boolean;
    description: string;
    vramGB: number | null;
    isAppleSilicon: boolean;
  };
}

export interface OllamaStatus {
  installed: boolean;
  version: string | null;
  daemonRunning: boolean;
  baseUrl: string;
  error: string | null;
}

export interface OllamaModelEntry {
  name: string;
  sizeBytes: number;
  modifiedAt: string;
  digest: string;
  details?: {
    family?: string;
    parameter_size?: string;
    quantization_level?: string;
  };
}

export interface PullProgressEvent {
  model: string;
  status: string;
  totalBytes?: number;
  completedBytes?: number;
  digest?: string;
}

export interface PullResult {
  ok: boolean;
  model: string;
  error: string | null;
}

export interface UniroDesktopBridge {
  isDesktop: true;
  auth: {
    cliStatus: () => Promise<CliStatusResult>;
    status: () => Promise<AuthStatusResult>;
    addKey: (provider: ApiKeyProviderId, key: string) => Promise<LoginResult>;
    login: (provider: SubscriptionProviderId) => Promise<LoginResult>;
    remove: (provider: string) => Promise<LoginResult>;
    onProgress: (handler: (e: LoginProgressEvent) => void) => () => void;
  };
  models: {
    system: () => Promise<SystemInfo>;
    ollama: {
      status: () => Promise<OllamaStatus>;
      list: () => Promise<OllamaModelEntry[]>;
      pull: (name: string) => Promise<PullResult>;
      remove: (name: string) => Promise<PullResult>;
      onPullProgress: (handler: (e: PullProgressEvent) => void) => () => void;
    };
  };
  app: {
    openExternal: (url: string) => Promise<void>;
    getVersion: () => Promise<string>;
  };
}

declare global {
  interface Window {
    uniro?: UniroDesktopBridge;
  }
}

export {};
