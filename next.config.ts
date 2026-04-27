import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Three build modes:
//   - default            → SSR (`next start`), used for Vercel/Railway-style hosts
//   - NEXT_EXPORT=1      → static export to `out/` with no basePath
//   - NEXT_PAGES_BUILD=1 → static export with basePath set, for GitHub Pages
//
// On GitHub Pages, project sites live at /<repo>/ so every asset URL must be
// prefixed; the deploy workflow sets NEXT_PAGES_BASE_PATH from the repo name.
const isPagesBuild = process.env.NEXT_PAGES_BUILD === "1";
const isExport = isPagesBuild || process.env.NEXT_EXPORT === "1";

const basePath =
  isPagesBuild && process.env.NEXT_PAGES_BASE_PATH
    ? process.env.NEXT_PAGES_BASE_PATH
    : isPagesBuild
      ? "/z-uniro-web"
      : undefined;

const nextConfig: NextConfig = isExport
  ? {
      output: "export",
      images: { unoptimized: true },
      trailingSlash: true,
      ...(basePath ? { basePath, assetPrefix: basePath } : {}),
    }
  : {
      output: "standalone",
    };

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
