import Image from "next/image";
import { profile } from "@/content/profile";
import portrait from "@/assets/portrait-aditya-cutout.webp";

// Facts phrased as a passing test run. Each line must stay literally true.
const checks = [
  "4+ years in product QA",
  "Traveloka · Gokomodo · Surya Anugrah Mulya",
  "2 internal QA platforms built and in use",
];

export function Hero() {
  return (
    <section
      id="top"
      data-stage="0"
      className="relative mx-auto grid min-h-svh w-full max-w-6xl items-center gap-10 px-4 pt-28 pb-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:pt-20"
    >
      <div className="relative z-10">
        <p className="kicker">
          {profile.title} · {profile.focus}
        </p>
        <h1 className="mt-5 text-5xl leading-[0.95] font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl">
          {profile.name}
        </h1>
        <p className="mt-6 max-w-xl text-lg text-pretty text-muted sm:text-xl">{profile.headline}</p>

        <div
          className="panel mt-8 max-w-md px-5 py-4 font-mono text-[0.8rem] leading-7"
          role="list"
          aria-label="Summary"
        >
          {checks.map((c) => (
            <div key={c} role="listitem" className="flex gap-3">
              <span className="font-semibold text-pass" aria-hidden="true">
                PASS
              </span>
              <span className="text-fg/90">{c}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="#work"
            className="rounded-full bg-fg px-6 py-3 text-sm font-medium text-ink transition hover:bg-accent"
          >
            See the work
          </a>
          <a
            href={`mailto:${profile.email}`}
            className="rounded-full border border-line bg-ink/70 px-6 py-3 text-sm font-medium backdrop-blur transition hover:border-accent hover:text-accent"
          >
            Email me
          </a>
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-line bg-ink/70 px-6 py-3 text-sm font-medium backdrop-blur transition hover:border-accent hover:text-accent"
          >
            LinkedIn
          </a>
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
        {/* Rim light: sits behind the cutout so the silhouette separates from black. */}
        <div
          aria-hidden="true"
          className="absolute inset-x-[8%] top-[6%] bottom-[18%] rounded-full bg-violet/25 blur-3xl"
        />
        <Image
          src={portrait}
          alt={`Portrait of ${profile.name}`}
          className="portrait-fade relative h-auto w-full"
          sizes="(min-width: 1024px) 40vw, 24rem"
          loading="eager"
          fetchPriority="high"
          placeholder="blur"
        />
      </div>
    </section>
  );
}
