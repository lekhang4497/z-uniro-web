export default function Principle() {
  return (
    <section className="py-[120px] max-md:py-20 text-center px-8 max-md:px-6">
      <div className="mx-auto max-w-[1180px]">
        <div className="font-mono text-[12px] tracking-[.18em] uppercase text-text-400">
          §
        </div>
        <h2 className="mt-4 text-[56px] max-md:text-[32px] leading-[1.1] tracking-[-0.025em] font-semibold max-w-[900px] mx-auto text-balance text-text-000 m-0">
          An agent should feel like{" "}
          <em className="not-italic text-text-300 font-medium">
            a colleague with shell access
          </em>
          —not a party trick.
        </h2>
        <div className="mt-10 font-mono text-[13px] text-text-400 tracking-[.04em]">
          — design notes, v0.1
        </div>
      </div>
    </section>
  );
}
