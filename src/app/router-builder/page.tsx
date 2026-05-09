"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Hand,
  MoreHorizontal,
  MousePointer2,
  Play,
  Redo2,
  Settings,
  Undo2,
} from "lucide-react";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import {
  CATALOG_BY_KIND,
  FLOW_NODE_TYPE,
  START_NODE_KIND,
  type NodeKind,
} from "@/components/router-builder/catalog";
import UniroNode, {
  type UniroNodeData,
} from "@/components/router-builder/UniroNode";
import Palette, { DRAG_TYPE } from "@/components/router-builder/Palette";
import PropertiesPanel from "@/components/router-builder/PropertiesPanel";
import { cn } from "@/lib/utils";

const NODE_TYPES = { [FLOW_NODE_TYPE]: UniroNode };

const SEED_NODES: Node<UniroNodeData>[] = [
  {
    id: "start",
    type: FLOW_NODE_TYPE,
    position: { x: 80, y: 220 },
    data: { kind: START_NODE_KIND, variant: "start" },
    deletable: false,
  },
];

export default function RouterBuilderPage() {
  // ReactFlow's pan/zoom utilities are only available inside a
  // <ReactFlowProvider>; the inner component uses useReactFlow().
  return (
    <ReactFlowProvider>
      <Builder />
    </ReactFlowProvider>
  );
}

