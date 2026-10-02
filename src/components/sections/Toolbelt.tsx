import { certifications, toolbelt } from "@/content/profile";

export function Toolbelt() {
  return (
    <section id="tools" data-stage="3" className="mx-auto min-h-svh w-full max-w-6xl px-4 py-28 sm:px-6">
      <div className="lg:max-w-[48%]">
        <p className="kicker">Toolbelt</p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Tools I use, and the ones I made.
        </h2>

        <div className="mt-10 grid gap-8 sm:grid-cols-2">
          {toolbelt.map((g) => (
            <div key={g.group}>
              <h3 className="font-mono text-[0.7rem] tracking-[0.14em] text-muted uppercase">{g.group}</h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {g.items.map((t) => (
                  <li
                    key={t}
                    className={`chip ${t.includes("(built)") ? "border-accent/50 text-accent" : "text-fg/90"}`}
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <h3 className="mt-12 font-mono text-[0.7rem] tracking-[0.14em] text-muted uppercase">Certifications</h3>
        <ul className="mt-3 space-y-1.5 text-fg/90">
          {certifications.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
