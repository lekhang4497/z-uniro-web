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
}
