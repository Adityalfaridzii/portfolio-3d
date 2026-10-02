// Per-formation placement and brightness. Kept out of the React component so
// tests can check every array has one entry per formation.

// Where each formation sits on wide screens: the text owns the left half.
// Anything that carries meaning (bars, timeline) must never sit under text.
export const WIDE_OFFSET: readonly (readonly [number, number])[] = [
  [3.0, 0.15], // chaos: behind the portrait
  [0, 0], // lattice: a floor under the cards
  [3.2, 0.1], // bars: right of the metric list
  [3.3, 0], // orbit: right of the toolbelt
  [3.4, 0], // timeline: right of the job list
  [0, -0.15], // converge: behind the contact panel
];

// Timeline is low: thousands of points on one thin line saturate under additive blending.
export const OPACITY: readonly number[] = [0.9, 0.55, 0.95, 0.8, 0.42, 0.75];

// Narrow screens have no free half: every formation sits under text, so it
// drops to ambient. Readability beats spectacle.
export const NARROW_OPACITY = 0.2;

// Below this canvas width, formations stop offsetting and go ambient.
export const WIDE_MIN_PX = 900;
