"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  BookOpen,
  Check,
  ChevronDown,
  Code2,
  Compass,
  Download,
  Folder,
  LayoutGrid,
  Mic,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
  ArrowLeftRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------- layout scaffolding ---------- */

function Spec({
  id,
  title,
  sub,
  children,
}: {
  id: string;
  title: string;
  sub?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-5 border-t border-border-200 pt-9 pb-5 mt-7 first:border-t-0 first:mt-0"
    >
      <header className="mb-[22px]">
        <div className="font-mono text-[10.5px] tracking-[.12em] uppercase text-text-400 mb-2">
          {id}
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-text-000 m-0 mb-1.5">
          {title}
        </h2>
        {sub && (
          <p className="text-[13.5px] text-text-400 leading-[1.55] m-0 max-w-[64ch]">
            {sub}
          </p>
        )}
      </header>
      <div className="flex flex-col overflow-hidden rounded-xl border border-border-200 bg-bg-000">
        {children}
      </div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[120px_1fr] items-start gap-5 px-[22px] py-[22px] border-t border-border-200 first:border-t-0 max-md:grid-cols-1">
      <div className="font-mono text-[10.5px] tracking-[.12em] uppercase text-text-400 pt-1.5">
        {label}
      </div>
      <div className="min-w-0 flex flex-col gap-3">{children}</div>
    </div>
  );
}

const DemoRow = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("flex flex-wrap gap-2 items-center", className)}>{children}</div>
);

/* ---------- 01 · Foundations ---------- */

const SWATCHES: [string, string][] = [
  ["--bg-100", "Canvas"],
  ["--bg-100", "Panel"],
  ["--bg-200", "Panel 2"],
  ["--bg-000", "Card"],
  ["--border-200", "Line"],
  ["--border-300", "Line 2"],
  ["--text-500", "Muted 2"],
  ["--text-400", "Muted"],
  ["--text-200", "Ink 2"],
  ["--text-000", "Ink"],
];

function Foundations() {
  return (
    <Spec
      id="01"
      title="Foundations"
      sub="Tokens — the palette is black, gray, white. Any accent comes from weight and spacing, not hue."
    >
      <Row label="palette">
        <div className="grid grid-cols-5 max-md:grid-cols-3 gap-2.5">
          {SWATCHES.map(([v, name], i) => (
            <div key={`${v}-${i}`} className="flex flex-col gap-1">
              <div
                className="h-14 rounded-lg border border-border-200"
                style={{ background: `var(${v})` }}
              />
              <div className="text-[12.5px] text-text-000">{name}</div>
              <div className="font-mono text-[10.5px] text-text-400">{v}</div>
            </div>
          ))}
        </div>
      </Row>

      <Row label="type">
        <div className="flex flex-col gap-3.5">
          {[
            ["30 / -.01", "A calm place to think.", "text-[30px] font-semibold tracking-tight"],
            ["22 / -.01", "Section heading", "text-[22px] font-semibold tracking-tight"],
            ["15 / 1.55", "Body — the default reading size inside messages and composers.", "text-[15px] leading-[1.55] text-text-000"],
            ["13 / 1.4", "Secondary — sidebar rows, topbar titles.", "text-[13px] text-text-200"],
            ["12 / .02", "Meta — captions, hints, helper text.", "text-[12px] text-text-400"],
            ["11 / .08", "Overline / section label", "text-[11px] tracking-[.08em] uppercase text-text-400"],
            ["mono 12", "jetbrains.mono — used for identifiers & tags", "font-mono text-[12px] text-text-400"],
          ].map(([size, body, cls], i) => (
            <div
              key={i}
              className="grid grid-cols-[96px_1fr] items-baseline gap-3.5 pb-3 border-b border-dashed border-border-200 last:border-0 last:pb-0"
            >
              <span className="font-mono text-[10.5px] text-text-400 tracking-[.02em]">
                {size}
              </span>
              <span className={cls}>{body}</span>
            </div>
          ))}
        </div>
      </Row>

      <Row label="radius">
        <div className="flex gap-4.5 flex-wrap">
          {[
            ["sm", 6, "chips"],
            ["md", 8, "buttons"],
            ["lg", 10, "inputs"],
            ["xl", 14, "menus"],
            ["2xl", 20, "composer"],
          ].map(([k, v, note]) => (
            <div key={k as string} className="flex flex-col gap-1.5 items-start">
              <div
                className="w-16 h-12 bg-bg-200 border border-border-200"
                style={{ borderRadius: `${v}px` }}
              />
              <div className="font-mono text-[11px] text-text-200">
                {k} · {v}px
              </div>
              <div className="text-[11px] text-text-400">{note}</div>
            </div>
          ))}
        </div>
      </Row>

      <Row label="elevation">
        <div className="grid grid-cols-3 max-md:grid-cols-1 gap-4.5">
          {[
            ["shadow-1 · chips, compact composer", "0 1px 2px rgba(0,0,0,.04)"],
            ["shadow-2 · composer, cards", "0 2px 8px rgba(0,0,0,.06)"],
            ["shadow-3 · menus, popovers", "0 24px 48px -16px rgba(0,0,0,.18), 0 2px 8px rgba(0,0,0,.06)"],
          ].map(([label, shadow]) => (
            <div key={label} className="flex flex-col gap-2">
              <div
                className="h-16 rounded-xl bg-bg-000 border border-border-200"
                style={{ boxShadow: shadow }}
              />
              <div className="font-mono text-[10.5px] text-text-400 tracking-[.02em]">
                {label}
              </div>
            </div>
          ))}
        </div>
      </Row>
    </Spec>
  );
}

/* ---------- 02 · Buttons ---------- */

const btnBase =
  "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] font-medium leading-none border border-transparent transition-colors disabled:opacity-45 disabled:cursor-not-allowed";
const btnSm = "px-2.5 py-1.5 text-[12px] rounded-[7px]";
const btnPrimary = "bg-text-000 text-bg-000 hover:bg-text-100";
const btnSecondary = "bg-bg-000 border-border-300 text-text-000 hover:border-text-200";
const btnGhost = "text-text-200 hover:bg-bg-200 hover:text-text-000";
const btnDanger = "bg-[#a63a2a] text-white hover:bg-[#8c3023]";
const btnDangerGhost = "text-[#a63a2a] hover:bg-[#a63a2a]/10";

