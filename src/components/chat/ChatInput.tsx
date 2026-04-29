"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  ArrowUp,
  Brain,
  Check,
  ChevronDown,
  ChevronRight,
  ImageIcon,
  LayoutGrid,
  List as ListIcon,
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
import {
  formatProviderName,
  groupModelsByProvider,
  modelDisplayMeta,
  modelDisplayName,
  type ProviderGroup,
} from "@/lib/provider-display";
import { ProviderLogo } from "./ProviderLogo";
import { cn } from "@/lib/utils";

type MenuView = "main" | "providers" | "providerModels";
type ProvidersViewMode = "list" | "card";

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
  const [menuView, setMenuView] = useState<MenuView>("main");
  const [providersViewMode, setProvidersViewMode] =
    useState<ProvidersViewMode>("list");
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [plusMenuOpen, setPlusMenuOpen] = useState(false);
  const plusMenuRef = useRef<HTMLDivElement>(null);
  const local = useLocalModels();

  // Close + menu on outside click.
  useEffect(() => {
    if (!plusMenuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (
        plusMenuRef.current &&
        !plusMenuRef.current.contains(e.target as Node)
      ) {
        setPlusMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [plusMenuOpen]);

  // Always reopen on the main view; preserve list/card preference across opens.
  useEffect(() => {
    if (!menuOpen) {
      setMenuView("main");
      setSelectedProvider(null);
    }
  }, [menuOpen]);

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

  const { primary, providerGroups } = useMemo(() => {
    const profiles = backendModels.filter((m) => m.type === "routing_profile");
    const aliases = backendModels.filter((m) => m.type === "alias");
    const top = [...profiles, ...aliases].slice(0, 3);
    return {
      primary: top,
      providerGroups: groupModelsByProvider(backendModels),
    };
  }, [backendModels]);

  const activeProviderGroup = useMemo<ProviderGroup | null>(() => {
    if (!selectedProvider) return null;
    return providerGroups.find((g) => g.id === selectedProvider) ?? null;
  }, [providerGroups, selectedProvider]);

  const modelLabel = useMemo(() => {
    if (!selectedModel) return "Choose model";
    if (isLocalId(selectedModel)) return `local · ${fromLocalId(selectedModel)}`;
    const m = backendModels.find((x) => x.id === selectedModel);
    if (m) return modelDisplayMeta(m).label;
    return selectedModel;
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
            <div className="flex items-center gap-1 relative" ref={plusMenuRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPlusMenuOpen((o) => !o);
                }}
                title="More actions"
                aria-label="More actions"
                className={cn(
                  "inline-flex items-center justify-center w-[30px] h-[30px] rounded-lg transition-colors",
                  plusMenuOpen
                    ? "bg-bg-200 text-text-000"
                    : "text-text-400 hover:bg-bg-200 hover:text-text-000"
                )}
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
              {thinkingMode && (
                <span
                  className="inline-flex items-center gap-1 rounded-md bg-bg-200 text-text-200 px-1.5 py-0.5 text-[11px]"
                  title="Adaptive thinking is on — toggle from the + menu"
                >
                  <Brain className="w-3 h-3" />
                  Thinking
                </span>
              )}

              {plusMenuOpen && (
                <div
                  role="menu"
                  className="absolute bottom-[calc(100%+8px)] left-0 z-30 w-[220px] p-1.5 rounded-xl border border-border-300 bg-bg-000 shadow-[0_24px_48px_-16px_rgba(0,0,0,.18),0_2px_8px_rgba(0,0,0,.06)]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => {
                      onThinkingModeChange(!thinkingMode);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left hover:bg-bg-100"
                  >
                    <Brain className="w-4 h-4 text-text-300" />
                    <span className="flex-1 text-[13.5px] text-text-000">
                      Thinking
                    </span>
                    {thinkingMode && (
                      <Check className="w-4 h-4 text-text-000" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPlusMenuOpen(false);
                      fileInputRef.current?.click();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left hover:bg-bg-100"
                  >
                    <ImageIcon className="w-4 h-4 text-text-300" />
                    <span className="flex-1 text-[13.5px] text-text-000">
                      Add image
                    </span>
                  </button>
                </div>
              )}
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
                    className={cn(
                      "absolute bottom-[calc(100%+10px)] right-0 z-30 p-1.5 rounded-xl border border-border-300 bg-bg-000 shadow-[0_24px_48px_-16px_rgba(0,0,0,.18),0_2px_8px_rgba(0,0,0,.06)] transition-[width] duration-100 flex flex-col",
                      menuView === "providers" && providersViewMode === "card"
                        ? "w-[400px]"
                        : "w-[320px]"
                    )}
                    style={{ maxHeight: "min(560px, calc(100vh - 140px))" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {menuView === "main" && (
                      <div className="overflow-y-auto">
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
                            {i === 0 && (
                              <div className="h-px bg-border-200 my-1.5 mx-1" />
                            )}
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
                          </>
                        )}

                        {providerGroups.length > 0 && (
                          <>
                            <div className="h-px bg-border-200 my-1.5 mx-1" />
                            <button
                              type="button"
                              onClick={() => setMenuView("providers")}
                              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left hover:bg-bg-100"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="text-[14px] font-medium text-text-000 leading-tight">
                                  More models
                                </div>
                                <div className="text-[12px] text-text-400 mt-0.5 leading-[1.35]">
                                  Browse by provider · {providerGroups.length}{" "}
                                  providers
                                </div>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-text-400" />
                            </button>
                          </>
                        )}
                      </div>
                    )}

                    {menuView === "providers" && (
                      <ProvidersView
                        groups={providerGroups}
                        viewMode={providersViewMode}
                        onViewModeChange={setProvidersViewMode}
                        onBack={() => setMenuView("main")}
                        onSelect={(id) => {
                          setSelectedProvider(id);
                          setMenuView("providerModels");
                        }}
                      />
                    )}

                    {menuView === "providerModels" && activeProviderGroup && (
                      <ProviderModelsView
                        group={activeProviderGroup}
                        selectedModel={selectedModel}
                        onBack={() => setMenuView("providers")}
                        onSelect={(id) => {
                          onModelChange(id);
                          setMenuOpen(false);
                        }}
                      />
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
  label,
}: {
  model: BackendModel;
  active: boolean;
  onClick: () => void;
  label?: string;
}) {
  const meta = modelDisplayMeta(model);
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left hover:bg-bg-100"
    >
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-medium text-text-000 leading-tight truncate">
          {label ?? meta.label}
        </div>
        {meta.description && (
          <div className="text-[12px] text-text-400 mt-0.5 leading-[1.35] line-clamp-2">
            {meta.description}
          </div>
        )}
      </div>
      {active && <Check className="w-4 h-4 text-text-000 shrink-0" />}
    </button>
  );
}

function ProvidersView({
  groups,
  viewMode,
  onViewModeChange,
  onBack,
  onSelect,
}: {
  groups: ProviderGroup[];
  viewMode: "list" | "card";
  onViewModeChange: (m: "list" | "card") => void;
  onBack: () => void;
  onSelect: (provider: string) => void;
}) {
  return (
    <div className="flex flex-col min-h-0 flex-1">
      <div className="flex items-center gap-1 px-1 pt-0.5 pb-1.5 shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-text-300 hover:bg-bg-100 hover:text-text-000"
          title="Back"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 text-[13.5px] font-medium text-text-000 px-1">
          Browse providers
        </div>
        <div className="inline-flex gap-0.5">
          <button
            type="button"
            onClick={() => onViewModeChange("list")}
            className={cn(
              "inline-flex items-center justify-center h-7 w-7 rounded-md transition-colors",
              viewMode === "list"
                ? "bg-bg-200 text-text-000"
                : "text-text-400 hover:bg-bg-100 hover:text-text-000"
            )}
            title="List view"
            aria-label="List view"
          >
            <ListIcon className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("card")}
            className={cn(
              "inline-flex items-center justify-center h-7 w-7 rounded-md transition-colors",
              viewMode === "card"
                ? "bg-bg-200 text-text-000"
                : "text-text-400 hover:bg-bg-100 hover:text-text-000"
            )}
            title="Card view"
            aria-label="Card view"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="h-px bg-border-200 mx-1 mb-1 shrink-0" />
      {groups.length === 0 ? (
        <div className="px-3 py-6 text-center text-[13px] text-text-400">
          No providers available
        </div>
      ) : viewMode === "list" ? (
        <div className="overflow-y-auto min-h-0 flex-1">
          {groups.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => onSelect(g.id)}
              className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left hover:bg-bg-100"
            >
              <ProviderLogo provider={g.id} size={28} />
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] font-medium text-text-000 truncate">
                  {formatProviderName(g.id)}
                </div>
                <div className="text-[11.5px] text-text-400">
                  {g.models.length} model{g.models.length === 1 ? "" : "s"}
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-text-400 shrink-0" />
            </button>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-1.5 overflow-y-auto min-h-0 flex-1 p-1">
          {groups.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => onSelect(g.id)}
              className="flex flex-col items-start gap-2 rounded-lg border border-border-200 bg-bg-000 px-3 py-3 text-left hover:border-text-200 transition-colors"
            >
              <ProviderLogo provider={g.id} size={32} />
              <div className="min-w-0 w-full">
                <div className="text-[13px] font-medium text-text-000 truncate">
                  {formatProviderName(g.id)}
                </div>
                <div className="text-[11px] text-text-400 mt-0.5">
                  {g.models.length} model{g.models.length === 1 ? "" : "s"}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ProviderModelsView({
  group,
  selectedModel,
  onBack,
  onSelect,
}: {
  group: ProviderGroup;
  selectedModel: string;
  onBack: () => void;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex flex-col min-h-0 flex-1">
      <div className="flex items-center gap-1 px-1 pt-0.5 pb-1.5 shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-text-300 hover:bg-bg-100 hover:text-text-000"
          title="Back"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 flex items-center gap-2 min-w-0 px-1">
          <ProviderLogo provider={group.id} size={20} />
          <div className="text-[13.5px] font-medium text-text-000 truncate">
            {formatProviderName(group.id)}
          </div>
          <span className="text-[11.5px] text-text-400 ml-auto">
            {group.models.length}
          </span>
        </div>
      </div>
      <div className="h-px bg-border-200 mx-1 mb-1 shrink-0" />
      <div className="overflow-y-auto min-h-0 flex-1">
        {group.models.map((m) => (
          <ModelItem
            key={m.id}
            model={m}
            active={m.id === selectedModel}
            label={modelDisplayName(m.id)}
            onClick={() => onSelect(m.id)}
          />
        ))}
      </div>
    </div>
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
