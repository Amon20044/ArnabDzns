"use client";

import { useEffect, useRef } from "react";
import {
  liquidGlassConfig,
  type LiquidGlassRefractionConfig,
} from "@/lib/liquid-glass";
import { cn } from "@/lib/utils";

type Variant = "header" | "shell";

type LiquidGlassWebGLProps = {
  className?: string;
  variant?: Variant;
};

const VERTEX_SHADER = /* glsl */ `#version 300 es
in vec2 aPosition;
out vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const FRAGMENT_SHADER = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 outColor;

uniform vec2  uResolution;
uniform float uTime;
uniform float uBezelPx;
uniform float uRadiusPx;
uniform float uDisplacement;
uniform float uChroma;
uniform float uDpr;
uniform float uAnimate;

float sdRoundedRect(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + vec2(r);
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

void main() {
  vec2 frag = vUv * uResolution;
  vec2 half_ = uResolution * 0.5;
  vec2 centered = frag - half_;
  float r = uRadiusPx * uDpr;
  float bezel = max(1.0, uBezelPx * uDpr);

  float sdf = sdRoundedRect(centered, half_, r);
  float inside = max(0.0, -sdf);
  float edge = clamp(1.0 - inside / bezel, 0.0, 1.0);
  float smoothEdge = edge * edge * (3.0 - 2.0 * edge);

  // SDF normal via central differences
  float eps = 1.5;
  float gx =
    sdRoundedRect(centered + vec2(eps, 0.0), half_, r) -
    sdRoundedRect(centered - vec2(eps, 0.0), half_, r);
  float gy =
    sdRoundedRect(centered + vec2(0.0, eps), half_, r) -
    sdRoundedRect(centered - vec2(0.0, eps), half_, r);
  vec2 n = normalize(vec2(gx, gy) + vec2(1e-6));

  // White Fresnel rim glow
  float fresnel = pow(smoothEdge, 1.8) * 0.22;

  // Subtle chromatic fringe — small R/B offset added on top of white rim
  float chroma = uChroma * 0.55;
  float rimR = pow(clamp(smoothEdge + 0.04, 0.0, 1.0), 1.8) * chroma;
  float rimB = pow(clamp(smoothEdge - 0.04, 0.0, 1.0), 1.8) * chroma;
  vec3 rim = vec3(fresnel + rimR, fresnel, fresnel + rimB);

  // Animated specular sweep (diagonal band travelling across glass)
  float t = uTime * uAnimate;
  vec2 sweepDir = normalize(vec2(1.0, -0.55));
  float sweepCoord = dot(vUv - 0.5, sweepDir) * 2.2 - fract(t * 0.08) * 4.4 + 1.1;
  float sweep = exp(-pow(sweepCoord, 2.0) * 18.0) * 0.16;

  // Top-left global light reflecting off the bezel
  vec2 lightDir = normalize(vec2(-1.0, -1.0));
  float topLight = clamp(dot(n, lightDir), 0.0, 1.0) * smoothEdge * 0.18;

  vec3 col = rim + vec3(sweep + topLight);

  // Clamp total additive contribution so plus-lighter never blows out
  col = clamp(col, 0.0, 0.45);

  // Shape mask with 1px AA (kills anything outside the rounded rect)
  float shapeMask = clamp(0.5 - sdf, 0.0, 1.0);

  // Pre-multiplied output: alpha is highlight intensity, not shape coverage.
  // Interior with no highlights => alpha 0 => fully transparent.
  float intensity = max(col.r, max(col.g, col.b));
  outColor = vec4(col, intensity) * shapeMask;
}`;

const FRAGMENT_SHADER_WEBGL1 = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform vec2  uResolution;
uniform float uTime;
uniform float uBezelPx;
uniform float uRadiusPx;
uniform float uDisplacement;
uniform float uChroma;
uniform float uDpr;
uniform float uAnimate;

