"use client";

import { useEffect, useRef } from "react";
import {
  Camera,
  Color,
  Mesh,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderer,
} from "three";

/* -------------------------------------------------------------------------
   Vertex shader — fullscreen quad.
   PlaneGeometry(2, 2) lays vertices in [-1, 1] on the xy plane, which is
   exactly clip space, so we can hand `position.xy` straight to gl_Position
   with zero matrix math. Three's standard `position` / `uv` attributes are
   used so ShaderMaterial wires everything up automatically.
   ------------------------------------------------------------------------- */
const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

/* -------------------------------------------------------------------------
   Fragment shader — single pass, drifting soft pastel clouds.
   Built around 4-tap value-noise FBM domain-warped twice (the classic
   Inigo Quilez warp), with a deliberately bright white-violet palette,
   *additive white* blooms (not dark), a feather-light vignette, and fine
   grain. Single quad, no textures, no post-processing.
   ------------------------------------------------------------------------- */
const fragmentShader = /* glsl */ `
  precision highp float;

  varying vec2 vUv;
  uniform float u_time;
  uniform vec2  u_resolution;

  // ---- noise stack ----
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p *= 2.02;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    // Aspect-corrected centred coords (short axis = 1)
    vec2 p = (vUv - 0.5) * 2.0;
    p.x *= u_resolution.x / u_resolution.y;

    float t = u_time * 0.05;

    // ---- Two-step domain warp (Inigo Quilez) ----
    vec2 q = vec2(
      fbm(p * 0.9 + vec2(0.0, 0.0) + t),
      fbm(p * 0.9 + vec2(5.2, 1.3) + t)
    );

    vec2 r = vec2(
      fbm(p * 1.1 + 3.5 * q + vec2(1.7, 9.2) - t * 0.6),
      fbm(p * 1.1 + 3.5 * q + vec2(8.3, 2.8) + t * 0.4)
    );

    float n = fbm(p + 3.5 * r);

    // -----------------------------------------------------------------
    // PALETTE — bright, luminous, white-dominant with violet pastels.
    // Every colour sits at >= 0.90 luminance so the bg never reads "dark".
    // -----------------------------------------------------------------
    vec3 cWhite = vec3(1.000, 1.000, 1.000);
    vec3 cBase  = vec3(0.985, 0.985, 0.998); // pure-white wash with cool tilt
    vec3 cLav   = vec3(0.905, 0.915, 0.985); // bright lavender
    vec3 cSky   = vec3(0.895, 0.935, 0.992); // pale sky-violet
    vec3 cMint  = vec3(0.930, 0.975, 0.965); // soft mint kiss

    // Start fully white and only *gently* tint towards lavender / sky / mint
    vec3 col = cBase;
    col = mix(col, cLav, smoothstep(0.05, 0.85, n) * 0.85);
    col = mix(col, cSky, smoothstep(0.30, 0.95, length(r) * 0.65) * 0.75);
    col = mix(col, cMint, smoothstep(0.45, 1.00, q.x * 0.5 + 0.5) * 0.30);

    // -----------------------------------------------------------------
    // ADDITIVE WHITE BLOOMS — these are the "lights" that make the
    // gradient feel bright and luminous instead of muddy violet.
    // (Previously these were dark violet → that's what crushed v1.)
    // -----------------------------------------------------------------
    for (int i = 0; i < 3; i++) {
      float fi = float(i);
      vec2 cp = vec2(
        sin(t * 0.55 + fi * 2.10) * 0.62,
        cos(t * 0.47 + fi * 1.37) * 0.42
      );
      float d = length(p - cp);
      col += vec3(0.18, 0.16, 0.14) * smoothstep(0.65, 0.0, d) * 0.40;
    }

    // Big bright top-centre highlight — "lit from above" feel
    float topGlow = 1.0 - smoothstep(0.0, 1.20, length(p - vec2(0.0, 0.85)));
    col += vec3(0.10, 0.10, 0.12) * topGlow * 0.85;

    // -----------------------------------------------------------------
    // VIGNETTE — feather-light. Maxes out at 4 % darkening at corners.
    // -----------------------------------------------------------------
    float vig = smoothstep(1.65, 0.30, length(p));
    col *= mix(0.96, 1.0, vig);

    // Gentle gain — keep it bright without blowing out
    col = clamp(col * 1.02, 0.0, 1.0);

    // -----------------------------------------------------------------
    // GRAIN — very subtle, time-animated
    // -----------------------------------------------------------------
    float grain = hash(gl_FragCoord.xy + fract(u_time * 0.5)) - 0.5;
    col += grain * 0.016;

    gl_FragColor = vec4(col, 1.0);
  }
`;

export const ShaderBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Honour reduced-motion: render a single frame, never animate.
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const renderer = new WebGLRenderer({
      antialias: false,
      alpha: false,
      powerPreference: "low-power",
      stencil: false,
      depth: false,
    });

    // Cap DPR — visual gain above 1.5 is invisible for a soft gradient.
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    renderer.setPixelRatio(dpr);
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    // Safety net: if the shader ever fails to draw, fall back to white,
    // never the WebGL default of black.
    renderer.setClearColor(new Color(0xffffff), 1);

    const canvas = renderer.domElement;
    canvas.style.display = "block";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    container.appendChild(canvas);

    // Standard fullscreen quad — 4 verts, indexed, ~zero cost.
    const geometry = new PlaneGeometry(2, 2);

    const uniforms = {
      u_time: { value: 0 },
      u_resolution: {
        value: new Vector2(window.innerWidth, window.innerHeight),
      },
    };

    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      depthTest: false,
      depthWrite: false,
    });

    const mesh = new Mesh(geometry, material);
    mesh.frustumCulled = false;

    const scene = new Scene();
    scene.add(mesh);

    // Vertex shader emits clip-space directly, so we just need *a* camera
    // object — no projection / view matrices are read.
    const camera = new Camera();

    let rafId = 0;
    let running = true;
    const start = performance.now();

    const renderFrame = (now: number) => {
      uniforms.u_time.value = (now - start) * 0.001;
      renderer.render(scene, camera);
    };

    const tick = (now: number) => {
      if (!running) return;
      renderFrame(now);
      rafId = window.requestAnimationFrame(tick);
    };

    if (reducedMotion) {
      renderFrame(performance.now());
    } else {
      rafId = window.requestAnimationFrame(tick);
    }

    // Pause when tab is hidden — saves battery, drops dropped-frame counter.
    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        if (rafId) window.cancelAnimationFrame(rafId);
      } else if (!reducedMotion) {
        running = true;
        rafId = window.requestAnimationFrame(tick);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    // Resize — debounced via rAF to coalesce bursts.
    let resizePending = false;
    const onResize = () => {
      if (resizePending) return;
      resizePending = true;
      window.requestAnimationFrame(() => {
        resizePending = false;
        const w = window.innerWidth;
        const h = window.innerHeight;
        renderer.setSize(w, h, false);
        uniforms.u_resolution.value.set(w, h);
        if (reducedMotion) renderFrame(performance.now());
      });
    };
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      running = false;
      if (rafId) window.cancelAnimationFrame(rafId);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (canvas.parentNode === container) {
        container.removeChild(canvas);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
    />
  );
};
