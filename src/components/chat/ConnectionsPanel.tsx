"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Loader2,
  Plug,
  Trash2,
} from "lucide-react";
import type {
  ApiKeyProviderId,
  AuthStatusResult,
  CliStatusResult,
  CredentialEntry,
  LoginProgressEvent,
  SubscriptionProviderId,
} from "@/types/electron";
import { emitConnectionsChanged } from "@/hooks/useConnectedProviders";
import { cn } from "@/lib/utils";

const SUBSCRIPTIONS: {
  id: SubscriptionProviderId;
  label: string;
  sub: string;
  aliases?: string[];
}[] = [
  {
    id: "openai",
    label: "ChatGPT Pro / Codex",
    sub: "Log in with your OpenAI subscription. No API key needed.",
    aliases: ["openai", "openai-codex"],
  },
  {
    id: "anthropic",
    label: "Claude Pro / Max",
    sub: "Log in with your Anthropic subscription. Tokens auto-refresh.",
    aliases: ["anthropic"],
  },
  {
    id: "gemini",
    label: "Google AI Pro / Gemini CLI",
    sub: "Log in with your Google account.",
    aliases: ["gemini", "google-gemini-cli"],
  },
  {
    id: "antigravity",
    label: "Google Antigravity",
    sub: "Log in with Antigravity (OAuth).",
    aliases: ["antigravity", "google-antigravity"],
  },
  {
    id: "github-copilot",
    label: "GitHub Copilot",
    sub: "Log in via device-code OAuth.",
    aliases: ["github-copilot"],
  },
];

const API_KEY_PROVIDERS: { id: ApiKeyProviderId; label: string }[] = [
  { id: "openai", label: "OpenAI" },
  { id: "anthropic", label: "Anthropic" },
  { id: "google", label: "Google / Gemini" },
  { id: "nvidia", label: "NVIDIA NIM" },
  { id: "deepseek", label: "DeepSeek" },
  { id: "groq", label: "Groq" },
  { id: "xai", label: "xAI" },
  { id: "mistral", label: "Mistral" },
  { id: "openrouter", label: "OpenRouter" },
];

function findCred(
  creds: CredentialEntry[],
  aliases: string[] | undefined
): CredentialEntry | undefined {
  if (!aliases) return undefined;
  const set = new Set(aliases.map((a) => a.toLowerCase()));
  return creds.find((c) => set.has(c.provider.toLowerCase()));
}