float sdRoundedRect(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + vec2(r);
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

void main() {
  vec2 frag = vUv * uResolution;
  vec2 half_ = uResolution * 0.5;
  vec2 centered = frag - half_;
  float r = uRadiusPx * uDpr;
  float bezel = max(1.0, uBezelPx * uDpr);

  float sdf = sdRoundedRect(centered, half_, r);
  float inside = max(0.0, -sdf);
  float edge = clamp(1.0 - inside / bezel, 0.0, 1.0);
  float smoothEdge = edge * edge * (3.0 - 2.0 * edge);

  float eps = 1.5;
  float gx =
    sdRoundedRect(centered + vec2(eps, 0.0), half_, r) -
    sdRoundedRect(centered - vec2(eps, 0.0), half_, r);
  float gy =
    sdRoundedRect(centered + vec2(0.0, eps), half_, r) -
    sdRoundedRect(centered - vec2(0.0, eps), half_, r);
  vec2 n = normalize(vec2(gx, gy) + vec2(1e-6));

  float fresnel = pow(smoothEdge, 1.8) * 0.22;

  float chroma = uChroma * 0.55;
  float rimR = pow(clamp(smoothEdge + 0.04, 0.0, 1.0), 1.8) * chroma;
  float rimB = pow(clamp(smoothEdge - 0.04, 0.0, 1.0), 1.8) * chroma;
  vec3 rim = vec3(fresnel + rimR, fresnel, fresnel + rimB);

  float t = uTime * uAnimate;
  vec2 sweepDir = normalize(vec2(1.0, -0.55));
  float sweepCoord = dot(vUv - 0.5, sweepDir) * 2.2 - fract(t * 0.08) * 4.4 + 1.1;
  float sweep = exp(-pow(sweepCoord, 2.0) * 18.0) * 0.16;

  vec2 lightDir = normalize(vec2(-1.0, -1.0));
  float topLight = clamp(dot(n, lightDir), 0.0, 1.0) * smoothEdge * 0.18;

  vec3 col = rim + vec3(sweep + topLight);
  col = clamp(col, 0.0, 0.45);

  float shapeMask = clamp(0.5 - sdf, 0.0, 1.0);
  float intensity = max(col.r, max(col.g, col.b));
  gl_FragColor = vec4(col, intensity) * shapeMask;
}`;

const VERTEX_SHADER_WEBGL1 = /* glsl */ `
attribute vec2 aPosition;
varying vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

function compile(
  gl: WebGL2RenderingContext | WebGLRenderingContext,
  type: number,
  source: string
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function linkProgram(
  gl: WebGL2RenderingContext | WebGLRenderingContext,
  vs: WebGLShader,
  fs: WebGLShader
): WebGLProgram | null {
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.bindAttribLocation(program, 0, "aPosition");
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

type GLHandles = {
  gl: WebGL2RenderingContext | WebGLRenderingContext;
  program: WebGLProgram;
  buffer: WebGLBuffer;
  uniforms: {
    uResolution: WebGLUniformLocation | null;
    uTime: WebGLUniformLocation | null;
    uBezelPx: WebGLUniformLocation | null;
    uRadiusPx: WebGLUniformLocation | null;
    uDisplacement: WebGLUniformLocation | null;
    uChroma: WebGLUniformLocation | null;
    uDpr: WebGLUniformLocation | null;
    uAnimate: WebGLUniformLocation | null;
  };
};

function initGL(canvas: HTMLCanvasElement): GLHandles | null {
  const ctxOptions: WebGLContextAttributes = {
    premultipliedAlpha: true,
    alpha: true,
    antialias: true,
    preserveDrawingBuffer: false,
  };

  let gl: WebGL2RenderingContext | WebGLRenderingContext | null =
    canvas.getContext("webgl2", ctxOptions) as WebGL2RenderingContext | null;
  let isWebGL2 = true;
  if (!gl) {
    gl = canvas.getContext("webgl", ctxOptions) as WebGLRenderingContext | null;
    isWebGL2 = false;
  }
  if (!gl) return null;

  const vs = compile(
    gl,
    gl.VERTEX_SHADER,
    isWebGL2 ? VERTEX_SHADER : VERTEX_SHADER_WEBGL1
  );
  const fs = compile(
    gl,
    gl.FRAGMENT_SHADER,
    isWebGL2 ? FRAGMENT_SHADER : FRAGMENT_SHADER_WEBGL1
  );
  if (!vs || !fs) return null;

  const program = linkProgram(gl, vs, fs);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!program) return null;

  const buffer = gl.createBuffer();
  if (!buffer) {
    gl.deleteProgram(program);
    return null;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]),
    gl.STATIC_DRAW
  );

  gl.useProgram(program);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  return {
    gl,
    program,
    buffer,
    uniforms: {
      uResolution: gl.getUniformLocation(program, "uResolution"),
      uTime: gl.getUniformLocation(program, "uTime"),
      uBezelPx: gl.getUniformLocation(program, "uBezelPx"),
      uRadiusPx: gl.getUniformLocation(program, "uRadiusPx"),
      uDisplacement: gl.getUniformLocation(program, "uDisplacement"),
      uChroma: gl.getUniformLocation(program, "uChroma"),
      uDpr: gl.getUniformLocation(program, "uDpr"),
      uAnimate: gl.getUniformLocation(program, "uAnimate"),
    },
  };
}

