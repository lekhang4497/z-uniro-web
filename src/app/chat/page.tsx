"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatWindow from "@/components/chat/ChatWindow";
import SettingsView from "@/components/chat/SettingsView";
import type { Message, Conversation } from "@/types";
import { useTranslations } from "next-intl";
import { useModels } from "@/hooks/useModels";

const INITIAL_CONVERSATION: Conversation = {
  id: "default",
  title: "New Chat",
  messages: [],
  updatedAt: Date.now(),
};

function ChatPageInner() {
  const [conversations, setConversations] = useState<Conversation[]>([
    INITIAL_CONVERSATION,
  ]);
  const [activeConvId, setActiveConvId] = useState("default");
  const [selectedModel, setSelectedModel] = useState("auto");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [thinkingMode, setThinkingMode] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [view, setView] = useState<"chat" | "settings">("chat");
  const [settingsInitialTab, setSettingsInitialTab] = useState<
    "general" | "connections" | "models" | undefined
  >(undefined);
  // Bumped each time we deep-link into settings, to force SettingsView to
  // re-mount with the new initialTab.
  const [settingsKey, setSettingsKey] = useState(0);

  const openSettings = useCallback(
    (tab?: "general" | "connections" | "models") => {
      setSettingsInitialTab(tab);
      setSettingsKey((k) => k + 1);
      setView("settings");
    },
    []
  );
  const t = useTranslations();
  const { models: backendModels, loading: modelsLoading } = useModels();

  const activeConversation =
    conversations.find((c) => c.id === activeConvId) || conversations[0];

  const handleSelectConversation = useCallback((id: string) => {
    setActiveConvId(id);
    setView("chat");
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, []);

  const handleNewChat = useCallback(() => {
    const id = `chat-${Date.now()}`;
    const newConv: Conversation = {
      id,
      title: t("chat.newChat"),
      messages: [],
      updatedAt: Date.now(),
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConvId(id);
    setImageFile(null);
    setView("chat");
  }, [t]);

  const updateMessages = useCallback(
    (
      convId: string,
      updater: Message[] | ((prev: Message[]) => Message[])
    ) => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== convId) return c;
          const newMessages =
            typeof updater === "function" ? updater(c.messages) : updater;
          let title = c.title;
          if (
            (title === "New Chat" || title === t("chat.newChat")) &&
            newMessages.length > 0
          ) {
            const firstUser = newMessages.find((m) => m.role === "user");
            if (firstUser) {
              title =
                firstUser.content.slice(0, 40) +
                (firstUser.content.length > 40 ? "…" : "");
            }
          }
          return {
            ...c,
            messages: newMessages,
            title,
            updatedAt: Date.now(),
          };
        })
      );
    },
    [t]
  );

  // Landing-page hand-off: read ?q= / localStorage on mount, hand to ChatWindow.
  const searchParams = useSearchParams();
  const router = useRouter();
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);
  useEffect(() => {
    const fromQuery = searchParams.get("q");
    const stored =
      typeof window !== "undefined"
        ? window.localStorage.getItem("uniro:pendingPrompt")
        : null;
    const prompt = (fromQuery || stored || "").trim();
    if (!prompt) return;

    try {
      window.localStorage.removeItem("uniro:pendingPrompt");
    } catch {
      /* ignore */
    }
    if (fromQuery) router.replace("/chat");
    setPendingPrompt(prompt);
  }, [searchParams, router]);

  const activeConvIdResolved = activeConversation.id;
  const updateActiveMessages = useCallback(
    (updater: Message[] | ((prev: Message[]) => Message[])) =>
      updateMessages(activeConvIdResolved, updater),
    [activeConvIdResolved, updateMessages]
  );
  const handleImageRemove = useCallback(() => setImageFile(null), []);
  const handlePendingPromptConsumed = useCallback(
    () => setPendingPrompt(null),
    []
  );

  const hasMessages = activeConversation.messages.length > 0;

  return (
    <div className="relative flex h-full bg-background">
      {sidebarOpen && (
        <button
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label={t("chat.closeSidebar")}
        />
      )}

      <ChatSidebar
        conversations={conversations}
        activeConvId={view === "chat" ? activeConvId : ""}
        onSelect={handleSelectConversation}
        onNewChat={handleNewChat}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        settingsActive={view === "settings"}
        onOpenSettings={() => openSettings()}
      />

      <div className="flex flex-col flex-1 min-w-0">
        <ChatHeader
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
          view={view}
          activeTitle={activeConversation.title}
          hasMessages={hasMessages}
        />

        {view === "settings" ? (
          <SettingsView key={settingsKey} initialTab={settingsInitialTab} />
        ) : (
          <ChatWindow
            conversation={activeConversation}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            updateMessages={updateActiveMessages}
            backendModels={backendModels}
            modelsLoading={modelsLoading}
            thinkingMode={thinkingMode}
            onThinkingModeChange={setThinkingMode}
            imageFile={imageFile}
            onImageAttach={setImageFile}
            onImageRemove={handleImageRemove}
            pendingPrompt={pendingPrompt}
            onPendingPromptConsumed={handlePendingPromptConsumed}
            onOpenSettings={openSettings}
          />
        )}
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={null}>
      <ChatPageInner />
    </Suspense>
  );
}
