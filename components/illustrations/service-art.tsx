import type { CSSProperties, ReactNode } from "react";

/**
 * One small illustrated scene per service.
 *
 * Each scene is a 240x160 vector that reacts when its card is hovered (the
 * card carries the `group` class): swatches fan out, a lid pops, a playhead
 * runs. Motion is plain CSS on `rotate` / `translate` / `scale` / `opacity`,
 * and the two looping animations pause for reduced-motion users.
 */

const INK = "#15121c";
const MINT = "#3ddc97";
const RED = "#ff5d5d";
const COBALT = "#4f7bff";
const PINK = "#ff7fb5";
const SUN = "#ffc83d";

/** Shared transition for anything that moves on hover. */
const MOVE =
  "transition-[rotate,translate,scale,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] [transform-box:fill-box]";

const vars = (values: Record<string, string>) => values as CSSProperties;

export type ServiceArtKind = "logo" | "brand" | "packaging" | "web" | "social" | "motion" | "generic";

export type ServicePanelTone = "violet" | "ink" | "lilac" | "deep";

export const serviceArtTone: Record<ServiceArtKind, ServicePanelTone> = {
  logo: "violet",
  brand: "ink",
  packaging: "lilac",
  web: "deep",
  social: "ink",
  motion: "violet",
  generic: "lilac",
};

/** Pick a scene from the service's id and title, so CMS edits keep working. */
export function resolveServiceArt(id: string, title: string): ServiceArtKind {
  const text = `${id} ${title}`.toLowerCase();

  if (/logo|mark|monogram/.test(text)) return "logo";
  if (/brand|identity/.test(text)) return "brand";
  if (/pack|label|box/.test(text)) return "packaging";
  if (/web|site|ui|ux|app|landing/.test(text)) return "web";
  if (/social|post|instagram|thumbnail|content/.test(text)) return "social";
  if (/motion|video|anim|reel|edit/.test(text)) return "motion";

  return "generic";
}

function LogoArt() {
  return (
    <>
      {/* artboard */}
      <g className={`${MOVE} origin-center -rotate-3 group-hover:rotate-0`}>
        <rect x="42" y="20" width="156" height="120" rx="14" fill="#ffffff" />
        <rect x="42" y="20" width="156" height="120" rx="14" fill="none" stroke="#e9d5ff" strokeWidth="2" />
        {/* construction guides */}
        <g fill="none" stroke="#d8b4fe" strokeWidth="1.5" strokeDasharray="3 5">
          <circle cx="120" cy="84" r="40" />
          <path d="M60 114h120M120 30v100" />
        </g>
        {/* the mark */}
        <path
          d="M92 112 120 52l28 60"
          fill="none"
          stroke={INK}
          strokeWidth="13"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="120" cy="100" r="8" fill="#a855f7" />
        {/* bezier handle through the apex */}
        <g className={`${MOVE} origin-center group-hover:rotate-[16deg]`}>
          <path d="M84 52h72" stroke={COBALT} strokeWidth="2" />
          <circle cx="84" cy="52" r="5" fill="#ffffff" stroke={COBALT} strokeWidth="2.5" />
          <circle cx="156" cy="52" r="5" fill="#ffffff" stroke={COBALT} strokeWidth="2.5" />
        </g>
        <rect x="114" y="46" width="12" height="12" rx="2" fill={COBALT} />
        <rect x="86" y="106" width="12" height="12" rx="2" fill="#ffffff" stroke={COBALT} strokeWidth="2.5" />
        <rect x="142" y="106" width="12" height="12" rx="2" fill="#ffffff" stroke={COBALT} strokeWidth="2.5" />
      </g>
      {/* pen nib */}
      <g className={`${MOVE} translate-x-3 translate-y-3 group-hover:translate-x-0 group-hover:translate-y-0`}>
        <path
          d="M150 62l34 12-10 26-10-4-6 12-8-20Z"
          fill={INK}
          stroke="#ffffff"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <circle cx="168" cy="84" r="4" fill="#ffffff" />
      </g>
      {/* colour chips */}
      <g className={`${MOVE} group-hover:-translate-y-1.5`}>
        <rect x="24" y="112" width="20" height="20" rx="6" fill={SUN} stroke="#ffffff" strokeWidth="3" />
        <rect x="24" y="86" width="20" height="20" rx="6" fill={MINT} stroke="#ffffff" strokeWidth="3" />
      </g>
    </>
  );
}

