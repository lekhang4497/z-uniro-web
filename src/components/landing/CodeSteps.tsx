export default function CodeSteps() {
  const lines = [
    [`import`, ` { defineConfig } `, `from`, ` "uniro";`],
    null,
    [`export default`, ` `, `defineConfig`, `({`],
    [`  `, `model`, `: `, `"claude-4-opus"`, `,`],
    [`  `, `budget`, `: { `, `usd`, `: `, `5`, `, `, `tokens`, `: `, `200_000`, ` },`],
    null,
    [`  `, `// everything the agent can touch`],
    [`  `, `tools`, `: [`],
    [`    `, `fs`, `({ `, `root`, `: `, `"./src"`, `, `, `write`, `: `, `"worktree"`, ` }),`],
    [`    `, `shell`, `({ `, `allow`, `: [`, `"pnpm"`, `, `, `"git"`, `, `, `"node"`, `] }),`],
    [`    `, `git`, `({ `, `commit`, `: `, `"draft"`, ` }),`],
    [`    `, `browser`, `({ `, `allowlist`, `: [`, `"docs.*"`, `] }),`],
    [`  ],`],
    null,
    [`  `, `hooks`, `: {`],
    [`    `, `beforeEdit`, `(diff) { `, `return`, ` `, `review`, `(diff); },`],
    [`  },`],
    [`});`],
  ] as const;

  // Minimal token-class mapping — these are just color buckets.
  const classify = (s: string) => {
    const t = s.trim();
    if (!t) return "";
    if (t.startsWith("//")) return "text-[#5F5B4E]";
    if (/^"[^"]*"$/.test(t)) return "text-[#A3E4C8]";
    if (["import", "from", "export", "default", "return"].includes(t))
      return "text-[#F0A97A]";
    if (/^(defineConfig|fs|shell|git|browser|review|beforeEdit)$/.test(t))
      return "text-[#B7A6FF]";
    if (/^(model|budget|tokens|usd|tools|hooks|root|write|allow|commit|allowlist)$/.test(t))
      return "text-[#9DC4FF]";
    if (/^\d|^_|\d_/.test(t)) return "text-[#E0C68A]";
    return "";
  };

  return (
    <section className="py-20 max-md:py-14 px-8 max-md:px-6">
      <div className="mx-auto max-w-[1180px]">
        <div className="grid grid-cols-[1.15fr_1fr] max-md:grid-cols-1 gap-16 max-md:gap-10 items-start">
          <div>
            <div className="rounded-[14px] overflow-hidden shadow-[0_30px_60px_-30px_rgba(20,16,10,0.25)] bg-[#0A0A0B] text-[#EDEDEE] font-mono text-[13px]">
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-[#211e15] border-b border-[#2c2820]">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3a3528]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3a3528]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3a3528]" />
                </div>
                <div className="text-[#8a8373] text-[12px] ml-2">uniro.config.ts</div>
              </div>
              <div className="px-5 py-4.5 leading-[1.75]">
                {lines.map((line, i) => (
                  <div key={i} className="grid grid-cols-[28px_1fr] gap-3">
                    <span className="text-[#4e4836] text-right select-none">{i + 1}</span>
                    <span>
                      {line === null ? (
                        <span>&nbsp;</span>
                      ) : (
                        line.map((tok, j) => (
                          <span key={j} className={classify(tok)}>
                            {tok}
                          </span>
                        ))
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="pt-6">
            <span className="inline-block font-mono text-[11px] tracking-[.18em] uppercase text-text-300">
              03 / Configuration
            </span>
            <h2 className="mt-3.5 text-[36px] max-md:text-[28px] leading-[1.1] tracking-[-0.02em] font-semibold m-0">
              One file.{" "}
              <em className="not-italic text-text-300 font-medium">No magic.</em>
            </h2>
            <p className="mt-4.5 text-[15.5px] text-text-200 max-w-[440px]">
              A single <span className="font-mono text-[14px]">uniro.config.ts</span>{" "}
              describes the tools, budget, and policies for a project. Check it into
              the repo — every teammate, every CI run, every environment behaves the
              same.
            </p>
            <div className="mt-7 border-t border-border-200">
              {[
                ["01", "Declare tools", "Each tool is a typed function. Uniro generates the schema the model sees, so calls can't drift from your codebase."],
                ["02", "Set a budget", "Cap runs by dollars, tokens, or wall clock. Exceeding it pauses for your approval — never silently bills."],
                ["03", "Hook the dangerous steps", "Intercept edits, shell commands, and network calls. Route them to a reviewer, a log, or your own policy engine."],
              ].map(([n, title, body]) => (
                <div
                  key={n}
                  className="grid grid-cols-[48px_1fr] gap-3 py-4 border-b border-border-200"
                >
                  <div className="font-mono text-[12px] text-text-400 pt-0.5">{n}</div>
                  <div>
                    <div className="text-[15px] font-medium text-text-000">{title}</div>
                    <div className="text-[13.5px] text-text-300 mt-1">{body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
