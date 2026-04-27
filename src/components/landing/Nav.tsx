"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { UniroMark } from "@/components/UniroMark";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations();

  const links = [
    { label: "Features", href: "/#features" },
    { label: t("nav.docs"), href: "/docs" },
    { label: t("nav.pricing"), href: "/#pricing" },
    { label: "Changelog", href: "/docs" },
    { label: "Community", href: "/docs" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={
        "sticky top-0 z-50 border-b transition-colors " +
        (scrolled
          ? "bg-bg-100/85 backdrop-blur-[14px] backdrop-saturate-[1.4] border-border-200"
          : "bg-transparent border-transparent")
      }
    >
      <div className="mx-auto max-w-[1180px] h-16 px-8 max-md:px-6 flex items-center gap-7">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-[20px] tracking-tight text-text-000"
        >
          <UniroMark size={26} />
          <span className="font-semibold tracking-tight">UNIRO</span>
        </Link>

        <div className="hidden md:flex gap-6 ml-3 text-[14px]">
          {links.map((l) => (
            <Link
              key={l.href + l.label}
              href={l.href}
              className={
                pathname === l.href
                  ? "text-text-000 font-medium"
                  : "text-text-200 hover:text-text-000 transition-colors"
              }
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex-1" />

        <div className="hidden md:flex items-center gap-[18px] text-[14px]">
          <Link href="/chat" className="text-text-400 hover:text-text-000 transition-colors">
            Sign in
          </Link>
          <Link
            href="/chat"
            className="inline-flex items-center rounded-lg bg-accent-000 hover:bg-accent-100 text-accent-fg px-4 py-2 text-[13.5px] font-medium transition-colors"
          >
            Install Uniro
          </Link>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(true)}
          className="md:hidden text-text-300 hover:text-text-000"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="right" className="w-[280px] bg-bg-000">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex flex-col gap-4 pt-4 px-2">
            {links.map((l) => (
              <Link
                key={l.href + l.label}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="text-[15px] text-text-200 hover:text-text-000 transition-colors"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/chat"
              onClick={() => setMobileOpen(false)}
              className="text-[15px] font-medium bg-accent-000 hover:bg-accent-100 text-accent-fg px-4 py-2 rounded-lg text-center"
            >
              Install Uniro
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
}
