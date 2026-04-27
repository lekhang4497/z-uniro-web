import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "@/styles/globals.css";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "UniRo — Intelligent LLM Router for Every Language",
  description:
    "Cut LLM costs by 50-80%. The only router that optimizes for complexity, cost, AND language efficiency. OpenAI-compatible drop-in replacement.",
  openGraph: {
    title: "UniRo — Intelligent LLM Router for Every Language",
    description:
      "Cut LLM costs by 50-80%. The only router that optimizes for complexity, cost, AND language efficiency.",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider messages={messages}>
            {children}
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
