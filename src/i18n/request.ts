import { getRequestConfig } from "next-intl/server";

// For static export (NEXT_EXPORT=1 — used by the desktop build) we can't read
// cookies at build time, so we lock the locale to English. The web build keeps
// the cookie-driven language switcher.
const isExport =
  process.env.NEXT_EXPORT === "1" || process.env.NEXT_PAGES_BUILD === "1";

export default getRequestConfig(async () => {
  if (isExport) {
    const messages = (await import("../../messages/en.json")).default;
    return { locale: "en", messages };
  }

  const { cookies } = await import("next/headers");
  const store = await cookies();
  const locale = store.get("locale")?.value || "en";
  const messages = (await import(`../../messages/${locale}.json`)).default;
  return { locale, messages };
});
