const QAS: [string, React.ReactNode][] = [
  [
    "Does Uniro send my code to your servers?",
    <>
      No. Uniro is a local binary. Your code, your prompts, and your tool outputs go
      directly from your machine to the model provider you configure. We don&apos;t sit
      in the middle, and there&apos;s no telemetry on by default.
    </>,
  ],
  [
    "Which models can I use?",
    <>
      Fourteen providers out of the box — Anthropic, OpenAI, Mistral, Groq, Together,
      Ollama, vLLM, LM Studio, and more. Any OpenAI-compatible endpoint works. Swap
      with <span className="font-mono text-[13px]">--model</span> or the config file.
    </>,
  ],
  [
    "How does the sandbox actually work?",
    "File edits land in a git worktree you review before merging. Shell commands run inside a restricted profile (allowlist, no network by default). Network and secret access are opt-in per session.",
  ],
  [
    "Can I write my own tools?",
    "Yes — tools are typed functions in TypeScript, Python, or Go. Uniro generates the schema the model sees from your types, so calls can't drift. MCP servers work too.",
  ],
  [
    "Is there a self-hosted version?",
    "The runtime always runs locally. Enterprise adds a hardened self-hosted control plane for policies, audit export, and VPC routing.",
  ],
];

export default function FAQ() {
  return (
    <section className="py-16 max-md:py-12 px-8 max-md:px-6">
      <div className="mx-auto max-w-[1180px]">
        <div className="grid grid-cols-[1fr_1.4fr] max-md:grid-cols-1 gap-[72px] max-md:gap-10">
          <div>
            <span className="inline-block font-mono text-[11px] tracking-[.18em] uppercase text-text-300">
              07 / FAQ
            </span>
            <h2 className="mt-3.5 text-[44px] max-md:text-[32px] leading-[1.05] tracking-[-0.02em] font-semibold m-0">
              Reasonable questions.
            </h2>
            <p className="mt-4 text-[15px] text-text-300 max-w-[32ch]">
              Still wondering? The docs go deeper, and the community Discord is a
              good place to get unstuck.
            </p>
          </div>

          <div className="border-t border-border-200">
            {QAS.map(([q, a], i) => (
              <details
                key={i}
                className="group border-b border-border-200 py-5 cursor-pointer"
                open={i === 0}
              >
                <summary className="flex justify-between items-center gap-4 text-[16px] font-medium text-text-000 list-none [&::-webkit-details-marker]:hidden">
                  {q}
                  <span className="font-mono text-text-400 text-[18px] transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <div className="text-text-200 text-[14.5px] mt-3 max-w-[560px] leading-[1.6]">
                  {a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
