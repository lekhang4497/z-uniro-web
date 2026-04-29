"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  BookOpen,
  Code2,
  Compass,
  Pencil,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import { UniroMark } from "@/components/UniroMark";
import type { Message, Conversation, BackendModel } from "@/types";
import { useTranslations } from "next-intl";
import { useBackendUrl } from "@/hooks/useBackendUrl";
import {
  fromLocalId,
  isLocalId,
  OLLAMA_BASE_URL,
} from "@/hooks/useLocalModels";

type Updater = Message[] | ((prev: Message[]) => Message[]);

interface ChatWindowProps {
  conversation: Conversation;
  selectedModel: string;
  onModelChange: (model: string) => void;
  updateMessages: (updater: Updater) => void;
  backendModels: BackendModel[];
  modelsLoading: boolean;
  thinkingMode: boolean;
  onThinkingModeChange: (v: boolean) => void;
  imageFile: File | null;
  onImageAttach: (f: File) => void;
  onImageRemove: () => void;
  pendingPrompt?: string | null;
  onPendingPromptConsumed?: () => void;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const SUGGESTIONS: { icon: LucideIcon; label: string; sub: string }[] = [
  { icon: Code2, label: "Code", sub: "Write, refactor, debug" },
  { icon: BookOpen, label: "Learn", sub: "Explain like I'm curious" },
  { icon: Pencil, label: "Write", sub: "Draft, edit, polish" },
  { icon: Compass, label: "Plan", sub: "Break it down" },
  { icon: Sparkles, label: "UniRo's pick", sub: "Surprise me" },
];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "Still up";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Evening";
}

