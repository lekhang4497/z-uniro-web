export interface Message {
  role: "user" | "assistant";
  content: string;
  model?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  updatedAt?: number;
}

export interface ModelCapabilities {
  vision?: boolean;
  tool_calling?: boolean;
  reasoning?: boolean;
}

export interface BackendModel {
  id: string;
  object: string;
  owned_by: string;
  type: "routing_profile" | "model" | "alias";
  description?: string;
  context_window?: number;
  cost_per_million_input_tokens?: number;
  cost_per_million_output_tokens?: number;
  capabilities?: ModelCapabilities;
  available?: boolean;
  status?: string;
  availability_tag?: string;
  // Backend-reported time-to-first-token in milliseconds (null when no
  // health check has been recorded yet). Surfaced on /admin so users see
  // baseline numbers without having to click "Measure latencies"; their
  // probe results override these when present.
  latency_ms?: number | null;
  // ISO timestamp of when the backend last health-checked this model.
  last_health_check?: string;
  // Provider id as the backend categorises it. Useful when the model id
  // doesn't carry a "<provider>/" prefix.
  provider?: string;
}
