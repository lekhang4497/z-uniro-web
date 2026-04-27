"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

export default function DocsSidebar() {
  const pathname = usePathname();
  const t = useTranslations();

  const sections = [
    {
      title: t("docsSidebar.gettingStarted"),
      links: [{ label: t("docsSidebar.quickStart"), href: "/docs/quickstart" }],
    },
    {
      title: t("docsSidebar.reference"),
      links: [
        { label: t("docsSidebar.apiReference"), href: "/docs/api-reference" },
        { label: t("docsSidebar.configuration"), href: "/docs/configuration" },
        { label: t("docsSidebar.models"), href: "/docs/models" },
      ],
    },
    {
      title: t("docsSidebar.deployment"),
      links: [{ label: t("docsSidebar.selfHosting"), href: "/docs/self-hosting" }],
    },
  ];

  return (
    <aside className="w-60 flex-shrink-0 hidden lg:block border-r border-border py-8 pr-6">
      <nav className="sticky top-24 space-y-6">
        {sections.map((section) => (
          <div key={section.title}>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              {section.title}
            </h4>
            <ul className="space-y-1">
              {section.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`block px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      pathname === link.href
                        ? "bg-primary/10 text-chart-3 font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-primary/5"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
