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
