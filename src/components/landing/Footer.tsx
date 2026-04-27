import Link from "next/link";
import { UniroMark } from "@/components/UniroMark";

const columns: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "Pricing", href: "/#pricing" },
      { label: "Changelog", href: "/docs" },
      { label: "Roadmap", href: "/docs" },
      { label: "Status", href: "/docs" },
    ],
  },
  {
    heading: "Developers",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "API reference", href: "/docs/api-reference" },
      { label: "Tool SDK", href: "/docs" },
      { label: "Examples", href: "/docs" },
      { label: "GitHub", href: "https://github.com" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/" },
      { label: "Careers", href: "/" },
      { label: "Press", href: "/" },
      { label: "Security", href: "/docs" },
      { label: "Contact", href: "/" },
    ],
  },
  {
    heading: "Community",
    links: [
      { label: "Discord", href: "/" },
      { label: "Forum", href: "/" },
      { label: "YouTube", href: "/" },
      { label: "Newsletter", href: "/" },
      { label: "RSS", href: "/" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-bg-200 border-t border-border-200 mt-20 pt-[72px] pb-10 px-8 max-md:px-6">
      <div className="mx-auto max-w-[1180px]">
        <div className="grid grid-cols-[2fr_repeat(4,1fr)] max-md:grid-cols-2 gap-12">
          <div className="max-w-[280px] max-md:col-span-2">
            <Link
              href="/"
              className="flex items-center gap-2.5 text-[20px] tracking-tight text-text-000 mb-4"
            >
              <UniroMark size={26} />
              <span className="font-semibold tracking-tight">UNIRO</span>
            </Link>
            <p className="text-text-300 text-[13.5px]">
              A unified runtime for terminal agents. Built in Berlin &amp; Brooklyn.
              MIT-licensed core.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.heading}>
              <h4 className="font-mono text-[10.5px] tracking-[.14em] uppercase text-text-400 font-medium m-0 mb-3.5">
                {col.heading}
              </h4>
              {col.links.map((l) => (
                <Link
                  key={l.label + l.href}
                  href={l.href}
                  className="block py-1.5 text-[13.5px] text-text-200 hover:text-text-000 transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-14 pt-6 border-t border-border-300 flex max-md:flex-col max-md:gap-2 justify-between font-mono text-[12.5px] text-text-400">
          <div>© {new Date().getFullYear()} Uniro Labs · MIT License for runtime</div>
          <div>v0.8.2 · uniro@8f2c41a</div>
        </div>
      </div>
    </footer>
  );
}
