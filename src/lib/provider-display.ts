// Provider helpers used by the chat composer's "More models" browse panel.
// Treats the prefix before the first "/" in a model id as the provider,
// pretty-prints the slug, and resolves a logo URL where we know one.

import type { BackendModel } from "@/types";

export interface ProviderGroup {
  id: string;
  models: BackendModel[];
}

/** "anthropic/claude-sonnet-4-5" → "anthropic"; "gpt-4" → ""  (no prefix). */
export function extractProvider(modelId: string): string {
  const i = modelId.indexOf("/");
  if (i <= 0) return "";
  return modelId.slice(0, i).toLowerCase();
}

const SPECIAL_NAMES: Record<string, string> = {
  openai: "OpenAI",
  "open-ai": "OpenAI",
  "openai-codex": "OpenAI Codex",
  "openai-compatible": "OpenAI Compatible",
  anthropic: "Anthropic",
  google: "Google",
  "google-gemini-cli": "Google Gemini",
  "google-antigravity": "Google Antigravity",
  meta: "Meta",
  "meta-llama": "Meta Llama",
  microsoft: "Microsoft",
  mistral: "Mistral",
  mistralai: "MistralAI",
  "mistral-ai": "MistralAI",
  nvidia: "NVIDIA",
  xai: "xAI",
  "x-ai": "xAI",
  cohere: "Cohere",
  perplexity: "Perplexity",
  deepseek: "DeepSeek",
  "deepseek-ai": "DeepSeek",
  qwen: "Qwen",
  groq: "Groq",
  together: "Together",
  "together-ai": "Together AI",
  amazon: "Amazon",
  ibm: "IBM",
  moonshotai: "MoonshotAI",
  moonshot: "Moonshot",
  minimax: "MiniMax",
  minimaxai: "MiniMaxAI",
  "z-ai": "z-ai",
  zyphra: "Zyphra",
  inflection: "Inflection",
  liquid: "Liquid",
  nous: "Nous",
  huggingface: "HuggingFace",
  "hugging-face": "HuggingFace",
  ollama: "Ollama",
  openrouter: "OpenRouter",
  "github-copilot": "GitHub Copilot",
};