export default function ChatWindow({
  conversation,
  selectedModel,
  onModelChange,
  updateMessages,
  backendModels,
  modelsLoading,
  thinkingMode,
  onThinkingModeChange,
  imageFile,
  onImageAttach,
  onImageRemove,
  pendingPrompt,
  onPendingPromptConsumed,
}: ChatWindowProps) {
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const t = useTranslations();
  const backendUrl = useBackendUrl();

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const handleSend = useCallback(
    async (content: string) => {
      const userMessage: Message = { role: "user", content };
      const currentMessages = [...conversation.messages, userMessage];
      updateMessages(currentMessages);

      const assistantMessage: Message = { role: "assistant", content: "", model: "" };
      updateMessages([...currentMessages, assistantMessage]);

      setIsStreaming(true);
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        let userContent: string | Array<Record<string, unknown>> = content;
        if (imageFile) {
          const dataUrl = await fileToBase64(imageFile);
          userContent = [
            { type: "image_url", image_url: { url: dataUrl } },
            { type: "text", text: content },
          ];
        }

        const apiMessages = currentMessages.slice(0, -1).map((m) => ({
          role: m.role,
          content: m.content,
        }));
        apiMessages.push({ role: "user", content: userContent as string });

        // Local Ollama models are routed directly to the local daemon's
        // OpenAI-compatible endpoint, bypassing the public backend (which
        // can't reach the user's localhost). Cloud models go through the
        // configured backend as usual.
        const isLocal = isLocalId(selectedModel);
        const dispatchModel = isLocal
          ? fromLocalId(selectedModel)
          : selectedModel;
        const dispatchUrl = isLocal
          ? `${OLLAMA_BASE_URL}/v1/chat/completions`
          : `${backendUrl}/v1/chat/completions`;

        const body: Record<string, unknown> = {
          model: dispatchModel,
          messages: apiMessages,
          stream: true,
        };

        // `thinking` is a UniRo backend extension; Ollama would 400 on it.
        if (thinkingMode && !isLocal) {
          body.thinking = true;
        }

        const response = await fetch(dispatchUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        onImageRemove();

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            (errorData as { detail?: string }).detail || `HTTP ${response.status}`
          );
        }

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let accumulatedContent = "";
        let modelName = "";
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.error) {
                accumulatedContent += `\n\n**Error:** ${parsed.error.message}`;
                break;
              }

              const delta = parsed.choices?.[0]?.delta;
              if (delta?.content) {
                accumulatedContent += delta.content;
              }
              if (parsed.model && !modelName) {
                modelName = parsed.model;
              }

              updateMessages([
                ...currentMessages,
                { role: "assistant", content: accumulatedContent, model: modelName },
              ]);
            } catch {
              // skip malformed chunks
            }
          }
        }

        const trailingLine = buffer.trim();
        if (trailingLine.startsWith("data: ")) {
          const trailingData = trailingLine.slice(6).trim();
          if (trailingData !== "[DONE]") {
            try {
              const parsed = JSON.parse(trailingData);
              const trailingDelta = parsed.choices?.[0]?.delta;
              if (trailingDelta?.content) {
                accumulatedContent += trailingDelta.content;
              }
              if (parsed.model && !modelName) {
                modelName = parsed.model;
              }
            } catch {
              // Ignore malformed final chunk
            }
          }
        }

        updateMessages([
          ...currentMessages,
          {
            role: "assistant",
            content: accumulatedContent || t("chat.noResponse"),
            model: modelName,
          },
        ]);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          // Content already captured incrementally
        } else {
          const errMsg = error instanceof Error ? error.message : "Unknown error";
          updateMessages([
            ...currentMessages,
            {
              role: "assistant",
              content: `**Error:** ${errMsg}\n\n${t("chat.errorBackend")}`,
              model: "",
            },
          ]);
        }
      } finally {
        abortRef.current = null;
        setIsStreaming(false);
      }
    },
    [
      conversation.messages,
      selectedModel,
      updateMessages,
      t,
      thinkingMode,
      imageFile,
      onImageRemove,
      backendUrl,
    ]
  );

  const isEmpty = conversation.messages.length === 0;
  const [greeting, setGreeting] = useState("");
  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  useEffect(() => {
    if (!pendingPrompt || !onPendingPromptConsumed) return;
    handleSend(pendingPrompt);
    onPendingPromptConsumed();
    // handleSend identity changes with conversation; we only want to fire once per pendingPrompt
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingPrompt]);

  const renderComposer = (placement: "above" | "below") => (
    <ChatInput
      onSend={handleSend}
      onStop={handleStop}
      isStreaming={isStreaming}
      thinkingMode={thinkingMode}
      onThinkingModeChange={onThinkingModeChange}
      selectedModel={selectedModel}
      onModelChange={onModelChange}
      backendModels={backendModels}
      modelsLoading={modelsLoading}
      onImageAttach={onImageAttach}
      imageFile={imageFile}
      onImageRemove={onImageRemove}
      dropdownPlacement={placement}
    />
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      {isEmpty ? (
        <div className="flex flex-1 flex-col items-center px-6 pb-10 pt-[clamp(24px,8vh,80px)] max-w-[760px] w-full mx-auto">
          <div className="mb-[18px] opacity-90 text-text-000">
            <UniroMark size={30} />
          </div>
          {greeting && (
            <h1 className="text-center text-[clamp(34px,4.2vw,46px)] font-light leading-[1.1] tracking-[-0.02em] text-text-000 m-0 mb-2.5">
              {greeting}, UniRo.
            </h1>
          )}
          <p className="text-text-400 m-0 mb-7 text-center max-w-[42ch]">
            A calm place to think out loud. Start with a prompt, or pick a lane.
          </p>

          <div className="w-full max-w-[720px]">{renderComposer("below")}</div>

          <div className="flex flex-wrap justify-center gap-2 mt-[18px]">
            {SUGGESTIONS.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() =>
                  handleSend(`Help me with ${s.label.toLowerCase()}: `)
                }
                className="inline-flex items-center gap-1.5 rounded-lg border-[0.5px] border-border-300 bg-bg-000 px-3 py-1.5 text-[12.5px] text-text-200 shadow-[0_1px_2px_rgba(0,0,0,.04)] hover:bg-bg-100 hover:text-text-000 transition-colors"
              >
                <s.icon className="w-3.5 h-3.5 text-text-000" />
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <MessageList messages={conversation.messages} isStreaming={isStreaming} />
          <div className="bg-gradient-to-t from-background via-background/70 to-transparent pt-2">
            <div className="mx-auto max-w-2xl">{renderComposer("above")}</div>
            <div className="text-center text-text-400 text-[11px] pb-3 font-mono">
              {selectedModel || "uniro"} may be wrong. Check important things.
            </div>
          </div>
        </>
      )}
    </div>
  );
}
