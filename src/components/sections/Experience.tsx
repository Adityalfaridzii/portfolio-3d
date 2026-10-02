import { education, experience } from "@/content/profile";

// Newest first, matching the 3D timeline beside it (it rises: newest on top).
export function Experience() {
  return (
    <section id="experience" data-stage="4" className="mx-auto w-full max-w-6xl px-4 py-28 sm:px-6">
      <div className="lg:max-w-[52%]">
        <p className="kicker">Experience · 2022 → now</p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          From testing products to building the testing.
        </h2>

        <ol className="mt-12 space-y-5">
          {experience.map((job, i) => {
            const current = i === 0;
            return (
              <li key={job.company} className={`panel p-6 ${current ? "border-accent/40" : ""}`}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-mono text-xs text-muted">{job.period}</p>
                  {current && (
                    <span className="rounded-full bg-accent/15 px-2 py-0.5 font-mono text-[0.65rem] text-accent uppercase">
                      Now
                    </span>
                  )}
                </div>
                <h3 className="mt-3 text-xl font-semibold">{job.role}</h3>
                <p className="text-muted">{job.company}</p>
                <ul className="mt-4 space-y-2 text-sm leading-relaxed text-fg/85">
                  {job.points.map((p) => (
                    <li key={p} className="flex gap-2">
                      <span aria-hidden="true" className="text-accent">
                        ›
                      </span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ol>

        <p className="mt-8 text-sm text-muted">
          {education.degree}, {education.school} · {education.period}
        </p>
      </div>
    </section>
  );
}
