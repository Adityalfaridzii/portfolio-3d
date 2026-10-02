"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";
import type { Tier } from "./canvas/Scene";

// three.js touches window/WebGL on import: client only, and split out of the
// main bundle so text paints before any 3D code downloads.
const Scene = dynamic(() => import("./canvas/Scene"), { ssr: false });

type Mode = "static" | Tier;

const REDUCED = "(prefers-reduced-motion: reduce)";

let webgl: boolean | undefined;
function hasWebGL() {
  if (webgl === undefined) {
    try {
      const c = document.createElement("canvas");
      webgl = !!(c.getContext("webgl2") ?? c.getContext("webgl"));
    } catch {
      webgl = false;
    }
  }
  return webgl;
}

function detect(): Mode {
  // Escape hatch for tests and screenshots: ?static forces the fallback.
  if (new URLSearchParams(window.location.search).has("static")) return "static";
  if (window.matchMedia(REDUCED).matches || !hasWebGL()) return "static";
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  return coarse || cores <= 4 || memory <= 4 ? "low" : "high";
}

function subscribe(onChange: () => void) {
  // Users can flip reduced motion while the page is open; honor it live.
  const mq = window.matchMedia(REDUCED);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

export function Backdrop() {
  const mode = useSyncExternalStore<Mode>(subscribe, detect, () => "static");

  return (
    <div aria-hidden="true" className="backdrop" data-mode={mode}>
      {mode !== "static" && (
        <div className="backdrop-canvas">
          <Scene tier={mode} />
        </div>
      )}
    </div>
  );
}
