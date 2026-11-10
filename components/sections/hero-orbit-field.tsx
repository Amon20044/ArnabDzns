import {
  Crop,
  Gamepad2,
  Image as ImageIcon,
  Layers,
  MousePointer2,
  Palette,
  PenTool,
  Sparkles,
  Type,
  type LucideIcon,
} from "lucide-react";
import type { CSSProperties } from "react";
import { Sticker, type StickerKind } from "@/components/illustrations/stickers";
import { cn } from "@/lib/utils";

interface OrbitTile {
  Icon: LucideIcon;
  /** Position on the ring in degrees, clockwise from the top. */
  at: number;
  tilt: number;
}

interface OrbitRing {
  /** Diameter as a multiple of the hero scene width. */
  size: number;
  seconds: number;
  reverse?: boolean;
  tiles: OrbitTile[];
  className?: string;
}

const RINGS: OrbitRing[] = [
  {
    size: 1.78,
    seconds: 90,
    tiles: [
      { Icon: PenTool, at: 305, tilt: -10 },
      { Icon: Palette, at: 62, tilt: 9 },
      { Icon: Gamepad2, at: 196, tilt: -6 },
    ],
  },
  {
    size: 2.6,
    seconds: 130,
    reverse: true,
    tiles: [
      { Icon: Layers, at: 282, tilt: 8 },
      { Icon: Type, at: 244, tilt: -9 },
      { Icon: ImageIcon, at: 96, tilt: 7 },
    ],
  },
  {
    size: 3.55,
    seconds: 170,
    className: "max-md:hidden",
    tiles: [
      { Icon: MousePointer2, at: 262, tilt: -8 },
      { Icon: Crop, at: 291, tilt: 10 },
      { Icon: Sparkles, at: 236, tilt: 6 },
    ],
  },
  { size: 4.7, seconds: 200, className: "max-lg:hidden", tiles: [] },
];

const SHAPE_ORBIT: { kind: StickerKind; at: number }[] = [
  { kind: "triangle", at: 20 },
  { kind: "circle", at: 110 },
  { kind: "cross", at: 200 },
  { kind: "square", at: 290 },
];

const ring = (size: number) => ({ "--ring": `calc(var(--scene) * ${size})` }) as CSSProperties;

/**
 * The hero's background: concentric rings centred on Arnab, with design-tool
 * tiles riding the outer rings and the four gamepad shapes circling close in.
 *
 * It lives at section level (not inside the scene) so one clip box can trim
 * the rings at the hero's edges. `--scene` and the centre point are set by the
 * hero section to match where the scene lands in its grid.
 */
export function HeroOrbitField({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        // The mask fades the rings out toward the hero's bottom edge, so they
        // dissolve into the page instead of being cut off in a straight line.
        "pointer-events-none absolute -top-28 bottom-0 left-1/2 -z-10 w-screen -translate-x-1/2 overflow-hidden [mask-image:linear-gradient(to_bottom,#000_calc(100%-15rem),transparent_calc(100%-1rem))]",
        className,
      )}
    >
      <div className="absolute bottom-0 left-1/2 top-28 w-[100cqw] -translate-x-1/2">
        <div className="hero-orbit-centre absolute size-0">
          {[...RINGS].reverse().map((item) => (
            <div
              key={item.size}
              className={cn("orbit-ring orbit-ring--embossed", item.className)}
              style={ring(item.size)}
            >
              {item.tiles.length ? (
                <div
                  className={cn("orbit-carrier", item.reverse && "orbit-carrier--reverse")}
                  style={{ "--orbit-seconds": `${item.seconds}s` } as CSSProperties}
                >
                  {item.tiles.map((tile) => (
                    <div
                      key={tile.at}
                      className="orbit-arm"
                      style={{ "--at": `${tile.at}deg` } as CSSProperties}
                    >
                      <div>
                        <div className="orbit-upright">
                          <div
                            className="orbit-tile"
                            style={{ "--tilt": `${tile.tilt}deg` } as CSSProperties}
                          >
                            <tile.Icon strokeWidth={1.8} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ))}

          <div className="orbit-ring orbit-ring--dashed" style={ring(1.14)}>
            <div className="orbit-carrier" style={{ "--orbit-seconds": "48s" } as CSSProperties}>
              {SHAPE_ORBIT.map((item) => (
                <div
                  key={item.kind}
                  className="orbit-arm"
                  style={{ "--at": `${item.at}deg` } as CSSProperties}
                >
                  <div>
                    <div className="orbit-upright">
                      <Sticker
                        kind={item.kind}
                        className="w-[clamp(1.7rem,calc(var(--scene)*0.075),2.6rem)] !border-2"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
