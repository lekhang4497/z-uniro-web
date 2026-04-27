"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export default function DocsOverview() {
  const t = useTranslations();

  const docCards = [
    {
      icon: "🚀",
      title: t("docsPage.quickStart"),
      desc: t("docsPage.quickStartDesc"),
      href: "/docs/quickstart",
    },
    {
      icon: "📖",
      title: t("docsPage.apiReference"),
      desc: t("docsPage.apiReferenceDesc"),
      href: "/docs/api-reference",
    },
    {
      icon: "⚙️",
      title: t("docsPage.configuration"),
      desc: t("docsPage.configurationDesc"),
      href: "/docs/configuration",
    },
    {
      icon: "🤖",
      title: t("docsPage.models"),
      desc: t("docsPage.modelsDesc"),
      href: "/docs/models",
    },
    {
      icon: "🐳",
      title: t("docsPage.selfHosting"),
      desc: t("docsPage.selfHostingDesc"),
      href: "/docs/self-hosting",
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight mb-3">
        {t("docsPage.title")}
      </h1>
      <p className="text-muted-foreground text-lg mb-10">
        {t("docsPage.subtitle")}
      </p>

      <div className="grid sm:grid-cols-2 gap-5">
        {docCards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="block rounded-xl border border-border bg-card p-6 hover:border-primary/40 hover:bg-card/88 transition-all duration-200 group"
          >
            <div className="text-2xl mb-3">{card.icon}</div>
            <h3 className="font-bold text-lg mb-1 group-hover:text-chart-3 transition-colors">
              {card.title}
            </h3>
            <p className="text-sm text-muted-foreground">{card.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
