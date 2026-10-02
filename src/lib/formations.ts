// Particle formations, one per page stage. The site's single visual idea:
// the same particles go from chaos to order as you scroll, which is QA's job.
//
//   0 chaos     hero        a drifting, uneven cloud
//   1 lattice   work        the cloud settles into a test bench grid
//   2 bars      metrics     columns whose heights ARE the coverage numbers
//   3 orbit     toolbelt    a steady ring (spun and tilted in the shader)
//   4 timeline  experience  a rising line, one node per job, placed by start date
//   5 converge  contact     everything resolves into one point
//
// Every builder returns exactly `n` xyz triples. Seeded, so the layout is
// identical on every load and testable.

export type Vec3Array = Float32Array; // length = n * 3

export type BarSpec = { value: number; target?: number }; // percent, 0..100
export type FormationInput = {
  bars: readonly BarSpec[];
  milestones: readonly number[]; // fractional years, e.g. 2024 + 1/12
  timelineRange: readonly [number, number];
};

export const FORMATION_COUNT = 6;

/** mulberry32: tiny deterministic PRNG. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussian(r: () => number) {
  // Box–Muller; clamp u away from 0 so log() stays finite.
  const u = Math.max(r(), 1e-9);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r());
}

export function chaos(n: number, seed = 1): Vec3Array {
  const r = rng(seed);
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    // Uneven shell plus stragglers: mostly a cloud, never a clean sphere.
    const stray = r() < 0.12;
    const radius = stray ? 3.4 + r() * 3.2 : 2.1 + gaussian(r) * 0.55;
    const theta = r() * Math.PI * 2;
    const phi = Math.acos(2 * r() - 1);
    out[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    out[i * 3 + 1] = radius * Math.cos(phi) * 0.85;
    out[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
  }
  return out;
}

export function lattice(n: number): Vec3Array {
  // A floor grid receding into depth, under the case-study cards.
  const out = new Float32Array(n * 3);
  const cols = Math.ceil(Math.sqrt(n * 1.8));
  const rows = Math.ceil(n / cols);
  const width = 15;
  const depth = 9;
  for (let i = 0; i < n; i++) {
    const c = i % cols;
    const row = Math.floor(i / cols);
    out[i * 3] = (c / (cols - 1) - 0.5) * width;
    out[i * 3 + 1] = -2.6;
    out[i * 3 + 2] = 2 - (row / Math.max(rows - 1, 1)) * depth;
  }
  return out;
}

export const BAR = { width: 0.5, gap: 0.42, maxHeight: 4.2, baseY: -2.1 } as const;

export function bars(n: number, specs: readonly BarSpec[], seed = 3): Vec3Array {
  const r = rng(seed);
  const out = new Float32Array(n * 3);
  if (specs.length === 0) return out;

  const heights = specs.map((s) => (Math.min(Math.max(s.value, 0), 100) / 100) * BAR.maxHeight);
  const pitch = BAR.width + BAR.gap;
  const x0 = -((specs.length - 1) * pitch) / 2;

  // Budget: target ticks are thin lines, the rest fills columns by volume.
  const withTarget = specs.filter((s) => s.target !== undefined).length;
  const tickCount = withTarget > 0 ? Math.floor(n * 0.05) : 0;
  const columnCount = n - tickCount;
  const totalH = heights.reduce((s, h) => s + h, 0) || 1;

  let i = 0;
  specs.forEach((_, b) => {
    const share = b === specs.length - 1
      ? columnCount - i // last column absorbs rounding
      : Math.round((heights[b] / totalH) * columnCount);
    for (let k = 0; k < share && i < columnCount; k++, i++) {
      out[i * 3] = x0 + b * pitch + (r() - 0.5) * BAR.width;
      out[i * 3 + 1] = BAR.baseY + r() * heights[b];
      out[i * 3 + 2] = (r() - 0.5) * BAR.width;
    }
  });

  // Target ticks: a short horizontal line at the target height of each bar that has one.
  const targeted = specs
    .map((s, b) => ({ s, b }))
    .filter(({ s }) => s.target !== undefined);
  for (let k = 0; i < n; k++, i++) {
    const { s, b } = targeted[k % targeted.length];
    out[i * 3] = x0 + b * pitch + (r() - 0.5) * (BAR.width + 0.35);
    out[i * 3 + 1] = BAR.baseY + ((s.target as number) / 100) * BAR.maxHeight;
    out[i * 3 + 2] = (r() - 0.5) * 0.04;
  }
  return out;
}

export const ORBIT = { radius: 2.2, tube: 0.2 } as const;

export function orbit(n: number, seed = 4): Vec3Array {
  // Flat ring in the XY plane, facing the camera. Tilt and spin live in the
  // shader: spinning about the ring's own axis keeps it a ring at every frame.
  const r = rng(seed);
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const u = (i / n) * Math.PI * 2;
    const v = r() * Math.PI * 2;
    const d = ORBIT.tube * Math.sqrt(r());
    out[i * 3] = (ORBIT.radius + d * Math.cos(v)) * Math.cos(u);
    out[i * 3 + 1] = (ORBIT.radius + d * Math.cos(v)) * Math.sin(u);
    out[i * 3 + 2] = d * Math.sin(v);
  }
  return out;
}

export const TIMELINE = { height: 5.2 } as const;

/**
 * y position of a date on the vertical timeline: earliest at the bottom, so
 * the career reads as rising. Exported so tests can check placement.
 */
