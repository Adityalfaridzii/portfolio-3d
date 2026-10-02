import { metrics } from "@/content/profile";

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2));

export function Metrics() {
  return (
    <section id="metrics" data-stage="2" className="mx-auto min-h-svh w-full max-w-6xl px-4 py-28 sm:px-6">
      <div className="lg:max-w-[48%]">
        <p className="kicker">Coverage, measured</p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Targets set. Targets beaten.
        </h2>
        <p className="mt-4 text-lg text-pretty text-muted">
          Cross-squad automation at Traveloka, across the Merchandising and User Identity domains.
        </p>

        <ul className="mt-10 space-y-6">
          {metrics.map((m) => {
            const target = "target" in m ? m.target : undefined;
            return (
              <li key={m.label}>
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-fg/90">{m.label}</span>
                  <span className="font-mono text-2xl font-semibold tabular-nums">
                    {fmt(m.value)}
                    <span className="text-base text-muted">{m.unit}</span>
                  </span>
                </div>
                {/* Bar + target tick. Decorative: the numbers above are the content. */}
                <div aria-hidden="true" className="relative mt-2 h-1.5 rounded-full bg-white/[0.07]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-accent to-violet"
                    style={{ width: `${m.value}%` }}
                  />
                  {target !== undefined && (
                    <div className="absolute -top-1 h-3.5 w-0.5 bg-fg" style={{ left: `${target}%` }} />
                  )}
                </div>
                {target !== undefined && (
                  <p className="mt-1.5 font-mono text-xs text-muted">
                    target {target}
                    {m.unit} · <span className="text-pass">+{fmt(m.value - target)} pts</span>
                  </p>
                )}
              </li>
            );
          })}
        </ul>

        <p className="mt-10 hidden font-mono text-xs text-muted lg:block">
          → The columns on the right are these five numbers, to scale.
        </p>
      </div>
    </section>
  );
}