const iconBtn =
  "inline-flex items-center justify-center w-[30px] h-[30px] rounded-lg text-text-200 hover:bg-bg-200 hover:text-text-000 transition-colors";

function Buttons() {
  return (
    <Spec
      id="02"
      title="Buttons"
      sub="All buttons are flat by default — background comes from hover, never decoration."
    >
      <Row label="primary">
        <DemoRow>
          <button className={cn(btnBase, btnPrimary)}>Continue</button>
          <button className={cn(btnBase, btnPrimary)} disabled>
            Disabled
          </button>
          <button className={cn(btnBase, btnSm, btnPrimary)}>Small</button>
        </DemoRow>
      </Row>
      <Row label="secondary">
        <DemoRow>
          <button className={cn(btnBase, btnSecondary)}>Cancel</button>
          <button className={cn(btnBase, btnSecondary)}>
            <Plus className="w-3.5 h-3.5" /> Add item
          </button>
          <button className={cn(btnBase, btnSm, btnSecondary)}>Small</button>
        </DemoRow>
      </Row>
      <Row label="ghost">
        <DemoRow>
          <button className={cn(btnBase, btnGhost)}>Ghost action</button>
          <button className={cn(btnBase, btnGhost)}>
            <Search className="w-3.5 h-3.5" /> Search
          </button>
          <button className={cn(btnBase, btnSm, btnGhost)}>Small</button>
        </DemoRow>
      </Row>
      <Row label="danger">
        <DemoRow>
          <button className={cn(btnBase, btnDanger)}>Delete chat</button>
          <button className={cn(btnBase, btnDangerGhost)}>Remove</button>
        </DemoRow>
      </Row>
      <Row label="icon">
        <DemoRow>
          <button className={iconBtn} title="New">
            <Plus className="w-4 h-4" />
          </button>
          <button className={iconBtn} title="Search">
            <Search className="w-4 h-4" />
          </button>
          <button className={iconBtn} title="Library">
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button className={iconBtn} title="Download">
            <Download className="w-4 h-4" />
          </button>
          <button
            className={cn(iconBtn, "bg-bg-200 text-text-000")}
            title="Active"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </DemoRow>
      </Row>
      <Row label="send">
        <DemoRow>
          <button
            className="inline-flex items-center justify-center h-8 w-8 rounded-xl bg-bg-300 text-text-300 hover:text-text-000 transition-colors"
            title="Voice"
          >
            <Mic className="w-4 h-4" />
          </button>
          <button
            className="inline-flex items-center justify-center h-8 w-8 rounded-xl bg-accent-000 text-accent-fg hover:bg-accent-100 shadow-sm transition-colors"
            title="Send"
          >
            <ArrowUp className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </DemoRow>
      </Row>
    </Spec>
  );
}

/* ---------- 03 · Inputs ---------- */

const inputBase =
  "w-full box-border bg-bg-000 border border-border-300 rounded-[10px] px-3 py-2.5 text-[14px] text-text-000 outline-none transition-colors focus:border-text-200 disabled:bg-bg-200 disabled:text-text-400";

const kbd =
  "font-mono text-[11px] text-text-400 border border-border-300 px-1.5 py-px rounded bg-bg-100";

function Inputs() {
  const [val, setVal] = useState("");
  const [search, setSearch] = useState("");
  return (
    <Spec
      id="03"
      title="Inputs"
      sub="Single border, quiet. Focus moves the border to ink-2 — no glow."
    >
      <Row label="text">
        <div className="grid grid-cols-2 max-md:grid-cols-1 gap-3.5">
          <label className="flex flex-col gap-1.5">
            <span className="text-[12.5px] text-text-200">Display name</span>
            <input
              className={inputBase}
              placeholder="Khang"
              value={val}
              onChange={(e) => setVal(e.target.value)}
            />
            <span className="text-[11.5px] text-text-400">Shown on your profile.</span>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[12.5px] text-text-200">
              Email <span className="text-[#a63a2a]">*</span>
            </span>
            <input className={inputBase} placeholder="you@studio.co" />
          </label>
        </div>
      </Row>

      <Row label="with icon">
        <div className="grid grid-cols-2 max-md:grid-cols-1 gap-3.5">
          <div className="flex items-center gap-2 bg-bg-000 border border-border-300 rounded-[10px] py-1.5 px-2.5 focus-within:border-text-200 transition-colors">
            <Search className="w-[15px] h-[15px] text-text-400 shrink-0" />
            <input
              className="flex-1 bg-transparent border-0 outline-none text-[14px] text-text-000 py-1 min-w-0"
              placeholder="Search chats, spaces…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="w-5 h-5 inline-flex items-center justify-center rounded text-text-400 hover:bg-bg-200 hover:text-text-000"
              >
                <X className="w-3 h-3" />
              </button>
            )}
            <span className={kbd}>⌘K</span>
          </div>

          <div className="flex items-center gap-2 bg-bg-000 border border-border-300 rounded-[10px] py-1.5 px-2.5 focus-within:border-text-200 transition-colors">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-000 text-accent-fg text-[12px] font-semibold shrink-0">
              K
            </div>
            <input
              className="flex-1 bg-transparent border-0 outline-none text-[14px] text-text-000 py-1 min-w-0"
              placeholder="Invite by email"
            />
            <button className={cn(btnBase, btnSm, btnSecondary, "mr-1")}>Invite</button>
          </div>
        </div>
      </Row>

      <Row label="textarea">
        <label className="flex flex-col gap-1.5">
          <span className="text-[12.5px] text-text-200">Custom instructions</span>
          <textarea
            rows={3}
            placeholder="Tell Uniro how to show up — tone, pacing, what to avoid."
            className={cn(
              inputBase,
              "resize-y min-h-16 font-[inherit] placeholder:text-text-400"
            )}
          />
          <span className="text-[11.5px] text-text-400">
            Applied to every new conversation.
          </span>
        </label>
      </Row>

      <Row label="states">
        <div className="grid grid-cols-2 max-md:grid-cols-1 gap-3.5">
          <label className="flex flex-col gap-1.5">
            <span className="text-[12.5px] text-text-200">Disabled</span>
            <input className={inputBase} defaultValue="read-only@studio.co" disabled />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[12.5px] text-text-200">Error</span>
            <input
              className={cn(inputBase, "border-[#a63a2a] focus:border-[#a63a2a]")}
              defaultValue="not-an-email"
            />
            <span className="text-[11.5px] text-[#a63a2a]">
              That doesn&apos;t look like an email.
            </span>
          </label>
        </div>
      </Row>
    </Spec>
  );
}

