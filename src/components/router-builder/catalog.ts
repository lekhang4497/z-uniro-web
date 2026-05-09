// Catalogue of building blocks the user can drop onto the router
// canvas. The structure here is what the sidebar palette renders, what
// the canvas creates on drop, and what the properties panel keys off
// of for per-type configuration. Each entry's `kind` is the stable id
// passed in dataTransfer; never rename without a migration.

import type { LucideIcon } from "lucide-react";
import {
  Boxes,
  Database,
  GitBranch,
  Play,
  PlayCircle,
  Repeat,
  Settings2,
  Shield,
  StickyNote,
  StopCircle,
  Tags,
  UserCheck,
  Wrench,
} from "lucide-react";

export type NodeKind =
  | "agent"
  | "classify"
  | "end"
  | "note"
  | "file_search"
  | "guardrails"
  | "mcp"
  | "if_else"
  | "while"
  | "user_approval"
  | "transform"
  | "set_state";

export type NodeCategory = "core" | "tools" | "logic" | "data";

export interface CatalogEntry {
  kind: NodeKind;
  label: string;
  category: NodeCategory;
  icon: LucideIcon;
  // The pastel swatch behind the icon. Matches the design system tones
  // shown in the reference: warm peach for control flow, soft mint for
  // start/agent, lavender for output, etc.
  tone: "amber" | "rose" | "mint" | "lavender" | "slate" | "yellow";
  // What appears under the node title — usually the kind echoed back
  // to make the canvas self-documenting at a glance.
  typeLabel: string;
  // Default values written into the node when it's first dropped.
  // The properties panel renders these by introspecting `defaults`.
  defaults: Record<string, unknown>;
}

export const CATEGORY_LABEL: Record<NodeCategory, string> = {
  core: "Core",
  tools: "Tools",
  logic: "Logic",
  data: "Data",
};

export const CATALOG: CatalogEntry[] = [
  {
    kind: "agent",
    label: "Agent",
    category: "core",
    icon: PlayCircle,
    tone: "lavender",
    typeLabel: "Agent",
    defaults: { model: "auto", systemPrompt: "" },
  },
  {
    kind: "classify",
    label: "Classify",
    category: "core",
    icon: Tags,
    tone: "amber",
    typeLabel: "Classify",
    defaults: { model: "auto", labels: ["simple", "complex"] },
  },
  {
    kind: "end",
    label: "End",
    category: "core",
    icon: StopCircle,
    tone: "slate",
    typeLabel: "End",
    defaults: {},
  },
  {
    kind: "note",
    label: "Note",
    category: "core",
    icon: StickyNote,
    tone: "yellow",
    typeLabel: "Note",
    defaults: { text: "Add a note…" },
  },

  {
    kind: "file_search",
    label: "File search",
    category: "tools",
    icon: Database,
    tone: "slate",
    typeLabel: "File search",
    defaults: { collection: "" },
  },
  {
    kind: "guardrails",
    label: "Guardrails",
    category: "tools",
    icon: Shield,
    tone: "amber",
    typeLabel: "Guardrails",
    defaults: { rules: [] },
  },
  {
    kind: "mcp",
    label: "MCP",
    category: "tools",
    icon: Wrench,
    tone: "slate",
    typeLabel: "MCP",
    defaults: { server: "" },
  },

  {
    kind: "if_else",
    label: "If / else",
    category: "logic",
    icon: GitBranch,
    tone: "rose",
    typeLabel: "If / else",
    defaults: { condition: "" },
  },
  {
    kind: "while",
    label: "While",
    category: "logic",
    icon: Repeat,
    tone: "rose",
    typeLabel: "While",
    defaults: { condition: "", maxIterations: 10 },
  },
  {
    kind: "user_approval",
    label: "User approval",
    category: "logic",
    icon: UserCheck,
    tone: "rose",
    typeLabel: "User approval",
    defaults: { prompt: "Approve to continue" },
  },

  {
    kind: "transform",
    label: "Transform",
    category: "data",
    icon: Settings2,
    tone: "slate",
    typeLabel: "Transform",
    defaults: { script: "" },
  },
  {
    kind: "set_state",
    label: "Set state",
    category: "data",
    icon: Boxes,
    tone: "slate",
    typeLabel: "Set state",
    defaults: { key: "", value: "" },
  },
];

export const CATALOG_BY_KIND: Record<NodeKind, CatalogEntry> = Object.fromEntries(
  CATALOG.map((e) => [e.kind, e])
) as Record<NodeKind, CatalogEntry>;

// Tailwind class fragments per tone — used by both the palette tile
// and the on-canvas node so the visual language stays consistent.
export const TONE_CLASSES: Record<
  CatalogEntry["tone"],
  { swatch: string; chip: string }
> = {
  amber: {
    swatch: "bg-[#fce8d4] text-[#7a4a1a]",
    chip: "bg-[#fce8d4]/60 text-[#7a4a1a]",
  },
  rose: {
    swatch: "bg-[#f9d8d8] text-[#7a2a2a]",
    chip: "bg-[#f9d8d8]/60 text-[#7a2a2a]",
  },
  mint: {
    swatch: "bg-[#d3ead9] text-[#22593c]",
    chip: "bg-[#d3ead9]/60 text-[#22593c]",
  },
  lavender: {
    swatch: "bg-[#dedaf3] text-[#3d3577]",
    chip: "bg-[#dedaf3]/60 text-[#3d3577]",
  },
  slate: {
    swatch: "bg-[#e8e8e6] text-[#3a3a36]",
    chip: "bg-[#e8e8e6]/60 text-[#3a3a36]",
  },
  yellow: {
    swatch: "bg-[#fff5b8] text-[#6f5510]",
    chip: "bg-[#fff5b8]/80 text-[#6f5510]",
  },
};

// Used as the canvas's start anchor — equivalent to the green "Start"
// node in the reference design. Not draggable from the palette; the
// canvas seeds it on first load so users have somewhere to connect to.
export const START_ICON = Play;
export const START_NODE_KIND = "start" as const;

// React Flow node type registration key. Single shared component, with
// data.kind discriminating rendering inside it.
export const FLOW_NODE_TYPE = "uniroNode";
