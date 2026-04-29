"use client";

import {
  formatProviderName,
  providerLogoUrl,
  shouldInvertOnDark,
} from "@/lib/provider-display";
import { cn } from "@/lib/utils";

/**
 * Round provider avatar that resolves a logo URL from the openrouter / gstatic
 * catalog and falls back to a letter avatar if the asset 404s. Inherits color
 * via currentColor so it themes cleanly inside dark text.
 */
export function ProviderLogo({
  provider,
  size = 28,
  className,
}: {
  provider: string;
  size?: number;
  className?: string;
}) {
  const url = providerLogoUrl(provider);
  const initial = formatProviderName(provider).charAt(0).toUpperCase() || "·";
  const invertCls = shouldInvertOnDark(provider) ? "dark:invert" : "";
  return (
    <span
      className={cn(
        "relative inline-flex items-center justify-center rounded-full bg-bg-200 overflow-hidden flex-shrink-0",
        className
      )}
      style={{ width: size, height: size }}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={provider}
          loading="lazy"
          className={cn("w-full h-full object-cover", invertCls)}
          onError={(e) => {
            const t = e.currentTarget as HTMLImageElement;
            t.style.display = "none";
            const sib = t.nextElementSibling as HTMLElement | null;
            if (sib) sib.style.display = "flex";
          }}
        />
      ) : null}
      <span
        className={cn(
          "absolute inset-0 items-center justify-center text-text-200 font-semibold",
          url ? "hidden" : "flex"
        )}
        style={{ fontSize: Math.round(size * 0.45) }}
      >
        {initial}
      </span>
    </span>
  );
}
