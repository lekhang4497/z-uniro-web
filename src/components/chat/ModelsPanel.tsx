"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Cpu,
  Download,
  HardDrive,
  Loader2,
  RefreshCw,
  Trash2,
  Zap,
} from "lucide-react";
import type {
  OllamaModelEntry,
  OllamaStatus,
  PullProgressEvent,
  SystemInfo,
} from "@/types/electron";
import { CATALOG, ramFit, type CatalogModel, type FitVerdict } from "@/lib/ollama-catalog";
import { cn } from "@/lib/utils";

function formatGB(bytes: number): string {
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
}

function FitPill({ verdict }: { verdict: FitVerdict }) {
  const cls = {
    fits: "bg-[#4aa86f]/10 text-[#4aa86f] border-[#4aa86f]/30",
    tight: "bg-[#c98b2b]/10 text-[#c98b2b] border-[#c98b2b]/30",
    no: "bg-[#a63a2a]/10 text-[#a63a2a] border-[#a63a2a]/30",
  }[verdict];
  const label = {
    fits: "Fits well",
    tight: "Will run, slow",
    no: "Not enough memory",
  }[verdict];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md border px-1.5 py-px text-[10.5px] font-medium", cls)}>
      {label}
    </span>
  );
}

function StatusDot({
  state,
}: {
  state: "ok" | "warn" | "fail" | "idle";
}) {
  const cls = {
    ok: "bg-[#4aa86f] shadow-[0_0_0_3px_rgba(74,168,111,.18)]",
    warn: "bg-[#c98b2b] shadow-[0_0_0_3px_rgba(201,139,43,.18)]",
    fail: "bg-[#a63a2a] shadow-[0_0_0_3px_rgba(166,58,42,.18)]",
    idle: "bg-text-400 shadow-[0_0_0_3px_color-mix(in_oklab,var(--text-400)_15%,transparent)]",
  }[state];
  return <span className={cn("inline-block h-[7px] w-[7px] rounded-full", cls)} />;
}