/* ---------- 04 · Controls ---------- */

function Toggle({ on, onClick }: { on: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative inline-block h-5 w-9 shrink-0 rounded-full transition-colors",
        on ? "bg-text-000" : "bg-bg-400"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform",
          on && "translate-x-4"
        )}
      />
    </button>
  );
}

function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { v: T; label: string }[];
}) {
  return (
    <div className="inline-flex gap-0.5 rounded-[9px] border border-border-200 bg-bg-200 p-0.5">
      {options.map((o) => (
        <button
          key={o.v}
          type="button"
          onClick={() => onChange(o.v)}
          className={cn(
            "px-3 py-1 rounded-[7px] text-[12.5px] transition-colors",
            value === o.v
              ? "bg-bg-000 text-text-000 shadow-sm"
              : "text-text-200 hover:text-text-000"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Controls() {
  const [on, setOn] = useState(true);
  const [seg, setSeg] = useState<"cozy" | "comfortable" | "roomy">("comfortable");
  const [radio, setRadio] = useState("time");
  const [checks, setChecks] = useState({ code: true, learn: false, write: true });
  const [slider, setSlider] = useState(62);

  const radioOpts: [string, string, string][] = [
    ["time", "Time of day", "Greets based on the clock."],
    ["plain", "Plain", "A single neutral line."],
    ["poetic", "Poetic", "A short, considered line."],
  ];

  return (
    <Spec
      id="04"
      title="Controls"
      sub="Toggles, segmented, radio, checkbox. Active state is always ink-on-card."
    >
      <Row label="toggle">
        <DemoRow className="gap-3">
          <Toggle on={on} onClick={() => setOn(!on)} />
          <span className="text-[12px] text-text-400">Adaptive thinking</span>
          <div className="w-6" />
          <Toggle on={false} />
          <span className="text-[12px] text-text-400">Off</span>
          <div className="w-6" />
          <Toggle on={true} />
          <span className="text-[12px] text-text-400">On</span>
        </DemoRow>
      </Row>

      <Row label="segmented">
        <DemoRow>
          <Segmented
            value={seg}
            onChange={setSeg}
            options={[
              { v: "cozy", label: "Cozy" },
              { v: "comfortable", label: "Comfortable" },
              { v: "roomy", label: "Roomy" },
            ]}
          />
        </DemoRow>
      </Row>

      <Row label="radio">
        <div className="flex flex-col gap-1.5">
          {radioOpts.map(([v, title, sub]) => {
            const active = radio === v;
            return (
              <button
                key={v}
                onClick={() => setRadio(v)}
                className={cn(
                  "flex items-start gap-3 rounded-[10px] border bg-bg-000 px-3.5 py-3 text-left transition-colors hover:border-text-200",
                  active ? "border-text-000" : "border-border-300"
                )}
              >
                <span
                  className={cn(
                    "relative mt-0.5 h-4 w-4 shrink-0 rounded-full border-[1.5px] bg-bg-000",
                    active ? "border-text-000" : "border-border-300"
                  )}
                >
                  {active && (
                    <span className="absolute inset-[3px] rounded-full bg-text-000" />
                  )}
                </span>
                <span className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-[13.5px] font-medium text-text-000">
                    {title}
                  </span>
                  <span className="text-[12px] text-text-400">{sub}</span>
                </span>
              </button>
            );
          })}
        </div>
      </Row>

      <Row label="checkbox">
        <div className="flex flex-col gap-2">
          {(["code", "learn", "write"] as const).map((k) => (
            <label
              key={k}
              className="inline-flex items-center gap-2.5 text-[13.5px] text-text-000 cursor-pointer"
            >
              <span
                className={cn(
                  "inline-flex h-4 w-4 items-center justify-center rounded border-[1.5px] transition-colors",
                  checks[k]
                    ? "bg-text-000 border-text-000 text-bg-000"
                    : "bg-bg-000 border-border-300 text-transparent"
                )}
              >
                {checks[k] && <Check className="w-3 h-3" strokeWidth={3} />}
              </span>
              <span>
                {k === "code" ? "Code help" : k === "learn" ? "Learning" : "Writing"}
              </span>
              <input
                type="checkbox"
                hidden
                checked={checks[k]}
                onChange={(e) => setChecks({ ...checks, [k]: e.target.checked })}
              />
            </label>
          ))}
        </div>
      </Row>

      <Row label="slider">
        <div className="flex items-center gap-3 w-full max-w-[420px]">
          <input
            type="range"
            min={0}
            max={100}
            value={slider}
            onChange={(e) => setSlider(+e.target.value)}
            className="flex-1 h-1 rounded appearance-none bg-bg-400 accent-text-000"
          />
          <span className="font-mono text-[12px] text-text-400">{slider}</span>
        </div>
      </Row>
    </Spec>
  );
}

/* ---------- 05 · Dropdown / Menu ---------- */

const MODELS = [
  { id: "Uniro 1.2", sub: "Most efficient for everyday tasks" },
  { id: "Uniro Pro", sub: "Balanced quality and speed" },
  { id: "Uniro Max", sub: "Highest quality, slower" },
];

function MenuDemo() {
  const [open, setOpen] = useState(false);
  const [model, setModel] = useState("Uniro Pro");
  const [adaptive, setAdaptive] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <Spec
      id="05"
      title="Dropdown & menu"
      sub="One menu style, used for model picker, overflow, context. Sits above with shadow-3."
    >
      <Row label="inline dropdown">
        <div className="relative inline-block">
          <select
            className="appearance-none bg-bg-000 border border-border-300 rounded-[10px] pl-3 pr-9 py-2.5 text-[14px] text-text-000 cursor-pointer min-w-[200px] hover:border-text-200 focus:border-text-200 outline-none"
            defaultValue=""
          >
            <option value="">Choose a space…</option>
            <option>Studio</option>
            <option>Personal</option>
            <option>Journal</option>
            <option>Side projects</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-400" />
        </div>
      </Row>

      <Row label="model menu">
        <div
          ref={ref}
          className="relative flex items-start border border-dashed border-border-300 rounded-[10px] bg-bg-100/50 p-6 min-h-[60px]"
        >
          <button
            onClick={() => setOpen((o) => !o)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] text-text-200 transition-colors",
              open
                ? "bg-black/5 dark:bg-white/10 text-text-000"
                : "hover:bg-black/5 dark:hover:bg-white/10 hover:text-text-000"
            )}
          >
            <span>{model}</span>
            <ChevronDown className="w-3 h-3" />
          </button>
          {open && (
            <div
              className="absolute z-20 w-[320px] p-1.5 mt-11 rounded-xl border border-border-300 bg-bg-000 shadow-[0_24px_48px_-16px_rgba(0,0,0,.18),0_2px_8px_rgba(0,0,0,.06)]"
              role="menu"
            >
              {MODELS.map((m, i) => (
                <div key={m.id}>
                  <button
                    onClick={() => {
                      setModel(m.id);
                      setOpen(false);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left hover:bg-bg-100"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-medium text-text-000 leading-tight">
                        {m.id}
                      </div>
                      <div className="text-[12px] text-text-400 mt-0.5 leading-[1.35]">
                        {m.sub}
                      </div>
                    </div>
                    {m.id === model && (
                      <Check className="w-4 h-4 text-text-000 shrink-0" />
                    )}
                  </button>
                  {i === 0 && <div className="h-px bg-border-200 my-1.5 mx-1" />}
                </div>
              ))}
              <div className="h-px bg-border-200 my-1.5 mx-1" />
              <button
                onClick={() => setAdaptive(!adaptive)}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left hover:bg-bg-100"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-medium text-text-000 leading-tight">
                    Adaptive thinking
                  </div>
                  <div className="text-[12px] text-text-400 mt-0.5 leading-[1.35]">
                    Thinks for more complex tasks
                  </div>
                </div>
                <Toggle on={adaptive} />
              </button>
              <div className="h-px bg-border-200 my-1.5 mx-1" />
              <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left hover:bg-bg-100">
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-medium text-text-000 leading-tight">
                    More models
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-text-400 -rotate-90" />
              </button>
            </div>
          )}
        </div>
      </Row>

      <Row label="overflow menu">
        <div className="flex items-start border border-dashed border-border-300 rounded-[10px] bg-bg-100/50 p-6">
          <div className="w-60 p-1.5 rounded-xl border border-border-300 bg-bg-000 shadow-[0_24px_48px_-16px_rgba(0,0,0,.18),0_2px_8px_rgba(0,0,0,.06)]">
            {[
              [<Pencil key="p" className="w-3.5 h-3.5 text-text-400" />, "Rename", "R"],
              [<Folder key="f" className="w-3.5 h-3.5 text-text-400" />, "Move to space", null],
              [<Download key="d" className="w-3.5 h-3.5 text-text-400" />, "Export", null],
            ].map(([ic, label, shortcut], i) => (
              <button
                key={i}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left hover:bg-bg-100"
              >
                {ic}
                <span className="flex-1 text-[13px] text-text-000">{label}</span>
                {shortcut && <span className={kbd}>{shortcut as string}</span>}
              </button>
            ))}
            <div className="h-px bg-border-200 my-1.5 mx-1" />
            <button className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left hover:bg-bg-100">
              <X className="w-3.5 h-3.5 text-[#a63a2a]" />
              <span className="flex-1 text-[13px] text-[#a63a2a]">Delete chat</span>
            </button>
          </div>
        </div>
      </Row>
    </Spec>
  );
}

/* ---------- 06 · List items ---------- */

function ListItems() {
  const [active, setActive] = useState("c2");
  const items = [
    { id: "c1", title: "Refactor the onboarding pricing table" },
    { id: "c2", title: "Draft release notes — v0.9 beta" },
    { id: "c3", title: "Compare postgres vs duckdb for logs" },
    { id: "c4", title: "Regex for parsing shipping labels" },
  ];

  return (
    <Spec
      id="06"
      title="Menu list & list items"
      sub="Flat, tight rows. Active is panel-2. Hover is panel-2 at 60%."
    >
      <Row label="sidebar rows">
        <div className="max-w-[320px] rounded-[10px] border border-border-200 bg-bg-100 p-2">
          <div className="text-[11px] tracking-[.08em] uppercase text-text-400 px-2.5 pb-1 pt-0.5">
            Today
          </div>
          {items.map((i) => (
            <button
              key={i.id}
              onClick={() => setActive(i.id)}
              className={cn(
                "w-full truncate text-left rounded-lg px-2.5 py-1.5 text-[13px] leading-snug transition-colors",
                active === i.id
                  ? "bg-[#efeeeb] dark:bg-[#1f1f1f] text-text-000"
                  : "text-text-200 hover:bg-bg-200 hover:text-text-000"
              )}
            >
              {i.title}
            </button>
          ))}
        </div>
      </Row>

      <Row label="nav rows">
        <div className="max-w-[320px] rounded-[10px] border border-border-200 bg-bg-100 p-2">
          {[
            [<Plus key="p" className="w-4 h-4" />, "New chat", "⌘N", true],
            [<Search key="s" className="w-4 h-4" />, "Search", "⌘K", false],
            [<LayoutGrid key="g" className="w-4 h-4" />, "Library", null, false],
            [<Folder key="f" className="w-4 h-4" />, "Spaces", null, false],
            [<SlidersHorizontal key="sl" className="w-4 h-4" />, "Tune", null, false],
          ].map(([ic, label, shortcut, primary], i) => (
            <button
              key={i}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition-colors hover:bg-bg-200 hover:text-text-000",
                primary ? "text-text-000" : "text-text-200"
              )}
            >
              {ic}
              <span className="flex-1 text-left">{label as string}</span>
              {shortcut && <span className={kbd}>{shortcut as string}</span>}
            </button>
          ))}
        </div>
      </Row>

      <Row label="detail rows">
        <div className="max-w-[540px] rounded-[10px] border border-border-200 bg-bg-000 px-4 py-1">
          {[
            ["Show timestamps", "Adds a subtle time next to each message.", true],
            ["Stream responses", "Type out replies as they come.", true],
            ["Send with Enter", "Shift+Enter for a new line.", false],
          ].map(([title, sub, on], i) => (
            <div
              key={title as string}
              className={cn(
                "grid grid-cols-[1fr_auto] items-center gap-4 py-3.5 border-t border-border-200",
                i === 0 && "border-t-0 pt-1"
              )}
            >
              <div>
                <div className="text-[13.5px] font-medium text-text-000 mb-0.5">
                  {title}
                </div>
                <div className="text-[12.5px] text-text-400">{sub}</div>
              </div>
              <Toggle on={on as boolean} />
            </div>
          ))}
        </div>
      </Row>
    </Spec>
  );
}

/* ---------- 07 · Chips, tags, badges ---------- */

function Chips() {
  const suggestions = [
    [<Code2 key="c" className="w-3.5 h-3.5" />, "Code"],
    [<BookOpen key="b" className="w-3.5 h-3.5" />, "Learn"],
    [<Pencil key="p" className="w-3.5 h-3.5" />, "Write"],
    [<Compass key="cp" className="w-3.5 h-3.5" />, "Plan"],
    [<Sparkles key="s" className="w-3.5 h-3.5" />, "Uniro's pick"],
  ];
  return (
    <Spec id="07" title="Chips, tags, badges" sub="Pill for filters, square-ish for tags. Always on card.">
      <Row label="suggestion">
        <DemoRow>
          {suggestions.map(([ic, label], i) => (
            <button
              key={i}
              className="inline-flex items-center gap-1.5 rounded-lg border-[0.5px] border-border-300 bg-bg-000 px-3 py-1.5 text-[12.5px] text-text-200 shadow-[0_1px_2px_rgba(0,0,0,.04)] hover:bg-bg-100 hover:text-text-000 transition-colors"
            >
              {ic}
              <span>{label as string}</span>
            </button>
          ))}
        </DemoRow>
      </Row>

      <Row label="filter pill">
        <DemoRow>
          {[
            ["All", false],
            ["Today", true],
            ["This week", false],
            ["Archived", false],
          ].map(([label, on]) => (
            <span
              key={label as string}
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-1 text-[12px] border cursor-pointer transition-colors",
                on
                  ? "bg-text-000 text-bg-000 border-text-000"
                  : "bg-bg-000 text-text-200 border-border-300 hover:border-text-200"
              )}
            >
              {label as string}
            </span>
          ))}
        </DemoRow>
      </Row>

      <Row label="tag">
        <DemoRow>
          {["research", "draft", "v0.9"].map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1.5 rounded-md border border-border-200 bg-bg-200 px-2 py-0.5 font-mono text-[11px] text-text-200"
            >
              {t}
            </span>
          ))}
          <span className="inline-flex items-center gap-1.5 rounded-md border border-border-200 bg-bg-200 pl-2 pr-1.5 py-0.5 font-mono text-[11px] text-text-200">
            flagged
            <X className="w-2.5 h-2.5 text-text-400 hover:text-text-000 cursor-pointer" />
          </span>
        </DemoRow>
      </Row>

      <Row label="badge">
        <DemoRow>
          <span className="rounded border border-border-200 bg-bg-200 px-1.5 py-px text-[10px] text-text-300 tracking-[.02em]">
            Beta
          </span>
          <span className="rounded border border-border-200 bg-bg-200 px-1.5 py-px text-[10px] text-text-300 tracking-[.02em]">
            New
          </span>
          <span className="rounded border border-border-200 bg-text-000 text-bg-000 px-1.5 py-px text-[10px] tracking-[.02em]">
            Pro
          </span>
          <span className={kbd}>⌘K</span>
          <span className={kbd}>Enter</span>
          <span className={kbd}>↑</span>
        </DemoRow>
      </Row>

      <Row label="status">
        <DemoRow>
          {[
            ["Streaming", "bg-text-000 shadow-[0_0_0_3px_rgba(10,10,9,.15)] dark:shadow-[0_0_0_3px_rgba(255,255,255,.12)]"],
            ["Idle", "bg-text-400 shadow-[0_0_0_3px_color-mix(in_oklab,var(--text-400)_15%,transparent)]"],
            ["Rate-limited", "bg-[#c98b2b] shadow-[0_0_0_3px_rgba(201,139,43,.18)]"],
            ["Offline", "bg-text-500 shadow-[0_0_0_3px_color-mix(in_oklab,var(--text-500)_15%,transparent)]"],
          ].map(([label, cls]) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 text-[12px] text-text-200"
            >
              <span className={cn("h-[7px] w-[7px] rounded-full", cls)} />
              {label}
            </span>
          ))}
        </DemoRow>
      </Row>
    </Spec>
  );
}