function BrandArt() {
  const swatches = [
    { fill: MINT, rest: "-30deg", open: "-46deg" },
    { fill: SUN, rest: "-10deg", open: "-15deg" },
    { fill: PINK, rest: "10deg", open: "16deg" },
    { fill: "#a855f7", rest: "30deg", open: "47deg" },
  ];

  return (
    <>
      {/* swatch fan, hinged at the bottom */}
      <g>
        {swatches.map((swatch) => (
          <g
            key={swatch.fill}
            className={`${MOVE} origin-bottom rotate-[var(--rest)] group-hover:rotate-[var(--open)]`}
            style={vars({ "--rest": swatch.rest, "--open": swatch.open })}
          >
            <rect x="98" y="38" width="44" height="96" rx="9" fill={swatch.fill} stroke="#ffffff" strokeWidth="3" />
            <rect x="104" y="108" width="32" height="8" rx="4" fill="#ffffff" opacity="0.85" />
            <rect x="104" y="120" width="20" height="5" rx="2.5" fill="#ffffff" opacity="0.6" />
          </g>
        ))}
        <circle cx="120" cy="128" r="6" fill="#ffffff" />
        <circle cx="120" cy="128" r="2.5" fill={INK} />
      </g>
      {/* type specimen card */}
      <g className={`${MOVE} origin-center -rotate-6 group-hover:-translate-x-1.5 group-hover:-rotate-12`}>
        <rect x="14" y="26" width="66" height="46" rx="9" fill="#ffffff" />
        <text
          x="26"
          y="59"
          fontSize="30"
          fontWeight="600"
          letterSpacing="-1.5"
          fill={INK}
          style={{ fontFamily: "var(--font-sans-stack)" }}
        >
          Aa
        </text>
      </g>
      {/* seal */}
      <g className={`${MOVE} origin-center group-hover:rotate-45 group-hover:scale-110`}>
        <path
          d="M204 22l6 6 8-2 2 8 8 2-2 8 6 6-6 6 2 8-8 2-2 8-8-2-6 6-6-6-8 2-2-8-8-2 2-8-6-6 6-6-2-8 8-2 2-8 8 2Z"
          fill={RED}
          stroke="#ffffff"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path d="M196 50l6 6 11-12" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </>
  );
}

