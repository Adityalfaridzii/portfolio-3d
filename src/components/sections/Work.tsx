import { caseStudies, type CaseStudy } from "@/content/profile";

function Case({ study, featured }: { study: CaseStudy; featured: boolean }) {
  const rows = [
    ["Problem", study.problem],
    ["Approach", study.approach],
    ["Result", study.result],
  ] as const;

  return (
    <article
      id={`case-${study.id}`}
      className={`panel flex flex-col p-6 sm:p-8 ${featured ? "" : "lg:col-span-2"}`}
    >
      <p className="kicker">{study.kicker}</p>
      <h3 className="mt-3 text-3xl font-semibold tracking-tight">{study.name}</h3>

      <dl className={`mt-6 grid gap-5 ${featured ? "" : "lg:grid-cols-3"}`}>
        {rows.map(([label, text]) => (
          <div key={label}>
            <dt className="font-mono text-[0.7rem] tracking-[0.14em] text-muted uppercase">{label}</dt>
            <dd className="mt-1.5 leading-relaxed text-pretty text-fg/90">{text}</dd>
          </div>
        ))}
      </dl>

      {study.insight && (
        <figure className="mt-6 border-l-2 border-accent pl-4">
          <blockquote className="text-lg font-medium text-pretty">“{study.insight.quote}”</blockquote>
          <figcaption className="mt-1.5 text-sm text-muted">{study.insight.note}</figcaption>
        </figure>
      )}

      <ul className="mt-auto flex flex-wrap gap-2 pt-6" aria-label="Stack">
        {study.stack.map((s) => (
          <li key={s} className="chip">
            {s}
          </li>
        ))}
      </ul>
    </article>
  );
}

export function Work() {
  return (
    <section id="work" data-stage="1" className="mx-auto w-full max-w-6xl px-4 py-28 sm:px-6">
      <p className="kicker">Case files</p>
      <h2 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
        I build the tools my team tests with.
      </h2>
      <p className="mt-4 max-w-2xl text-lg text-pretty text-muted">
        Two internal platforms from my R&amp;D work, both in use at the company, and one framework where the
        interesting part is the design decisions.
      </p>

      <div className="mt-12 grid gap-5 lg:grid-cols-2">
        {caseStudies.map((s, i) => (
          <Case key={s.id} study={s} featured={i < 2} />
        ))}
      </div>
    </section>
  );
}
