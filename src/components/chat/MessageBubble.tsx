"use client";

import React, { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { Copy, RefreshCw, Pencil, ThumbsUp, ThumbsDown, Check } from "lucide-react";
import type { Message } from "@/types";
import { cn } from "@/lib/utils";
import {
  extractProvider,
  formatProviderName,
  modelDisplayName,
} from "@/lib/provider-display";
import { ProviderLogo } from "./ProviderLogo";

function normaliseLatex(text: string): string {
    const codeBlocks: string[] = [];
    let result = text.replace(/(```[\s\S]*?```)/g, (_m, block) => {
        codeBlocks.push(block);
        return `%%CODEBLOCK_${codeBlocks.length - 1}%%`;
    });
    result = result.replace(/\\\[([\s\S]*?)\\\]/g, (_m, inner) => `\n$$${inner}$$\n`);
    result = result.replace(/\\\(([\s\S]*?)\\\)/g, (_m, inner) => `$${inner}$`);
    result = result.replace(
        /(\$\$)([\s\S]*?)\1/g,
        (_m, _delim, inner) => `\n\n$$${inner}$$\n\n`
    );
    result = result.replace(/\n{3,}/g, "\n\n");
    result = result.replace(/%%CODEBLOCK_(\d+)%%/g, (_m, idx) => codeBlocks[Number(idx)]);
    return result;
}

interface MessageBubbleProps {
    message: Message;
    isStreaming?: boolean;
    onRegenerate?: () => void;
    onEdit?: (content: string) => void;
}

function parseThinkBlocks(content: string): { thinking: string | null; reply: string } {
    const openTag = "<think>";
    const closeTag = "</think>";
    const openIdx = content.indexOf(openTag);
    if (openIdx === -1) return { thinking: null, reply: content };
    const afterOpen = openIdx + openTag.length;
    const closeIdx = content.indexOf(closeTag, afterOpen);
    if (closeIdx === -1) return { thinking: content.slice(afterOpen), reply: "" };
    const thinkContent = content.slice(afterOpen, closeIdx).trim();
    const reply = content.slice(closeIdx + closeTag.length).trim();
    return { thinking: thinkContent || null, reply };
}

function ThinkingBlock({ content, isStreaming }: { content: string; isStreaming?: boolean }) {
    const [expanded, setExpanded] = useState(isStreaming ?? false);
    const isOpen = isStreaming || expanded;
    return (
        <div className="mb-3 rounded-xl border border-border-200 bg-bg-100 overflow-hidden">
            <button
                onClick={() => setExpanded(!expanded)}
                className="flex w-full items-center gap-2 px-3.5 py-2 text-[13px] font-medium text-text-300 hover:text-text-000 transition-colors"
                type="button"
            >
                <svg
                    className={cn(
                        "w-3.5 h-3.5 transition-transform duration-200",
                        isOpen && "rotate-90"
                    )}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
                <span>Thinking{isStreaming ? "…" : ""}</span>
                {isStreaming && (
                    <span className="flex gap-1 ml-1">
                        {[0, 0.15, 0.3].map((d) => (
                            <span
                                key={d}
                                className="w-1 h-1 rounded-full bg-text-400"
                                style={{
                                    animation: "typing-dot 1.4s infinite",
                                    animationDelay: `${d}s`,
                                }}
                            />
                        ))}
                    </span>
                )}
            </button>
            {isOpen && (
                <div className="px-3.5 pb-3 text-[13px] text-text-300 leading-relaxed border-t border-border-200">
                    <div className="pt-2 message-content">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm, remarkMath]}
                            rehypePlugins={[[rehypeKatex, { strict: false, throwOnError: false }]]}
                        >
                            {normaliseLatex(content)}
                        </ReactMarkdown>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function MessageBubble({
    message,
    isStreaming,
    onRegenerate,
    onEdit,
}: MessageBubbleProps) {
    const isUser = message.role === "user";

    const { thinking, reply } = useMemo(
        () => parseThinkBlocks(message.content || ""),
        [message.content]
    );

    const normalised = useMemo(() => normaliseLatex(reply), [reply]);

    const [copied, setCopied] = useState(false);
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(message.content);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(message.content);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            // ignore
        }
    };

    if (isUser) {
        return (
            <div className="group relative flex w-full justify-end px-1 py-2 animate-fade-in-up user-message">
                <div className="max-w-[80%] min-w-0">
                    {editing ? (
                        <EditForm
                            initial={draft}
                            onCancel={() => {
                                setDraft(message.content);
                                setEditing(false);
                            }}
                            onSave={(newText) => {
                                setEditing(false);
                                setDraft(newText);
                                onEdit?.(newText);
                            }}
                        />
                    ) : (
                        <div
                            className="user-bubble rounded-[14px_14px_4px_14px] px-3.5 py-2.5 text-[15px] whitespace-pre-wrap leading-[1.65] text-text-000"
                        >
                            {message.content}
                        </div>
                    )}

                    {!editing && !isStreaming && (
                        <div className="flex items-center justify-end gap-0.5 mt-2 -mr-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                            <ActionBtn onClick={copy} title={copied ? "Copied" : "Copy"}>
                                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            </ActionBtn>
                            {onEdit && (
                                <ActionBtn onClick={() => setEditing(true)} title="Edit">
                                    <Pencil className="w-3.5 h-3.5" />
                                </ActionBtn>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="group relative flex w-full px-1 py-2 animate-fade-in-up assistant-message">
            <div className="flex-auto w-0 min-w-0">
                {message.model && (
                    <ModelByline model={message.model} />
                )}

                <>
                    {thinking && (
                        <ThinkingBlock content={thinking} isStreaming={isStreaming && !reply} />
                    )}
                    {normalised && (
                        <div className="message-content text-[15px] text-text-000 leading-[1.7]">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm, remarkMath]}
                                rehypePlugins={[[rehypeKatex, { strict: false, throwOnError: false }]]}
                            >
                                {normalised}
                            </ReactMarkdown>
                        </div>
                    )}
                </>

                {!isStreaming && (
                    <div className="flex items-center gap-0.5 mt-2 -ml-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                        <ActionBtn onClick={copy} title={copied ? "Copied" : "Copy"}>
                            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </ActionBtn>
                        {onRegenerate && (
                            <ActionBtn onClick={onRegenerate} title="Regenerate">
                                <RefreshCw className="w-3.5 h-3.5" />
                            </ActionBtn>
                        )}
                        <ActionBtn title="Good response">
                            <ThumbsUp className="w-3.5 h-3.5" />
                        </ActionBtn>
                        <ActionBtn title="Bad response">
                            <ThumbsDown className="w-3.5 h-3.5" />
                        </ActionBtn>
                    </div>
                )}
            </div>
        </div>
    );
}

function ActionBtn({
    children,
    title,
    onClick,
}: {
    children: React.ReactNode;
    title: string;
    onClick?: () => void;
}) {
    return (
        <button
            type="button"
            title={title}
            aria-label={title}
            onClick={onClick}
            className="p-1.5 rounded-lg text-text-400 hover:text-text-000 hover:bg-bg-200 transition-colors"
        >
            {children}
        </button>
    );
}

function EditForm({
    initial,
    onSave,
    onCancel,
}: {
    initial: string;
    onSave: (v: string) => void;
    onCancel: () => void;
}) {
    const [val, setVal] = useState(initial);
    return (
        <div className="rounded-xl border border-border-300 bg-bg-000 p-3">
            <textarea
                className="w-full bg-transparent outline-none resize-none text-[15px] text-text-000 leading-[1.6]"
                rows={Math.min(8, Math.max(2, val.split("\n").length))}
                value={val}
                onChange={(e) => setVal(e.target.value)}
                autoFocus
            />
            <div className="flex justify-end gap-1 mt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-3 h-8 rounded-lg text-[13px] text-text-300 hover:bg-bg-200"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={() => onSave(val.trim())}
                    className="px-3 h-8 rounded-lg text-[13px] bg-accent-000 text-accent-fg hover:bg-accent-100"
                >
                    Save
                </button>
            </div>
        </div>
    );
}

function ModelByline({ model }: { model: string }) {
    const provider = extractProvider(model);
    const shortName = modelDisplayName(model);
    return (
        <div className="mb-1 inline-flex items-center gap-1.5 text-[11px] text-text-400">
            {provider && <ProviderLogo provider={provider} size={14} />}
            <span title={model}>
                {provider ? (
                    <>
                        <span className="text-text-300">{formatProviderName(provider)}</span>
                        <span className="mx-1 text-text-500">/</span>
                        <span>{shortName}</span>
                    </>
                ) : (
                    model
                )}
            </span>
        </div>
    );
}
