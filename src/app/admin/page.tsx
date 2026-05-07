"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Boxes,
  CheckCircle2,
  Eye,
  LayoutGrid,
  List as ListIcon,
  Loader2,
  RefreshCw,
  Timer,
  Wrench,
  XCircle,
} from "lucide-react";
import type { BackendModel } from "@/types";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useModels } from "@/hooks/useModels";
import {
  bucketFor,
  LATENCY_BUCKETS,
  type LatencyBucketId,
  type LatencyMap,
  type LatencyResult,
  useModelLatency,
} from "@/hooks/useModelLatency";
import {
  extractProvider,
  formatProviderName,
  groupModelsByProvider,
  modelDisplayName,
} from "@/lib/provider-display";
import { ProviderLogo } from "@/components/chat/ProviderLogo";
import { UniroMark } from "@/components/UniroMark";
import { cn } from "@/lib/utils";

type SortMode = "provider" | "latency" | "name" | "status";
type ViewMode = "list" | "card";

// Includes "error" + "unmeasured" so users can isolate the broken or
// not-yet-probed rows.
const ALL_BUCKET_IDS: readonly LatencyBucketId[] = [
  ...LATENCY_BUCKETS.map((b) => b.id),
  "error",
  "unmeasured",
];

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: "provider", label: "Provider (grouped)" },
  { value: "latency", label: "Latency · fast first" },
  { value: "name", label: "Name" },
  { value: "status", label: "Status · down first" },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useSupabaseUser();
  const { profile, loading: profileLoading, error: profileError } =
    useUserProfile();

  // Bounce signed-out users to /login?next=/admin so they land back
  // here after sign-in. Wrong-role users see the 403-style screen below.
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login?next=/admin");
    }
  }, [authLoading, user, router]);

  if (authLoading || profileLoading || !user) {
    return <CenteredLoader label="Checking access…" />;
  }

  if (profileError) {
    return (
      <Gate
        title="Couldn't verify access"
        body={
          <>
            We couldn&apos;t reach Supabase to check your role:{" "}
            <span className="font-mono">{profileError}</span>. Try
            refreshing — if this keeps happening, the database may be
            down or the schema migration hasn&apos;t been applied to
            this project.
          </>
        }
      />
    );
  }

  if (!profile?.is_admin) {
    return (
      <Gate
        title="You don't have admin access"
        body={
          <>
            Signed in as <span className="font-mono">{user.email}</span>.
            Ask an existing admin to flip your{" "}
            <code className="font-mono text-[12px]">is_admin</code> in
            the <code className="font-mono text-[12px]">profiles</code>{" "}
            table.
          </>
        }
      />
    );
  }

  return <Dashboard />;
}

