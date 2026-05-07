"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  Loader2,
  RefreshCw,
  Wrench,
  XCircle,
} from "lucide-react";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { useModels } from "@/hooks/useModels";
import {
  formatProviderName,
  groupModelsByProvider,
  modelDisplayName,
} from "@/lib/provider-display";
import { ProviderLogo } from "@/components/chat/ProviderLogo";
import { adminAllowlistConfigured, isAdminEmail } from "@/lib/admin";
import { UniroMark } from "@/components/UniroMark";
import { cn } from "@/lib/utils";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useSupabaseUser();
  const allowlisted = isAdminEmail(user?.email);
  const allowlistConfigured = adminAllowlistConfigured();

  // Bounce signed-out users to /login?next=/admin so they land back
  // here after sign-in. Anyone else who fails the allowlist sees the
  // 403-style screen below.
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login?next=/admin");
    }
  }, [authLoading, user, router]);

  if (authLoading || (!user && !authLoading)) {
    return <CenteredLoader label="Checking access…" />;
  }

  if (!allowlistConfigured) {
    return (
      <Gate
        title="Admin allowlist not configured"
        body={
          <>
            Set <code className="font-mono text-[12px]">NEXT_PUBLIC_ADMIN_EMAILS</code>{" "}
            (comma-separated) in this build&apos;s environment to grant
            access. Until then nobody can use the admin dashboard.
          </>
        }
      />
    );
  }

  if (!allowlisted) {
    return (
      <Gate
        title="You don't have admin access"
        body={
          <>
            Signed in as <span className="font-mono">{user!.email}</span>.
            Ask whoever runs this UniRo deployment to add you to the admin
            allowlist.
          </>
        }
      />
    );
  }

  return <Dashboard />;
}