/* ---------- 08 · Avatars & user card ---------- */

function Avatars() {
  return (
    <Spec id="08" title="Avatars & user card">
      <Row label="avatar">
        <DemoRow>
          {[
            { size: 22, font: 10 },
            { size: 30, font: 12 },
            { size: 36, font: 14 },
            { size: 48, font: 18 },
          ].map((a, i) => (
            <div
              key={i}
              className="inline-flex items-center justify-center rounded-full bg-accent-000 text-accent-fg font-semibold"
              style={{ width: a.size, height: a.size, fontSize: a.font }}
            >
              K
            </div>
          ))}
          <div
            className="inline-flex items-center justify-center rounded-full bg-bg-200 text-text-200 font-semibold border border-border-300"
            style={{ width: 36, height: 36, fontSize: 14 }}
          >
            MT
          </div>
          <div
            className="inline-flex items-center justify-center rounded-full bg-bg-000 text-text-200 font-semibold border border-border-300"
            style={{ width: 36, height: 36, fontSize: 14 }}
          >
            +3
          </div>
        </DemoRow>
      </Row>

      <Row label="user card">
        <div className="max-w-[280px] rounded-xl border border-border-200 bg-bg-100 p-2">
          <button className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-bg-200">
            <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-accent-000 text-accent-fg text-[12px] font-semibold shrink-0">
              K
            </div>
            <div className="flex-1 min-w-0 leading-tight">
              <div className="text-[13px] font-medium text-text-000 truncate">Khang</div>
              <div className="text-[11px] text-text-400 truncate">Studio · Pro</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-text-400 shrink-0" />
          </button>
        </div>
      </Row>
    </Spec>
  );
}

