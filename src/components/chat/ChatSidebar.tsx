"use client";

import { useMemo } from "react";
import {
  ChevronDown,
  Folder,
  LayoutGrid,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import type { Conversation } from "@/types";
import { useTranslations } from "next-intl";
import { UniroMark } from "@/components/UniroMark";
import { cn } from "@/lib/utils";

interface ChatSidebarProps {
  conversations: Conversation[];
  activeConvId: string;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  isOpen: boolean;
  onToggle: () => void;
  settingsActive?: boolean;
  onOpenSettings?: () => void;
}

const DAY = 24 * 60 * 60 * 1000;

function groupByDate(convs: Conversation[]) {
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();
  const startOfYesterday = startOfToday - DAY;
  const startOf7 = startOfToday - 6 * DAY;
  const startOf30 = startOfToday - 30 * DAY;

  const buckets: Record<string, Conversation[]> = {
    Today: [],
    Yesterday: [],
    "This week": [],
    "This month": [],
    Earlier: [],
  };

  for (const c of convs) {
    const ts = c.updatedAt ?? 0;
    if (ts >= startOfToday) buckets.Today.push(c);
    else if (ts >= startOfYesterday) buckets.Yesterday.push(c);
    else if (ts >= startOf7) buckets["This week"].push(c);
    else if (ts >= startOf30) buckets["This month"].push(c);
    else buckets.Earlier.push(c);
  }

  for (const k of Object.keys(buckets)) {
    buckets[k].sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
  }

  return Object.entries(buckets)
    .filter(([, items]) => items.length > 0)
    .map(([label, items]) => ({ label, items }));
}

function NavItem({
  icon,
  label,
  primary,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  primary?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-[9px] px-2.5 py-2 text-[13px] transition-colors hover:bg-bg-200 hover:text-text-000",
        primary ? "text-text-000" : "text-text-200"
      )}
    >
      {icon}
      <span className="flex-1 text-left font-normal">{label}</span>
    </button>
  );
}

export default function ChatSidebar({
  conversations,
  activeConvId,
  onSelect,
  onNewChat,
  isOpen,
  onToggle,
  settingsActive,
  onOpenSettings,
}: ChatSidebarProps) {
  const t = useTranslations();
  const groups = useMemo(() => groupByDate(conversations), [conversations]);

  if (!isOpen) return null;

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex h-full w-[280px] flex-shrink-0 flex-col bg-bg-100 border-r border-border-200 md:static md:z-auto">
      {/* Brand + collapse */}
      <div className="flex items-center justify-between gap-2 px-3.5 pt-3.5 pb-2.5">
        <div className="flex items-center gap-2.5 text-text-000">
          <UniroMark size={20} />
          <span className="text-[20px] font-semibold tracking-tight text-text-000">
            UNIRO
          </span>
        </div>
        <button
          type="button"
          onClick={onToggle}
          title={t("chat.closeSidebar")}
          aria-label={t("chat.closeSidebar")}
          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-text-400 hover:bg-bg-200 hover:text-text-000 transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-4 h-4">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M9 4v16" />
          </svg>
        </button>
      </div>

      {/* Primary nav */}
      <nav className="px-2 pt-1 flex flex-col gap-px">
        <NavItem
          primary
          onClick={onNewChat}
          icon={<Plus className="w-4 h-4" />}
          label={t("chat.newChatTitle")}
        />
        <NavItem icon={<Search className="w-4 h-4" />} label="Search" />
        <NavItem icon={<LayoutGrid className="w-4 h-4" />} label="Library" />
        <NavItem icon={<Folder className="w-4 h-4" />} label="Spaces" />
        <NavItem icon={<SlidersHorizontal className="w-4 h-4" />} label="Tune" />
      </nav>

      <div className="h-px bg-border-200 mx-3.5 my-2.5" />

      {/* Conversation history */}
      <div className="flex-1 overflow-y-auto px-2 pb-2.5">
        {groups.length === 0 ? (
          <div className="px-2.5 py-6 text-center text-[13px] text-text-400">
            No conversations yet
          </div>
        ) : (
          groups.map((group) => (
            <div key={group.label} className="mb-1.5">
              <div className="px-2.5 pb-1 pt-2.5 text-[11px] tracking-[.08em] uppercase text-text-400">
                {group.label}
              </div>
              {group.items.map((c) => {
                const active = c.id === activeConvId;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onSelect(c.id)}
                    className={cn(
                      "block w-full truncate text-left rounded-lg px-2.5 py-1.5 text-[13px] leading-[1.35] transition-colors",
                      active
                        ? "bg-[#efeeeb] dark:bg-[#1f1f1f] text-text-000"
                        : "text-text-200 hover:bg-bg-200 hover:text-text-000"
                    )}
                  >
                    <span className="block truncate">{c.title}</span>
                  </button>
                );
              })}
            </div>
          ))
        )}
      </div>

      {/* Footer: user card → settings */}
      <div className="border-t border-border-200 px-2.5 py-2.5">
        <button
          type="button"
          onClick={onOpenSettings}
          title="Open settings"
          className={cn(
            "flex w-full items-center gap-2.5 rounded-[10px] px-1.5 py-1.5 text-left transition-colors hover:bg-bg-200",
            settingsActive && "bg-bg-200"
          )}
        >
          <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-accent-000 text-accent-fg text-[12px] font-semibold flex-shrink-0">
            U
          </div>
          <div className="flex-1 min-w-0 leading-tight text-left">
            <div className="text-[13px] font-medium text-text-000 truncate">UniRo</div>
            <div className="text-[11px] text-text-400 truncate">Studio · Pro</div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-text-400 flex-shrink-0" />
        </button>
      </div>
    </aside>
  );
}
