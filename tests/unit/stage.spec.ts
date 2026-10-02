import { expect, test } from "@playwright/test";
import { FORMATION_COUNT } from "@/lib/formations";
import { holdEase, stageAt, weightAt, type Anchor } from "@/lib/stage";

const anchors: Anchor[] = [
  { center: 400, stage: 0 },
  { center: 1400, stage: 1 },
  { center: 2400, stage: 2 },
];

test.describe("stageAt", () => {
  test("returns 0 when there are no sections", () => {
    expect(stageAt(1000, [])).toBe(0);
  });

  test("clamps before the first and after the last section", () => {
    expect(stageAt(0, anchors)).toBe(0);
    expect(stageAt(99_999, anchors)).toBe(2);
  });

  test("is exact at each section center", () => {
    for (const a of anchors) expect(stageAt(a.center, anchors)).toBe(a.stage);
  });

  test("interpolates linearly between section centers", () => {
    expect(stageAt(900, anchors)).toBeCloseTo(0.5);
    expect(stageAt(2150, anchors)).toBeCloseTo(1.75);
  });

  test("handles two sections at the same position without dividing by zero", () => {
    const stacked: Anchor[] = [
      { center: 500, stage: 3 },
      { center: 500, stage: 4 },
      { center: 900, stage: 5 },
    ];
    expect(Number.isFinite(stageAt(500, stacked))).toBe(true);
    expect(stageAt(700, stacked)).toBeCloseTo(4.5);
  });
});

test.describe("holdEase", () => {
  test("keeps integers and midpoints fixed", () => {
    for (const s of [0, 1, 2.5, 4, 5]) expect(holdEase(s)).toBeCloseTo(s);
  });

  test("is monotonic, so scrolling down never moves a formation backwards", () => {
    let prev = -Infinity;
    let worstDrop = 0;
    for (let s = 0; s <= FORMATION_COUNT - 1; s += 0.001) {
      const e = holdEase(s);
      worstDrop = Math.max(worstDrop, prev - e);
      prev = e;
    }
    expect(worstDrop).toBeLessThanOrEqual(1e-12);
  });

  test("holds near a section: 10% into a transition moves less than 10%", () => {
    expect(holdEase(1.1) - 1).toBeLessThan(0.1);
  });
});

test.describe("weightAt", () => {
  test("weights of all formations sum to 1 at every stage", () => {
    // If they don't, particles drift toward the origin mid-transition.
    for (let s = 0; s <= FORMATION_COUNT - 1; s += 0.01) {
      let sum = 0;
      for (let i = 0; i < FORMATION_COUNT; i++) sum += weightAt(s, i);
      expect(sum).toBeCloseTo(1, 9);
    }
  });

  test("only neighboring formations contribute", () => {
    expect(weightAt(2.3, 2)).toBeCloseTo(0.7);
    expect(weightAt(2.3, 3)).toBeCloseTo(0.3);
    expect(weightAt(2.3, 0)).toBe(0);
    expect(weightAt(2.3, 4)).toBe(0);
  });
});
