# z-uniro-web

Public web build of UniRo. Deployed to GitHub Pages on every push to `main`.

Live URL: <https://lekhang4497.github.io/z-uniro-web/>

This repo is the **website-only** copy of the frontend. The full source
(including the Electron desktop app) lives at
[lekhang4497/uniro-frontend](https://github.com/lekhang4497/uniro-frontend).

## Build modes

```bash
npm run dev         # SSR dev server on :3000

# GitHub Pages-style build (with basePath):
NEXT_PAGES_BUILD=1 npm run build       # → out/

# Plain static export (no basePath, used by the Electron app):
NEXT_EXPORT=1 npm run build            # → out/
```

The deployed site reads the backend URL from `NEXT_PUBLIC_BACKEND_URL`
(defaults to `https://api.uniro.tech`). Users can override it per-install
in **Settings → Backend**.
