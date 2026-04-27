"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import ConnectionsPanel from "./ConnectionsPanel";
import BackendPanel from "./BackendPanel";
import ModelsPanel from "./ModelsPanel";

type TabId =
  | "general"
  | "backend"
  | "models"
  | "connections"
  | "account"
  | "privacy"
  | "billing"
  | "usage"
  | "capabilities"
  | "connectors"
  | "studio"
  | "appearance";

type Tab = { id: TabId; label: string; badge?: string; desktopOnly?: boolean };

const TABS: Tab[] = [
  { id: "general", label: "General" },
  { id: "backend", label: "Backend" },
  { id: "models", label: "Models", badge: "Desktop", desktopOnly: true },
  { id: "connections", label: "Connections", badge: "Desktop", desktopOnly: true },
  { id: "account", label: "Account" },
  { id: "privacy", label: "Privacy" },
  { id: "billing", label: "Billing" },
  { id: "usage", label: "Usage" },
  { id: "capabilities", label: "Capabilities" },
  { id: "connectors", label: "Connectors" },
  { id: "studio", label: "Studio", badge: "Beta" },
  { id: "appearance", label: "Appearance" },
];

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={cn(
        "relative h-5 w-9 shrink-0 rounded-full transition-colors",
        on ? "bg-text-000" : "bg-bg-400"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
          on && "translate-x-4"
        )}
      />
    </button>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: React.ReactNode;
  required?: boolean;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-[22px]">
      <label className="block text-[13px] text-text-200 mb-2">
        {label}
        {required && <span className="text-[#c44]"> *</span>}
      </label>
      {children}
      {hint && <div className="mt-1.5 text-[12.5px] text-text-300 leading-[1.5]">{hint}</div>}
    </div>
  );
}

function Row({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto] gap-6 py-4 items-start border-t border-border-200 first:border-t-0 first:pt-1">
      <div className="min-w-0">
        <div className="text-[14px] font-medium text-text-000 mb-1">{title}</div>
        {desc && (
          <div className="text-[13px] text-text-300 leading-[1.5] max-w-[62ch]">
            {desc}
          </div>
        )}
      </div>
      <div className="pt-0.5">{children}</div>
    </div>
  );
}

function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: readonly { v: T; label: string }[];
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

function GeneralPanel() {
  const { theme, setTheme } = useTheme();
  const [fullName, setFullName] = useState("Khang");
  const [nickname, setNickname] = useState("Khang");
  const [role] = useState("");
  const [prefs, setPrefs] = useState("");
  const [notifs, setNotifs] = useState({
    response: false,
    studioEmail: false,
    dispatch: false,
  });

  return (
    <div className="flex flex-col">
      <section className="pt-1 pb-2">
        <h2 className="text-[17px] font-semibold tracking-tight text-text-000 mb-5">Profile</h2>

        <div className="grid grid-cols-2 gap-5 mb-1.5">
          <Field label="Full name">
            <div className="flex items-center gap-2.5 rounded-[10px] border border-border-200 bg-bg-000 pl-1.5 pr-2.5 py-1.5 focus-within:border-text-200">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-000 text-accent-fg text-[12px] font-semibold shrink-0">
                K
              </div>
              <input
                className="flex-1 bg-transparent border-0 outline-none text-[14px] text-text-000 px-1 py-1 min-w-0"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          </Field>

          <Field label="What should Uniro call you?" required>
            <input
              className="w-full rounded-[10px] border border-border-200 bg-bg-000 px-3 py-2.5 text-[14px] text-text-000 outline-none focus:border-text-200"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </Field>
        </div>

        <Field label="What best describes your work?">
          <div className="flex items-center justify-between rounded-[10px] border border-border-200 bg-bg-000 px-3 py-2.5 text-[14px] cursor-pointer hover:border-text-200 transition-colors">
            <span className={role ? "text-text-000" : "text-text-400"}>
              {role || "Select your work function"}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-text-300" />
          </div>
        </Field>

        <Field
          label={
            <>
              What{" "}
              <span className="underline decoration-border-300 underline-offset-2 hover:decoration-text-300 cursor-pointer text-text-000">
                personal preferences
              </span>{" "}
              should Uniro consider in responses?
            </>
          }
          hint={
            <>
              Your preferences will apply to all conversations, within{" "}
              <span className="underline decoration-border-300 underline-offset-2 hover:decoration-text-300 cursor-pointer text-text-000">
                Uniro&apos;s guidelines
              </span>
              .
            </>
          }
        >
          <textarea
            rows={2}
            placeholder="e.g. keep explanations brief and to the point"
            value={prefs}
            onChange={(e) => setPrefs(e.target.value)}
            className="w-full resize-y min-h-[64px] rounded-[10px] border border-border-200 bg-bg-000 px-3 py-3 text-[14px] text-text-000 outline-none placeholder:text-text-400 focus:border-text-200"
          />
        </Field>
      </section>

      <div className="h-px bg-border-200 my-7" />

      <section className="pt-1 pb-2">
        <h2 className="text-[17px] font-semibold tracking-tight text-text-000 mb-5">
          Notifications
        </h2>

        <Row
          title="Response completions"
          desc="Get notified when Uniro has finished a response. Most useful for long-running tasks like tool calls, Research, and Studio on the web."
        >
          <Toggle
            on={notifs.response}
            onChange={(v) => setNotifs({ ...notifs, response: v })}
          />
        </Row>

        <Row
          title="Emails from Studio on the web"
          desc="Get an email when Studio on the web has finished building or needs your response."
        >
          <Toggle
            on={notifs.studioEmail}
            onChange={(v) => setNotifs({ ...notifs, studioEmail: v })}
          />
        </Row>

        <Row
          title="Dispatch messages"
          desc="Get a push notification on your phone when Uniro messages you in Dispatch."
        >
          <Toggle
            on={notifs.dispatch}
            onChange={(v) => setNotifs({ ...notifs, dispatch: v })}
          />
        </Row>
      </section>

      <div className="h-px bg-border-200 my-7" />

      <section className="pt-1 pb-2">
        <h2 className="text-[17px] font-semibold tracking-tight text-text-000 mb-5">
          Appearance
        </h2>

        <Row title="Theme" desc="Choose how Uniro looks. Matches your system theme by default.">
          <Segmented
            value={(theme === "dark" ? "dark" : "light") as "light" | "dark"}
            onChange={(v) => setTheme(v)}
            options={[
              { v: "light", label: "Light" },
              { v: "dark", label: "Dark" },
            ]}
          />
        </Row>
      </section>

      <div className="h-20" />
    </div>
  );
}

