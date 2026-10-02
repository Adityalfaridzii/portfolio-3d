# Aditya Rahman Alfaridzi — Portfolio

Personal site for a Senior QA Engineer who builds QA tooling. A single particle
system tells the story as you scroll: it starts as **chaos** and ends **ordered**,
which is the job.

| Section | Formation | What it shows |
|---|---|---|
| Hero | chaos | a drifting, uneven cloud |
| Case files | lattice | the cloud settles into a test-bench grid |
| Metrics | bars | five columns whose heights **are** the coverage numbers, with target ticks |
| Toolbelt | orbit | a steady ring |
| Experience | timeline | a rising line, one node per job, placed by start date |
| Contact | converge | everything resolves into one point |

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS 4 ·
React Three Fiber + three.js · Lenis · Playwright · axe-core

## Design decisions

- **Text is HTML, not 3D.** Every section is server-rendered. The canvas is
  progressive enhancement: the page is complete and readable without it.
- **Who gets the 3D is decided, not hoped for.** `src/components/Backdrop.tsx`
  picks a mode per visitor:
  - `high` — capable desktop: 14k particles, DPR up to 2
  - `low` — touch or ≤4 cores / ≤4 GB: 5k particles, DPR ≤ 1.5
  - `static` — reduced motion, no WebGL, or `?static`: a CSS gradient only.
    Flipping reduced motion mid-visit removes the canvas live.
- **No post-processing.** Glow is an exponential halo in the particle shader;
  vignette and grain are CSS. That saves a full-screen render pass every frame
  and ~24 KB gz.
- **Meaning never sits under text.** On wide screens, formations that carry
  data (bars, timeline) sit in the free right half. On narrow screens there is
  no free half, so particles drop to ambient opacity.
- **One source of truth.** Everything the site claims lives in
  `src/content/profile.ts`. The 3D bars and timeline are generated from the
  same data the text renders.

## Measured

Production build, median of 3 runs (Playwright + Chromium):

| | LCP | CLS |
|---|---|---|
| Desktop, unthrottled | ~120 ms | 0 |
| Pixel 7, 4× CPU + 4G | ~720 ms | 0 |

Initial JS is ~181 KB gz. The 3D chunk (~239 KB gz, three.js core + R3F) is
not referenced by the initial HTML; it loads after first paint.

## Tests

```bash
npm run check        # lint + typecheck + every test
npm run test:unit    # pure logic, no browser
npm run test:e2e     # desktop + Pixel 7
```

- **Unit** — scroll→stage mapping, easing monotonicity, blend weights summing
  to 1, every formation's point count and shape, bars drawn to scale, timeline
  ordered by date, and the wiring check that fails if a formation is added
  without updating the shader or layout arrays.
- **E2E** — content matches the source data, links are safe, no console
  errors through a full scroll, no horizontal overflow, the right backdrop mode
  per device / preference / missing WebGL.
- **Accessibility** — axe with WCAG 2.2 A/AA tags (0 violations), and a
  keyboard skip link.
- **Privacy** — the CV this site was built from contains a phone number and a
  home address, and the case studies describe systems whose config holds API
  keys. Tests assert none of it reaches the served HTML or any JS chunk, and
  that private working files return 404.

The suite was checked by mutation: planting a scale bug in the bars, dropping a
formation from the shader, making the easing overshoot, and putting the phone
number on the page each turn the suite red.

CI runs the same suite against the production build on every push.

## Develop

```bash
npm install
npx playwright install chromium
npm run dev
```
