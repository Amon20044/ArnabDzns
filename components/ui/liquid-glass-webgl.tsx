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
uniform float uDpr;
uniform float uAnimate;

// Bar material (stolen from FluidGlass / MeshTransmissionMaterial)
uniform float uIor;           // index of refraction, ~1.15 for default glass
uniform float uThickness;     // simulated slab thickness, default 10
uniform float uTransmission;  // 0..1, how much light passes through
uniform float uRoughness;     // 0..1, frosted-glass factor
uniform float uAnisotropy;    // 0..1, directional smear of highlights
uniform float uChroma;        // base chromatic aberration, scaled by IOR

float sdRoundedRect(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + vec2(r);
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

float hash12(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
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

  // In-plane gradient of SDF
  float eps = 1.5;
  float gx =
    sdRoundedRect(centered + vec2(eps, 0.0), half_, r) -
    sdRoundedRect(centered - vec2(eps, 0.0), half_, r);
  float gy =
    sdRoundedRect(centered + vec2(0.0, eps), half_, r) -
    sdRoundedRect(centered - vec2(0.0, eps), half_, r);
  vec2 n2 = normalize(vec2(gx, gy) + vec2(1e-6));

  // Pseudo-3D normal of a convex bevel: tilts outward at the rim, flat in center
  vec3 normal = normalize(vec3(-n2 * smoothEdge, mix(1.0, 0.35, smoothEdge)));
  vec3 viewDir = vec3(0.0, 0.0, 1.0);
  vec3 lightDir = normalize(vec3(-0.55, -0.7, 0.65));
  vec3 halfDir = normalize(lightDir + viewDir);
  float NdotV = clamp(dot(normal, viewDir), 0.0, 1.0);
  float NdotH = clamp(dot(normal, halfDir), 0.0, 1.0);

  // Schlick Fresnel parameterized by real IOR
  float F0 = pow((uIor - 1.0) / (uIor + 1.0), 2.0);
  float fresnel = F0 + (1.0 - F0) * pow(1.0 - NdotV, 5.0);

  // Blinn-Phong specular — shininess narrows for low roughness
  float shininess = mix(96.0, 6.0, clamp(uRoughness, 0.0, 1.0));
  float spec = pow(NdotH, shininess);

  // Thickness shapes the rim presence and chromatic spread
  float thicknessFactor = clamp(uThickness / 10.0, 0.25, 2.5);

  // Rim glow: fresnel focused on the bezel, damped by roughness
  float rimGlow =
    fresnel * smoothEdge * 0.78 * thicknessFactor * (1.0 - uRoughness * 0.4);

  // Animated glare sweep, width controlled by anisotropy + roughness
  float t = uTime * uAnimate;
  vec2 sweepDir = normalize(vec2(1.0, -0.55));
  float sweepCoord =
    dot(vUv - 0.5, sweepDir) * 2.2 - fract(t * 0.08) * 4.4 + 1.1;
  float tightness =
    mix(22.0, 3.5, clamp(uAnisotropy * 30.0 + uRoughness * 0.6, 0.0, 1.0));
  float sweep =
    exp(-pow(sweepCoord, 2.0) * tightness) * 0.28 * uTransmission;

  // Chromatic aberration widens with IOR and thickness
  float chroma = uChroma * (1.0 + (uIor - 1.0) * 2.0) * thicknessFactor;
  float rimR = pow(clamp(smoothEdge + 0.04, 0.0, 1.0), 1.6) * chroma;
  float rimB = pow(clamp(smoothEdge - 0.04, 0.0, 1.0), 1.6) * chroma;

  // Frosted micro-noise only when roughness > 0
  float micro = (hash12(frag + t * 0.5) - 0.5) * uRoughness * 0.06;

  vec3 col =
    vec3(rimGlow + micro) +
    vec3(rimR, 0.0, rimB) +
    vec3(sweep) +
    vec3(spec * 0.45 * (1.0 - uRoughness * 0.6) * uTransmission);

  col = clamp(col, 0.0, 0.55);

  // Shape mask kills anything outside the rounded rect with sub-pixel AA
  float shapeMask = clamp(0.5 - sdf, 0.0, 1.0);

  // Premultiplied alpha: alpha is highlight intensity, interior with no
  // highlight is fully transparent (no black plate)
  float intensity = max(col.r, max(col.g, col.b));
  outColor = vec4(col, intensity) * shapeMask;
}`;

const VERTEX_SHADER_WEBGL1 = /* glsl */ `
attribute vec2 aPosition;
varying vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const FRAGMENT_SHADER_WEBGL1 = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform vec2  uResolution;
uniform float uTime;
uniform float uBezelPx;
uniform float uRadiusPx;
uniform float uDpr;
uniform float uAnimate;

uniform float uIor;
uniform float uThickness;
uniform float uTransmission;
uniform float uRoughness;
uniform float uAnisotropy;
uniform float uChroma;

float sdRoundedRect(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + vec2(r);
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

float hash12(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
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
  vec2 n2 = normalize(vec2(gx, gy) + vec2(1e-6));

  vec3 normal = normalize(vec3(-n2 * smoothEdge, mix(1.0, 0.35, smoothEdge)));
  vec3 viewDir = vec3(0.0, 0.0, 1.0);
  vec3 lightDir = normalize(vec3(-0.55, -0.7, 0.65));
  vec3 halfDir = normalize(lightDir + viewDir);
  float NdotV = clamp(dot(normal, viewDir), 0.0, 1.0);
  float NdotH = clamp(dot(normal, halfDir), 0.0, 1.0);

  float F0 = pow((uIor - 1.0) / (uIor + 1.0), 2.0);
  float fresnel = F0 + (1.0 - F0) * pow(1.0 - NdotV, 5.0);

  float shininess = mix(96.0, 6.0, clamp(uRoughness, 0.0, 1.0));
  float spec = pow(NdotH, shininess);

  float thicknessFactor = clamp(uThickness / 10.0, 0.25, 2.5);

  float rimGlow =
    fresnel * smoothEdge * 0.78 * thicknessFactor * (1.0 - uRoughness * 0.4);

  float t = uTime * uAnimate;
  vec2 sweepDir = normalize(vec2(1.0, -0.55));
  float sweepCoord =
    dot(vUv - 0.5, sweepDir) * 2.2 - fract(t * 0.08) * 4.4 + 1.1;
  float tightness =
    mix(22.0, 3.5, clamp(uAnisotropy * 30.0 + uRoughness * 0.6, 0.0, 1.0));
  float sweep =
    exp(-pow(sweepCoord, 2.0) * tightness) * 0.28 * uTransmission;

  float chroma = uChroma * (1.0 + (uIor - 1.0) * 2.0) * thicknessFactor;
  float rimR = pow(clamp(smoothEdge + 0.04, 0.0, 1.0), 1.6) * chroma;
  float rimB = pow(clamp(smoothEdge - 0.04, 0.0, 1.0), 1.6) * chroma;

  float micro = (hash12(frag + t * 0.5) - 0.5) * uRoughness * 0.06;

  vec3 col =
    vec3(rimGlow + micro) +
    vec3(rimR, 0.0, rimB) +
    vec3(sweep) +
    vec3(spec * 0.45 * (1.0 - uRoughness * 0.6) * uTransmission);

  col = clamp(col, 0.0, 0.55);

  float shapeMask = clamp(0.5 - sdf, 0.0, 1.0);
  float intensity = max(col.r, max(col.g, col.b));
  gl_FragColor = vec4(col, intensity) * shapeMask;
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
    uDpr: WebGLUniformLocation | null;
    uAnimate: WebGLUniformLocation | null;
    uIor: WebGLUniformLocation | null;
    uThickness: WebGLUniformLocation | null;
    uTransmission: WebGLUniformLocation | null;
    uRoughness: WebGLUniformLocation | null;
    uAnisotropy: WebGLUniformLocation | null;
    uChroma: WebGLUniformLocation | null;
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
      uDpr: gl.getUniformLocation(program, "uDpr"),
      uAnimate: gl.getUniformLocation(program, "uAnimate"),
      uIor: gl.getUniformLocation(program, "uIor"),
      uThickness: gl.getUniformLocation(program, "uThickness"),
      uTransmission: gl.getUniformLocation(program, "uTransmission"),
      uRoughness: gl.getUniformLocation(program, "uRoughness"),
      uAnisotropy: gl.getUniformLocation(program, "uAnisotropy"),
      uChroma: gl.getUniformLocation(program, "uChroma"),
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

    // Bar defaults (mirroring FluidGlass's Bar material)
    const ior = config.ior ?? 1.15;
    const thickness = config.thickness ?? 10;
    const transmission = config.transmission ?? 1;
    const roughness = config.roughness ?? 0;
    const anisotropy = config.anisotropy ?? 0.01;

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
      gl.uniform1f(uniforms.uDpr, dpr);
      gl.uniform1f(uniforms.uAnimate, reducedMotion ? 0 : 1);
      gl.uniform1f(uniforms.uIor, ior);
      gl.uniform1f(uniforms.uThickness, thickness);
      gl.uniform1f(uniforms.uTransmission, transmission);
      gl.uniform1f(uniforms.uRoughness, roughness);
      gl.uniform1f(uniforms.uAnisotropy, anisotropy);
      gl.uniform1f(uniforms.uChroma, config.chromaticAberration);
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