export function LiquidGlassWebGL({
  className,
  variant = "header",
}: LiquidGlassWebGLProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handles = initGL(canvas);
    if (!handles) return;

    const { gl, program, buffer, uniforms } = handles;
    const config: LiquidGlassRefractionConfig =
      liquidGlassConfig.refraction[variant];

    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let visible = true;
    let running = true;
    let rafId = 0;
    const startTime = performance.now();

    const resize = (w: number, h: number) => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, Math.round(w));
      height = Math.max(1, Math.round(h));
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const draw = (now: number) => {
      if (!running) return;
      const elapsed = (now - startTime) / 1000;
      gl.useProgram(program);
      gl.uniform2f(uniforms.uResolution, canvas.width, canvas.height);
      gl.uniform1f(uniforms.uTime, elapsed);
      gl.uniform1f(uniforms.uBezelPx, config.bezel);
      gl.uniform1f(uniforms.uRadiusPx, config.cornerRadius);
      gl.uniform1f(uniforms.uDisplacement, config.displacement);
      gl.uniform1f(uniforms.uChroma, config.chromaticAberration);
      gl.uniform1f(uniforms.uDpr, dpr);
      gl.uniform1f(uniforms.uAnimate, reducedMotion ? 0 : 1);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const loop = () => {
      if (!running || !visible) return;
      draw(performance.now());
      if (reducedMotion) return;
      rafId = requestAnimationFrame(loop);
    };

    const parent = canvas.parentElement;
    const initialRect = (parent ?? canvas).getBoundingClientRect();
    resize(initialRect.width, initialRect.height);

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      resize(entry.contentRect.width, entry.contentRect.height);
      draw(performance.now());
    });
    if (parent) resizeObserver.observe(parent);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        const next = entry.isIntersecting;
        if (next === visible) return;
        visible = next;
        if (visible && !reducedMotion) {
          rafId = requestAnimationFrame(loop);
        } else {
          cancelAnimationFrame(rafId);
        }
      },
      { threshold: 0 }
    );
    intersectionObserver.observe(canvas);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      running = false;
      cancelAnimationFrame(rafId);
    };
    canvas.addEventListener("webglcontextlost", onContextLost);

    if (reducedMotion) {
      draw(performance.now());
    } else {
      rafId = requestAnimationFrame(loop);
    }

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      canvas.removeEventListener("webglcontextlost", onContextLost);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      const loseExt = gl.getExtension("WEBGL_lose_context");
      loseExt?.loseContext();
    };
  }, [variant]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full",
        className
      )}
      style={{ mixBlendMode: "plus-lighter" }}
    />
  );
}