function PackagingArt() {
  return (
    <>
      <ellipse cx="118" cy="140" rx="74" ry="8" fill="#581c87" opacity="0.22" />
      {/* things popping out of the box */}
      <g className={`${MOVE} translate-y-5 opacity-0 group-hover:translate-y-0 group-hover:opacity-100`}>
        <path d="M92 44l10 18H82Z" fill={MINT} stroke="#ffffff" strokeWidth="3" strokeLinejoin="round" />
        <circle cx="124" cy="30" r="10" fill={RED} stroke="#ffffff" strokeWidth="3" />
        <path d="M148 34l12 12M160 34l-12 12" stroke={COBALT} strokeWidth="5" strokeLinecap="round" />
      </g>
      {/* box body */}
      <path d="M70 74h100v58a8 8 0 0 1-8 8H78a8 8 0 0 1-8-8Z" fill="#9333ea" />
      <path d="M70 74h100v14H70Z" fill="#6b21a8" opacity="0.55" />
      <rect x="112" y="74" width="16" height="66" fill="#e9d5ff" opacity="0.9" />
      {/* label */}
      <g className={`${MOVE} origin-center group-hover:scale-110 group-hover:-rotate-6`}>
        <circle cx="120" cy="112" r="19" fill="#ffffff" />
        <path
          d="M120 99l3.6 8 8.6.8-6.5 5.8 2 8.4-7.7-4.5-7.7 4.5 2-8.4-6.5-5.8 8.6-.8Z"
          fill={SUN}
        />
      </g>
      {/* lid lifts and tips back */}
      <g className={`${MOVE} origin-bottom-left group-hover:-translate-y-4 group-hover:-rotate-12`}>
        <rect x="64" y="58" width="112" height="20" rx="6" fill="#7e22ce" />
        <rect x="112" y="58" width="16" height="20" fill="#e9d5ff" opacity="0.9" />
      </g>
      {/* pouch */}
      <g className={`${MOVE} origin-bottom group-hover:rotate-6`}>
        <path d="M186 84h30l4 50a6 6 0 0 1-6 6h-26a6 6 0 0 1-6-6Z" fill={SUN} stroke="#ffffff" strokeWidth="3" strokeLinejoin="round" />
        <path d="M184 84h34" stroke={INK} strokeWidth="5" strokeLinecap="round" />
        <rect x="192" y="104" width="18" height="6" rx="3" fill={INK} />
        <rect x="192" y="114" width="12" height="5" rx="2.5" fill={INK} opacity="0.5" />
      </g>
      {/* swing tag */}
      <g className={`${MOVE} origin-top group-hover:rotate-[18deg]`}>
        <path d="M42 70v20" stroke={INK} strokeWidth="2.5" />
        <rect x="28" y="88" width="28" height="38" rx="7" fill="#ffffff" stroke={INK} strokeWidth="2.5" />
        <circle cx="42" cy="98" r="3.5" fill={INK} />
        <rect x="34" y="108" width="16" height="4" rx="2" fill={PINK} />
        <rect x="34" y="116" width="10" height="4" rx="2" fill="#d8b4fe" />
      </g>
    </>
  );
}

function WebArt() {
  return (
    <>
      {/* browser window */}
      <g className={`${MOVE} group-hover:-translate-x-1.5`}>
        <rect x="20" y="22" width="164" height="112" rx="12" fill="#ffffff" />
        <path d="M20 34a12 12 0 0 1 12-12h140a12 12 0 0 1 12 12v8H20Z" fill="#f3e8ff" />
        <circle cx="34" cy="32" r="3.5" fill={RED} />
        <circle cx="46" cy="32" r="3.5" fill={SUN} />
        <circle cx="58" cy="32" r="3.5" fill={MINT} />
        <rect x="74" y="27" width="70" height="10" rx="5" fill="#ffffff" />
        {/* hero block */}
        <rect x="32" y="52" width="74" height="9" rx="4.5" fill={INK} />
        <rect x="32" y="66" width="52" height="6" rx="3" fill="#cfc5e8" />
        <g className={`${MOVE} origin-center group-hover:scale-110`}>
          <rect x="32" y="80" width="46" height="16" rx="6" fill="#9333ea" />
          <rect x="41" y="86" width="28" height="4" rx="2" fill="#ffffff" />
        </g>
        <rect x="118" y="52" width="54" height="44" rx="8" fill="#e9d5ff" />
        <circle cx="134" cy="68" r="7" fill={SUN} />
        <path d="M118 96l18-18 12 10 10-8 14 16Z" fill="#a855f7" />
        {/* cards */}
        <rect x="32" y="106" width="42" height="18" rx="6" fill="#f3e8ff" />
        <rect x="80" y="106" width="42" height="18" rx="6" fill="#f3e8ff" />
        <rect x="128" y="106" width="44" height="18" rx="6" fill="#f3e8ff" />
      </g>
      {/* phone slides up over the window */}
      <g className={`${MOVE} translate-y-3 group-hover:translate-y-0`}>
        <rect x="170" y="54" width="52" height="96" rx="12" fill={INK} stroke="#ffffff" strokeWidth="3" />
        <rect x="176" y="62" width="40" height="80" rx="7" fill="#ffffff" />
        <rect x="188" y="58" width="16" height="3" rx="1.5" fill="#3a3348" />
        <rect x="181" y="68" width="30" height="22" rx="5" fill="#e9d5ff" />
        <rect x="181" y="95" width="24" height="5" rx="2.5" fill={INK} />
        <rect x="181" y="104" width="30" height="4" rx="2" fill="#cfc5e8" />
        <rect x="181" y="118" width="30" height="14" rx="5" fill={MINT} />
      </g>
      {/* cursor travels to the button */}
      <g className={`${MOVE} translate-x-7 translate-y-6 group-hover:translate-x-0 group-hover:translate-y-0`}>
        <path d="M66 90l22 9-9 3.5-3.5 9Z" fill={INK} stroke="#ffffff" strokeWidth="3" strokeLinejoin="round" />
      </g>
    </>
  );
}

