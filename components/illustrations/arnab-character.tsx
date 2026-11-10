"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface ArnabCharacterProps {
  className?: string;
  /** Accessible description. Pass an empty string when purely decorative. */
  title?: string;
}

const loop = (duration: number, delay = 0) =>
  ({
    duration,
    delay,
    repeat: Number.POSITIVE_INFINITY,
    ease: "easeInOut",
  }) as const;

const SKIN = "#d59d6c";
const SKIN_SHADE = "#b97b4d";
const HAIR = "#1d1826";
const HAIR_LIGHT = "#3b3050";
const INK = "#15121c";
const SHELL = "#f7f5fc";
const SHELL_SHADE = "#d9d3ea";

/**
 * Arnab, waist-up, headset on, mid-game with a controller.
 *
 * Hand-built vector so it stays sharp at any size, weighs a few KB, and can
 * be animated part by part (blink, thumbs, button presses, light bar) without
 * a Lottie runtime. No SVG filters are used: every moving part is a plain
 * transform or opacity change.
 */
export function ArnabCharacter({
  className,
  title = "Illustration of Arnab wearing a headset and holding a game controller",
}: ArnabCharacterProps) {
  const reduce = useReducedMotion();
  const still = Boolean(reduce);

  return (
    <svg
      viewBox="0 0 480 520"
      className={cn("h-auto w-full overflow-visible", className)}
      role={title ? "img" : "presentation"}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <linearGradient id="arnab-hoodie" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a3350" />
          <stop offset="0.5" stopColor="#262033" />
          <stop offset="1" stopColor="#15111d" />
        </linearGradient>
        <linearGradient id="arnab-sleeve" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3f3757" />
          <stop offset="1" stopColor="#1d1828" />
        </linearGradient>
        <radialGradient id="arnab-face" cx="0.38" cy="0.32" r="0.8">
          <stop offset="0" stopColor="#e3b081" />
          <stop offset="0.7" stopColor={SKIN} />
          <stop offset="1" stopColor="#c58a5b" />
        </radialGradient>
        <linearGradient id="arnab-shell" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor={SHELL_SHADE} />
        </linearGradient>
        <radialGradient id="arnab-lightbar" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#e9d5ff" />
          <stop offset="1" stopColor="#a855f7" stopOpacity="0" />
        </radialGradient>
        <clipPath id="arnab-face-clip">
          <ellipse cx="240" cy="172" rx="80" ry="86" />
        </clipPath>
      </defs>

      {/* ---------- Body ---------- */}
      <ellipse cx="240" cy="288" rx="86" ry="30" fill="#110e18" />
      <path
        d="M112 520c-4-92 8-190 62-224l26-12h80l26 12c54 34 66 132 62 224Z"
        fill="url(#arnab-hoodie)"
      />
      {/* centre seam + pocket line give the hoodie some structure */}
      <path
        d="M240 306v214M176 520c2-34 12-58 28-72M304 520c-2-34-12-58-28-72"
        fill="none"
        stroke="#0b0910"
        strokeOpacity="0.35"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* neck + tee */}
      <path d="M212 236h56v48c-16 16-40 16-56 0Z" fill={SKIN_SHADE} />
      <path d="M204 280c18 22 54 22 72 0l8 6c-22 34-66 34-88 0Z" fill="#a855f7" />
      <path
        d="M196 286c-4 18-4 34 2 52M284 286c4 18 4 34-2 52"
        stroke="#d8b4fe"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="198" cy="342" r="5" fill="#d8b4fe" />
      <circle cx="282" cy="342" r="5" fill="#d8b4fe" />

      {/* ---------- Head ---------- */}
      <motion.g
        style={{ transformBox: "fill-box", transformOrigin: "50% 92%" }}
        animate={still ? undefined : { rotate: [-2.2, 2.2, -2.2] }}
        transition={loop(5.2)}
      >
        {/* hair, back volume */}
        <path
          d="M150 190c-20-74 14-152 90-156 78-4 112 78 90 156-10 18-170 18-180 0Z"
          fill={HAIR}
        />
        <ellipse cx="240" cy="172" rx="80" ry="86" fill="url(#arnab-face)" />
        {/* shadow cast by the fringe */}
        <g clipPath="url(#arnab-face-clip)">
          <path
            d="M150 150c30-14 60 14 92-2 26 14 62-6 90 6v-70H150Z"
            fill={SKIN_SHADE}
            opacity="0.55"
          />
          <ellipse cx="192" cy="214" rx="17" ry="11" fill="#ff7fb5" opacity="0.34" />
          <ellipse cx="288" cy="214" rx="17" ry="11" fill="#ff7fb5" opacity="0.34" />
        </g>

        {/* hair: fluffy top + fringe tufts */}
        <g fill={HAIR}>
          <circle cx="182" cy="82" r="34" />
          <circle cx="226" cy="58" r="38" />
          <circle cx="276" cy="64" r="36" />
          <circle cx="312" cy="100" r="30" />
          <circle cx="160" cy="124" r="26" />
          <path d="M152 174c-8-58 20-104 88-106 68-2 98 44 88 106-6-20-14-32-26-40-10 14-28 20-48 16 4-8 6-16 4-24-14 22-42 30-68 24 6-8 8-16 8-24-22 8-38 26-46 48Z" />
        </g>
        <g fill={HAIR_LIGHT} opacity="0.55">
          <path d="M196 62c14-14 38-18 56-10-20 0-38 6-52 20Z" />
          <path d="M264 58c18 2 34 12 42 28-12-12-26-18-44-20Z" />
          <path d="M172 104c4-12 12-22 24-28-8 10-12 20-14 34Z" />
        </g>

        {/* headset band over the hair */}
        <path
          d="M140 182C128 20 352 20 340 182"
          fill="none"
          stroke={SHELL}
          strokeWidth="15"
          strokeLinecap="round"
        />
        <path
          d="M150 150C150 44 330 44 330 150"
          fill="none"
          stroke={SHELL_SHADE}
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.9"
        />
        {/* ear cups */}
        <rect x="120" y="146" width="44" height="76" rx="20" fill={SHELL} />
        <rect x="128" y="156" width="28" height="56" rx="14" fill="#a855f7" />
        <rect x="134" y="164" width="9" height="26" rx="4.5" fill="#d8b4fe" />
        <rect x="316" y="146" width="44" height="76" rx="20" fill={SHELL} />
        <rect x="324" y="156" width="28" height="56" rx="14" fill="#a855f7" />
        <rect x="330" y="164" width="9" height="26" rx="4.5" fill="#d8b4fe" />
        {/* mic boom */}
        <path
          d="M136 214c2 26 22 40 52 38"
          fill="none"
          stroke={INK}
          strokeWidth="5"
          strokeLinecap="round"
        />
        <rect x="184" y="243" width="22" height="16" rx="8" fill={INK} />

        {/* brows */}
        <path
          d="M192 148q17-9 34-2M254 146q17-7 34 2"
          fill="none"
          stroke={HAIR}
          strokeWidth="7"
          strokeLinecap="round"
        />
        {/* eyes (blink) */}
        <motion.g
          style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
          animate={still ? undefined : { scaleY: [1, 1, 0.08, 1, 1] }}
          transition={{
            duration: 4.6,
            times: [0, 0.9, 0.94, 0.98, 1],
            repeat: Number.POSITIVE_INFINITY,
          }}
        >
          <ellipse cx="210" cy="180" rx="6.5" ry="8" fill={INK} />
          <ellipse cx="270" cy="180" rx="6.5" ry="8" fill={INK} />
          <circle cx="212.5" cy="177" r="2.2" fill="#ffffff" />
          <circle cx="272.5" cy="177" r="2.2" fill="#ffffff" />
        </motion.g>
        {/* glasses */}
        <g fill="none" stroke={INK} strokeWidth="6" strokeLinejoin="round">
          <rect x="182" y="160" width="54" height="40" rx="12" fill="#ffffff" fillOpacity="0.16" />
          <rect x="244" y="160" width="54" height="40" rx="12" fill="#ffffff" fillOpacity="0.16" />
          <path d="M236 174q4-5 8 0" strokeLinecap="round" />
          <path d="M182 172l-18-4M298 172l18-4" strokeLinecap="round" />
        </g>
        <path
          d="M191 170l10-6M253 170l10-6"
          stroke="#ffffff"
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.75"
        />
        {/* nose + grin */}
        <path
          d="M238 202q5 10-5 12"
          fill="none"
          stroke={SKIN_SHADE}
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path d="M216 226q24 22 48 0q-24 8-48 0Z" fill="#5a2a1f" />
        <path d="M222 229q18 6 36 0q-18 9-36 0Z" fill="#ffffff" />
      </motion.g>

      {/* ---------- Arms + controller ---------- */}
      <motion.g
        style={{ transformBox: "fill-box", transformOrigin: "50% 40%" }}
        animate={still ? undefined : { rotate: [-2.5, 2.5, -2.5], y: [0, -3, 0] }}
        transition={loop(3.4)}
      >
        {/* sleeves: shoulder, elbow out, wrist in at the grips */}
        <path
          d="M152 318c-38 30-58 86-42 120 8 16 22 26 38 28"
          fill="none"
          stroke="url(#arnab-sleeve)"
          strokeWidth="46"
          strokeLinecap="round"
        />
        <path
          d="M328 318c38 30 58 86 42 120-8 16-22 26-38 28"
          fill="none"
          stroke="url(#arnab-sleeve)"
          strokeWidth="46"
          strokeLinecap="round"
        />
        {/* cuffs */}
        <path
          d="M133 462l16 4M347 462l-16 4"
          fill="none"
          stroke="#a855f7"
          strokeWidth="46"
        />
        {/* palms sit behind the grips, the way a held pad hides the fingers */}
        <ellipse cx="160" cy="476" rx="25" ry="24" fill={SKIN} />
        <ellipse cx="320" cy="476" rx="25" ry="24" fill={SKIN} />

        <g transform="translate(0 16)">
          {/* light bar glow */}
          <motion.ellipse
            cx="240"
            cy="366"
            rx="78"
            ry="24"
            fill="url(#arnab-lightbar)"
            animate={still ? undefined : { opacity: [0.35, 1, 0.35] }}
            transition={loop(2.2)}
          />
          <path
            d="M136 392c0-22 18-32 44-32h120c26 0 44 10 44 32l14 76c6 30-28 44-44 16l-14-26H180l-14 26c-16 28-50 14-44-16Z"
            fill="url(#arnab-shell)"
          />
          <path
            d="M180 458h120l14 26c16 28 50 14 44-16l-4-20c2 22-22 30-34 10l-12-22H172l-12 22c-12 20-36 12-34-10l-4 20c-6 30 28 44 44 16Z"
            fill="#c4b9de"
            opacity="0.7"
          />
          {/* touchpad */}
          <rect x="204" y="368" width="72" height="40" rx="10" fill={INK} />
          <rect x="204" y="368" width="72" height="5" rx="2.5" fill="#c084fc" />
          {/* d-pad */}
          <g fill={INK}>
            <rect x="158" y="392" width="34" height="12" rx="4" />
            <rect x="169" y="381" width="12" height="34" rx="4" />
          </g>
          {/* face buttons: generic shape set, lit in sequence */}
          {[
            { cx: 308, cy: 380, fill: "#3ddc97" },
            { cx: 326, cy: 398, fill: "#ff5d5d" },
            { cx: 308, cy: 416, fill: "#4f7bff" },
            { cx: 290, cy: 398, fill: "#ff7fb5" },
          ].map((button, index) => (
            <motion.circle
              key={button.fill}
              cx={button.cx}
              cy={button.cy}
              r="9"
              fill={button.fill}
              style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
              animate={still ? undefined : { scale: [1, 1, 1.28, 1, 1] }}
              transition={{
                duration: 3.2,
                times: [0, 0.1 + index * 0.2, 0.16 + index * 0.2, 0.24 + index * 0.2, 1],
                repeat: Number.POSITIVE_INFINITY,
              }}
            />
          ))}
          {/* sticks */}
          <circle cx="214" cy="436" r="15" fill={INK} />
          <circle cx="266" cy="436" r="15" fill={INK} />
          <circle cx="214" cy="434" r="9" fill="#3a3348" />
          <circle cx="266" cy="434" r="9" fill="#3a3348" />
        </g>

        {/* thumbs rest on top of the pad */}
        <motion.path
          d="M156 464l12-24"
          fill="none"
          stroke={SKIN}
          strokeWidth="17"
          strokeLinecap="round"
          animate={still ? undefined : { x: [0, 4, -2, 0], y: [0, -3, 2, 0] }}
          transition={loop(1.5)}
        />
        <motion.path
          d="M324 464l-10-22"
          fill="none"
          stroke={SKIN}
          strokeWidth="17"
          strokeLinecap="round"
          animate={still ? undefined : { x: [0, -4, 2, 0], y: [0, 3, -3, 0] }}
          transition={loop(1.1, 0.2)}
        />
        <path
          d="M150 470q6 6 14 4M330 470q-6 6-14 4"
          fill="none"
          stroke={SKIN_SHADE}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </motion.g>
    </svg>
  );
}