export default function ModelsPanel() {
  const isDesktop = typeof window !== "undefined" && !!window.uniro?.isDesktop;
  const [system, setSystem] = useState<SystemInfo | null>(null);
  const [status, setStatus] = useState<OllamaStatus | null>(null);
  const [installed, setInstalled] = useState<OllamaModelEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeName, setActiveName] = useState<string | null>(null);
  const [progress, setProgress] = useState<Record<string, PullProgressEvent>>({});
  const [customName, setCustomName] = useState("");

  const refresh = useCallback(async () => {
    if (!window.uniro) return;
    setLoading(true);
    setError(null);
    try {
      const [sys, st, list] = await Promise.all([
        window.uniro.models.system(),
        window.uniro.models.ollama.status(),
        window.uniro.models.ollama.list(),
      ]);
      setSystem(sys);
      setStatus(st);
      setInstalled(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isDesktop) return;
    refresh();
    const off = window.uniro!.models.ollama.onPullProgress((e) => {
      setProgress((prev) => ({ ...prev, [e.model]: e }));
    });
    return () => {
      off();
    };
  }, [isDesktop, refresh]);

  const installedNames = useMemo(
    () => new Set(installed.map((m) => m.name)),
    [installed]
  );

  const doPull = async (name: string) => {
    if (!window.uniro) return;
    setActiveName(name);
    setError(null);
    try {
      const res = await window.uniro.models.ollama.pull(name);
      if (!res.ok) setError(res.error || `Failed to pull ${name}`);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setActiveName(null);
      setProgress((prev) => {
        const { [name]: _omit, ...rest } = prev;
        void _omit;
        return rest;
      });
    }
  };

  const doRemove = async (name: string) => {
    if (!window.uniro) return;
    setActiveName(name);
    setError(null);
    try {
      const res = await window.uniro.models.ollama.remove(name);
      if (!res.ok) setError(res.error || `Failed to remove ${name}`);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setActiveName(null);
    }
  };

  if (!isDesktop) {
    return (
      <div>
        <h2 className="text-[17px] font-semibold tracking-tight text-text-000 mb-5">
          Models
        </h2>
        <div className="rounded-xl border border-dashed border-border-200 bg-bg-100/60 px-6 py-10 text-center">
          <div className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-[10px] border border-border-200 bg-bg-000 text-text-300">
            <Cpu className="w-[18px] h-[18px]" />
          </div>
          <div className="text-[14px] font-medium text-text-000 mb-1">
            Local model management is desktop-only
          </div>
          <div className="text-[13px] text-text-400 max-w-[46ch] mx-auto leading-[1.5]">
            Run the desktop app to download and serve models from your own machine
            via Ollama. The web app uses cloud models routed through the UniRo
            backend.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* ---------- System info ---------- */}
      <section className="pt-1 pb-2">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[17px] font-semibold tracking-tight text-text-000 m-0">
            Models
          </h2>
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-[12px] text-text-400 hover:text-text-000 disabled:opacity-40 transition-colors"
          >
            <RefreshCw className={cn("w-3 h-3", loading && "animate-spin")} />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-3 max-md:grid-cols-1 gap-3 mb-2">
          <SystemCard
            icon={<HardDrive className="w-3.5 h-3.5" />}
            label="Memory"
            primary={system ? `${system.totalRamGB} GB` : "…"}
            sub={system ? `${system.freeRamGB} GB free` : ""}
          />
          <SystemCard
            icon={<Cpu className="w-3.5 h-3.5" />}
            label="CPU"
            primary={system ? `${system.cpuCores} cores` : "…"}
            sub={system?.cpuModel.replace(/\s+/g, " ").trim() ?? ""}
          />
          <SystemCard
            icon={<Zap className="w-3.5 h-3.5" />}
            label="GPU"
            primary={
              system?.gpu.detected
                ? system.gpu.description
                : "no discrete GPU"
            }
            sub={
              system?.gpu.isAppleSilicon
                ? `unified memory (${system.totalRamGB} GB)`
                : system?.gpu.vramGB
                  ? `${system.gpu.vramGB} GB VRAM`
                  : ""
            }
          />
        </div>
      </section>

      <div className="h-px bg-border-200 my-6" />

      {/* ---------- Ollama runtime ---------- */}
      <section className="pt-1 pb-2">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[15px] font-semibold text-text-000 m-0">
            Local runtime · Ollama
          </h3>
          {status && (
            <div className="flex items-center gap-2 text-[12px] text-text-400">
              <StatusDot
                state={
                  !status.installed
                    ? "fail"
                    : !status.daemonRunning
                      ? "warn"
                      : "ok"
                }
              />
              {!status.installed
                ? "Not installed"
                : !status.daemonRunning
                  ? "Installed, daemon offline"
                  : `Running · v${status.version ?? "?"}`}
            </div>
          )}
        </div>

        {status && !status.installed && (
          <OllamaInstallCard />
        )}
        {status && status.installed && !status.daemonRunning && (
          <DaemonOfflineCard />
        )}
      </section>

      {/* ---------- Installed models ---------- */}
      <section className="pt-1 pb-2">
        <h3 className="text-[15px] font-semibold text-text-000 mb-3">
          Installed models
        </h3>
        {installed.length === 0 ? (
          <div className="rounded-[10px] border border-dashed border-border-200 bg-bg-100/60 px-4 py-6 text-center text-[13px] text-text-400">
            No local models yet. Install one from the catalog below.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {installed.map((m) => {
              const busy = activeName === m.name;
              return (
                <div
                  key={m.name}
                  className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-[10px] border border-border-200 bg-bg-000 px-4 py-3"
                >
                  <div className="min-w-0">
                    <div className="text-[13.5px] font-medium text-text-000 truncate">
                      {m.name}
                    </div>
                    <div className="text-[11.5px] text-text-400 mt-0.5">
                      {formatGB(m.sizeBytes)}
                      {m.details?.parameter_size
                        ? ` · ${m.details.parameter_size}`
                        : ""}
                      {m.details?.quantization_level
                        ? ` · ${m.details.quantization_level}`
                        : ""}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => doRemove(m.name)}
                    disabled={busy}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border-300 bg-bg-000 px-2.5 py-1.5 text-[12px] text-text-200 hover:border-text-200 hover:text-text-000 disabled:opacity-50"
                  >
                    {busy ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <div className="h-px bg-border-200 my-6" />

      {/* ---------- Catalog ---------- */}
      <section className="pt-1 pb-2">
        <h3 className="text-[15px] font-semibold text-text-000 mb-1">
          Browse models
        </h3>
        <p className="text-[12.5px] text-text-400 mb-3 leading-[1.5]">
          Curated picks from{" "}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.uniro?.app.openExternal("https://ollama.com/library");
            }}
            className="underline decoration-border-300 hover:decoration-text-300 cursor-pointer"
          >
            ollama.com/library
          </a>
          . Hardware fit is estimated against your machine&apos;s memory.
        </p>

        <div className="flex flex-col gap-2">
          {CATALOG.map((m) => {
            const fit = system ? ramFit(m, system.totalRamGB) : null;
            const isInstalled = installedNames.has(m.id);
            const busy = activeName === m.id;
            const prog = progress[m.id];
            const pct =
              prog?.totalBytes && prog?.completedBytes
                ? Math.round((prog.completedBytes / prog.totalBytes) * 100)
                : null;

            return (
              <div
                key={m.id}
                className="rounded-[10px] border border-border-200 bg-bg-000 px-4 py-3"
              >
                <div className="grid grid-cols-[1fr_auto] gap-3 items-start">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[13.5px] font-medium text-text-000">
                        {m.label}
                      </span>
                      <span className="font-mono text-[11px] text-text-400">
                        {m.id}
                      </span>
                      {isInstalled && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-bg-200 px-1.5 py-px text-[10.5px] text-text-200 border border-border-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Installed
                        </span>
                      )}
                      {fit && !isInstalled && <FitPill verdict={fit.verdict} />}
                    </div>
                    <div className="text-[12.5px] text-text-400 mt-1 leading-[1.5]">
                      {m.description}
                    </div>
                    <div className="text-[11.5px] text-text-400 mt-1.5">
                      {m.paramSize} · ~{m.downloadGB} GB download · needs ~{m.minRamGB} GB RAM
                    </div>
                    {fit && fit.verdict !== "fits" && !isInstalled && (
                      <div
                        className={cn(
                          "text-[11.5px] mt-1.5",
                          fit.verdict === "no"
                            ? "text-[#a63a2a]"
                            : "text-[#c98b2b]"
                        )}
                      >
                        {fit.reason}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center">
                    {isInstalled ? (
                      <button
                        type="button"
                        onClick={() => doRemove(m.id)}
                        disabled={busy}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border-300 bg-bg-000 px-2.5 py-1.5 text-[12px] text-text-200 hover:border-text-200 hover:text-text-000 disabled:opacity-50"
                      >
                        {busy ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                        Remove
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => doPull(m.id)}
                        disabled={
                          busy ||
                          !status?.daemonRunning ||
                          (fit?.verdict === "no")
                        }
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors",
                          busy
                            ? "bg-bg-300 text-text-300"
                            : fit?.verdict === "no"
                              ? "bg-bg-200 text-text-400 cursor-not-allowed"
                              : "bg-accent-000 text-accent-fg hover:bg-accent-100"
                        )}
                      >
                        {busy ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Download className="w-3.5 h-3.5" />
                        )}
                        {busy ? "Installing…" : "Install"}
                      </button>
                    )}
                  </div>
                </div>

                {busy && prog && (
                  <ProgressBar
                    label={prog.status}
                    pct={pct}
                    total={prog.totalBytes}
                    completed={prog.completedBytes}
                  />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ---------- Custom pull ---------- */}
      <section className="pt-5 pb-2">
        <h3 className="text-[15px] font-semibold text-text-000 mb-1">
          Pull a custom model
        </h3>
        <p className="text-[12.5px] text-text-400 mb-3 leading-[1.5]">
          Type any name from{" "}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.uniro?.app.openExternal("https://ollama.com/library");
            }}
            className="underline decoration-border-300 hover:decoration-text-300 cursor-pointer"
          >
            ollama.com/library
          </a>{" "}
          (e.g. <span className="font-mono text-[12px]">llama3.2:1b</span>).
        </p>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                customName.trim() &&
                !activeName
              ) {
                doPull(customName.trim());
                setCustomName("");
              }
            }}
            placeholder="model:tag"
            className="flex-1 min-w-0 rounded-[10px] border border-border-300 bg-bg-000 px-3 py-2 text-[13px] text-text-000 placeholder:text-text-400 outline-none focus:border-text-200 transition-colors font-mono"
          />
          <button
            type="button"
            onClick={() => {
              if (customName.trim() && !activeName) {
                doPull(customName.trim());
                setCustomName("");
              }
            }}
            disabled={!customName.trim() || !!activeName || !status?.daemonRunning}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-medium",
              !customName.trim() || !!activeName || !status?.daemonRunning
                ? "bg-bg-300 text-text-400 cursor-not-allowed"
                : "bg-accent-000 text-accent-fg hover:bg-accent-100"
            )}
          >
            <Download className="w-3.5 h-3.5" />
            Pull
          </button>
        </div>
      </section>

      {error && (
        <div className="mt-4 rounded-[10px] border border-[#a63a2a]/40 bg-[#a63a2a]/5 px-3.5 py-2.5 text-[13px] text-[#a63a2a] flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="h-16" />
    </div>
  );
}

function SystemCard({
  icon,
  label,
  primary,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  primary: string;
  sub: string;
}) {
  return (
    <div className="rounded-[10px] border border-border-200 bg-bg-000 px-3.5 py-3">
      <div className="flex items-center gap-1.5 text-[11px] tracking-[.06em] uppercase text-text-400 mb-1.5">
        {icon}
        {label}
      </div>
      <div className="text-[14px] text-text-000 font-medium truncate">
        {primary}
      </div>
      {sub && (
        <div className="text-[11.5px] text-text-400 mt-0.5 truncate">{sub}</div>
      )}
    </div>
  );
}

function OllamaInstallCard() {
  return (
    <div className="rounded-[10px] border border-border-200 bg-bg-100/60 px-4 py-4">
      <div className="text-[14px] font-medium text-text-000 mb-1">
        Install Ollama to run models locally
      </div>
      <div className="text-[12.5px] text-text-400 leading-[1.5] mb-3 max-w-[60ch]">
        Ollama is a small local model server. UniRo uses it to download, run,
        and chat with open-weight models on your own machine. macOS, Linux, and
        Windows are supported.
      </div>
      <button
        type="button"
        onClick={() =>
          window.uniro?.app.openExternal("https://ollama.com/download")
        }
        className="inline-flex items-center gap-1.5 rounded-lg bg-accent-000 text-accent-fg hover:bg-accent-100 px-3 py-1.5 text-[12.5px] font-medium transition-colors"
      >
        <Download className="w-3.5 h-3.5" />
        Get Ollama
      </button>
    </div>
  );
}

function DaemonOfflineCard() {
  return (
    <div className="rounded-[10px] border border-[#c98b2b]/30 bg-[#c98b2b]/5 px-4 py-3.5 text-[13px] text-text-200 leading-[1.55]">
      Ollama is installed but its daemon isn&apos;t responding on{" "}
      <span className="font-mono">localhost:11434</span>. Start it with{" "}
      <code className="font-mono text-[12px] bg-bg-200 px-1 py-px rounded">
        ollama serve
      </code>{" "}
      (or open the Ollama menu bar app on macOS).
    </div>
  );
}

function ProgressBar({
  label,
  pct,
  total,
  completed,
}: {
  label: string;
  pct: number | null;
  total?: number;
  completed?: number;
}) {
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between text-[11.5px] text-text-400 mb-1">
        <span className="truncate">{label || "preparing…"}</span>
        <span className="font-mono ml-2">
          {pct !== null
            ? `${pct}%`
            : total
              ? `${formatGB(completed ?? 0)} / ${formatGB(total)}`
              : ""}
        </span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded bg-bg-300">
        <div
          className="h-full bg-text-000 transition-[width] duration-200"
          style={{ width: pct !== null ? `${pct}%` : "10%" }}
        />
      </div>
    </div>
  );
}
