"use client";

import Nav from "@/components/landing/Nav";
import Footer from "@/components/landing/Footer";
import FadeIn from "@/components/landing/FadeIn";
import { useTranslations } from "next-intl";

const modelPricing = [
  { model: "gemini-2.5-flash", provider: "Google", input: "$0.15", output: "$0.60" },
  { model: "gemini-2.5-pro", provider: "Google", input: "$1.25", output: "$10.00" },
  { model: "gpt-5.4", provider: "OpenAI", input: "$2.50", output: "$10.00" },
  { model: "gpt-4.1-mini", provider: "OpenAI", input: "$0.40", output: "$1.60" },
  { model: "claude-sonnet-4-5", provider: "Anthropic", input: "$3.00", output: "$15.00" },
  { model: "claude-opus-4-6", provider: "Anthropic", input: "$15.00", output: "$75.00" },
  { model: "deepseek-chat", provider: "DeepSeek", input: "$0.27", output: "$1.10" },
  { model: "ollama/*", provider: "Local", input: "$0.00", output: "$0.00" },
];

export default function PricingPage() {
  const t = useTranslations();

  const tiers = [
    {
      name: t("pricing.free"),
      price: "$0",
      period: t("pricing.freePeriod"),
      desc: t("pricing.freeDesc"),
      features: t.raw("pricing.freeFeatures") as string[],
      cta: t("pricing.freeCta"),
      highlight: false,
    },
    {
      name: t("pricing.pro"),
      price: "$29",
      period: t("pricing.proPeriod"),
      desc: t("pricing.proDesc"),
      features: t.raw("pricing.proFeatures") as string[],
      cta: t("pricing.proCta"),
      highlight: true,
    },
    {
      name: t("pricing.enterprise"),
      price: "Custom",
      period: t("pricing.enterprisePeriod"),
      desc: t("pricing.enterpriseDesc"),
      features: t.raw("pricing.enterpriseFeatures") as string[],
      cta: t("pricing.enterpriseCta"),
      highlight: false,
    },
  ];

  return (
    <>
      <Nav />
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-center mb-4">
              {t("pricingPage.title")}
            </h1>
            <p className="text-muted-foreground text-center mb-16 text-lg max-w-2xl mx-auto">
              {t("pricingPage.subtitle")}
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6 mb-20">
            {tiers.map((tier, i) => (
              <FadeIn key={tier.name} delay={i * 0.1}>
                <div
                  className={`h-full rounded-xl border p-6 flex flex-col ${
                    tier.highlight
                      ? "border-primary bg-primary/8 shadow-[0_0_40px_-10px_hsl(var(--primary)/0.3)]"
                      : "border-border bg-card"
                  }`}
                >
                  <div className="mb-6">
                    <h3 className="font-bold text-lg mb-2">{tier.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold">
                        {tier.price}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        {tier.period}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {tier.desc}
                    </p>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {tier.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2.5 text-sm text-muted-foreground"
                      >
                        <span className="text-green-500 mt-0.5 flex-shrink-0">
                          &#10003;
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <a
                    href="/chat"
                    className={`block text-center py-3 rounded-lg font-semibold text-sm transition-colors ${
                      tier.highlight
                        ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                        : "border border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
                    }`}
                  >
                    {tier.cta}
                  </a>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn>
            <h2 className="text-2xl font-bold tracking-tight text-center mb-8">
              {t("pricingPage.perModelTitle")}
            </h2>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-primary/8">
                    <th className="text-left px-5 py-3 font-semibold text-chart-3">
                      {t("pricingPage.tableModel")}
                    </th>
                    <th className="text-left px-5 py-3 font-semibold text-chart-3">
                      {t("pricingPage.tableProvider")}
                    </th>
                    <th className="text-left px-5 py-3 font-semibold text-chart-3">
                      {t("pricingPage.tableInput")}
                    </th>
                    <th className="text-left px-5 py-3 font-semibold text-chart-3">
                      {t("pricingPage.tableOutput")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {modelPricing.map((row) => (
                    <tr
                      key={row.model}
                      className="border-t border-border"
                    >
                      <td className="px-5 py-3 font-mono text-foreground">
                        {row.model}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {row.provider}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {row.input}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {row.output}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeIn>

          <div className="mt-20">
            <FadeIn>
              <h2 className="text-2xl font-bold tracking-tight text-center mb-10">
                {t("pricingPage.billingFaqTitle")}
              </h2>
            </FadeIn>
            <div className="max-w-3xl mx-auto space-y-6">
              {(t.raw("pricingPage.billingFaq") as { q: string; a: string }[]).map((item, i) => (
                <FadeIn key={item.q} delay={i * 0.05}>
                  <div className="rounded-xl border border-border bg-card p-6">
                    <h3 className="font-semibold mb-2">{item.q}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.a}
                    </p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>

          <FadeIn delay={0.2}>
            <p className="text-center text-sm text-muted-foreground mt-16 max-w-2xl mx-auto">
              {t("pricingPage.footer")}
            </p>
          </FadeIn>
        </div>
      </main>
      <Footer />
    </>
  );
}