/* ---------- 09 · Message bubbles ---------- */

function Bubbles() {
  const bubbleFrame =
    "rounded-xl border border-dashed border-border-300 bg-bg-100 px-5 py-[18px] max-w-[640px]";

  return (
    <Spec
      id="09"
      title="Message bubbles"
      sub="The chat stream — user bubble on the right, assistant free-flowing on the left."
    >
      <Row label="user">
        <div className={bubbleFrame}>
          <div className="flex justify-end">
            <div className="user-bubble max-w-[80%] rounded-[14px_14px_4px_14px] px-3.5 py-2.5 text-[15px] leading-[1.65] text-text-000">
              How would you compare postgres and duckdb for log analytics?
            </div>
          </div>
        </div>
      </Row>

      <Row label="assistant">
        <div className={bubbleFrame}>
          <div className="text-[15px] leading-[1.7] text-text-000">
            <p className="m-0 mb-2.5">
              Short answer — <strong>DuckDB</strong> for interactive analytics on flat
              log files, <strong>Postgres</strong> if you need concurrent writes or
              row-level guarantees.
            </p>
            <ul className="m-0 pl-5 list-disc">
              <li className="mb-1.5">Ingest rate: Postgres ~10–30k rows/s single-node.</li>
              <li>Query shape: aggregates over columnar data — DuckDB wins 5–40×.</li>
            </ul>
          </div>
        </div>
      </Row>

      <Row label="streaming">
        <div className={bubbleFrame}>
          <p className="m-0 text-[15px] leading-[1.7] text-text-000">
            Drafting the release notes now
            <span className="inline-block ml-0.5 h-3.5 w-[7px] bg-text-000 align-[-2px] animate-[blink_.9s_steps(2)_infinite]" />
          </p>
        </div>
      </Row>

      <Row label="code">
        <div className={bubbleFrame}>
          <pre className="m-0 overflow-auto rounded-[10px] border border-border-200 bg-bg-200/60 px-3.5 py-3 text-[12.5px] text-text-000 font-mono border-l-2 border-l-text-000">
            <code>{`^(?:FX|UPS|DHL)-(?<id>[A-Z0-9]{8,12})\\s+(?<zip>\\d{5})$`}</code>
          </pre>
        </div>
      </Row>
    </Spec>
  );
}