function Dashboard() {
  const { models, loading, error } = useModels();
  const {
    latencies,
    inFlight,
    progress,
    measuring,
    measure,
    abort,
    lastMeasuredAt,
  } = useModelLatency();

  const [view, setView] = useState<ViewMode>("list");
  const [sortBy, setSortBy] = useState<SortMode>("provider");
  // null = no filter (show everything). Otherwise the set of buckets
  // the user wants visible.
  const [bucketFilter, setBucketFilter] = useState<Set<LatencyBucketId> | null>(
    null
  );

  const concrete = useMemo(
    () => models.filter((m) => m.type === "model"),
    [models]
  );

  const providers = useMemo(() => groupModelsByProvider(concrete), [concrete]);

  const totals = useMemo(() => {
    let total = 0;
    let available = 0;
    for (const m of concrete) {
      total += 1;
      if (m.available !== false) available += 1;
    }
    return { total, available };
  }, [concrete]);

  // Unified latency lookup: user-measured probe (most recent) wins;
  // otherwise fall back to whatever the backend's /v1/models reported.
  // Returns undefined only when neither source has a value.
  const effectiveLatencies = useMemo(() => {
    const merged: LatencyMap = { ...latencies };
    for (const m of concrete) {
      if (merged[m.id]) continue;
      if (m.latency_ms != null) {
        merged[m.id] = {
          ms: m.latency_ms,
          error: null,
          measuredAt: m.last_health_check
            ? Date.parse(m.last_health_check) || 0
            : 0,
        };
      }
    }
    return merged;
  }, [concrete, latencies]);

  const filtered = useMemo(() => {
    if (!bucketFilter) return concrete;
    return concrete.filter((m) =>
      bucketFilter.has(bucketFor(effectiveLatencies[m.id]))
    );
  }, [concrete, effectiveLatencies, bucketFilter]);

  const handleMeasureAll = () => {
    measure(concrete.map((m) => m.id));
  };

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
          <div className="flex items-center gap-2">
            {measuring ? (
              <button
                type="button"
                onClick={abort}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border-300 bg-bg-000 px-3 h-8 text-[12.5px] text-text-200 hover:text-text-000 hover:bg-bg-100 transition-colors"
                title="Stop measuring"
              >
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>
                  Measuring… {progress?.done ?? 0}/{progress?.total ?? 0}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleMeasureAll}
                disabled={concrete.length === 0}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border-300 bg-bg-000 px-3 h-8 text-[12.5px] text-text-200 hover:text-text-000 hover:bg-bg-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                title="Send a 1-token probe to each model and record time-to-first-token"
              >
                <Timer className="w-3.5 h-3.5" />
                <span>Measure latencies</span>
              </button>
            )}
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

            {/* Toolbar */}
            <Toolbar
              view={view}
              onViewChange={setView}
              sortBy={sortBy}
              onSortChange={setSortBy}
              bucketFilter={bucketFilter}
              onBucketFilterChange={setBucketFilter}
              latencies={effectiveLatencies}
              concrete={concrete}
              filteredCount={filtered.length}
              lastMeasuredAt={lastMeasuredAt}
            />

            {/* Models — grouped by provider when sortBy="provider", flat
                otherwise. View mode (list vs card) applies in both cases. */}
            <section className="flex flex-col gap-6">
              {filtered.length === 0 ? (
                <EmptyState
                  message={
                    bucketFilter
                      ? "No models match the current latency filter."
                      : "No models reported by the backend."
                  }
                />
              ) : sortBy === "provider" ? (
                <GroupedByProvider
                  providers={providers
                    .map((g) => ({
                      ...g,
                      models: g.models.filter((m) => filtered.includes(m)),
                    }))
                    .filter((g) => g.models.length > 0)}
                  view={view}
                  latencies={effectiveLatencies}
                  inFlight={inFlight}
                />
              ) : (
                <FlatList
                  models={sortFlat(filtered, sortBy, effectiveLatencies)}
                  view={view}
                  latencies={effectiveLatencies}
                  inFlight={inFlight}
                />
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

// ---------- Toolbar ----------

function Toolbar({
  view,
  onViewChange,
  sortBy,
  onSortChange,
  bucketFilter,
  onBucketFilterChange,
  latencies,
  concrete,
  filteredCount,
  lastMeasuredAt,
}: {
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
  sortBy: SortMode;
  onSortChange: (s: SortMode) => void;
  bucketFilter: Set<LatencyBucketId> | null;
  onBucketFilterChange: (s: Set<LatencyBucketId> | null) => void;
  latencies: LatencyMap;
  concrete: BackendModel[];
  filteredCount: number;
  lastMeasuredAt: number | null;
}) {
  // Per-bucket counts so the filter chips show "Slow (3)" rather than a
  // bare label — much easier to scan.
  const counts = useMemo(() => {
    const c: Record<LatencyBucketId, number> = {
      fast: 0,
      medium: 0,
      slow: 0,
      very_slow: 0,
      error: 0,
      unmeasured: 0,
    };
    for (const m of concrete) c[bucketFor(latencies[m.id])] += 1;
    return c;
  }, [concrete, latencies]);

  const toggleBucket = (id: LatencyBucketId) => {
    const next = new Set(bucketFilter ?? ALL_BUCKET_IDS);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    if (next.size === ALL_BUCKET_IDS.length) onBucketFilterChange(null);
    else if (next.size === 0) onBucketFilterChange(new Set());
    else onBucketFilterChange(next);
  };

  const isActive = (id: LatencyBucketId) =>
    bucketFilter === null ? true : bucketFilter.has(id);

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex items-center gap-2 text-[12.5px] text-text-300">
          <span>Sort</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortMode)}
            className="rounded-lg border border-border-300 bg-bg-000 px-2.5 h-8 text-[12.5px] text-text-000 outline-none focus:border-text-200"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <div className="inline-flex items-center gap-0.5 rounded-lg border border-border-300 bg-bg-000 p-0.5">
          <ViewToggleButton
            active={view === "list"}
            onClick={() => onViewChange("list")}
            icon={<ListIcon className="w-3.5 h-3.5" />}
            label="List"
          />
          <ViewToggleButton
            active={view === "card"}
            onClick={() => onViewChange("card")}
            icon={<LayoutGrid className="w-3.5 h-3.5" />}
            label="Card"
          />
        </div>

        <div className="flex-1" />

        <div className="text-[11.5px] text-text-400 tabular-nums">
          {filteredCount} of {concrete.length} model
          {concrete.length === 1 ? "" : "s"}
          {lastMeasuredAt && (
            <span className="ml-3">
              · last measured {formatAgo(lastMeasuredAt)}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11.5px] uppercase tracking-[.06em] text-text-400 mr-1">
          Latency
        </span>
        {ALL_BUCKET_IDS.map((id) => {
          const meta = labelForBucket(id);
          return (
            <button
              key={id}
              type="button"
              onClick={() => toggleBucket(id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 h-7 text-[11.5px] transition-colors",
                isActive(id)
                  ? "border-text-200 bg-bg-000 text-text-000"
                  : "border-border-300 bg-bg-100/40 text-text-400 hover:text-text-200"
              )}
              title={meta.tooltip}
            >
              <span
                className={cn(
                  "inline-block w-2 h-2 rounded-full",
                  bucketDotClass(id)
                )}
              />
              <span>{meta.label}</span>
              <span className="text-text-400 tabular-nums">
                {counts[id]}
              </span>
            </button>
          );
        })}
        {bucketFilter !== null && (
          <button
            type="button"
            onClick={() => onBucketFilterChange(null)}
            className="ml-1 text-[11.5px] text-text-300 hover:text-text-000 underline underline-offset-4"
          >
            Reset
          </button>
        )}
      </div>
    </section>
  );
}

function ViewToggleButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        "inline-flex items-center justify-center h-7 w-7 rounded-md transition-colors",
        active
          ? "bg-bg-200 text-text-000"
          : "text-text-400 hover:bg-bg-100 hover:text-text-000"
      )}
    >
      {icon}
    </button>
  );
}

// ---------- Renderers ----------

function GroupedByProvider({
  providers,
  view,
  latencies,
  inFlight,
}: {
  providers: { id: string; models: BackendModel[] }[];
  view: ViewMode;
  latencies: LatencyMap;
  inFlight: ReadonlySet<string>;
}) {
  return (
    <>
      {providers.map((g) => {
        const upCount = g.models.filter((m) => m.available !== false).length;
        const tone: SummaryTone =
          upCount === g.models.length ? "ok" : upCount === 0 ? "fail" : "warn";
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
            {view === "list" ? (
              <ul>
                {g.models.map((m) => (
                  <ModelRow
                    key={m.id}
                    model={m}
                    latency={latencies[m.id]}
                    measuring={inFlight.has(m.id)}
                    showProviderLogo={false}
                  />
                ))}
              </ul>
            ) : (
              <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {g.models.map((m) => (
                  <ModelCard
                    key={m.id}
                    model={m}
                    latency={latencies[m.id]}
                    measuring={inFlight.has(m.id)}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

function FlatList({
  models,
  view,
  latencies,
  inFlight,
}: {
  models: BackendModel[];
  view: ViewMode;
  latencies: LatencyMap;
  inFlight: ReadonlySet<string>;
}) {
  if (view === "list") {
    return (
      <div className="rounded-[12px] border border-border-200 bg-bg-000 overflow-hidden">
        <ul>
          {models.map((m) => (
            <ModelRow
              key={m.id}
              model={m}
              latency={latencies[m.id]}
              measuring={inFlight.has(m.id)}
              showProviderLogo
            />
          ))}
        </ul>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {models.map((m) => (
        <ModelCard
          key={m.id}
          model={m}
          latency={latencies[m.id]}
          measuring={inFlight.has(m.id)}
        />
      ))}
    </div>
  );
}

// Sorts a flat list by the chosen mode, with stable per-name tiebreak.
function sortFlat(
  models: BackendModel[],
  sortBy: SortMode,
  latencies: LatencyMap
): BackendModel[] {
  const arr = [...models];
  const nameKey = (m: BackendModel) => modelDisplayName(m.id).toLowerCase();
  const latencyKey = (m: BackendModel) => {
    const r = latencies[m.id];
    if (!r || r.error) return Number.POSITIVE_INFINITY;
    if (r.ms == null) return Number.POSITIVE_INFINITY;
    return r.ms;
  };

  if (sortBy === "name") {
    arr.sort((a, b) => nameKey(a).localeCompare(nameKey(b)));
  } else if (sortBy === "latency") {
    arr.sort(
      (a, b) =>
        latencyKey(a) - latencyKey(b) || nameKey(a).localeCompare(nameKey(b))
    );
  } else if (sortBy === "status") {
    // Down (false) first so problems surface; alphabetical inside each tier.
    arr.sort((a, b) => {
      const ax = a.available === false ? 0 : 1;
      const bx = b.available === false ? 0 : 1;
      return ax - bx || nameKey(a).localeCompare(nameKey(b));
    });
  }
  return arr;
}

// ---------- Per-model row + card ----------

function ModelRow({
  model: m,
  latency,
  measuring,
  showProviderLogo,
}: {
  model: BackendModel;
  latency: LatencyResult | undefined;
  measuring: boolean;
  showProviderLogo: boolean;
}) {
  const up = m.available !== false;
  const provider = extractProvider(m.id);
  return (
    <li className="flex items-center gap-3 px-4 py-2.5 border-t border-border-200/60 first:border-t-0 hover:bg-bg-100/40">
      {up ? (
        <CheckCircle2 className="w-4 h-4 text-[#4aa86f] shrink-0" />
      ) : (
        <XCircle className="w-4 h-4 text-[#a63a2a] shrink-0" />
      )}
      {showProviderLogo && provider ? (
        <ProviderLogo provider={provider} size={18} />
      ) : null}
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
      <LatencyBadge latency={latency} measuring={measuring} />
      <CapabilityChips
        vision={m.capabilities?.vision}
        tools={m.capabilities?.tool_calling}
        reasoning={m.capabilities?.reasoning}
      />
      {m.context_window ? (
        <div className="hidden md:block text-[11.5px] text-text-400 tabular-nums w-[80px] text-right">
          {formatContext(m.context_window)} ctx
        </div>
      ) : null}
      {(m.cost_per_million_input_tokens != null ||
        m.cost_per_million_output_tokens != null) && (
        <div className="hidden lg:block text-[11.5px] text-text-400 tabular-nums w-[110px] text-right">
          {formatCost(
            m.cost_per_million_input_tokens,
            m.cost_per_million_output_tokens
          )}
        </div>
      )}
    </li>
  );
}

function ModelCard({
  model: m,
  latency,
  measuring,
}: {
  model: BackendModel;
  latency: LatencyResult | undefined;
  measuring: boolean;
}) {
  const up = m.available !== false;
  const provider = extractProvider(m.id);
  return (
    <div className="flex flex-col gap-2 rounded-[12px] border border-border-200 bg-bg-000 px-3.5 py-3.5">
      <div className="flex items-start gap-2.5">
        {provider ? <ProviderLogo provider={provider} size={28} /> : null}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            {up ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-[#4aa86f] shrink-0" />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-[#a63a2a] shrink-0" />
            )}
            <span className="text-[10.5px] tracking-[.06em] uppercase text-text-400 truncate">
              {provider ? formatProviderName(provider) : "—"}
            </span>
          </div>
          <div className="text-[13px] font-medium text-text-000 font-mono truncate mt-0.5">
            {modelDisplayName(m.id)}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 mt-1">
        <LatencyBadge latency={latency} measuring={measuring} />
        {m.context_window ? (
          <span className="text-[11px] text-text-400 tabular-nums">
            {formatContext(m.context_window)} ctx
          </span>
        ) : null}
      </div>

      {(m.capabilities?.vision ||
        m.capabilities?.tool_calling ||
        m.capabilities?.reasoning) && (
        <div className="flex items-center gap-1 flex-wrap">
          <CapabilityChipsInline
            vision={m.capabilities?.vision}
            tools={m.capabilities?.tool_calling}
            reasoning={m.capabilities?.reasoning}
          />
        </div>
      )}

      {(m.cost_per_million_input_tokens != null ||
        m.cost_per_million_output_tokens != null) && (
        <div className="text-[11px] text-text-400 tabular-nums">
          {formatCost(
            m.cost_per_million_input_tokens,
            m.cost_per_million_output_tokens
          )}{" "}
          per 1M tok
        </div>
      )}
    </div>
  );
}

function CapabilityChipsInline({
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
  if (tools)
    chips.push({ label: "Tools", icon: <Wrench className="w-3 h-3" /> });
  if (reasoning)
    chips.push({
      label: "Reasoning",
      icon: <AlertCircle className="w-3 h-3" />,
    });
  return (
    <>
      {chips.map((c) => (
        <span
          key={c.label}
          className="inline-flex items-center gap-1 rounded-md border border-border-200 px-1.5 py-0.5 text-[10.5px] text-text-300"
        >
          {c.icon}
          <span>{c.label}</span>
        </span>
      ))}
    </>
  );
}

function LatencyBadge({
  latency,
  measuring,
}: {
  latency: LatencyResult | undefined;
  measuring: boolean;
}) {
  if (measuring) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-border-300 bg-bg-100 px-2 py-0.5 text-[11px] text-text-300 w-[88px] justify-center">
        <Loader2 className="w-3 h-3 animate-spin" />
        <span>probing</span>
      </span>
    );
  }
  if (!latency) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-border-300 bg-bg-100/40 px-2 py-0.5 text-[11px] text-text-400 w-[88px] justify-center">
        not measured
      </span>
    );
  }
  if (latency.error) {
    return (
      <span
        title={latency.error}
        className="inline-flex items-center gap-1.5 rounded-md border border-[#a63a2a]/40 bg-[#a63a2a]/8 px-2 py-0.5 text-[11px] text-[#a63a2a] w-[88px] justify-center truncate"
      >
        error
      </span>
    );
  }
  if (latency.ms == null) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-border-300 px-2 py-0.5 text-[11px] text-text-400 w-[88px] justify-center">
        —
      </span>
    );
  }
  const id = bucketFor(latency);
  const meta = labelForBucket(id);
  return (
    <span
      title={`${meta.label} · time-to-first-token`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] tabular-nums w-[88px] justify-center",
        bucketBadgeClass(id)
      )}
    >
      <span className={cn("inline-block w-1.5 h-1.5 rounded-full", bucketDotClass(id))} />
      <span>{formatLatencyMs(latency.ms)}</span>
    </span>
  );
}

// ---------- Helpers ----------

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-[12px] border border-dashed border-border-300 bg-bg-100/40 px-4 py-10 flex flex-col items-center gap-2 text-text-400">
      <Boxes className="w-5 h-5" />
      <div className="text-[13px]">{message}</div>
    </div>
  );
}

function formatLatencyMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(ms < 10_000 ? 2 : 1)}s`;
}

function formatAgo(ts: number): string {
  const sec = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}

function labelForBucket(id: LatencyBucketId): { label: string; tooltip: string } {
  switch (id) {
    case "fast":
      return { label: "Fast", tooltip: "≤ 800ms time-to-first-token" };
    case "medium":
      return { label: "Medium", tooltip: "≤ 2s time-to-first-token" };
    case "slow":
      return { label: "Slow", tooltip: "≤ 5s time-to-first-token" };
    case "very_slow":
      return { label: "Very slow", tooltip: "> 5s time-to-first-token" };
    case "error":
      return { label: "Error", tooltip: "The probe failed for this model" };
    case "unmeasured":
      return { label: "Unmeasured", tooltip: "No probe yet — click Measure" };
  }
}

function bucketDotClass(id: LatencyBucketId): string {
  switch (id) {
    case "fast":
      return "bg-[#4aa86f]";
    case "medium":
      return "bg-[#7baf57]";
    case "slow":
      return "bg-[#c98b2b]";
    case "very_slow":
      return "bg-[#a63a2a]";
    case "error":
      return "bg-[#a63a2a]";
    case "unmeasured":
      return "bg-text-400";
  }
}

function bucketBadgeClass(id: LatencyBucketId): string {
  switch (id) {
    case "fast":
      return "border-[#4aa86f]/40 bg-[#4aa86f]/10 text-[#4aa86f]";
    case "medium":
      return "border-[#7baf57]/40 bg-[#7baf57]/10 text-[#7baf57]";
    case "slow":
      return "border-[#c98b2b]/40 bg-[#c98b2b]/10 text-[#c98b2b]";
    case "very_slow":
      return "border-[#a63a2a]/40 bg-[#a63a2a]/10 text-[#a63a2a]";
    case "error":
      return "border-[#a63a2a]/40 bg-[#a63a2a]/10 text-[#a63a2a]";
    case "unmeasured":
      return "border-border-300 bg-bg-100/40 text-text-400";
  }
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
