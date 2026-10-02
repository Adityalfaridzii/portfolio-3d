import { profile } from "@/content/profile";

export function Contact() {
  return (
    <section id="contact" data-stage="5" className="mx-auto w-full max-w-6xl px-4 pt-20 pb-16 sm:px-6">
      <div className="panel px-6 py-14 text-center sm:px-12">
        <p className="kicker">Contact</p>
        <h2 className="mx-auto mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
          Looking for QA that builds its own tools?
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-pretty text-muted">
          Based in {profile.location}. Happy to talk QA, test automation, and building tools for testers.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <a
            href={`mailto:${profile.email}`}
            className="rounded-full bg-fg px-7 py-3.5 font-medium text-ink transition hover:bg-accent"
          >
            {profile.email}
          </a>
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-line px-7 py-3.5 font-medium transition hover:border-accent hover:text-accent"
          >
            LinkedIn
          </a>
        </div>
      </div>

      <footer className="mt-12 flex flex-col items-center justify-between gap-2 font-mono text-xs text-muted sm:flex-row">
        <p>© {new Date().getFullYear()} {profile.name}</p>
        <p>Next.js · React Three Fiber</p>
      </footer>
    </section>
  );
}