/* ---------- 10 · Composer ---------- */

function ComposerDemo({ compact }: { compact?: boolean }) {
  const [val, setVal] = useState(compact ? "" : "Draft release notes for v0.9 beta");
  const active = !!val.trim();
  return (
    <div
      className={cn(
        "rounded-[20px] border border-border-300 bg-bg-000 transition-colors",
        compact ? "shadow-[0_1px_2px_rgba(0,0,0,.04)]" : "shadow-[0_2px_8px_rgba(0,0,0,.06)]"
      )}
    >
      <div className={compact ? "px-3.5 pt-2.5 pb-1" : "px-4 pt-3.5 pb-1.5"}>
        <textarea
          rows={compact ? 1 : 2}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder={compact ? "Reply…" : "Ask Uniro anything…"}
          className="w-full resize-none border-0 outline-none bg-transparent text-[15px] leading-[1.55] text-text-000 placeholder:text-text-400 min-h-[24px] max-h-[200px]"
        />
      </div>
      <div className="flex items-center justify-between px-2.5 pb-2.5 pt-1.5">
        <button className={iconBtn} title="Attach">
          <Plus className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-1">
          <button className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] text-text-200 hover:bg-black/5 dark:hover:bg-white/10 hover:text-text-000 transition-colors">
            <span>Uniro Pro</span>
            <ChevronDown className="w-3 h-3" />
          </button>
          {active ? (
            <button
              className="inline-flex items-center justify-center h-8 w-8 rounded-xl bg-accent-000 text-accent-fg hover:bg-accent-100 shadow-sm"
              title="Send"
            >
              <ArrowUp className="w-4 h-4" strokeWidth={2.5} />
            </button>
          ) : (
            <button
              className="inline-flex items-center justify-center h-8 w-8 rounded-xl text-text-300 hover:bg-bg-300 hover:text-text-000 transition-colors"
              title="Voice"
            >
              <Mic className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Composer() {
  return (
    <Spec
      id="10"
      title="Composer"
      sub="The primary input surface — grows to content, model picker nested, send goes ink when ready."
    >
      <Row label="default">
        <div className="max-w-[640px]">
          <ComposerDemo />
        </div>
      </Row>
      <Row label="compact">
        <div className="max-w-[640px]">
          <ComposerDemo compact />
        </div>
      </Row>
    </Spec>
  );
}

/* ---------- 11 · Overlays ---------- */

function Overlays() {
  const [toast, setToast] = useState(false);
  const [dialog, setDialog] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(false), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <Spec id="11" title="Overlays" sub="Tooltips, toasts, and dialogs — inherit card + shadow-3.">
      <Row label="tooltip">
        <DemoRow className="gap-8">
          <div className="relative inline-block group">
            <button className={iconBtn}>
              <Search className="w-4 h-4" />
            </button>
            <span className="pointer-events-none absolute left-1/2 top-full -translate-x-1/2 mt-2 whitespace-nowrap rounded-md bg-text-000 text-bg-000 px-2 py-1 text-[12px] opacity-0 group-hover:opacity-100 transition-opacity">
              Search chats <span className="font-mono opacity-60">⌘K</span>
            </span>
          </div>
          <div className="relative inline-block group">
            <button className={iconBtn}>
              <Download className="w-4 h-4" />
            </button>
            <span className="pointer-events-none absolute left-1/2 bottom-full -translate-x-1/2 mb-2 whitespace-nowrap rounded-md bg-text-000 text-bg-000 px-2 py-1 text-[12px] opacity-0 group-hover:opacity-100 transition-opacity">
              Export transcript
            </span>
          </div>
        </DemoRow>
      </Row>

      <Row label="toast">
        <DemoRow>
          <button
            className={cn(btnBase, btnSecondary)}
            onClick={() => setToast(true)}
          >
            Trigger toast
          </button>
          <div
            className={cn(
              "inline-flex items-center gap-2.5 rounded-[10px] bg-text-000 text-bg-000 px-3 py-2 text-[13px] shadow-[0_12px_24px_-8px_rgba(0,0,0,.25)] transition-[opacity,transform] duration-200",
              toast
                ? "opacity-100 translate-y-0 pointer-events-auto"
                : "opacity-0 translate-y-1.5 pointer-events-none"
            )}
          >
            <Check className="w-3.5 h-3.5" />
            <span>Saved — release-notes.md</span>
            <button className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded text-text-500 hover:bg-white/10 hover:text-bg-000">
              <X className="w-3 h-3" />
            </button>
          </div>
        </DemoRow>
      </Row>

      <Row label="dialog">
        <DemoRow>
          <button
            className={cn(btnBase, btnSecondary)}
            onClick={() => setDialog(true)}
          >
            Open dialog
          </button>
        </DemoRow>
        {dialog && (
          <div className="fixed inset-0 z-40 grid place-items-center">
            <div
              className="absolute inset-0 bg-black/35"
              onClick={() => setDialog(false)}
            />
            <div className="relative w-[min(440px,calc(100%-32px))] rounded-[14px] border border-border-300 bg-bg-000 p-5 shadow-[0_24px_48px_-16px_rgba(0,0,0,.25),0_2px_8px_rgba(0,0,0,.08)]">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[17px] font-semibold text-text-000">
                  Delete this chat?
                </span>
                <button className={iconBtn} onClick={() => setDialog(false)}>
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="m-0 mb-4 text-[14px] text-text-200 leading-[1.55]">
                &ldquo;Refactor the onboarding pricing table&rdquo; and its history will
                be removed. This can&apos;t be undone.
              </p>
              <div className="flex justify-end gap-1.5">
                <button
                  className={cn(btnBase, btnGhost)}
                  onClick={() => setDialog(false)}
                >
                  Cancel
                </button>
                <button
                  className={cn(btnBase, btnDanger)}
                  onClick={() => setDialog(false)}
                >
                  Delete chat
                </button>
              </div>
            </div>
          </div>
        )}
      </Row>
    </Spec>
  );
}

/* ---------- 12 · Navigation ---------- */

function Navigation() {
  const [tab, setTab] = useState("general");
  const tabs: [string, string, boolean?][] = [
    ["general", "General"],
    ["models", "Models"],
    ["appearance", "Appearance"],
    ["data", "Data"],
    ["billing", "Billing", true],
  ];

  return (
    <Spec id="12" title="Navigation">
      <Row label="topbar">
        <div className="rounded-[10px] border border-border-200 overflow-hidden bg-bg-100">
          <header className="flex h-[52px] items-center justify-between px-5">
            <div className="flex items-center gap-2.5 min-w-0 text-[13px] text-text-200">
              <span className="font-mono text-[12px] text-text-400 tracking-[.02em]">chat</span>
              <span className="text-text-500">/</span>
              <span className="text-text-000 font-medium truncate">
                Draft release notes — v0.9 beta
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12.5px] text-text-200 hover:bg-bg-200 hover:text-text-000 transition-colors">
                <Download className="w-3.5 h-3.5" /> Export
              </button>
              <button className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12.5px] text-text-200 hover:bg-bg-200 hover:text-text-000 transition-colors">
                <ArrowLeftRight className="w-3.5 h-3.5" /> Share
              </button>
            </div>
          </header>
        </div>
      </Row>

      <Row label="tabs">
        <div className="flex gap-0.5 border-b border-border-200">
          {tabs.map(([k, label, isNew]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={cn(
                "px-3.5 py-2.5 text-[13px] border-b-2 -mb-px transition-colors",
                tab === k
                  ? "text-text-000 border-text-000"
                  : "text-text-400 border-transparent hover:text-text-000"
              )}
            >
              {label}
              {isNew && (
                <span className="ml-1.5 rounded border border-border-200 bg-bg-200 px-1.5 py-px text-[10px] text-text-300">
                  New
                </span>
              )}
            </button>
          ))}
        </div>
      </Row>

      <Row label="breadcrumb">
        <div className="inline-flex items-center gap-1.5 font-mono text-[11.5px] text-text-400 tracking-[.02em]">
          <span>workspace</span>
          <span className="text-text-500">/</span>
          <span>studio</span>
          <span className="text-text-500">/</span>
          <span className="text-text-000">release-notes</span>
        </div>
      </Row>
    </Spec>
  );
}

