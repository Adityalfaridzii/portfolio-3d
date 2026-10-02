import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";
import { metrics, milestones, timelineRange } from "@/content/profile";
import {
  BAR,
  bars,
  buildFormations,
  chaos,
  converge,
  FORMATION_COUNT,
  lattice,
  orbit,
  ORBIT,
  timeline,
  TIMELINE,
  timelineY,
  type BarSpec,
} from "@/lib/formations";
import { OPACITY, WIDE_OFFSET } from "@/lib/stageLayout";

const input = {
  bars: metrics.map((m) => ({ value: m.value, target: "target" in m ? m.target : undefined })),
  milestones,
  timelineRange,
};

function points(a: Float32Array) {
  const out: [number, number, number][] = [];
  for (let i = 0; i < a.length; i += 3) out.push([a[i], a[i + 1], a[i + 2]]);
  return out;
}

test.describe("every formation", () => {
  // Odd counts on purpose: rounding bugs hide behind round numbers.
  for (const n of [1, 7, 1000, 14_001]) {
    test(`returns exactly ${n} finite points`, () => {
      for (const f of buildFormations(n, input)) {
        expect(f.length).toBe(n * 3);
        expect(f.every(Number.isFinite)).toBe(true);
      }
    });
  }

  test("is deterministic, so the page looks the same on every load", () => {
    expect(chaos(500)).toEqual(chaos(500));
    expect(bars(500, input.bars)).toEqual(bars(500, input.bars));
    expect(converge(500)).toEqual(converge(500));
  });

  test("there is one formation per stage", () => {
    expect(buildFormations(10, input)).toHaveLength(FORMATION_COUNT);
  });
});

test.describe("wiring between formations, layout and shader", () => {
  // These are the arrays you forget to extend when adding a formation.
  test("layout has one entry per formation", () => {
    expect(WIDE_OFFSET).toHaveLength(FORMATION_COUNT);
    expect(OPACITY).toHaveLength(FORMATION_COUNT);
  });

  test("the shader declares and blends every formation", () => {
    const src = readFileSync(join(process.cwd(), "src/components/canvas/ParticleField.tsx"), "utf8");
    const declared = src.match(/attribute vec3 aP\d/g) ?? [];
    expect(declared).toHaveLength(FORMATION_COUNT);
    for (let i = 0; i < FORMATION_COUNT; i++) {
      expect(src, `formation ${i} is never weighted in the shader`).toContain(`* wt(${i}.0)`);
    }
  });
});

test.describe("bars: the columns are the metrics, to scale", () => {
  const specs: BarSpec[] = [{ value: 50 }, { value: 100 }, { value: 86.07 }];
  const pts = points(bars(30_000, specs));
  const pitch = BAR.width + BAR.gap;
  const x0 = -((specs.length - 1) * pitch) / 2;

  test("each column reaches its value as a share of the max height", () => {
    specs.forEach((s, b) => {
      const cx = x0 + b * pitch;
      const top = Math.max(...pts.filter(([x]) => Math.abs(x - cx) <= BAR.width / 2).map(([, y]) => y));
      expect(top).toBeCloseTo(BAR.baseY + (s.value / 100) * BAR.maxHeight, 1);
    });
  });

  test("no point sits below the baseline", () => {
    expect(Math.min(...pts.map(([, y]) => y))).toBeGreaterThanOrEqual(BAR.baseY - 1e-6);
  });

  test("target ticks sit exactly at each target height", () => {
    const withTargets = points(bars(5_000, [{ value: 90, target: 85 }, { value: 95 }]));
    const tickY = BAR.baseY + 0.85 * BAR.maxHeight;
    const onTick = withTargets.filter(([, y]) => Math.abs(y - tickY) < 1e-5);
    expect(onTick.length).toBeGreaterThanOrEqual(Math.floor(5_000 * 0.05) - 1);
  });

  test("values outside 0–100 are clamped instead of breaking the layout", () => {
    const ys = points(bars(2_000, [{ value: -20 }, { value: 250 }])).map(([, y]) => y);
    expect(Math.min(...ys)).toBeGreaterThanOrEqual(BAR.baseY - 1e-6);
    expect(Math.max(...ys)).toBeLessThanOrEqual(BAR.baseY + BAR.maxHeight + 1e-6);
  });

  test("an empty metric list yields points at the origin, not NaN", () => {
    expect(bars(10, []).every((v) => v === 0)).toBe(true);
  });
});

test.describe("timeline: rising, one node per job", () => {
  test("the range covers every job start date", () => {
    // Fails if a new job is added to profile.ts without widening the range.
    for (const m of milestones) {
      expect(m).toBeGreaterThan(timelineRange[0]);
      expect(m).toBeLessThan(timelineRange[1]);
    }
  });

  test("range ends map to the bottom and top of the line", () => {
    expect(timelineY(timelineRange[0], timelineRange)).toBeCloseTo(-TIMELINE.height / 2);
    expect(timelineY(timelineRange[1], timelineRange)).toBeCloseTo(TIMELINE.height / 2);
  });

  test("later jobs sit higher", () => {
    const ys = milestones.map((m) => timelineY(m, timelineRange));
    for (let i = 1; i < ys.length; i++) expect(ys[i]).toBeGreaterThan(ys[i - 1]);
  });

  test("the line stays within its height", () => {
    const ys = points(timeline(4_000, milestones, timelineRange)).map(([, y]) => Math.abs(y));
    expect(Math.max(...ys)).toBeLessThanOrEqual(TIMELINE.height / 2 + 0.25);
  });
});

test.describe("shapes", () => {
  test("orbit is a flat ring facing the camera (tilt is the shader's job)", () => {
    const pts = points(orbit(3_000));
    const radii = pts.map(([x, y]) => Math.hypot(x, y));
    expect(Math.min(...radii)).toBeGreaterThanOrEqual(ORBIT.radius - ORBIT.tube - 1e-6);
    expect(Math.max(...radii)).toBeLessThanOrEqual(ORBIT.radius + ORBIT.tube + 1e-6);
    expect(Math.max(...pts.map(([, , z]) => Math.abs(z)))).toBeLessThanOrEqual(ORBIT.tube + 1e-6);
  });

  test("lattice is a floor: every point on one plane", () => {
    const ys = new Set(points(lattice(1_000)).map(([, y]) => y));
    expect(ys.size).toBe(1);
  });

  test("converge stays compact enough to hide behind the contact panel", () => {
    expect(Math.max(...points(converge(5_000)).map((p) => Math.hypot(...p)))).toBeLessThan(2);
  });
});
