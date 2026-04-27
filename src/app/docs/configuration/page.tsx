import fs from "fs";
import path from "path";
import DocsContent from "@/components/docs/DocsContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Configuration — UniRo Docs",
  description:
    "Configure UniRo with environment variables, routing profiles, and model aliases.",
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

export default function ConfigurationPage() {
  const contents = loadAllLocales("configuration.md");
  return <DocsContent contents={contents} />;
}
