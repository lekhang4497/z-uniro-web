import fs from "fs";
import path from "path";
import DocsContent from "@/components/docs/DocsContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quick Start — UniRo Docs",
  description: "Get up and running with UniRo in under 2 minutes.",
};

const LOCALES = ["en", "vi", "ja"] as const;

function loadAllLocales(filename: string): Record<string, string> {
  const contents: Record<string, string> = {};
  for (const locale of LOCALES) {
    const filePath = path.join(process.cwd(), `src/content/${locale}/${filename}`);
    try {
      contents[locale] = fs.readFileSync(filePath, "utf-8");
    } catch {
      // locale file not found, skip
    }
  }
  return contents;
}

export default function QuickStartPage() {
  const contents = loadAllLocales("quickstart.md");
  return <DocsContent contents={contents} />;
}
