"use client";

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { ParticleField } from "./ParticleField";

export type Tier = "high" | "low";

// No post-processing: glow is in the particle shader, vignette and grain are
// CSS (see .backdrop::after). Saves a full-screen pass every frame and ~24 KB gz.
const TIERS = {
  high: { count: 14000, dpr: [1, 2] as const, startDpr: 1.5 },
  low: { count: 5000, dpr: [1, 1.5] as const, startDpr: 1 },
};

export default function Scene({ tier }: { tier: Tier }) {
  const cfg = TIERS[tier];
  const [dpr, setDpr] = useState(cfg.startDpr);

  return (
    <Canvas
      dpr={dpr}
      camera={{ position: [0, 0, 10], fov: 45, near: 0.1, far: 60 }}
      gl={{ antialias: false, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#07090d"]} />
      <PerformanceMonitor
        onIncline={() => setDpr(cfg.dpr[1])}
        onDecline={() => setDpr(cfg.dpr[0])}
        flipflops={3}
      />
      <ParticleField count={cfg.count} />
    </Canvas>
  );
}