function Dashboard() {
  // useModels currently only fetches once on mount; expose a refetch
  // shape via a key bump. Keeps the hook's signature unchanged.
  const { models, loading, error } = useModels();

  const providers = useMemo(() => {
    const onlyConcrete = models.filter((m) => m.type === "model");
    return groupModelsByProvider(onlyConcrete);
  }, [models]);

  const totals = useMemo(() => {
    let total = 0;
    let available = 0;
    for (const m of models) {
      if (m.type !== "model") continue;
      total += 1;
      if (m.available !== false) available += 1;
    }
    return { total, available };
  }, [models]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border-200 bg-bg-100/40 backdrop-blur">
        <div className="mx-auto max-w-[1080px] px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/chat"
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-text-300 hover:bg-bg-200 hover:text-text-000 transition-colors"
              aria-label="Back to chat"
              title="Back to chat"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <UniroMark size={22} />
            <div className="text-text-000 font-semibold tracking-tight text-[16px]">
              Admin
            </div>
            <span className="text-text-400 text-[13px] hidden sm:inline">
              · Models
            </span>
          </div>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border-300 bg-bg-000 px-3 h-8 text-[12.5px] text-text-200 hover:text-text-000 hover:bg-bg-100 transition-colors"
            title="Refresh model list"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1080px] px-6 py-8 flex flex-col gap-8">
        {error ? (
          <div className="rounded-[10px] border border-[#a63a2a]/40 bg-[#a63a2a]/5 px-4 py-3 text-[13px] text-[#a63a2a]">
            Couldn&apos;t reach <span className="font-mono">/v1/models</span>:{" "}
            {error}
          </div>
        ) : null}

        {loading && providers.length === 0 ? (
          <CenteredLoader label="Loading models…" inline />
        ) : (
          <>
            {/* Top-line summary */}
            <section>
              <h2 className="text-[14px] font-semibold text-text-000 m-0 mb-3 tracking-tight">
                Overview
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <SummaryCard
                  label="Models available"
                  value={`${totals.available} / ${totals.total}`}
                  tone={
                    totals.total === 0
                      ? "muted"
                      : totals.available === totals.total
                        ? "ok"
                        : totals.available === 0
                          ? "fail"
                          : "warn"
                  }
                />
                <SummaryCard
                  label="Providers"
                  value={String(providers.length)}
                  tone="muted"
                />
                <SummaryCard
                  label="Providers fully up"
                  value={
                    providers.filter((g) =>
                      g.models.every((m) => m.available !== false)
                    ).length + " / " + providers.length
                  }
                  tone="muted"
                />
              </div>
            </section>

            {/* Per-provider sections */}
            <section className="flex flex-col gap-6">
              <h2 className="text-[14px] font-semibold text-text-000 m-0 tracking-tight">
                Providers
              </h2>
              {providers.length === 0 ? (
                <div className="text-[13px] text-text-400">
                  No models reported by the backend.
                </div>
              ) : (
                providers.map((g) => {
                  const upCount = g.models.filter(
                    (m) => m.available !== false
                  ).length;
                  const tone: SummaryTone =
                    upCount === g.models.length
                      ? "ok"
                      : upCount === 0
                        ? "fail"
                        : "warn";
                  return (
                    <div
                      key={g.id}
                      className="rounded-[12px] border border-border-200 bg-bg-000 overflow-hidden"
                    >
                      <div className="flex items-center gap-3 px-4 py-3 border-b border-border-200 bg-bg-100/40">
                        <ProviderLogo provider={g.id} size={22} />
                        <div className="flex-1 min-w-0">
                          <div className="text-[14px] font-medium text-text-000 truncate">
                            {formatProviderName(g.id)}
                          </div>
                          <div className="text-[11.5px] text-text-400 mt-0.5">
                            {upCount} of {g.models.length} model
                            {g.models.length === 1 ? "" : "s"} available
                          </div>
                        </div>
                        <ProviderStatusPill tone={tone} />
                      </div>
                      <ul>
                        {g.models.map((m) => {
                          const up = m.available !== false;
                          return (
                            <li
                              key={m.id}
                              className="flex items-center gap-3 px-4 py-2.5 border-t border-border-200/60 first:border-t-0 hover:bg-bg-100/40"
                            >
                              {up ? (
                                <CheckCircle2 className="w-4 h-4 text-[#4aa86f] shrink-0" />
                              ) : (
                                <XCircle className="w-4 h-4 text-[#a63a2a] shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="text-[13.5px] font-medium text-text-000 truncate font-mono">
                                  {modelDisplayName(m.id)}
                                </div>
                                {(m.availability_tag || m.status) && (
                                  <div className="text-[11.5px] text-text-400 mt-0.5">
                                    {m.availability_tag || m.status}
                                  </div>
                                )}
                              </div>
                              <CapabilityChips
                                vision={m.capabilities?.vision}
                                tools={m.capabilities?.tool_calling}
                                reasoning={m.capabilities?.reasoning}
                              />
                              {m.context_window ? (
                                <div className="hidden md:block text-[11.5px] text-text-400 tabular-nums w-[90px] text-right">
                                  {formatContext(m.context_window)} ctx
                                </div>
                              ) : null}
                              {(m.cost_per_million_input_tokens != null ||
                                m.cost_per_million_output_tokens != null) && (
                                <div className="hidden lg:block text-[11.5px] text-text-400 tabular-nums w-[120px] text-right">
                                  {formatCost(
                                    m.cost_per_million_input_tokens,
                                    m.cost_per_million_output_tokens
                                  )}
                                </div>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })
              )}
            </section>

            {/* API key management notice */}
            <section className="rounded-[12px] border border-border-200 bg-bg-100/40 p-5">
              <div className="flex items-center gap-2 text-text-000 text-[14px] font-medium mb-1">
                <Wrench className="w-4 h-4 text-text-300" />
                <span>API key management</span>
              </div>
              <p className="text-[13px] text-text-400 leading-[1.55] max-w-[68ch]">
                The backend doesn&apos;t expose admin endpoints yet, so this
                dashboard can&apos;t set or rotate provider API keys directly.
                Keys are stored on the backend host in{" "}
                <code className="font-mono text-[12px]">~/.uniro/credentials.json</code>{" "}
                or as <code className="font-mono text-[12px]">UNIRO_*</code>{" "}
                / provider-specific env vars (see the README). When a
                provider&apos;s models all show <em>unavailable</em> here,
                that&apos;s usually the symptom — set the key on the host
                and restart <code className="font-mono text-[12px]">uniro serve</code>.
              </p>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function CapabilityChips({
  vision,
  tools,
  reasoning,
}: {
  vision?: boolean;
  tools?: boolean;
  reasoning?: boolean;
}) {
  const chips: { label: string; icon: React.ReactNode }[] = [];
  if (vision) chips.push({ label: "Vision", icon: <Eye className="w-3 h-3" /> });
  if (tools) chips.push({ label: "Tools", icon: <Wrench className="w-3 h-3" /> });
  if (reasoning)
    chips.push({ label: "Reasoning", icon: <AlertCircle className="w-3 h-3" /> });
  if (chips.length === 0) return <div className="hidden sm:block w-[120px]" />;
  return (
    <div className="hidden sm:flex items-center gap-1 w-[120px]">
      {chips.map((c) => (
        <span
          key={c.label}
          className="inline-flex items-center gap-1 rounded-md border border-border-200 px-1.5 py-0.5 text-[10.5px] text-text-300"
        >
          {c.icon}
          <span>{c.label}</span>
        </span>
      ))}
    </div>
  );
}

function formatContext(tokens: number): string {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
  if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(0)}K`;
  return `${tokens}`;
}

function formatCost(
  inCost: number | null | undefined,
  outCost: number | null | undefined
): string {
  const fmt = (v: number | null | undefined) =>
    v == null ? "?" : `$${v.toFixed(2)}`;
  return `${fmt(inCost)} / ${fmt(outCost)}`;
}

type SummaryTone = "ok" | "warn" | "fail" | "muted";

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: SummaryTone;
}) {
  const valueColor = {
    ok: "text-[#4aa86f]",
    warn: "text-[#c98b2b]",
    fail: "text-[#a63a2a]",
    muted: "text-text-000",
  }[tone];
  return (
    <div className="rounded-[12px] border border-border-200 bg-bg-000 px-4 py-3.5">
      <div className="text-[11.5px] tracking-[.06em] uppercase text-text-400">
        {label}
      </div>
      <div className={cn("text-[22px] font-light tabular-nums mt-1", valueColor)}>
        {value}
      </div>
    </div>
  );
}

function ProviderStatusPill({ tone }: { tone: SummaryTone }) {
  const cfg = {
    ok: { label: "All up", cls: "bg-[#4aa86f]/12 text-[#4aa86f]" },
    warn: { label: "Partial", cls: "bg-[#c98b2b]/12 text-[#c98b2b]" },
    fail: { label: "All down", cls: "bg-[#a63a2a]/12 text-[#a63a2a]" },
    muted: { label: "—", cls: "bg-bg-200 text-text-300" },
  }[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
        cfg.cls
      )}
    >
      {cfg.label}
    </span>
  );
}

function CenteredLoader({
  label,
  inline,
}: {
  label: string;
  inline?: boolean;
}) {
  const wrap = inline
    ? "flex items-center justify-center py-12"
    : "min-h-screen flex items-center justify-center bg-background";
  return (
    <div className={wrap}>
      <div className="flex items-center gap-2 text-text-300 text-[13px]">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>{label}</span>
      </div>
    </div>
  );
}

function Gate({ title, body }: { title: string; body: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-[420px] flex flex-col items-center text-center">
        <div className="opacity-90 text-text-000 mb-5">
          <UniroMark size={28} />
        </div>
        <h1 className="text-[20px] font-light tracking-[-0.01em] text-text-000 m-0 mb-2">
          {title}
        </h1>
        <p className="text-[13px] text-text-400 leading-[1.55] mb-5">{body}</p>
        <Link
          href="/chat"
          className="text-[12.5px] text-text-200 hover:text-text-000 underline underline-offset-4"
        >
          Back to chat
        </Link>
      </div>
    </div>
  );
}
