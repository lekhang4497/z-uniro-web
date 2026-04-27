"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  ArrowUp,
  Check,
  ChevronDown,
  ImageIcon,
  Mic,
  Plus,
  X,
} from "lucide-react";
import type { BackendModel } from "@/types";
import {
  fromLocalId,
  isLocalId,
  toLocalId,
  useLocalModels,
} from "@/hooks/useLocalModels";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (content: string) => void;
  onStop: () => void;
  isStreaming: boolean;
  thinkingMode: boolean;
  onThinkingModeChange: (v: boolean) => void;
  selectedModel: string;
  onModelChange: (id: string) => void;
  backendModels: BackendModel[];
  modelsLoading: boolean;
  onImageAttach: (file: File) => void;
  imageFile: File | null;
  onImageRemove: () => void;
}

export default function ChatInput({
  onSend,
  onStop,
  isStreaming,
  thinkingMode,
  onThinkingModeChange,
  selectedModel,
  onModelChange,
  backendModels,
  modelsLoading,
  onImageAttach,
  imageFile,
  onImageRemove,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const [dragging, setDragging] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const local = useLocalModels();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const t = useTranslations();

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
  }, [input]);

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  const handleSubmit = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    onSend(trimmed);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }, [input, isStreaming, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onImageAttach(file);
    e.target.value = "";
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith("image/")) onImageAttach(file);
    },
    [onImageAttach]
  );

  const { primary, rest } = useMemo(() => {
    const profiles = backendModels.filter((m) => m.type === "routing_profile");
    const aliases = backendModels.filter((m) => m.type === "alias");
    const plain = backendModels.filter((m) => m.type === "model");
    const top = [...profiles, ...aliases].slice(0, 3);
    const topIds = new Set(top.map((m) => m.id));
    const others = [...profiles, ...aliases, ...plain].filter(
      (m) => !topIds.has(m.id)
    );
    return { primary: top, rest: others };
  }, [backendModels]);

  const modelLabel = useMemo(() => {
    if (!selectedModel) return "Choose model";
    if (isLocalId(selectedModel)) return `local · ${fromLocalId(selectedModel)}`;
    const m = backendModels.find((x) => x.id === selectedModel);
    return m?.id ?? selectedModel;
  }, [selectedModel, backendModels]);

  const hasText = !!input.trim();
  const canSend = hasText && !isStreaming;

  return (
    <div className="px-4 pb-5 pt-2">
      <div className="mx-auto max-w-2xl">
        <div
          className={cn(
            "relative rounded-[20px] border border-border-300 bg-bg-000 shadow-[0_2px_8px_rgba(0,0,0,.06)] transition-colors",
            dragging && "border-text-200"
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragging(false);
          }}
          onDrop={handleDrop}
          onClick={() => textareaRef.current?.focus()}
        >
          {imageFile && (
            <div className="pt-3.5 px-4">
              <AttachmentPreview
                file={imageFile}
                onRemove={onImageRemove}
                removeLabel={t("chat.removeImage")}
              />
            </div>
          )}

          <div className="px-4 pt-3.5 pb-1.5">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("chat.placeholder")}
              disabled={isStreaming}
              rows={1}
              autoFocus
              className="w-full resize-none border-0 outline-none bg-transparent text-[15px] leading-[1.55] text-text-000 placeholder:text-text-400 min-h-[24px] max-h-[200px]"
            />
          </div>

          <div className="flex items-center justify-between px-2.5 pb-2.5 pt-1.5">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                title={t("chat.attach") ?? "Attach"}
                className="inline-flex items-center justify-center w-[30px] h-[30px] rounded-lg text-text-400 hover:bg-bg-200 hover:text-text-000 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <div className="flex items-center gap-1" ref={menuRef}>
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen((o) => !o);
                  }}
                  title="Choose model"
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg px-2.5 h-8 text-[13px] text-text-200 transition-colors",
                    menuOpen
                      ? "bg-black/5 dark:bg-white/10 text-text-000"
                      : "hover:bg-black/5 dark:hover:bg-white/10 hover:text-text-000"
                  )}
                >
                  <span className="truncate max-w-[180px]">
                    {modelsLoading ? "…" : modelLabel}
                  </span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {menuOpen && (
                  <div
                    role="menu"
                    className="absolute bottom-[calc(100%+10px)] right-0 z-30 w-[320px] p-1.5 rounded-xl border border-border-300 bg-bg-000 shadow-[0_24px_48px_-16px_rgba(0,0,0,.18),0_2px_8px_rgba(0,0,0,.06)]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {primary.map((m, i) => (
                      <div key={m.id}>
                        <ModelItem
                          model={m}
                          active={m.id === selectedModel}
                          onClick={() => {
                            onModelChange(m.id);
                            setMenuOpen(false);
                          }}
                        />
                        {i === 0 && <div className="h-px bg-border-200 my-1.5 mx-1" />}
                      </div>
                    ))}
                    {primary.length === 0 && (
                      <div className="px-3 py-2.5 text-[13px] text-text-400">
                        No cloud models available
                      </div>
                    )}

                    {local.reachable && local.models.length > 0 && (
                      <>
                        <div className="h-px bg-border-200 my-1.5 mx-1" />
                        <div className="px-3 pt-1.5 pb-0.5 text-[10.5px] tracking-[.08em] uppercase text-text-400">
                          Local · Ollama
                        </div>
                        <div className="max-h-44 overflow-y-auto">
                          {local.models.map((m) => {
                            const id = toLocalId(m.name);
                            const active = id === selectedModel;
                            return (
                              <button
                                key={m.name}
                                type="button"
                                onClick={() => {
                                  onModelChange(id);
                                  setMenuOpen(false);
                                }}
                                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left hover:bg-bg-100"
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="text-[14px] font-medium text-text-000 leading-tight truncate">
                                    {m.name}
                                  </div>
                                  <div className="text-[11.5px] text-text-400 mt-0.5">
                                    {(m.sizeBytes / 1024 ** 3).toFixed(1)} GB
                                    {m.details?.parameter_size
                                      ? ` · ${m.details.parameter_size}`
                                      : ""}
                                  </div>
                                </div>
                                {active && (
                                  <Check className="w-4 h-4 text-text-000 shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}

                    <div className="h-px bg-border-200 my-1.5 mx-1" />

                    <button
                      type="button"
                      onClick={() => onThinkingModeChange(!thinkingMode)}
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
                      <span
                        className={cn(
                          "relative h-5 w-9 shrink-0 rounded-full transition-colors",
                          thinkingMode ? "bg-text-000" : "bg-bg-400"
                        )}
                      >
                        <span
                          className={cn(
                            "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
                            thinkingMode && "translate-x-4"
                          )}
                        />
                      </span>
                    </button>

                    {rest.length > 0 && (
                      <>
                        <div className="h-px bg-border-200 my-1.5 mx-1" />
                        <button
                          type="button"
                          onClick={() => setShowAll((v) => !v)}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left hover:bg-bg-100"
                        >
                          <div className="flex-1 min-w-0 text-[14px] font-medium text-text-000 leading-tight">
                            More models
                          </div>
                          <ChevronDown
                            className={cn(
                              "w-3.5 h-3.5 text-text-400 transition-transform",
                              showAll ? "rotate-180" : "-rotate-90"
                            )}
                          />
                        </button>

                        {showAll && (
                          <div className="mt-1 max-h-64 overflow-y-auto">
                            {rest.map((m) => (
                              <ModelItem
                                key={m.id}
                                model={m}
                                active={m.id === selectedModel}
                                onClick={() => {
                                  onModelChange(m.id);
                                  setMenuOpen(false);
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              {isStreaming ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStop();
                  }}
                  className="inline-flex items-center justify-center h-8 w-8 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm"
                  aria-label="Stop generating"
                >
                  <div className="w-3.5 h-3.5 rounded-sm bg-current" />
                </button>
              ) : canSend ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSubmit();
                  }}
                  className="inline-flex items-center justify-center h-8 w-8 rounded-xl bg-accent-000 text-accent-fg hover:bg-accent-100 shadow-sm transition-colors"
                  aria-label="Send"
                >
                  <ArrowUp className="w-4 h-4" strokeWidth={2.5} />
                </button>
              ) : (
                <button
                  type="button"
                  className="inline-flex items-center justify-center h-8 w-8 rounded-xl text-text-300 hover:bg-bg-300 hover:text-text-000 transition-colors"
                  aria-label="Voice input"
                  title="Voice"
                >
                  <Mic className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {dragging && (
            <div className="absolute inset-0 bg-bg-000/90 border-2 border-dashed border-text-200 rounded-[20px] z-40 flex flex-col items-center justify-center backdrop-blur-sm pointer-events-none">
              <ImageIcon className="w-10 h-10 text-text-200 mb-2 animate-bounce" />
              <p className="text-text-200 font-medium text-sm">
                Drop image to upload
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ModelItem({
  model,
  active,
  onClick,
}: {
  model: BackendModel;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left hover:bg-bg-100"
    >
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-medium text-text-000 leading-tight truncate">
          {model.id}
        </div>
        {model.description && (
          <div className="text-[12px] text-text-400 mt-0.5 leading-[1.35] line-clamp-2">
            {model.description}
          </div>
        )}
      </div>
      {active && <Check className="w-4 h-4 text-text-000 shrink-0" />}
    </button>
  );
}

function AttachmentPreview({
  file,
  onRemove,
  removeLabel,
}: {
  file: File;
  onRemove: () => void;
  removeLabel: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="relative group flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-border-200 bg-bg-200">
        <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-2">
          <ImageIcon className="w-5 h-5 text-text-400" />
          <span className="text-[10px] text-text-400 truncate max-w-full px-1">
            {file.name}
          </span>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-black/70 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
          title={removeLabel}
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
