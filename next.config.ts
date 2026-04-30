import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { existsSync } from "node:fs";
import path from "node:path";

// Three build modes:
//   - default            → SSR (`next start`), used for Vercel/Railway-style hosts
//   - NEXT_EXPORT=1      → static export to `out/` with no basePath
//   - NEXT_PAGES_BUILD=1 → static export with basePath set, for GitHub Pages
//
// On GitHub Pages, project sites live at /<repo>/ so every asset URL must be
// prefixed; the deploy workflow sets NEXT_PAGES_BASE_PATH from the repo name.
// Exception: if `public/CNAME` exists, Pages serves the site at the root of a
// custom domain (www.uniro.tech) and the basePath would 404 every asset.
const isPagesBuild = process.env.NEXT_PAGES_BUILD === "1";
const isExport = isPagesBuild || process.env.NEXT_EXPORT === "1";
const hasCustomDomain = existsSync(path.join(__dirname, "public", "CNAME"));

const basePath =
  isPagesBuild && !hasCustomDomain
    ? process.env.NEXT_PAGES_BASE_PATH || "/z-uniro-web"
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
