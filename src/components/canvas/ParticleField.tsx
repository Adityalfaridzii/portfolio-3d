"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { buildFormations, FORMATION_COUNT, rng } from "@/lib/formations";
import { holdEase, measureAnchors, stageAt, weightAt, type Anchor } from "@/lib/stage";
import { metrics, milestones, timelineRange } from "@/content/profile";
import { NARROW_OPACITY, OPACITY, WIDE_MIN_PX, WIDE_OFFSET } from "@/lib/stageLayout";

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uStage;
  uniform float uSize;
  uniform float uPixelRatio;
  attribute vec3 aP0;
  attribute vec3 aP1;
  attribute vec3 aP2;
  attribute vec3 aP3;
  attribute vec3 aP4;
  attribute vec3 aP5;
  attribute float aSeed;
  varying float vSeed;

  float wt(float i) { return clamp(1.0 - abs(uStage - i), 0.0, 1.0); }

  vec3 rotY(vec3 p, float a) {
    float c = cos(a), s = sin(a);
    return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
  }
  vec3 rotX(vec3 p, float a) {
    float c = cos(a), s = sin(a);
    return vec3(p.x, c * p.y - s * p.z, s * p.y + c * p.z);
  }
  vec3 rotZ(vec3 p, float a) {
    float c = cos(a), s = sin(a);
    return vec3(c * p.x - s * p.y, s * p.x + c * p.y, p.z);
  }

  void main() {
    // Only the cloud and the ring move; bars and timeline must face the reader.
    // The ring spins about its own axis, then tilts: it stays a ring every frame.
    vec3 ring = rotY(rotX(rotZ(aP3, uTime * 0.12), 1.0), -0.35);
    vec3 p = rotY(aP0, uTime * 0.06) * wt(0.0)
           + aP1 * wt(1.0)
           + aP2 * wt(2.0)
           + ring * wt(3.0)
           + aP4 * wt(4.0)
           + aP5 * wt(5.0);

    // Drift is the "chaos": loud in the hero, nearly still once ordered.
    float drift = mix(0.035, 0.38, wt(0.0));
    p += drift * vec3(
      sin(uTime * 0.70 + aSeed * 40.0),
      cos(uTime * 0.55 + aSeed * 25.0),
      sin(uTime * 0.45 + aSeed * 17.0)
    );

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPixelRatio * (0.55 + aSeed * 0.9) / -mv.z;
    vSeed = aSeed;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uOpacity;
  varying float vSeed;

  void main() {
    // Bright core plus an exponential halo: the glow lives here instead of a
    // full-screen bloom pass, which costs a render target every frame.
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.12, d) * 0.8 + exp(-d * 11.0) * 0.55;
    if (a < 0.01) discard;
    gl_FragColor = vec4(mix(uColorA, uColorB, vSeed), a * uOpacity);
    #include <colorspace_fragment>
  }
`;

const barSpecs = metrics.map((m) => ({
  value: m.value,
  target: "target" in m ? m.target : undefined,
}));

export function ParticleField({ count }: { count: number }) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const group = useRef<THREE.Group>(null);
  const anchors = useRef<Anchor[]>([]);
  const stage = useRef(0);
  const wide = useThree((s) => s.size.width >= WIDE_MIN_PX);

  const geometry = useMemo(() => {
    const formations = buildFormations(count, {
      bars: barSpecs,
      milestones,
      timelineRange,
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(formations[0], 3));
    formations.forEach((f, i) => g.setAttribute(`aP${i}`, new THREE.BufferAttribute(f, 3)));
    const r = rng(9);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) seeds[i] = r();
    g.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    return g;
  }, [count]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uStage: { value: 0 },
      uSize: { value: 38 },
      uPixelRatio: { value: 1 },
      uOpacity: { value: 1 },
      uColorA: { value: new THREE.Color("#6ee7f9") },
      uColorB: { value: new THREE.Color("#a78bfa") },
    }),
    [],
  );

  // Section positions change with layout (fonts, images, resize): re-measure.
  useEffect(() => {
    const update = () => {
      anchors.current = measureAnchors();
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(document.body);
    return () => ro.disconnect();
  }, []);

  useFrame((state, delta) => {
    const m = material.current;
    const g = group.current;
    if (!m || !g) return;

    const viewCenter = window.scrollY + window.innerHeight / 2;
    const target = holdEase(stageAt(viewCenter, anchors.current));
    stage.current = THREE.MathUtils.damp(stage.current, target, 3.5, delta);
    const s = stage.current;

    let ox = 0;
    let oy = 0;
    let op = 0;
    for (let i = 0; i < FORMATION_COUNT; i++) {
      const w = weightAt(s, i);
      ox += WIDE_OFFSET[i][0] * w;
      oy += WIDE_OFFSET[i][1] * w;
      op += OPACITY[i] * w;
    }
    g.position.set(wide ? ox : 0, wide ? oy : 0, 0);

    m.uniforms.uTime.value = state.clock.elapsedTime;
    m.uniforms.uStage.value = s;
    m.uniforms.uPixelRatio.value = state.gl.getPixelRatio();
    m.uniforms.uOpacity.value = wide ? op : op * NARROW_OPACITY;

    // Gentle pointer parallax. Touch devices leave pointer at 0,0.
    const cam = state.camera;
    cam.position.x = THREE.MathUtils.damp(cam.position.x, state.pointer.x * 0.4, 2, delta);
    cam.position.y = THREE.MathUtils.damp(cam.position.y, state.pointer.y * 0.25, 2, delta);
    cam.lookAt(0, 0, 0);
  });

  return (
    <group ref={group}>
      <points geometry={geometry} frustumCulled={false}>
        <shaderMaterial
          ref={material}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
