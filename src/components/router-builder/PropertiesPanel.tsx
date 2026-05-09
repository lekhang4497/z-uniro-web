"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { Node } from "@xyflow/react";
import { CATALOG_BY_KIND, TONE_CLASSES, type NodeKind } from "./catalog";
import type { UniroNodeData } from "./UniroNode";
import { useModels } from "@/hooks/useModels";
import { cn } from "@/lib/utils";

interface PropertiesPanelProps {
  node: Node<UniroNodeData> | null;
  onClose: () => void;
  onChange: (id: string, patch: Partial<UniroNodeData>) => void;
  onDelete: (id: string) => void;
}

export default function PropertiesPanel({
  node,
  onClose,
  onChange,
  onDelete,
}: PropertiesPanelProps) {
  // Local mirror so the inputs feel responsive even though we throttle
  // writes back to the canvas via onChange. Reset whenever the panel
  // switches to a different node.
  const [name, setName] = useState("");
  const [paramsText, setParamsText] = useState("");
  const [paramsErr, setParamsErr] = useState<string | null>(null);
  const { models: backendModels } = useModels();

  useEffect(() => {
    if (!node) return;
    setName(typeof node.data?.name === "string" ? node.data.name : "");
    setParamsText(JSON.stringify(node.data?.params ?? {}, null, 2));
    setParamsErr(null);
  }, [node?.id]); // intentionally key on id, not data — avoid input thrash

  if (!node) return null;
  const kind = (node.data?.kind ?? "agent") as NodeKind | "start";
  const entry = kind !== "start" ? CATALOG_BY_KIND[kind as NodeKind] : null;
  const toneSwatch = entry ? TONE_CLASSES[entry.tone].swatch : "";
  const Icon = entry?.icon;

  const writeName = (v: string) => {
    setName(v);
    onChange(node.id, { name: v });
  };

  const writeParam = (key: string, value: unknown) => {
    const next = { ...(node.data?.params ?? {}), [key]: value };
    onChange(node.id, { params: next });
    setParamsText(JSON.stringify(next, null, 2));
  };

  const writeParamsRaw = (raw: string) => {
    setParamsText(raw);
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        setParamsErr("Params must be a JSON object.");
        return;
      }
      setParamsErr(null);
      onChange(node.id, { params: parsed });
    } catch (e) {
      setParamsErr(e instanceof Error ? e.message : "Invalid JSON");
    }
  };

  const params = (node.data?.params ?? {}) as Record<string, unknown>;
  const supportsModel = entry?.kind === "agent" || entry?.kind === "classify";

  return (
    <aside className="w-[320px] shrink-0 border-l border-border-200 bg-bg-000 flex flex-col h-full overflow-hidden">
      <header className="flex items-center justify-between gap-2 px-4 h-12 border-b border-border-200">
        <div className="flex items-center gap-2.5 min-w-0">
          {entry && Icon ? (
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-[8px] shrink-0",
                toneSwatch
              )}
            >
              <Icon className="w-3.5 h-3.5" />
            </span>
          ) : null}
          <div className="min-w-0">
            <div className="text-[13px] font-medium text-text-000 truncate">
              {entry?.label ?? "Start"}
            </div>
            <div className="text-[10.5px] tracking-[.06em] uppercase text-text-400">
              Node properties
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-text-400 hover:bg-bg-200 hover:text-text-000 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        <Field label="Name">
          <input
            type="text"
            value={name}
            onChange={(e) => writeName(e.target.value)}
            placeholder={entry?.label ?? "Start"}
            className="w-full rounded-[10px] border border-border-300 bg-bg-000 px-3 py-2 text-[13.5px] text-text-000 outline-none placeholder:text-text-400 focus:border-text-200 transition-colors"
          />
        </Field>

        {supportsModel && (
          <Field label="Model">
            <select
              value={(params.model as string) ?? "auto"}
              onChange={(e) => writeParam("model", e.target.value)}
              className="w-full rounded-[10px] border border-border-300 bg-bg-000 px-2.5 py-2 text-[13.5px] text-text-000 outline-none focus:border-text-200"
            >
              {/* Routing profiles + aliases first, then concrete models */}
              {backendModels
                .slice()
                .sort((a, b) => a.id.localeCompare(b.id))
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.id}
                  </option>
                ))}
              {/* "auto" fallback if the backend hasn't loaded yet */}
              {backendModels.length === 0 && (
                <option value="auto">auto</option>
              )}
            </select>
          </Field>
        )}

        {kind === "note" && (
          <Field label="Text">
            <textarea
              value={(params.text as string) ?? ""}
              onChange={(e) => writeParam("text", e.target.value)}
              rows={4}
              className="w-full rounded-[10px] border border-border-300 bg-bg-000 px-3 py-2 text-[13.5px] text-text-000 outline-none placeholder:text-text-400 focus:border-text-200 transition-colors resize-y"
            />
          </Field>
        )}

        <Field
          label="Params (JSON)"
          hint="Free-form params for this node. Per-type forms land in a follow-up."
        >
          <textarea
            value={paramsText}
            onChange={(e) => writeParamsRaw(e.target.value)}
            rows={8}
            spellCheck={false}
            className={cn(
              "w-full rounded-[10px] border bg-bg-000 px-3 py-2 text-[12.5px] text-text-000 outline-none focus:border-text-200 transition-colors font-mono resize-y",
              paramsErr ? "border-[#a63a2a]/60" : "border-border-300"
            )}
          />
          {paramsErr && (
            <div className="mt-1.5 text-[11.5px] text-[#a63a2a]">
              {paramsErr}
            </div>
          )}
        </Field>
      </div>

      <footer className="border-t border-border-200 px-4 py-3 flex items-center justify-between gap-2">
        <div className="text-[11px] text-text-400 font-mono truncate">
          {node.id}
        </div>
        {kind !== "start" && (
          <button
            type="button"
            onClick={() => onDelete(node.id)}
            className="text-[12.5px] text-[#a63a2a] hover:text-[#7a2a1a] transition-colors"
          >
            Delete node
          </button>
        )}
      </footer>
    </aside>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11.5px] tracking-[.04em] uppercase text-text-400 font-medium">
        {label}
      </span>
      {children}
      {hint && (
        <span className="text-[11px] text-text-400 leading-[1.45]">{hint}</span>
      )}
    </label>
  );
}
