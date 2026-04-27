"use client";

import Link from "next/link";
import FadeIn from "./FadeIn";
import { useTranslations } from "next-intl";
import { Building2, User, Users, type LucideIcon } from "lucide-react";

export default function Pricing() {
  const t = useTranslations();

  const tiers: {
    name: string;
    price: string;
    period: string;
    desc: string;
    cta: string;
    ctaHref: string;
    Icon: LucideIcon;
  }[] = [
    {
      name: t("pricing.free"),
      price: "$0",
      period: t("pricing.freePeriod"),
      desc: t("pricing.freeDesc"),
      cta: t("pricing.freeCta"),
      ctaHref: "/chat",
      Icon: User,
    },
    {
      name: t("pricing.pro"),
      price: "$19",
      period: t("pricing.proPeriod"),
      desc: t("pricing.proDesc"),
      cta: t("pricing.proCta"),
      ctaHref: "/chat",
      Icon: Users,
    },
    {
      name: t("pricing.enterprise"),
      price: "Custom",
      period: t("pricing.enterprisePeriod"),
      desc: t("pricing.enterpriseDesc"),
      cta: t("pricing.enterpriseCta"),
      ctaHref: "/pricing",
      Icon: Building2,
    },
  ];

  return (
    <section id="pricing" className="py-20 lg:py-32 px-6">
      <div className="max-w-[1180px] mx-auto">
        <FadeIn>
          <h2 className="font-medium text-[32px] md:text-[40px] lg:text-[52px] leading-[1.1] tracking-tight text-center mb-4 text-text-000">
            {t("pricing.title")}
          </h2>
          <p className="text-text-300 text-center mb-16 text-lg max-w-2xl mx-auto">
            {t("pricing.subtitle")}
          </p>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-5">
          {tiers.map((tier, i) => (
            <FadeIn key={tier.name} delay={i * 0.1}>
              <div className="h-full min-h-[440px] rounded-2xl border border-border-200 bg-bg-000 px-8 pt-9 pb-8 flex flex-col">
                <div className="text-text-000 mb-6">
                  <tier.Icon className="w-12 h-12" strokeWidth={1.5} />
                </div>

                <h3 className="text-[28px] font-semibold tracking-tight text-text-000 mb-3">
                  {tier.name}
                </h3>
                <p className="text-[14px] leading-[1.5] text-text-200 mb-7">
                  {tier.desc}
                </p>

                <div className="mt-auto">
                  <div className="text-[28px] font-semibold tracking-tight leading-[1.1] text-text-000">
                    {tier.price}
                  </div>
                  <div className="text-[12.5px] text-text-300 mt-1.5">
                    {tier.period}
                  </div>

                  <Link
                    href={tier.ctaHref}
                    className="mt-6 flex w-full items-center justify-center rounded-lg bg-accent-000 text-accent-fg hover:bg-accent-100 px-6 py-3.5 text-[14px] font-medium transition-colors"
                  >
                    {tier.cta}
                  </Link>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.3}>
          <p className="text-center text-sm text-text-300 mt-10 max-w-2xl mx-auto">
            {t("pricing.footer")}
          </p>
          <div className="text-center mt-4">
            <Link
              href="/pricing"
              className="text-[15px] text-text-000 underline decoration-border-300 underline-offset-2 hover:decoration-text-300 transition-colors"
            >
              {t("pricing.seeFullPricing")}
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
