// Curated Ollama models for the in-app browser. Hand-maintained because
// ollama.com doesn't expose a public registry API. The "downloadGB" /
// "minRamGB" figures are the rule-of-thumb at the default quantization;
// adjust as upstream sizes change.

export interface CatalogModel {
  id: string; // exact `ollama pull` name
  family: string; // visible group (Llama, Qwen, …)
  label: string; // display name
  description: string;
  paramSize: string; // "8B", "70B" …
  downloadGB: number; // approx size on disk after pull
  minRamGB: number; // recommended free RAM/VRAM for usable speed
  capabilities: ("chat" | "code" | "vision" | "tools")[];
}

export const CATALOG: CatalogModel[] = [
  {
    id: "llama3.2:3b",
    family: "Llama",
    label: "Llama 3.2 3B",
    description: "Small, fast general-purpose model. Good for laptops without a GPU.",
    paramSize: "3B",
    downloadGB: 2,
    minRamGB: 4,
    capabilities: ["chat"],
  },
  {
    id: "llama3.1:8b",
    family: "Llama",
    label: "Llama 3.1 8B",
    description: "Solid all-rounder; strong instruction following.",
    paramSize: "8B",
    downloadGB: 4.7,
    minRamGB: 8,
    capabilities: ["chat", "tools"],
  },
  {
    id: "llama3.1:70b",
    family: "Llama",
    label: "Llama 3.1 70B",
    description: "Top-tier open chat model. Needs serious hardware.",
    paramSize: "70B",
    downloadGB: 40,
    minRamGB: 64,
    capabilities: ["chat", "tools"],
  },
  {
    id: "qwen2.5:7b",
    family: "Qwen",
    label: "Qwen 2.5 7B",
    description: "Strong multilingual model from Alibaba.",
    paramSize: "7B",
    downloadGB: 4.4,
    minRamGB: 8,
    capabilities: ["chat", "tools"],
  },
  {
    id: "qwen2.5:14b",
    family: "Qwen",
    label: "Qwen 2.5 14B",
    description: "Better reasoning than 7B; still runnable on a 16GB MacBook.",
    paramSize: "14B",
    downloadGB: 9,
    minRamGB: 16,
    capabilities: ["chat", "tools"],
  },
  {
    id: "qwen2.5-coder:7b",
    family: "Qwen",
    label: "Qwen 2.5 Coder 7B",
    description: "Code-focused. Good Tab-completion / refactor model.",
    paramSize: "7B",
    downloadGB: 4.7,
    minRamGB: 8,
    capabilities: ["chat", "code"],
  },
  {
    id: "deepseek-r1:7b",
    family: "DeepSeek",
    label: "DeepSeek R1 7B",
    description: "Reasoning-distilled. Slower but better on math/logic.",
    paramSize: "7B",
    downloadGB: 4.7,
    minRamGB: 8,
    capabilities: ["chat"],
  },
  {
    id: "deepseek-r1:14b",
    family: "DeepSeek",
    label: "DeepSeek R1 14B",
    description: "Reasoning model; good balance of cost vs. capability.",
    paramSize: "14B",
    downloadGB: 9,
    minRamGB: 16,
    capabilities: ["chat"],
  },
  {
    id: "mistral:7b",
    family: "Mistral",
    label: "Mistral 7B",
    description: "Compact, fast, surprisingly capable for its size.",
    paramSize: "7B",
    downloadGB: 4.4,
    minRamGB: 8,
    capabilities: ["chat"],
  },
  {
    id: "mistral-small:24b",
    family: "Mistral",
    label: "Mistral Small 24B",
    description: "Balanced model; beats older 70B-class models on many tasks.",
    paramSize: "24B",
    downloadGB: 14,
    minRamGB: 24,
    capabilities: ["chat", "tools"],
  },
  {
    id: "phi3:3.8b",
    family: "Phi",
    label: "Phi-3 Mini 3.8B",
    description: "Microsoft's small-but-mighty model. Great on low-end hardware.",
    paramSize: "3.8B",
    downloadGB: 2.3,
    minRamGB: 4,
    capabilities: ["chat"],
  },
  {
    id: "gemma2:9b",
    family: "Gemma",
    label: "Gemma 2 9B",
    description: "Google's open weight model. Strong general chat.",
    paramSize: "9B",
    downloadGB: 5.4,
    minRamGB: 12,
    capabilities: ["chat"],
  },
  {
    id: "llava:7b",
    family: "Llava",
    label: "Llava 7B (vision)",
    description: "Vision-language model; can describe images.",
    paramSize: "7B",
    downloadGB: 4.7,
    minRamGB: 8,
    capabilities: ["chat", "vision"],
  },
];

export type FitVerdict = "fits" | "tight" | "no";

export interface Fit {
  verdict: FitVerdict;
  reason: string;
}

export function ramFit(model: CatalogModel, totalRamGB: number): Fit {
  if (totalRamGB >= model.minRamGB * 1.5) {
    return { verdict: "fits", reason: "Should run smoothly." };
  }
  if (totalRamGB >= model.minRamGB) {
    return {
      verdict: "tight",
      reason: `Needs ~${model.minRamGB} GB; you have ${totalRamGB} GB. Will run but expect slowdowns.`,
    };
  }
  return {
    verdict: "no",
    reason: `Needs ~${model.minRamGB} GB free; you only have ${totalRamGB} GB.`,
  };
}
