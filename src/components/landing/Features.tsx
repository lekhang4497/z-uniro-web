export default function Features() {
  const cells: { glyph: string; title: string; body: React.ReactNode; learn: string }[] = [
    {
      glyph: "⌘",
      title: "Plans before edits.",
      body: "Uniro writes a plan, shows the diff it intends to make, and asks once. No silent rewrites of your files — every change is reviewable before it lands.",
      learn: "How planning works",
    },
    {
      glyph: "⇄",
      title: "One flag, any model.",
      body: (
        <>
          Switch between Claude, GPT, local Llama, or your own endpoint with{" "}
          <span className="font-mono text-[12.5px]">--model</span>. Session state,
          tools, and context carry across providers unchanged.
        </>
      ),
      learn: "Supported providers",
    },
    {
      glyph: "◉",
      title: "Sandboxed by default.",
      body: "File writes go through a worktree. Shell commands run inside a restricted profile. Network and secrets are opt-in, per session. Nothing escapes unless you say so.",
      learn: "Security model",
    },
  ];

  return (
    <section id="features" className="py-16 px-8 max-md:px-6">
      <div className="mx-auto max-w-[1180px]">
        <span className="inline-block font-mono text-[11px] tracking-[.18em] uppercase text-text-300">
          02 / Core capabilities
        </span>
        <h2 className="mt-3.5 text-[44px] max-md:text-[32px] leading-[1.05] tracking-[-0.025em] font-medium max-w-[780px] m-0">
          Three things that{" "}
          <span className="text-text-300 font-medium">change the work.</span>
        </h2>
      </div>

      <div className="mx-auto max-w-[1180px] mt-10">
        <div className="grid grid-cols-3 max-md:grid-cols-1 border-t border-b border-border-200">
          {cells.map((c, i) => (
            <div
              key={c.title}
              className={
                "group px-8 py-9 border-r border-border-200 last:border-r-0 max-md:border-r-0" +
                (i < cells.length - 1 ? " max-md:border-b" : "")
              }
            >
              <div className="mb-6 inline-grid place-items-center w-[42px] h-[42px] rounded-[10px] border border-border-300 bg-bg-100 font-mono text-[16px] text-text-000">
                {c.glyph}
              </div>
              <h3 className="text-[22px] tracking-[-0.02em] font-semibold m-0 mb-2.5 text-text-000">
                {c.title}
              </h3>
              <p className="text-[14.5px] text-text-200 m-0">{c.body}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] text-text-000">
                {c.learn}
                <span className="inline-block transition-transform group-hover:translate-x-1">
                  →
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
