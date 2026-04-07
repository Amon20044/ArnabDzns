"use client";

import { useEffect, useRef } from "react";

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShader = `
precision highp float;

uniform float uTime;
uniform vec3 uColor;
uniform vec3 uResolution;
uniform vec2 uMouse;
uniform float uAmplitude;
uniform float uSpeed;

varying vec2 vUv;

void main() {
  float mr = min(uResolution.x, uResolution.y);
  vec2 uv = (vUv.xy * 2.0 - 1.0) * uResolution.xy / mr;

  uv += (uMouse - vec2(0.5)) * uAmplitude;

  float d = -uTime * 0.5 * uSpeed;
  float a = 0.0;
  for (float i = 0.0; i < 8.0; ++i) {
    a += cos(i - d - a * uv.x);
    d += sin(uv.y * i + a);
  }

  d += uTime * 0.5 * uSpeed;

  vec3 wave = vec3(
    cos(uv * vec2(d, a)) * 0.6 + 0.4,
    cos(a + d) * 0.5 + 0.5
  );

  vec3 prism = cos(wave * cos(vec3(d, a, 2.5)) * 0.5 + 0.5) * uColor;
  // Mix the iridescent prism over a pure-white base — kept very subtle
  // so the background stays bright and soft.
  vec3 col = mix(vec3(1.0), prism, 0.18);
  // Pull everything an extra 28 % toward white for a luminous, airy feel
  col = mix(col, vec3(1.0), 0.28);
  // Tiny cool tint so it doesn't read as flat white
  col += vec3(0.012, 0.010, 0.018);
  col = clamp(col, 0.0, 1.0);
  gl_FragColor = vec4(col, 1.0);
}
`;

interface IridescenceBackgroundProps {
  color?: [number, number, number];
  speed?: number;
  amplitude?: number;
  mouseReact?: boolean;
}

const fallbackThemeColor: [number, number, number] = [0.93, 0.88, 0.99];

function hexToNormalizedRgb(hex: string): [number, number, number] | null {
  const normalizedHex = hex.trim().replace("#", "");

  if (!/^[0-9a-fA-F]{6}$/.test(normalizedHex)) {
    return null;
  }

  const r = Number.parseInt(normalizedHex.slice(0, 2), 16) / 255;
  const g = Number.parseInt(normalizedHex.slice(2, 4), 16) / 255;
  const b = Number.parseInt(normalizedHex.slice(4, 6), 16) / 255;

  return [r, g, b];
}

function brightenColor([r, g, b]: [number, number, number], ratio = 0.36) {
  return [
    r + (1 - r) * ratio,
    g + (1 - g) * ratio,
    b + (1 - b) * ratio,
  ] as [number, number, number];
}

function resolveThemeColor() {
  const styles = getComputedStyle(document.documentElement);
  const purple300 = styles.getPropertyValue("--color-purple-300");
  const parsed = hexToNormalizedRgb(purple300);

  if (!parsed) {
    return fallbackThemeColor;
  }

  return brightenColor(parsed);
}

export function IridescenceBackground({
  color,
  speed = 0.85,
  amplitude = 0.08,
  mouseReact = true,
}: IridescenceBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let isMounted = true;
    let teardown: (() => void) | undefined;

    void (async () => {
      const { Color, Mesh, Program, Renderer, Triangle } = await import("ogl");

      if (!isMounted || !containerRef.current) {
        return;
      }

      const renderer = new Renderer({
        alpha: false,
        antialias: false,
        depth: false,
        dpr: Math.min(window.devicePixelRatio || 1, 1.5),
        powerPreference: "low-power",
        stencil: false,
      });
      const gl = renderer.gl;
      gl.clearColor(1, 1, 1, 1);

      const canvas = gl.canvas;
      canvas.style.display = "block";
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      container.appendChild(canvas);

      const mouseUniform = new Float32Array([0.5, 0.5]);
      const geometry = new Triangle(gl);
      const resolvedColor = color ?? resolveThemeColor();

      const program = new Program(gl, {
        fragment: fragmentShader,
        uniforms: {
          uAmplitude: { value: amplitude },
          uColor: { value: new Color(...resolvedColor) },
          uMouse: { value: mouseUniform },
          uResolution: {
            value: new Color(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height),
          },
          uSpeed: { value: reducedMotion ? 0 : speed },
          uTime: { value: 0 },
        },
        vertex: vertexShader,
      });

      const mesh = new Mesh(gl, { geometry, program });
      let frameId = 0;

      const resize = () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        program.uniforms.uResolution.value = new Color(
          gl.canvas.width,
          gl.canvas.height,
          gl.canvas.width / gl.canvas.height,
        );
      };

      const renderFrame = (time: number) => {
        program.uniforms.uTime.value = time * 0.001;
        renderer.render({ scene: mesh });
      };

      const tick = (time: number) => {
        renderFrame(time);
        frameId = window.requestAnimationFrame(tick);
      };

      const handlePointerMove = (event: PointerEvent) => {
        mouseUniform[0] = event.clientX / window.innerWidth;
        mouseUniform[1] = 1 - event.clientY / window.innerHeight;
      };

      resize();

      if (mouseReact) {
        window.addEventListener("pointermove", handlePointerMove, { passive: true });
      }

      if (reducedMotion) {
        renderFrame(performance.now());
      } else {
        frameId = window.requestAnimationFrame(tick);
      }

      window.addEventListener("resize", resize, { passive: true });

      teardown = () => {
        if (frameId) {
          window.cancelAnimationFrame(frameId);
        }

        window.removeEventListener("resize", resize);

        if (mouseReact) {
          window.removeEventListener("pointermove", handlePointerMove);
        }

        if (canvas.parentNode === container) {
          container.removeChild(canvas);
        }

        program.remove();
        geometry.remove();
        gl.getExtension("WEBGL_lose_context")?.loseContext();
      };
    })();

    return () => {
      isMounted = false;
      teardown?.();
    };
  }, [amplitude, color, mouseReact, speed]);

  return <div ref={containerRef} aria-hidden className="pointer-events-none fixed inset-0 -z-10" />;
}
