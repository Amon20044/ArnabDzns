import { liquidGlassConfig } from "@/lib/liquid-glass";

export function LiquidGlassDefs() {
  const { distortion } = liquidGlassConfig;

  return (
    <svg
      aria-hidden
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
    >
      <defs>
        <filter id="lg-distort" colorInterpolationFilters="sRGB">
          <feTurbulence
            type="turbulence"
            baseFrequency={distortion.baseFrequency}
            numOctaves={distortion.numOctaves}
            seed={distortion.seed}
            result="turbulence"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="turbulence"
            scale={distortion.scale}
            xChannelSelector={distortion.xChannelSelector}
            yChannelSelector={distortion.yChannelSelector}
          />
        </filter>
      </defs>
    </svg>
  );
}