function SocialArt() {
  return (
    <>
      {/* post */}
      <g className={`${MOVE} origin-center -rotate-3 group-hover:rotate-0`}>
        <rect x="58" y="16" width="112" height="128" rx="14" fill="#ffffff" />
        <circle cx="76" cy="34" r="8" fill="#a855f7" />
        <circle cx="76" cy="34" r="11" fill="none" stroke={PINK} strokeWidth="2.5" />
        <rect x="92" y="28" width="40" height="5" rx="2.5" fill={INK} />
        <rect x="92" y="37" width="24" height="4" rx="2" fill="#cfc5e8" />
        <rect x="66" y="52" width="96" height="62" rx="9" fill="#9333ea" />
        <circle cx="140" cy="68" r="9" fill={SUN} />
        <path d="M66 105l26-26 18 16 14-10 38 29v-9H66Z" fill="#c084fc" />
        <path d="M66 114l30-20 20 12 16-8 30 16Z" fill="#6b21a8" />
        {/* actions */}
        <path
          d="M78 124c-3.5-3.5-9 1.5-5 6l5 5 5-5c4-4.5-1.5-9.5-5-6Z"
          fill={RED}
          className={`${MOVE} origin-center group-hover:scale-125`}
        />
        <rect x="92" y="124" width="12" height="10" rx="4" fill="none" stroke={INK} strokeWidth="2.5" />
        <path d="M112 134l10-10M122 124h-7M122 124v7" stroke={INK} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      </g>
      {/* likes pill */}
      <g className={`${MOVE} origin-center group-hover:-translate-y-1.5 group-hover:scale-110`}>
        <rect x="152" y="86" width="72" height="30" rx="15" fill={PINK} stroke="#ffffff" strokeWidth="3" />
        <path d="M172 96c-3-3-8 1.5-4.5 5.5l4.5 4.5 4.5-4.5c3.5-4-1.5-8.5-4.5-5.5Z" fill="#ffffff" />
        <text
          x="184"
          y="106.5"
          fontSize="13"
          fontWeight="700"
          fill={INK}
          style={{ fontFamily: "var(--font-sans-stack)" }}
        >
          2.4k
        </text>
      </g>
      {/* comment bubble */}
      <g className={`${MOVE} origin-bottom-right group-hover:-rotate-6 group-hover:-translate-x-1`}>
        <path d="M16 48a10 10 0 0 1 10-10h34a10 10 0 0 1 10 10v14a10 10 0 0 1-10 10H40l-10 9v-9h-4a10 10 0 0 1-10-10Z" fill={MINT} stroke="#ffffff" strokeWidth="3" strokeLinejoin="round" />
        <rect x="26" y="48" width="34" height="5" rx="2.5" fill={INK} />
        <rect x="26" y="58" width="20" height="5" rx="2.5" fill={INK} opacity="0.55" />
      </g>
      {/* hearts drifting up */}
      {[
        { x: 196, y: 70, size: 1, delay: "0s" },
        { x: 212, y: 60, size: 0.7, delay: "0.9s" },
        { x: 184, y: 56, size: 0.55, delay: "1.7s" },
      ].map((heart) => (
        <g key={heart.delay} transform={`translate(${heart.x} ${heart.y}) scale(${heart.size})`}>
          <path
            d="M0 0c-5-5-13 2-7 9l7 7 7-7c6-7-2-14-7-9Z"
            fill={RED}
            className="art-loop [transform-box:fill-box]"
            style={{ animation: `art-float-up 2.8s ease-out ${heart.delay} infinite` }}
          />
        </g>
      ))}
    </>
  );
}