function Builder() {
  const [title, setTitle] = useState("New agent");
  const [nodes, setNodes] = useState<Node<UniroNodeData>[]>(SEED_NODES);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tool, setTool] = useState<"select" | "pan">("select");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const flow = useReactFlow();
  // Monotonically increasing id source. Crypto.randomUUID would also
  // work, but a short numeric tail keeps node ids readable in devtools.
  const nextIdRef = useRef(1);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((ns) => applyNodeChanges(changes, ns) as Node<UniroNodeData>[]),
    []
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((es) => applyEdgeChanges(changes, es)),
    []
  );
  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((es) => addEdge({ ...params, animated: false }, es)),
    []
  );

  const onSelectionChange = useCallback(
    ({ nodes: sel }: { nodes: Node[] }) => {
      setSelectedId(sel.length === 1 ? sel[0].id : null);
    },
    []
  );

  // ---------- drag from palette → drop on canvas ----------
  const onDragOver = useCallback((e: React.DragEvent) => {
    if (e.dataTransfer.types.includes(DRAG_TYPE)) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    }
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      const kind = e.dataTransfer.getData(DRAG_TYPE) as NodeKind;
      if (!kind) return;
      const entry = CATALOG_BY_KIND[kind];
      if (!entry) return;
      e.preventDefault();

      // Convert the screen-space drop position to flow coordinates so
      // the new node lands exactly under the cursor regardless of zoom
      // or pan.
      const position = flow.screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      });

      const id = `n-${nextIdRef.current++}`;
      const variant: UniroNodeData["variant"] =
        kind === "note" ? "note" : "default";
      const node: Node<UniroNodeData> = {
        id,
        type: FLOW_NODE_TYPE,
        position,
        data: {
          kind,
          variant,
          name: "",
          params: { ...entry.defaults },
        },
      };
      setNodes((ns) => [...ns, node]);
    },
    [flow]
  );

  // ---------- properties panel writes ----------
  const onNodePatch = useCallback(
    (id: string, patch: Partial<UniroNodeData>) => {
      setNodes((ns) =>
        ns.map((n) =>
          n.id === id ? { ...n, data: { ...n.data, ...patch } } : n
        )
      );
    },
    []
  );

  const onNodeDelete = useCallback((id: string) => {
    setNodes((ns) => ns.filter((n) => n.id !== id));
    setEdges((es) => es.filter((e) => e.source !== id && e.target !== id));
    setSelectedId(null);
  }, []);

  const selectedNode = useMemo(
    () => (selectedId ? nodes.find((n) => n.id === selectedId) ?? null : null),
    [nodes, selectedId]
  );

  return (
    <div className="flex h-screen flex-col bg-[#f6f5f1] dark:bg-[#181816]">
      {/* ---------- top header ---------- */}
      <header className="flex h-14 items-center justify-between gap-3 px-4 border-b border-border-200 bg-bg-000">
        <div className="flex items-center gap-2 min-w-0">
          <Link
            href="/chat"
            aria-label="Back"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-text-300 hover:bg-bg-200 hover:text-text-000 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-transparent outline-none text-[18px] font-semibold tracking-tight text-text-000 min-w-0 max-w-[280px] truncate focus:bg-bg-100 rounded px-1.5 -mx-1.5"
          />
          <span className="ml-1 inline-flex items-center rounded-md border border-border-300 bg-bg-100 px-1.5 py-0.5 text-[10.5px] tracking-[.06em] uppercase text-text-300">
            Draft
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label="More"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-text-400 hover:bg-bg-200 hover:text-text-000 transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          <button
            type="button"
            aria-label="Settings"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-text-400 hover:bg-bg-200 hover:text-text-000 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-1.5 rounded-lg px-3 h-8 text-[12.5px] text-text-400 cursor-not-allowed"
            title="Evaluate (coming soon)"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Evaluate</span>
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border-300 bg-bg-000 px-3 h-8 text-[12.5px] text-text-200 hover:text-text-000 hover:bg-bg-100 transition-colors"
            title="View as code (coming soon)"
          >
            <span className="font-mono">{"</>"}</span>
            <span>Code</span>
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg bg-text-000 hover:bg-text-100 text-bg-000 px-4 h-8 text-[12.5px] font-medium transition-colors"
          >
            Publish
          </button>
        </div>
      </header>

      {/* ---------- main: palette | canvas | properties ---------- */}
      <div className="flex flex-1 min-h-0">
        <aside className="hidden md:flex w-[200px] shrink-0 border-r border-border-200 bg-bg-000 flex-col">
          <Palette />
        </aside>

        <div
          ref={wrapperRef}
          className="relative flex-1 min-w-0"
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={NODE_TYPES}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onSelectionChange={onSelectionChange}
            panOnDrag={tool === "pan"}
            selectionOnDrag={tool === "select"}
            fitView
            fitViewOptions={{ padding: 0.25 }}
            proOptions={{ hideAttribution: true }}
            defaultEdgeOptions={{
              type: "smoothstep",
              style: { stroke: "var(--color-border-300)", strokeWidth: 1.5 },
            }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1}
              color="var(--color-border-200)"
            />
            <Controls
              showInteractive={false}
              className="!bottom-20 !left-4 !shadow-none [&_button]:!bg-bg-000 [&_button]:!border-border-200 [&_button]:!text-text-300"
            />
            <MiniMap
              pannable
              zoomable
              className="!bg-bg-100 !border !border-border-200 hidden lg:block"
              nodeColor="var(--color-bg-300)"
              maskColor="rgba(0,0,0,0.05)"
            />
          </ReactFlow>

          {/* ---------- floating bottom toolbar ---------- */}
          <div className="absolute left-1/2 bottom-5 -translate-x-1/2 flex items-center gap-0.5 rounded-full border border-border-200 bg-bg-000 px-1.5 py-1 shadow-[0_4px_16px_-4px_rgba(0,0,0,.12)]">
            <ToolbarButton
              active={tool === "pan"}
              onClick={() => setTool("pan")}
              icon={<Hand className="w-4 h-4" />}
              label="Pan"
            />
            <ToolbarButton
              active={tool === "select"}
              onClick={() => setTool("select")}
              icon={<MousePointer2 className="w-4 h-4" />}
              label="Select"
            />
            <span className="w-px h-5 bg-border-200 mx-1" />
            <ToolbarButton
              onClick={() => {
                /* undo: wired to keyboard via React Flow defaults; full
                   history stack is a follow-up. */
              }}
              icon={<Undo2 className="w-4 h-4" />}
              label="Undo"
              disabled
            />
            <ToolbarButton
              onClick={() => {
                /* redo: same as above */
              }}
              icon={<Redo2 className="w-4 h-4" />}
              label="Redo"
              disabled
            />
          </div>
        </div>

        {selectedNode && (
          <PropertiesPanel
            node={selectedNode}
            onClose={() => setSelectedId(null)}
            onChange={onNodePatch}
            onDelete={onNodeDelete}
          />
        )}
      </div>
    </div>
  );
}

function ToolbarButton({
  active,
  onClick,
  icon,
  label,
  disabled,
}: {
  active?: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors",
        active
          ? "bg-text-000 text-bg-000"
          : "text-text-300 hover:bg-bg-200 hover:text-text-000",
        disabled && "opacity-40 cursor-not-allowed hover:bg-transparent hover:text-text-300"
      )}
    >
      {icon}
    </button>
  );
}