export function formatProviderName(provider: string): string {
  if (!provider) return "Other";
  const k = provider.toLowerCase();
  if (k in SPECIAL_NAMES) return SPECIAL_NAMES[k];
  // Default: split on - / _ and Title-case each part.
  return k
    .split(/[-_]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

const ROOT = "https://openrouter.ai/images/icons";
const FAV = (host: string) =>
  `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(
    host
  )}&size=256`;

/**
 * Best-effort logo URL. Returns null when we don't know one — the caller
 * should render a letter-avatar fallback in that case.
 */
export function providerLogoUrl(provider: string): string | null {
  const k = provider.toLowerCase();
  switch (k) {
    case "anthropic":
      return `${ROOT}/Anthropic.svg`;
    case "openai":
    case "openai-codex":
      return `${ROOT}/OpenAI.svg`;
    case "google":
    case "google-gemini-cli":
      return `${ROOT}/GoogleGemini.svg`;
    case "google-antigravity":
      return `${ROOT}/GoogleAIStudio.svg`;
    case "meta":
    case "meta-llama":
      return `${ROOT}/Meta.png`;
    case "microsoft":
      return `${ROOT}/Microsoft.svg`;
    case "mistralai":
    case "mistral":
    case "mistral-ai":
      return `${ROOT}/Mistral.png`;
    case "deepseek":
    case "deepseek-ai":
      return `${ROOT}/DeepSeek.png`;
    case "qwen":
      return `${ROOT}/Qwen.png`;
    case "cohere":
      return `${ROOT}/Cohere.png`;
    case "perplexity":
      return `${ROOT}/Perplexity.svg`;
    case "x-ai":
    case "xai":
      return FAV("https://x.ai/");
    case "nvidia":
      return FAV("https://nvidia.com/");
    case "groq":
      return FAV("https://groq.com/");
    case "together":
    case "together-ai":
      return FAV("https://www.together.ai/");
    case "huggingface":
    case "hugging-face":
      return FAV("https://huggingface.co/");
    case "amazon":
      return FAV("https://nova.amazon.com/");
    case "ibm":
      return FAV("https://ibm.com/");
    case "moonshotai":
    case "moonshot":
      return FAV("https://moonshot.ai/");
    case "minimax":
    case "minimaxai":
      return FAV("https://minimaxi.com/");
    case "z-ai":
      return FAV("https://z.ai/");
    case "nous":
      return FAV("https://nousresearch.com/");
    case "inflection":
      return FAV("https://inflection.ai/");
    case "liquid":
      return FAV("https://www.liquid.ai/");
    case "ollama":
      return FAV("https://ollama.com/");
    case "openrouter":
      return FAV("https://openrouter.ai/");
    case "github-copilot":
      return FAV("https://github.com/features/copilot");
    default:
      return null;
  }
}

/** Mono-mark logos that need inversion against a dark background. */
const INVERT_PROVIDERS = new Set(["openai", "openai-codex", "z-ai", "liquid"]);
export function shouldInvertOnDark(provider: string): boolean {
  return INVERT_PROVIDERS.has(provider.toLowerCase());
}

export function groupModelsByProvider(
  models: BackendModel[]
): ProviderGroup[] {
  const map = new Map<string, BackendModel[]>();
  for (const m of models) {
    if (m.type !== "model") continue;
    const provider = extractProvider(m.id);
    if (!provider) continue;
    let list = map.get(provider);
    if (!list) {
      list = [];
      map.set(provider, list);
    }
    list.push(m);
  }
  return Array.from(map.entries())
    .map(([id, list]) => ({
      id,
      models: list.slice().sort((a, b) => a.id.localeCompare(b.id)),
    }))
    .sort((a, b) => {
      if (b.models.length !== a.models.length) {
        return b.models.length - a.models.length;
      }
      return formatProviderName(a.id).localeCompare(formatProviderName(b.id));
    });
}

/** Strip the "{provider}/" prefix from a model id for compact display. */
export function modelDisplayName(modelId: string): string {
  const i = modelId.indexOf("/");
  return i > 0 ? modelId.slice(i + 1) : modelId;
}

// Pretty labels + descriptions for known routing profiles. The backend
// emits these as `type: "routing_profile"` with bare ids ("auto", "eco",
// "premium"); the UI overrides their visible label and tagline so users
// see a friendly name rather than the raw slug.
const ROUTING_PROFILE_OVERRIDES: Record<
  string,
  { label: string; description: string }
> = {
  auto: { label: "Auto", description: "UNIRO Smart routing" },
  eco: { label: "Eco", description: "Use cheapest models" },
  premium: { label: "Premium", description: "Use most capable models" },
};

export function routingProfileMeta(
  modelId: string
): { label: string; description: string } | null {
  return ROUTING_PROFILE_OVERRIDES[modelId.toLowerCase()] ?? null;
}

/**
 * Resolve display label + description for any backend model. For routing
 * profiles we override; for everything else we fall back to the raw fields.
 */
export function modelDisplayMeta(model: {
  id: string;
  description?: string;
}): { label: string; description?: string } {
  const override = routingProfileMeta(model.id);
  if (override) return override;
  return { label: model.id, description: model.description };
}

// ---- Provider → credential gating --------------------------------------

// Provider id → list of credential keys (any one of which counts as
// "connected"). The backend's credentials.json uses these key names; the
// desktop app's Connections tab writes the same names. Empty / missing
// entries mean "no gating" (e.g. routing-profile slugs, ollama, or
// long-tail providers we'd rather not block).
const PROVIDER_CREDENTIALS: Record<string, string[]> = {
  // OAuth subscriptions
  anthropic: ["anthropic"],
  openai: ["openai", "openai-codex"],
  "openai-codex": ["openai", "openai-codex"],
  google: ["google", "gemini", "google-gemini-cli"],
  "google-gemini-cli": ["google-gemini-cli", "gemini", "google"],
  gemini: ["gemini", "google", "google-gemini-cli"],
  "google-antigravity": ["google-antigravity", "antigravity"],
  antigravity: ["antigravity", "google-antigravity"],
  "github-copilot": ["github-copilot"],

  // API-key providers
  mistralai: ["mistral", "mistralai"],
  mistral: ["mistral", "mistralai"],
  "mistral-ai": ["mistral", "mistralai"],
  xai: ["xai"],
  "x-ai": ["xai"],
  deepseek: ["deepseek"],
  "deepseek-ai": ["deepseek"],
  groq: ["groq"],
  nvidia: ["nvidia"],
  cohere: ["cohere"],
  openrouter: ["openrouter"],

  // NVIDIA NIM routes — these prefixes route through the NVIDIA key.
  meta: ["nvidia"],
  "meta-llama": ["nvidia"],
  microsoft: ["nvidia"],
  qwen: ["nvidia"],
  ibm: ["nvidia"],
  moonshotai: ["nvidia"],
  bytedance: ["nvidia"],
  databricks: ["nvidia"],
  baai: ["nvidia"],
  "01-ai": ["nvidia"],
};

const SUBSCRIPTION_PROVIDERS = new Set<string>([
  "anthropic",
  "openai",
  "openai-codex",
  "google",
  "google-gemini-cli",
  "gemini",
  "google-antigravity",
  "antigravity",
  "github-copilot",
]);

export function requiredCredentials(provider: string): string[] {
  return PROVIDER_CREDENTIALS[provider.toLowerCase()] ?? [];
}

/**
 * True if no creds are required, or at least one accepted key is connected.
 * Pass `connectedKeys = null` (e.g. on web) to skip gating entirely.
 */
export function isProviderConnected(
  provider: string,
  connectedKeys: ReadonlySet<string> | null
): boolean {
  if (connectedKeys === null) return true;
  const needs = requiredCredentials(provider);
  if (needs.length === 0) return true;
  return needs.some((k) => connectedKeys.has(k));
}

/** Tag text shown on a disabled provider row — picks the right CTA verb. */
export function connectActionLabel(provider: string): string {
  return SUBSCRIPTION_PROVIDERS.has(provider.toLowerCase())
    ? "Connect to subscription"
    : "Add API key";
}