export function timelineY(year: number, [from, to]: readonly [number, number]) {
  const t = (year - from) / (to - from);
  return (t - 0.5) * TIMELINE.height;
}

export function timeline(
  n: number,
  milestones: readonly number[],
  range: readonly [number, number],
  seed = 5,
): Vec3Array {
  const r = rng(seed);
  const out = new Float32Array(n * 3);
  const nodeShare = milestones.length > 0 ? 0.35 : 0;
  const lineCount = Math.floor(n * (1 - nodeShare));

  for (let i = 0; i < lineCount; i++) {
    out[i * 3] = (r() - 0.5) * 0.09;
    out[i * 3 + 1] = (i / Math.max(lineCount - 1, 1) - 0.5) * TIMELINE.height;
    out[i * 3 + 2] = (r() - 0.5) * 0.05;
  }
  for (let i = lineCount; i < n; i++) {
    const m = milestones[(i - lineCount) % milestones.length];
    const rad = 0.2 * Math.cbrt(r());
    const theta = r() * Math.PI * 2;
    const phi = Math.acos(2 * r() - 1);
    out[i * 3] = rad * Math.sin(phi) * Math.cos(theta);
    out[i * 3 + 1] = timelineY(m, range) + rad * Math.cos(phi);
    out[i * 3 + 2] = rad * Math.sin(phi) * Math.sin(theta);
  }
  return out;
}

export function converge(n: number, seed = 6): Vec3Array {
  // A dense core with a thin halo: sits behind the contact panel's blur.
  const r = rng(seed);
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const halo = r() < 0.15;
    const rad = halo ? 0.45 + r() * 0.7 : Math.abs(gaussian(r)) * 0.3;
    const theta = r() * Math.PI * 2;
    const phi = Math.acos(2 * r() - 1);
    out[i * 3] = rad * Math.sin(phi) * Math.cos(theta);
    out[i * 3 + 1] = rad * Math.cos(phi);
    out[i * 3 + 2] = rad * Math.sin(phi) * Math.sin(theta);
  }
  return out;
}

export function buildFormations(n: number, input: FormationInput): Vec3Array[] {
  return [
    chaos(n),
    lattice(n),
    bars(n, input.bars),
    orbit(n),
    timeline(n, input.milestones, input.timelineRange),
    converge(n),
  ];
}
