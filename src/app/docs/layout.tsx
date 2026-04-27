import Nav from "@/components/landing/Nav";
import DocsSidebar from "@/components/docs/DocsSidebar";
import Footer from "@/components/landing/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation — UniRo",
  description:
    "UniRo documentation — quickstart, API reference, configuration, models, and self-hosting guides.",
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Nav />
      <div className="max-w-6xl mx-auto px-6 pt-24 pb-16 flex gap-10 min-h-screen">
        <DocsSidebar />
        <main className="flex-1 min-w-0 py-8">{children}</main>
      </div>
      <Footer />
    </>
  );
}
