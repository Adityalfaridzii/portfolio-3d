// Maps the page's scroll position to a continuous "stage" value that drives
// the particle formation. Pure functions: no DOM access except measureAnchors.

export type Anchor = { center: number; stage: number };

/**
 * Stage at a given viewport-center position, interpolated linearly between the
 * centers of neighboring sections. Clamped to the first/last anchor.
 * Anchors must be sorted by `center`.
 */
export function stageAt(viewCenter: number, anchors: readonly Anchor[]): number {
  if (anchors.length === 0) return 0;
  const first = anchors[0];
  const last = anchors[anchors.length - 1];
  if (viewCenter <= first.center) return first.stage;
  if (viewCenter >= last.center) return last.stage;

  for (let i = 0; i < anchors.length - 1; i++) {
    const a = anchors[i];
    const b = anchors[i + 1];
    if (viewCenter <= b.center) {
      const span = b.center - a.center;
      const t = span > 0 ? (viewCenter - a.center) / span : 1;
      return a.stage + (b.stage - a.stage) * t;
    }
  }
  return last.stage;
}

/**
 * Eases within each integer segment so a formation "holds" near its section
 * and morphs quickly in between. 1.0 → 1.0, 1.5 → 1.5, 1.1 → ~1.03.
 */
export function holdEase(stage: number): number {
  const base = Math.floor(stage);
  const f = stage - base;
  return base + f * f * (3 - 2 * f);
}

/** Linear blend weight of formation `i` at a given stage (tent function). */
export function weightAt(stage: number, i: number): number {
  return Math.max(0, 1 - Math.abs(stage - i));
}

/** Reads `[data-stage]` sections from the DOM. Call on load and resize. */
export function measureAnchors(root: ParentNode = document): Anchor[] {
  const scrollY = window.scrollY;
  return Array.from(root.querySelectorAll<HTMLElement>("[data-stage]"))
    .map((el) => {
      const rect = el.getBoundingClientRect();
      return {
        center: rect.top + scrollY + rect.height / 2,
        stage: Number(el.dataset.stage),
      };
    })
    .filter((a) => Number.isFinite(a.stage))
    .sort((a, b) => a.center - b.center);
}
