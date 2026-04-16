import type { ImpactAccent } from "@/types";

export interface ImpactAccentTokens {
  /** Foreground tint used for headline + glow color. */
  foreground: string;
  /** Solid chip / bar fill. */
  solid: string;
  /** Soft translucent fill for sparkline gradients. */
  soft: string;
  /** Border / ring tint for accents on dark cards. */
  ring: string;
  /** Badge tone for StatusBadge reuse. */
  badgeTone: string;
  /** Card gradient overlay — stops placed top-right-ish. */
  gradient: string;
}

const accentMap: Record<string, ImpactAccentTokens> = {
  violet: {
    foreground: "#d8b4fe",
    solid: "#a855f7",
    soft: "rgba(168, 85, 247, 0.22)",
    ring: "rgba(168, 85, 247, 0.45)",
    badgeTone: "#a855f7",
    gradient:
      "radial-gradient(circle at 82% 12%, rgba(168,85,247,0.28) 0%, transparent 52%), radial-gradient(circle at 18% 88%, rgba(76,29,149,0.22) 0%, transparent 46%)",
  },
  iris: {
    foreground: "#c4b5fd",
    solid: "#8b5cf6",
    soft: "rgba(139, 92, 246, 0.22)",
    ring: "rgba(139, 92, 246, 0.45)",
    badgeTone: "#8b5cf6",
    gradient:
      "radial-gradient(circle at 82% 12%, rgba(139,92,246,0.28) 0%, transparent 52%), radial-gradient(circle at 18% 88%, rgba(55,48,163,0.22) 0%, transparent 46%)",
  },
  emerald: {
    foreground: "#6ee7b7",
    solid: "#10b981",
    soft: "rgba(16, 185, 129, 0.22)",
    ring: "rgba(16, 185, 129, 0.45)",
    badgeTone: "#10b981",
    gradient:
      "radial-gradient(circle at 82% 12%, rgba(16,185,129,0.26) 0%, transparent 52%), radial-gradient(circle at 18% 88%, rgba(6,95,70,0.2) 0%, transparent 46%)",
  },
  lime: {
    foreground: "#bef264",
    solid: "#84cc16",
    soft: "rgba(132, 204, 22, 0.22)",
    ring: "rgba(132, 204, 22, 0.4)",
    badgeTone: "#84cc16",
    gradient:
      "radial-gradient(circle at 82% 12%, rgba(132,204,22,0.24) 0%, transparent 52%), radial-gradient(circle at 18% 88%, rgba(63,98,18,0.2) 0%, transparent 46%)",
  },
  amber: {
    foreground: "#fcd34d",
    solid: "#f59e0b",
    soft: "rgba(245, 158, 11, 0.22)",
    ring: "rgba(245, 158, 11, 0.42)",
    badgeTone: "#f59e0b",
    gradient:
      "radial-gradient(circle at 82% 12%, rgba(245,158,11,0.26) 0%, transparent 52%), radial-gradient(circle at 18% 88%, rgba(120,53,15,0.2) 0%, transparent 46%)",
  },
  rose: {
    foreground: "#fda4af",
    solid: "#f43f5e",
    soft: "rgba(244, 63, 94, 0.22)",
    ring: "rgba(244, 63, 94, 0.42)",
    badgeTone: "#f43f5e",
    gradient:
      "radial-gradient(circle at 82% 12%, rgba(244,63,94,0.26) 0%, transparent 52%), radial-gradient(circle at 18% 88%, rgba(136,19,55,0.22) 0%, transparent 46%)",
  },
  sky: {
    foreground: "#7dd3fc",
    solid: "#0ea5e9",
    soft: "rgba(14, 165, 233, 0.22)",
    ring: "rgba(14, 165, 233, 0.42)",
    badgeTone: "#0ea5e9",
    gradient:
      "radial-gradient(circle at 82% 12%, rgba(14,165,233,0.26) 0%, transparent 52%), radial-gradient(circle at 18% 88%, rgba(7,89,133,0.2) 0%, transparent 46%)",
  },
};

export const resolveImpactAccent = (accent: ImpactAccent): ImpactAccentTokens =>
  accentMap[accent] ?? accentMap.violet;
