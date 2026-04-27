export default function LogoStrip() {
  const cells: [string, boolean][] = [
    ["Anthropic", false],
    ["openai", true],
    ["Mistral", false],
    ["ollama", true],
    ["Groq", false],
    ["together.ai", true],
  ];

  return (
    <section className="py-12 border-t border-b border-border-200 px-8 max-md:px-6">
      <div className="mx-auto max-w-[1180px]">
        <div className="text-center text-[11px] tracking-[.08em] uppercase text-text-400 font-mono mb-7">
          Speaks fluently with
        </div>
        <div className="grid grid-cols-6 gap-8 max-md:grid-cols-3 max-md:gap-5 items-center">
          {cells.map(([name, mono]) => (
            <div
              key={name}
              className={
                mono
                  ? "h-9 grid place-items-center font-mono text-[15px] font-medium tracking-[.02em] text-text-400 opacity-85"
                  : "h-9 grid place-items-center text-[22px] tracking-tight text-text-400 opacity-85"
              }
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