export default function ConnectionsPanel() {
  const isDesktop = typeof window !== "undefined" && !!window.uniro?.isDesktop;
  const [cli, setCli] = useState<CliStatusResult | null>(null);
  const [status, setStatus] = useState<AuthStatusResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeProvider, setActiveProvider] = useState<string | null>(null);
  const [progress, setProgress] = useState<LoginProgressEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async () => {
    if (!window.uniro) return;
    setLoading(true);
    setError(null);
    try {
      const cliRes = await window.uniro.auth.cliStatus();
      setCli(cliRes);
      if (!cliRes.installed) {
        setStatus({ entries: [], raw: "" });
        return;
      }
      const s = await window.uniro.auth.status();
      setStatus(s);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isDesktop) return;
    refresh();
    const off = window.uniro!.auth.onProgress((e) => {
      setProgress((prev) => [...prev.slice(-200), e]);
      requestAnimationFrame(() => {
        const el = progressRef.current;
        if (el) el.scrollTop = el.scrollHeight;
      });
    });
    return () => {
      off();
    };
  }, [isDesktop, refresh]);

  const creds = status?.entries ?? [];

  const doLogin = async (provider: SubscriptionProviderId) => {
    if (!window.uniro) return;
    setActiveProvider(provider);
    setProgress([]);
    setError(null);
    try {
      const res = await window.uniro.auth.login(provider);
      if (!res.ok) {
        const detail = res.output ? `\n\n${res.output.trim()}` : "";
        setError(`Login failed (exit ${res.code ?? "?"})${detail}`);
      } else {
        emitConnectionsChanged();
      }
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setActiveProvider(null);
    }
  };

  const doRemove = async (provider: string) => {
    if (!window.uniro) return;
    setActiveProvider(provider);
    setError(null);
    try {
      await window.uniro.auth.remove(provider);
      emitConnectionsChanged();
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setActiveProvider(null);
    }
  };

  if (!isDesktop) {
    return (
      <div>
        <h2 className="text-[17px] font-semibold tracking-tight text-text-000 mb-5">
          Connections
        </h2>
        <div className="rounded-xl border border-dashed border-border-200 bg-bg-100/60 px-6 py-10 text-center">
          <div className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-[10px] border border-border-200 bg-bg-000 text-text-300">
            <Plug className="w-[18px] h-[18px]" />
          </div>
          <div className="text-[14px] font-medium text-text-000 mb-1">
            Only available in the desktop app
          </div>
          <div className="text-[13px] text-text-400 max-w-[46ch] mx-auto leading-[1.5]">
            Subscription integration (ChatGPT Pro, Claude Pro, Gemini, Antigravity,
            GitHub Copilot) runs through the <code className="font-mono">uniro</code>{" "}
            CLI, which the UniRo desktop app launches for you.
          </div>
        </div>
      </div>
    );
  }

  if (cli && !cli.installed) {
    return (
      <div>
        <h2 className="text-[17px] font-semibold tracking-tight text-text-000 mb-5">
          Connections
        </h2>
        <div className="rounded-xl border border-[#c98b2b]/30 bg-[#c98b2b]/5 px-6 py-6">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-border-200 bg-bg-000 text-text-300 shrink-0">
              <AlertCircle className="w-[18px] h-[18px]" />
            </div>
            <div className="min-w-0">
              <div className="text-[14px] font-medium text-text-000 mb-1">
                The <code className="font-mono text-[13px]">uniro</code> CLI isn&apos;t
                installed
              </div>
              <div className="text-[13px] text-text-300 leading-[1.55] mb-3 max-w-[60ch]">
                Subscription integration (ChatGPT Pro, Claude Pro, Gemini,
                Antigravity, GitHub Copilot) runs through the local{" "}
                <code className="font-mono text-[12.5px]">uniro</code> CLI, which
                stores OAuth tokens at{" "}
                <code className="font-mono text-[12.5px]">
                  ~/.uniro/credentials.json
                </code>
                . Install it once with pip, then click Refresh.
              </div>
              <div className="rounded-[8px] border border-border-200 bg-bg-000 px-3 py-2 font-mono text-[12.5px] text-text-200 mb-3">
                pip install uniro
              </div>
              <div className="text-[12px] text-text-400 leading-[1.5] mb-3 max-w-[60ch]">
                We probed for{" "}
                <code className="font-mono text-[11.5px]">{cli.binary}</code>; it
                wasn&apos;t found on PATH. If you installed it somewhere unusual,
                set <code className="font-mono text-[11.5px]">UNIRO_BIN</code>{" "}
                to the absolute path before launching the app.
                {cli.error && (
                  <>
                    {" "}
                    <span className="text-text-300">Last error: </span>
                    <span className="font-mono">{cli.error.split("\n")[0]}</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    window.uniro?.app.openExternal("https://uniro.tech/docs")
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border-300 bg-bg-000 px-3 py-1.5 text-[12.5px] text-text-200 hover:border-text-200 hover:text-text-000"
                >
                  <Download className="w-3.5 h-3.5" />
                  Install instructions
                </button>
                <button
                  type="button"
                  onClick={refresh}
                  disabled={loading}
                  className="inline-flex items-center rounded-lg bg-accent-000 text-accent-fg hover:bg-accent-100 px-3 py-1.5 text-[12.5px] font-medium disabled:opacity-50"
                >
                  {loading ? "Checking…" : "Refresh"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <section className="pt-1 pb-2">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[17px] font-semibold tracking-tight text-text-000 m-0">
            Subscriptions
          </h2>
          <div className="flex items-center gap-3">
            {cli?.version && (
              <span className="text-[11.5px] text-text-400 font-mono">
                uniro v{cli.version}
              </span>
            )}
            <button
              type="button"
              onClick={refresh}
              disabled={loading}
              className="text-[12px] text-text-400 hover:text-text-000 disabled:opacity-40"
            >
              {loading ? "Refreshing…" : "Refresh"}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {SUBSCRIPTIONS.map((s) => {
            const connected = findCred(creds, s.aliases);
            const busy = activeProvider === s.id;
            return (
              <div
                key={s.id}
                className="grid grid-cols-[1fr_auto] items-start gap-4 rounded-[10px] border border-border-200 bg-bg-000 px-4 py-3.5"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-[14px] font-medium text-text-000">
                      {s.label}
                    </div>
                    {connected && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-text-000 bg-bg-200 border border-border-200 px-1.5 py-px rounded">
                        <CheckCircle2 className="w-3 h-3" />
                        Connected
                      </span>
                    )}
                  </div>
                  <div className="text-[12.5px] text-text-400 mt-0.5 leading-[1.4]">
                    {s.sub}
                  </div>
                  {connected && (
                    <div className="mt-2 font-mono text-[11px] text-text-400">
                      <span className="text-text-300">{connected.provider}</span>
                      <span className="mx-2">·</span>
                      <span>{connected.maskedToken}</span>
                      <span className="mx-2">·</span>
                      <span>({connected.source})</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1.5 items-end">
                  {connected ? (
                    <button
                      type="button"
                      onClick={() => doRemove(connected.provider)}
                      disabled={busy}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border-300 bg-bg-000 px-3 py-1.5 text-[12.5px] text-text-200 hover:border-text-200 hover:text-text-000 disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Disconnect
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => doLogin(s.id)}
                      disabled={busy}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition-colors",
                        busy
                          ? "bg-bg-300 text-text-300"
                          : "bg-accent-000 text-accent-fg hover:bg-accent-100"
                      )}
                    >
                      {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      {busy ? "Connecting…" : "Connect"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {(() => {
        // Find the most recent structured event in this session (auth URL
        // for browser-redirect flows, or device-code for GitHub Copilot).
        const lastAuthUrl = [...progress]
          .reverse()
          .find((p) => p.authUrl)?.authUrl;
        const lastDevice = [...progress]
          .reverse()
          .find((p) => p.userCode && p.verificationUri);
        return (
          (activeProvider || progress.length > 0) && (
            <section className="mt-5 flex flex-col gap-3">
              {lastDevice && (
                <div className="rounded-[10px] border border-border-300 bg-bg-000 px-4 py-3.5">
                  <div className="text-[11px] tracking-[.08em] uppercase text-text-400 mb-2">
                    Device sign-in code
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <code className="font-mono text-[20px] tracking-[0.16em] text-text-000 bg-bg-200 px-3 py-1.5 rounded">
                      {lastDevice.userCode}
                    </code>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard
                          ?.writeText(lastDevice.userCode ?? "")
                          .catch(() => {});
                      }}
                      className="inline-flex items-center gap-1.5 text-[12px] text-text-300 hover:text-text-000"
                    >
                      <Copy className="w-3 h-3" />
                      Copy
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        window.uniro?.app.openExternal(
                          lastDevice.verificationUri ?? ""
                        )
                      }
                      className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-accent-000 text-accent-fg hover:bg-accent-100 px-3 py-1.5 text-[12.5px] font-medium"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open {new URL(lastDevice.verificationUri ?? "").host}
                    </button>
                  </div>
                  <div className="text-[12px] text-text-400 mt-2">
                    Visit the URL above and enter this code to authorize the
                    desktop app.
                  </div>
                </div>
              )}

              {!lastDevice && lastAuthUrl && (
                <div className="rounded-[10px] border border-border-200 bg-bg-100 px-3.5 py-2.5 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] text-text-200 font-medium">
                      Browser didn&apos;t open?
                    </div>
                    <div className="text-[11.5px] text-text-400 truncate">
                      {lastAuthUrl}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      window.uniro?.app.openExternal(lastAuthUrl)
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border-300 bg-bg-000 px-2.5 py-1.5 text-[12px] text-text-200 hover:border-text-200 hover:text-text-000"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open
                  </button>
                </div>
              )}

              <div>
                <div className="text-[11px] tracking-[.08em] uppercase text-text-400 mb-2">
                  Log
                </div>
                <div
                  ref={progressRef}
                  className="rounded-[10px] border border-border-200 bg-bg-100 p-3 font-mono text-[12px] text-text-200 max-h-[200px] overflow-y-auto leading-[1.5] whitespace-pre-wrap"
                >
                  {progress.length === 0 ? (
                    <span className="text-text-400">Starting…</span>
                  ) : (
                    progress.map((p, i) => (
                      <div
                        key={i}
                        className={
                          p.channel === "stderr" ? "text-text-300" : ""
                        }
                      >
                        {p.line}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          )
        );
      })()}

      {error && (
        <div className="mt-4 rounded-[10px] border border-[#a63a2a]/40 bg-[#a63a2a]/5 px-3.5 py-2.5 text-[13px] text-[#a63a2a]">
          {error}
        </div>
      )}

      <div className="h-px bg-border-200 my-7" />

      <section className="pt-1 pb-2">
        <h2 className="text-[17px] font-semibold tracking-tight text-text-000 mb-2">
          API keys
        </h2>
        <p className="text-[13px] text-text-400 mb-5 leading-[1.55] max-w-[62ch]">
          Paste a provider key to save it to{" "}
          <code className="font-mono text-[12px]">~/.uniro/credentials.json</code>.
        </p>

        <div className="flex flex-col gap-2">
          {API_KEY_PROVIDERS.map((p) => {
            const existing = creds.find(
              (c) => c.provider.toLowerCase() === p.id.toLowerCase()
            );
            return (
              <ApiKeyRow
                key={p.id}
                provider={p.id}
                label={p.label}
                existing={existing}
                busy={activeProvider === p.id}
                onSave={async (key) => {
                  if (!window.uniro) return;
                  setActiveProvider(p.id);
                  setError(null);
                  try {
                    const res = await window.uniro.auth.addKey(p.id, key);
                    if (!res.ok) setError(res.output || "Failed to save key");
                    else emitConnectionsChanged();
                    await refresh();
                  } finally {
                    setActiveProvider(null);
                  }
                }}
                onRemove={async (provider) => {
                  setActiveProvider(provider);
                  try {
                    await window.uniro!.auth.remove(provider);
                    emitConnectionsChanged();
                    await refresh();
                  } finally {
                    setActiveProvider(null);
                  }
                }}
              />
            );
          })}
        </div>
      </section>

      <div className="h-16" />
    </div>
  );
}

function ApiKeyRow({
  provider,
  label,
  existing,
  busy,
  onSave,
  onRemove,
}: {
  provider: string;
  label: string;
  existing?: CredentialEntry;
  busy: boolean;
  onSave: (key: string) => void;
  onRemove: (provider: string) => void;
}) {
  const [value, setValue] = useState("");
  const disabled = useMemo(() => !value.trim() || busy, [value, busy]);

  return (
    <div className="grid grid-cols-[140px_1fr_auto] max-md:grid-cols-1 items-center gap-3 rounded-[10px] border border-border-200 bg-bg-000 px-3.5 py-2.5">
      <div className="text-[13.5px] font-medium text-text-000">{label}</div>
      <div className="flex items-center gap-2 min-w-0">
        <input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={
            existing
              ? `${existing.maskedToken} · paste to replace`
              : `${provider} key`
          }
          className="flex-1 min-w-0 rounded-lg border border-border-300 bg-bg-000 px-3 py-1.5 text-[13px] text-text-000 placeholder:text-text-400 outline-none focus:border-text-200 transition-colors"
        />
      </div>
      <div className="flex items-center gap-1.5 justify-end">
        {existing && (
          <button
            type="button"
            disabled={busy}
            onClick={() => onRemove(existing.provider)}
            title="Remove"
            className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-text-400 hover:bg-bg-200 hover:text-text-000 disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            onSave(value.trim());
            setValue("");
          }}
          className={cn(
            "inline-flex items-center rounded-lg px-3 h-8 text-[12.5px] font-medium transition-colors",
            disabled
              ? "bg-bg-300 text-text-400 cursor-not-allowed"
              : "bg-accent-000 text-accent-fg hover:bg-accent-100"
          )}
        >
          {existing ? "Replace" : "Save"}
        </button>
      </div>
    </div>
  );
}