function PlaceholderPanel({ title, note }: { title: string; note: string }) {
  return (
    <div>
      <h2 className="text-[17px] font-semibold tracking-tight text-text-000 mb-5">
        {title}
      </h2>
      <div className="rounded-xl border border-dashed border-border-200 bg-bg-100/60 px-6 py-10 text-center">
        <div className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-[10px] border border-border-200 bg-bg-000 text-text-300">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-[18px] h-[18px]">
            <circle cx="10" cy="12" r="2" />
            <circle cx="16" cy="6" r="2" />
            <circle cx="16" cy="18" r="2" />
            <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h14M18 18h2" strokeLinecap="round" />
          </svg>
        </div>
        <div className="text-[14px] font-medium text-text-000 mb-1">Nothing here yet</div>
        <div className="text-[13px] text-text-300 max-w-[46ch] mx-auto">{note}</div>
      </div>
    </div>
  );
}

export default function SettingsView() {
  const [tab, setTab] = useState<TabId>("general");
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    setIsDesktop(typeof window !== "undefined" && !!window.uniro?.isDesktop);
  }, []);

  const visibleTabs = useMemo(
    () => TABS.filter((t) => !t.desktopOnly || isDesktop),
    [isDesktop]
  );

  return (
    <div className="flex-1 overflow-auto flex flex-col min-h-0">
      <div className="max-w-[960px] w-full mx-auto px-12 pt-9 pb-5">
        <h1 className="text-[30px] font-semibold tracking-tight text-text-000 m-0">Settings</h1>
      </div>

      <div className="max-w-[960px] w-full mx-auto px-12 pb-10 grid grid-cols-[180px_1fr] gap-10 items-start">
        <nav className="flex flex-col gap-px sticky top-5">
          {visibleTabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-left text-[14px] transition-colors",
                tab === t.id
                  ? "bg-bg-200 text-text-000 font-medium"
                  : "text-text-200 hover:bg-bg-200 hover:text-text-000"
              )}
            >
              <span>{t.label}</span>
              {t.badge && (
                <span className="rounded border border-border-200 bg-bg-200 px-1.5 py-px text-[10px] tracking-wide text-text-300">
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="min-w-0">
          {tab === "general" && <GeneralPanel />}
          {tab === "backend" && <BackendPanel />}
          {tab === "models" && <ModelsPanel />}
          {tab === "connections" && <ConnectionsPanel />}
          {tab === "account" && (
            <PlaceholderPanel
              title="Account"
              note="Profile, sign-in, and session management live here."
            />
          )}
          {tab === "privacy" && (
            <PlaceholderPanel
              title="Privacy"
              note="Control how Uniro uses and stores your data."
            />
          )}
          {tab === "billing" && (
            <PlaceholderPanel
              title="Billing"
              note="Plan, invoices, and payment methods."
            />
          )}
          {tab === "usage" && (
            <PlaceholderPanel
              title="Usage"
              note="Track your monthly message and compute usage."
            />
          )}
          {tab === "capabilities" && (
            <PlaceholderPanel
              title="Capabilities"
              note="Enable and disable Uniro's tools and abilities."
            />
          )}
          {tab === "connectors" && (
            <PlaceholderPanel
              title="Connectors"
              note="Link Uniro to external services like Drive, GitHub, and Notion."
            />
          )}
          {tab === "studio" && (
            <PlaceholderPanel
              title="Studio"
              note="Preview new Studio features before they ship."
            />
          )}
          {tab === "appearance" && (
            <PlaceholderPanel
              title="Appearance"
              note="Theme-level controls also live under General → Appearance."
            />
          )}
        </div>
      </div>
    </div>
  );
}
