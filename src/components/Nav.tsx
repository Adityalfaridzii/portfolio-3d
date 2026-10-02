import { profile } from "@/content/profile";

const links = [
  { href: "#work", label: "Work" },
  { href: "#metrics", label: "Metrics" },
  { href: "#experience", label: "Experience" },
];

export function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <a
        href="#work"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:rounded-full focus:bg-fg focus:px-4 focus:py-2 focus:text-ink"
      >
        Skip to content
      </a>
      <nav
        aria-label="Primary"
        className="mx-auto mt-3 flex w-[calc(100%-2rem)] max-w-6xl items-center justify-between rounded-full border border-line bg-ink/60 px-5 py-2.5 backdrop-blur-md"
      >
        <a href="#top" className="font-medium tracking-tight">
          {profile.shortName}
          <span className="text-accent">.</span>
        </a>
        <div className="flex items-center gap-1 text-sm">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="hidden rounded-full px-3 py-1.5 text-muted transition hover:text-fg sm:block"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#contact"
            className="rounded-full bg-fg/10 px-3.5 py-1.5 transition hover:bg-accent hover:text-ink"
          >
            Contact
          </a>
        </div>
      </nav>
    </header>
  );
}
