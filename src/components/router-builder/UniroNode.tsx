"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import {
  CATALOG_BY_KIND,
  START_ICON,
  TONE_CLASSES,
  type NodeKind,
} from "./catalog";
import { cn } from "@/lib/utils";

// Per-node mutable state. data.kind picks the rendering; data.name
// (if set) overrides the catalog label so users can name their nodes
// ("Web research agent" vs "Agent"); data.params is the loose bag the
// properties panel writes into.
export interface UniroNodeData {
  kind: NodeKind | "start";
  name?: string;
  params?: Record<string, unknown>;
  // Note nodes are visually distinct — no handles, sticky-note styling.
  // Recorded once on creation so we don't re-derive every render.
  variant?: "default" | "note" | "start";
  [key: string]: unknown;
}

export default function UniroNode({ data, selected }: NodeProps) {
  const d = data as UniroNodeData;
  const variant = d.variant ?? "default";

  if (variant === "note") {
    return <NoteNode data={d} selected={!!selected} />;
  }
  if (variant === "start" || d.kind === "start") {
    return <StartNode data={d} selected={!!selected} />;
  }
  return <DefaultNode data={d} selected={!!selected} />;
}

function DefaultNode({
  data,
  selected,
}: {
  data: UniroNodeData;
  selected: boolean;
}) {
  const entry = CATALOG_BY_KIND[data.kind as NodeKind];
  if (!entry) return null;
  const tone = TONE_CLASSES[entry.tone];
  const Icon = entry.icon;

  return (
    <div
      className={cn(
        "group relative min-w-[210px] max-w-[260px] rounded-[18px] border bg-bg-000 px-3 py-2.5 shadow-[0_2px_10px_-4px_rgba(0,0,0,.08)] transition-all",
        selected
          ? "border-text-200 shadow-[0_4px_16px_-4px_rgba(0,0,0,.14)]"
          : "border-border-200 hover:border-border-300"
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !bg-bg-000 !border !border-border-300"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !bg-bg-000 !border !border-border-300"
      />

      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-[12px]",
            tone.swatch
          )}
        >
          <Icon className="w-4 h-4" />
        </span>
        <div className="min-w-0 leading-tight">
          <div className="text-[13.5px] font-medium text-text-000 truncate">
            {data.name?.trim() || entry.label}
          </div>
          <div className="text-[11.5px] text-text-400 truncate">
            {entry.typeLabel}
          </div>
        </div>
      </div>
    </div>
  );
}

function StartNode({
  data,
  selected,
}: {
  data: UniroNodeData;
  selected: boolean;
}) {
  return (
    <div
      className={cn(
        "relative inline-flex items-center gap-2.5 rounded-[14px] border bg-bg-000 px-3 py-2 shadow-[0_2px_10px_-4px_rgba(0,0,0,.08)] transition-all",
        selected
          ? "border-text-200"
          : "border-border-200 hover:border-border-300"
      )}
    >
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !bg-bg-000 !border !border-border-300"
      />
      <span className="flex h-7 w-7 items-center justify-center rounded-[10px] bg-[#d3ead9] text-[#22593c]">
        <START_ICON className="w-3.5 h-3.5" />
      </span>
      <span className="text-[13.5px] font-medium text-text-000 leading-none">
        {data.name?.trim() || "Start"}
      </span>
    </div>
  );
}

function NoteNode({
  data,
  selected,
}: {
  data: UniroNodeData;
  selected: boolean;
}) {
  const text =
    typeof data.params?.text === "string"
      ? (data.params.text as string)
      : "Add a note…";
  return (
    <div
      className={cn(
        "max-w-[260px] rounded-[14px] bg-[#fff5b8] text-[#3a2a04] px-3.5 py-2.5 text-[13px] leading-[1.5] shadow-[0_2px_10px_-4px_rgba(0,0,0,.12)] transition-all whitespace-pre-wrap",
        selected ? "ring-2 ring-[#d4a72b]" : ""
      )}
    >
      {text}
    </div>
  );
}
