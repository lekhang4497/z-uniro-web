export default function Comparison() {
  const rows: [string, string, string, string][] = [
    ["Swap models mid-session", "Yes — one flag", "Reinstall", "Vendor-locked"],
    ["Budget caps (USD, tokens, wall-clock)", "Native", "No", "Tokens only"],
    ["Typed tools from your codebase", "TS / Python / Go", "JSON schemas", "No"],
    ["Worktree sandboxing for writes", "Default on", "No", "No"],
    ["Plan-then-apply approval loop", "Always", "No", "Manual"],
    ["Run fully offline (local models)", "Yes", "Depends", "No"],
    ["Audit log of every tool call", "JSONL · exportable", "No", "No"],
  ];

  const cellCls = (v: string) => {
    if (v === "No") return "text-text-400";
    if (/^(Depends|Manual|Vendor-locked|Tokens only|JSON schemas)$/.test(v))
      return "text-text-300 font-medium";
    return "text-text-000 font-semibold";
  };

  return (
    <section className="py-20 max-md:py-14 px-8 max-md:px-6">
      <div className="mx-auto max-w-[1180px]">
        <span className="inline-block font-mono text-[11px] tracking-[.18em] uppercase text-text-300">
          05 / How it compares
        </span>
        <h2 className="mt-3.5 text-[44px] max-md:text-[32px] leading-[1.05] tracking-[-0.025em] font-medium max-w-[780px] m-0">
          A runtime, not a{" "}
          <span className="text-text-300 font-medium">wrapper.</span>
        </h2>
        <p className="mt-4.5 text-[17px] text-text-200 max-w-[620px]">
          Other tools give you a chat window glued to a model. Uniro gives you the
          plumbing: tools, budgets, sandboxing, audit logs, and a clean way to swap
          models.
        </p>

        {/* Desktop: a 4-col table that's the easiest scan when you have
            the room. Hidden below md in favor of the stacked card list. */}
        <div className="mt-14 hidden md:block overflow-hidden rounded-[14px] border border-border-200 bg-bg-100">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {["Capability", "Uniro", "Plain CLI wrapper", "IDE chat panel"].map(
                  (h, i) => (
                    <th
                      key={h}
                      className={
                        "text-left py-4 px-5 text-[11px] font-medium tracking-[.12em] uppercase font-mono bg-bg-200 border-b border-border-200 " +
                        (i === 1 ? "text-text-000" : "text-text-300")
                      }
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td className="py-4 px-5 text-[14px] text-text-000 font-medium w-[38%] border-b border-border-200 last:border-b-0">
                    {r[0]}
                  </td>
                  <td className={`py-4 px-5 text-[14px] bg-[color-mix(in_oklab,var(--text-000)_5%,var(--bg-100))] border-b border-border-200 ${cellCls(r[1])}`}>
                    {r[1]}
                  </td>
                  <td className={`py-4 px-5 text-[14px] border-b border-border-200 ${cellCls(r[2])}`}>
                    {r[2]}
                  </td>
                  <td className={`py-4 px-5 text-[14px] border-b border-border-200 ${cellCls(r[3])}`}>
                    {r[3]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile: one card per capability with three labelled rows.
            Same data, scannable at 320px without horizontal scroll. */}
        <ul className="mt-10 md:hidden flex flex-col gap-2.5">
          {rows.map((r, i) => (
            <li
              key={i}
              className="rounded-[12px] border border-border-200 bg-bg-100 p-4"
            >
              <div className="text-[14px] font-medium text-text-000 mb-2.5">
                {r[0]}
              </div>
              <dl className="grid grid-cols-[110px_1fr] gap-y-1.5 gap-x-3 text-[13px]">
                <dt className="text-[10.5px] tracking-[.12em] uppercase font-mono text-text-000 self-center">
                  Uniro
                </dt>
                <dd className={cellCls(r[1])}>{r[1]}</dd>
                <dt className="text-[10.5px] tracking-[.12em] uppercase font-mono text-text-300 self-center">
                  CLI wrapper
                </dt>
                <dd className={cellCls(r[2])}>{r[2]}</dd>
                <dt className="text-[10.5px] tracking-[.12em] uppercase font-mono text-text-300 self-center">
                  IDE chat
                </dt>
                <dd className={cellCls(r[3])}>{r[3]}</dd>
              </dl>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
