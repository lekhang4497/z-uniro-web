"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useLocale } from "next-intl";

interface DocsContentProps {
  contents: Record<string, string>;
}

export default function DocsContent({ contents }: DocsContentProps) {
  const locale = useLocale();
  const content = contents[locale] || contents["en"] || "";

  return (
    <article className="docs-content max-w-3xl">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </article>
  );
}
