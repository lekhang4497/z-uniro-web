import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chat — UniRo",
  description: "Chat with AI using UniRo intelligent routing.",
};

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex h-[100dvh] flex-col overflow-hidden">{children}</div>;
}
