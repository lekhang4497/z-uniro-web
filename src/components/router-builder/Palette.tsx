"use client";

import { CATALOG, CATEGORY_LABEL, TONE_CLASSES } from "./catalog";
import type { NodeCategory, NodeKind } from "./catalog";

// React Flow's drop handler reads this dataTransfer key. Kept in one
// constant so the producer (here) and the consumer (the canvas in the
// page) can't drift apart.
export const DRAG_TYPE = "application/uniro-node-kind";

const ORDER: NodeCategory[] = ["core", "tools", "logic", "data"];

export default function Palette() {
  return (
    <div className="h-full overflow-y-auto px-3 py-4 flex flex-col gap-5">
      {ORDER.map((cat) => {
        const items = CATALOG.filter((c) => c.category === cat);
        return (
          <section key={cat} className="flex flex-col gap-1">
            <div className="px-2 text-[10.5px] tracking-[.12em] uppercase text-text-400 font-medium">
              {CATEGORY_LABEL[cat]}
            </div>
            {items.map((entry) => {
              const Icon = entry.icon;
              const tone = TONE_CLASSES[entry.tone];
              return (
                <div
                  key={entry.kind}
                  draggable
                  onDragStart={(e) => onDragStart(e, entry.kind)}
                  className="flex items-center gap-2.5 rounded-[10px] px-2 py-1.5 cursor-grab active:cursor-grabbing hover:bg-bg-200 transition-colors select-none"
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-[9px] ${tone.swatch}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-[13.5px] text-text-000">
                    {entry.label}
                  </span>
                </div>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}

function onDragStart(e: React.DragEvent, kind: NodeKind) {
  e.dataTransfer.setData(DRAG_TYPE, kind);
  // Some browsers refuse to start the drag without an effectAllowed.
  e.dataTransfer.effectAllowed = "move";
}