/* ---------- 13 · Loaders ---------- */

function Loaders() {
  return (
    <Spec id="13" title="Loaders">
      <Row label="skeleton">
        <div className="flex flex-col gap-2.5 max-w-[420px]">
          {[40, 88, 74, 60].map((w) => (
            <div
              key={w}
              className="h-3 rounded-md animate-[shimmer_1.4s_ease-in-out_infinite] bg-[linear-gradient(90deg,var(--bg-200)_0%,color-mix(in_oklab,var(--bg-200)_50%,var(--bg-000))_50%,var(--bg-200)_100%)] bg-[length:200%_100%]"
              style={{ width: `${w}%` }}
            />
          ))}
        </div>
      </Row>

      <Row label="typing">
        <div className="inline-flex items-center gap-1 rounded-[10px] bg-bg-200 px-2.5 py-2">
          {[0, 0.15, 0.3].map((d) => (
            <span
              key={d}
              className="h-1.5 w-1.5 rounded-full bg-text-400"
              style={{ animation: "typing-dot 1.2s ease-in-out infinite", animationDelay: `${d}s` }}
            />
          ))}
        </div>
      </Row>

      <Row label="spinner">
        <DemoRow>
          <div className="h-3.5 w-3.5 rounded-full border-[1.5px] border-border-300 border-t-text-000 animate-spin" />
          <span className="font-mono text-[12px] text-text-400">Thinking…</span>
        </DemoRow>
      </Row>

      <Row label="progress">
        <div className="h-1 w-full max-w-[420px] overflow-hidden rounded bg-bg-400">
          <div className="h-full rounded bg-text-000" style={{ width: "62%" }} />
        </div>
      </Row>
    </Spec>
  );
}

