import Link from "next/link";

export default function CTASection() {
  return (
    <section className="px-8 max-md:px-6 pt-20">
      <div className="mx-auto max-w-[1180px]">
        <div className="grid grid-cols-[1.3fr_1fr] max-md:grid-cols-1 gap-12 items-end relative overflow-hidden rounded-[18px] bg-text-000 text-bg-000 px-16 py-20 max-md:px-8 max-md:py-14">
          <h2 className="text-[56px] max-md:text-[36px] leading-[1.05] tracking-[-0.025em] font-semibold max-w-[560px] text-balance m-0">
            Start running <em className="not-italic text-bg-000/55 font-medium">your</em> agents—
            <br />
            on your terms.
          </h2>

          <div className="flex flex-col gap-4 items-start text-bg-000/75 text-[14px]">
            <div className="w-full rounded-[10px] border border-bg-000/20 bg-bg-000/5 font-mono text-[13px] px-4 py-3">
              <span className="text-bg-000/45">$</span> curl uniro.sh | sh
            </div>
            <Link
              href="/docs"
              className="rounded-full bg-bg-000 text-text-000 font-medium px-6 py-3.5 text-[14.5px] hover:bg-bg-000/90 transition-colors"
            >
              Read the getting-started guide →
            </Link>
            <div className="text-bg-000/55 text-[12.5px]">
              Works on macOS, Linux, Windows (WSL). Takes 40 seconds.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
