"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface ChatHeaderProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  view: "chat" | "settings";
  activeTitle?: string;
  hasMessages: boolean;
}

export default function ChatHeader({
  onToggleSidebar,
  sidebarOpen,
  view,
  activeTitle,
  hasMessages,
}: ChatHeaderProps) {
  const t = useTranslations();

  return (
    <header className="flex h-[52px] items-center justify-between px-5 border-b border-transparent">
      <div className="flex items-center gap-2.5 min-w-0">
        {!sidebarOpen && (
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label={t("chat.openSidebar")}
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-text-400 hover:bg-bg-200 hover:text-text-000 transition-colors -ml-1"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-4 h-4">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="M9 4v16" />
              <path strokeLinecap="round" d="M14 9l3 3-3 3" />
            </svg>
          </button>
        )}
        <span className="font-mono text-[12px] text-text-400 tracking-[.02em]">
          {view === "settings"
            ? "settings"
            : hasMessages
              ? "chat"
              : "new conversation"}
        </span>
        {view === "chat" && hasMessages && activeTitle && (
          <>
            <span className="text-text-500">/</span>
            <span
              className={cn(
                "text-[13px] font-medium text-text-000 truncate"
              )}
            >
              {activeTitle}
            </span>
          </>
        )}
      </div>
    </header>
  );
}