/* ---------- 14 · Empty state ---------- */

function EmptyState() {
  return (
    <Spec id="14" title="Empty state">
      <Row label="empty">
        <div className="rounded-xl border border-dashed border-border-300 bg-bg-100/60 px-6 py-10 text-center">
          <div className="mx-auto mb-3 inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-border-200 bg-bg-000 text-text-300">
            <Folder className="w-[18px] h-[18px]" />
          </div>
          <div className="text-[14px] font-medium text-text-000 mb-1">No spaces yet</div>
          <div className="text-[13px] text-text-400 max-w-[46ch] mx-auto leading-[1.5]">
            Spaces hold related chats together — research, a project, or a recurring
            thread. Make your first one to get organized.
          </div>
          <div className="mt-4 flex justify-center gap-2">
            <button className={cn(btnBase, btnSecondary)}>
              <Plus className="w-3.5 h-3.5" /> New space
            </button>
            <button className={cn(btnBase, btnGhost)}>Learn more</button>
          </div>
        </div>
      </Row>
    </Spec>
  );
}

/* ---------- page shell ---------- */

const SECTIONS: [string, string][] = [
  ["01", "Foundations"],
  ["02", "Buttons"],
  ["03", "Inputs"],
  ["04", "Controls"],
  ["05", "Dropdown & menu"],
  ["06", "List items"],
  ["07", "Chips & badges"],
  ["08", "Avatars"],
  ["09", "Message bubbles"],
  ["10", "Composer"],
  ["11", "Overlays"],
  ["12", "Navigation"],
  ["13", "Loaders"],
  ["14", "Empty state"],
];

function Toc({ active }: { active: string }) {
  return (
    <nav className="sticky top-0 self-start h-screen overflow-auto px-[18px] py-[22px] border-r border-border-200 bg-bg-100 flex flex-col gap-3.5 max-md:static max-md:h-auto max-md:border-r-0 max-md:border-b">
      <div className="flex items-center gap-2.5">
        <div className="flex h-5 w-5 items-center justify-center rounded-md bg-text-000 text-bg-000 text-[11px] font-semibold">
          U
        </div>
        <span className="text-[18px] font-semibold tracking-tight text-text-000">
          Uniro
        </span>
      </div>
      <div className="font-mono text-[10.5px] tracking-[.12em] uppercase text-text-400 px-2">
        Components
      </div>
      <div className="flex flex-col gap-px">
        {SECTIONS.map(([id, title]) => (
          <a
            key={id}
            href={`#${id}`}
            className={cn(
              "grid grid-cols-[26px_1fr] items-center gap-1 rounded-[7px] px-2 py-1.5 text-[13px] no-underline transition-colors",
              active === id
                ? "bg-bg-200 text-text-000 font-medium"
                : "text-text-200 hover:bg-bg-200 hover:text-text-000"
            )}
          >
            <span
              className={cn(
                "font-mono text-[11px]",
                active === id ? "text-text-200" : "text-text-400"
              )}
            >
              {id}
            </span>
            <span>{title}</span>
          </a>
        ))}
      </div>
      <div className="mt-auto border-t border-dashed border-border-200 pt-2.5 px-2 font-mono text-[10px] tracking-[.04em] text-text-400">
        v0.9 · black / gray / white
      </div>
    </nav>
  );
}

export default function ComponentsPage() {
  const [active, setActive] = useState("01");

  useEffect(() => {
    const opts = { rootMargin: "-20% 0px -70% 0px", threshold: 0 };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) setActive(e.target.id);
      });
    }, opts);
    SECTIONS.forEach(([id]) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  return (
    <div className="grid grid-cols-[240px_1fr] min-h-screen bg-bg-100 text-text-000 max-md:grid-cols-1">
      <Toc active={active} />
      <main className="px-14 py-12 pb-32 max-w-[980px] w-full box-border max-md:px-5 max-md:py-8 max-md:pb-20">
        <header className="mb-10">
          <div className="font-mono text-[11px] tracking-[.12em] uppercase text-text-400 mb-2.5">
            Uniro · design system
          </div>
          <h1 className="text-[44px] font-semibold tracking-tight leading-[1.05] m-0 mb-3 text-text-000">
            Components
          </h1>
          <p className="text-[15px] text-text-200 max-w-[60ch] leading-[1.55] m-0">
            A specimen sheet of the atoms used across Uniro. Adjust anything here —
            styles propagate to every page that imports the shared tokens.
          </p>
        </header>

        <Foundations />
        <Buttons />
        <Inputs />
        <Controls />
        <MenuDemo />
        <ListItems />
        <Chips />
        <Avatars />
        <Bubbles />
        <Composer />
        <Overlays />
        <Navigation />
        <Loaders />
        <EmptyState />

        <footer className="mt-20 border-t border-dashed border-border-200 pt-5 font-mono text-[11px] tracking-[.04em] text-text-400">
          End of sheet · {SECTIONS.length} sections
        </footer>
      </main>
    </div>
  );
}
