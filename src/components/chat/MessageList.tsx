"use client";

import { useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";
import type { Message } from "@/types";

interface MessageListProps {
  messages: Message[];
  isStreaming: boolean;
  onSuggestionClick?: (suggestion: string) => void;
}

// If the user has scrolled up by more than this from the bottom, treat
// it as "they're reading history" and don't yank them back when new
// content streams in.
const STICK_THRESHOLD_PX = 200;

export default function MessageList({ messages, isStreaming }: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distanceFromBottom > STICK_THRESHOLD_PX) return;
    // `instant` while streaming so we don't queue an animation per chunk;
    // smooth on user-driven changes (new message, switched conv) for polish.
    bottomRef.current?.scrollIntoView({
      behavior: isStreaming ? "instant" : "smooth",
    });
  }, [messages, isStreaming]);

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto px-4 py-6 md:px-6">
      <div className="mx-auto max-w-3xl">
        {messages.map((msg, i) => (
          <MessageBubble
            key={i}
            message={msg}
            isStreaming={isStreaming && i === messages.length - 1}
          />
        ))}

        {isStreaming && messages[messages.length - 1]?.role === "assistant" && !messages[messages.length - 1]?.content && (
          <div className="animate-fade-in-up mb-5">
            <div className="flex items-center gap-2 py-2">
              <div className="flex gap-1.5">
                {[0, 0.15, 0.3].map((delay) => (
                  <span
                    key={delay}
                    className="w-1.5 h-1.5 rounded-full bg-text-400"
                    style={{
                      animation: "typing-dot 1.4s infinite",
                      animationDelay: `${delay}s`,
                    }}
                  />
                ))}
              </div>
              <span className="text-[13px] text-text-400">Connecting to model…</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