function MotionArt() {
  return (
    <>
      {/* motion path with onion skins */}
      <path
        d="M30 74c24-58 56-58 80 0s56 58 80 0"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.55"
        strokeWidth="2"
        strokeDasharray="2 7"
        strokeLinecap="round"
      />
      <circle cx="46" cy="46" r="9" fill="#ffffff" opacity="0.18" />
      <circle cx="70" cy="30" r="9" fill="#ffffff" opacity="0.32" />
      <circle cx="94" cy="46" r="9" fill="#ffffff" opacity="0.5" />
      <g className={`${MOVE} group-hover:translate-x-9 group-hover:translate-y-9 group-hover:scale-90`}>
        <circle cx="110" cy="74" r="12" fill={SUN} stroke="#ffffff" strokeWidth="3" />
      </g>
      <path d="M204 30l4 9 9 4-9 4-4 9-4-9-9-4 9-4Z" fill="#ffffff" className={`${MOVE} origin-center group-hover:rotate-90 group-hover:scale-125`} />

      {/* timeline */}
      <rect x="18" y="94" width="204" height="54" rx="12" fill={INK} />
      <rect x="28" y="104" width="76" height="9" rx="4.5" fill={MINT} />
      <rect x="92" y="118" width="96" height="9" rx="4.5" fill={PINK} />
      <rect x="44" y="132" width="58" height="9" rx="4.5" fill={COBALT} />
      <rect x="126" y="132" width="70" height="9" rx="4.5" fill="#a855f7" />
      {[46, 104, 140, 188].map((x, index) => (
        <rect
          key={x}
          x={x - 4}
          y={index % 2 === 0 ? 104.5 : 118.5}
          width="8"
          height="8"
          rx="1.5"
          fill="#ffffff"
          transform={`rotate(45 ${x} ${index % 2 === 0 ? 108.5 : 122.5})`}
        />
      ))}
      {/* playhead */}
      <g className="art-loop" style={{ animation: "art-playhead 3.6s cubic-bezier(0.45,0,0.55,1) infinite" }}>
        <path d="M36 90v60" stroke={RED} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M29 84h14v7l-7 6-7-6Z" fill={RED} />
      </g>
    </>
  );
}

function GenericArt() {
  return (
    <>
      <g className={`${MOVE} origin-center group-hover:rotate-12`}>
        <rect x="76" y="36" width="88" height="88" rx="22" fill="#9333ea" stroke="#ffffff" strokeWidth="4" />
        <path d="M120 54l7 18 18 7-18 7-7 18-7-18-18-7 18-7Z" fill="#ffffff" />
      </g>
      <circle cx="46" cy="52" r="12" fill={MINT} stroke="#ffffff" strokeWidth="3" className={`${MOVE} group-hover:-translate-y-2`} />
      <rect x="182" y="92" width="26" height="26" rx="7" fill={SUN} stroke="#ffffff" strokeWidth="3" className={`${MOVE} origin-center group-hover:rotate-45`} />
      <path d="M40 112l14 14M54 112l-14 14" stroke={COBALT} strokeWidth="5" strokeLinecap="round" />
    </>
  );
}

const scenes: Record<ServiceArtKind, () => ReactNode> = {
  logo: LogoArt,
  brand: BrandArt,
  packaging: PackagingArt,
  web: WebArt,
  social: SocialArt,
  motion: MotionArt,
  generic: GenericArt,
};

export function ServiceArt({
  kind,
  className,
  align = "center",
}: {
  kind: ServiceArtKind;
  className?: string;
  /** Where the scene sits when its panel is wider than the scene. */
  align?: "center" | "right";
}) {
  const Scene = scenes[kind];

  return (
    <svg
      viewBox="0 0 240 160"
      preserveAspectRatio={align === "right" ? "xMaxYMid meet" : "xMidYMid meet"}
      aria-hidden
      className={className}
    >
      <Scene />
    </svg>
  );
}
