export interface LiquidGlassDistortionConfig {
  baseFrequency: string;
  numOctaves: number;
  scale: number;
  seed: number;
  xChannelSelector: "R" | "G" | "B" | "A";
  yChannelSelector: "R" | "G" | "B" | "A";
}

export interface LiquidGlassPreset {
  border: string;
  background: string;
  backgroundColor: string;
  shadow: string;
  backdrop: string;
  backdropWebkit: string;
}

export interface LiquidGlassRefractionConfig {
  bezel: number;
  cornerRadius: number;
  displacement: number;
  blur: number;
  brightness: number;
  saturate: number;
  contrast: number;
}

export interface LiquidGlassConfig {
  distortion: LiquidGlassDistortionConfig;
  refraction: {
    header: LiquidGlassRefractionConfig;
    shell: LiquidGlassRefractionConfig;
  };
  presets: {
    surface: LiquidGlassPreset;
    header: LiquidGlassPreset;
    shell: LiquidGlassPreset;
    capsule: LiquidGlassPreset;
    capsulePrimary: LiquidGlassPreset;
  };
}

export const liquidGlassConfig = {
  distortion: {
    baseFrequency: "0.014 0.018",
    numOctaves: 6,
    scale: 1,
    seed: 7,
    xChannelSelector: "R",
    yChannelSelector: "G",
  },
  refraction: {
    header: {
      bezel: 22,
      cornerRadius: 18,
      displacement: 32,
      blur: 2.0,
      brightness: 1.06,
      saturate: 1.12,
      contrast: 1.04,
    },
    shell: {
      bezel: 18,
      cornerRadius: 28,
      displacement: 28,
      blur: 2.0,
      brightness: 1.06,
      saturate: 1.12,
      contrast: 1.04,
    },
  },
  presets: {
    surface: {
      border: "rgba(255, 255, 255, 0.4)",
      background: [
        "linear-gradient(180deg, rgba(255, 255, 255, 0.44) 0%, rgba(255, 255, 255, 0.16) 18%, transparent 58%)",
        "radial-gradient(circle at 12% 12%, rgba(255, 255, 255, 0.34) 0%, transparent 34%)",
        "radial-gradient(circle at 88% 86%, rgba(168, 85, 247, 0.08) 0%, transparent 40%)",
        "linear-gradient(135deg, rgba(255, 255, 255, 0.34) 0%, rgba(245, 240, 255, 0.24) 56%, rgba(255, 255, 255, 0.12) 100%)",
      ].join(", "),
      backgroundColor: "rgba(255, 255, 255, 0.18)",
      shadow: [
        "inset 1px 1px 0 rgba(255, 255, 255, 0.78)",
        "inset -1px -1px 0 rgba(255, 255, 255, 0.18)",
        "inset 0 0 0 1px rgba(255, 255, 255, 0.12)",
        "0 12px 28px rgba(88, 28, 135, 0.1)",
        "0 3px 10px rgba(9, 9, 11, 0.05)",
      ].join(", "),
      backdrop: "brightness(1.06) saturate(1.42) blur(16px) url(#lg-distort)",
      backdropWebkit: "brightness(1.06) saturate(1.42) blur(16px)",
    },
    header: {
      border: "rgba(255, 255, 255, 0.52)",
      background: [
        "linear-gradient(180deg, rgba(255, 255, 255, 0.62) 0%, rgba(255, 255, 255, 0.20) 18%, rgba(255, 255, 255, 0.08) 58%, transparent 100%)",
        "radial-gradient(circle at 14% 18%, rgba(255, 255, 255, 0.62) 0%, transparent 32%)",
        "radial-gradient(circle at 82% 26%, rgba(168, 85, 247, 0.16) 0%, transparent 32%)",
        "radial-gradient(circle at 70% 88%, rgba(96, 165, 250, 0.12) 0%, transparent 34%)",
        "linear-gradient(135deg, rgba(255, 255, 255, 0.42) 0%, rgba(248, 247, 252, 0.24) 56%, rgba(255, 255, 255, 0.14) 100%)",
      ].join(", "),
      backgroundColor: "rgba(255, 255, 255, 0.24)",
      shadow: [
        "inset 1.5px 1.5px 0 rgba(255, 255, 255, 0.9)",
        "inset -1px -1px 0 rgba(255, 255, 255, 0.22)",
        "inset 0 0 0 1px rgba(255, 255, 255, 0.16)",
        "0 18px 50px rgba(88, 28, 135, 0.14)",
        "0 4px 14px rgba(9, 9, 11, 0.08)",
      ].join(", "),
      backdrop: "blur(0.9px) contrast(1.04) brightness(1.06) saturate(1.12)",
      backdropWebkit: "blur(0.9px) contrast(1.04) brightness(1.06) saturate(1.12)",
    },
    shell: {
      border: "rgba(255, 255, 255, 0.48)",
      background: [
        "linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.16) 18%, transparent 58%)",
        "radial-gradient(circle at 12% 12%, rgba(255, 255, 255, 0.46) 0%, transparent 36%)",
        "radial-gradient(circle at 88% 88%, rgba(168, 85, 247, 0.14) 0%, transparent 42%)",
        "linear-gradient(135deg, rgba(255, 255, 255, 0.36) 0%, rgba(248, 247, 252, 0.22) 58%, rgba(255, 255, 255, 0.12) 100%)",
      ].join(", "),
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      shadow: [
        "inset 1.5px 1.5px 0 rgba(255, 255, 255, 0.88)",
        "inset -1px -1px 0 rgba(255, 255, 255, 0.2)",
        "inset 0 0 0 1px rgba(255, 255, 255, 0.14)",
        "0 22px 60px rgba(88, 28, 135, 0.16)",
        "0 6px 18px rgba(9, 9, 11, 0.08)",
      ].join(", "),
      backdrop: "brightness(1.08) saturate(1.46) blur(18px) url(#lg-distort)",
      backdropWebkit: "brightness(1.08) saturate(1.46) blur(18px)",
    },
    capsule: {
      border: "rgba(255, 255, 255, 0.42)",
      background: [
        "linear-gradient(180deg, rgba(255, 255, 255, 0.46) 0%, rgba(255, 255, 255, 0.18) 18%, transparent 56%)",
        "radial-gradient(circle at 14% 16%, rgba(255, 255, 255, 0.36) 0%, transparent 34%)",
        "radial-gradient(circle at 86% 84%, rgba(168, 85, 247, 0.12) 0%, transparent 40%)",
        "linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(244, 240, 255, 0.24) 60%, rgba(255, 255, 255, 0.14) 100%)",
      ].join(", "),
      backgroundColor: "rgba(255, 255, 255, 0.16)",
      shadow: [
        "inset 1.25px 1.25px 0 rgba(255, 255, 255, 0.8)",
        "inset -0.75px -0.75px 0 rgba(255, 255, 255, 0.22)",
        "inset 0 0 0 1px rgba(255, 255, 255, 0.12)",
        "0 8px 20px rgba(168, 85, 247, 0.12)",
        "0 2px 6px rgba(9, 9, 11, 0.05)",
      ].join(", "),
      backdrop: "brightness(1.06) saturate(1.4) blur(14px) url(#lg-distort)",
      backdropWebkit: "brightness(1.06) saturate(1.4) blur(14px)",
    },
    capsulePrimary: {
      border: "rgba(192, 132, 252, 0.38)",
      background: [
        "linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.04) 16%, transparent 50%)",
        "radial-gradient(circle at 18% 18%, rgba(216, 180, 254, 0.24) 0%, transparent 36%)",
        "radial-gradient(circle at 84% 84%, rgba(255, 255, 255, 0.08) 0%, transparent 42%)",
        "linear-gradient(135deg, rgba(9, 9, 11, 0.9) 0%, rgba(50, 20, 80, 0.84) 100%)",
      ].join(", "),
      backgroundColor: "rgba(31, 18, 53, 0.72)",
      shadow: [
        "inset 1px 1px 0 rgba(255, 255, 255, 0.18)",
        "inset -1px -1px 0 rgba(255, 255, 255, 0.08)",
        "inset 0 0 0 1px rgba(255, 255, 255, 0.08)",
        "0 4px 20px rgba(0, 0, 0, 0.25)",
        "0 1px 3px rgba(0, 0, 0, 0.15)",
      ].join(", "),
      backdrop: "brightness(0.92) saturate(1.4) blur(12px) url(#lg-distort)",
      backdropWebkit: "brightness(0.92) saturate(1.4) blur(12px)",
    },
  },
} satisfies LiquidGlassConfig;

export const liquidGlassCssVariables = {
  "--liquid-glass-surface-border": liquidGlassConfig.presets.surface.border,
  "--liquid-glass-surface-background": liquidGlassConfig.presets.surface.background,
  "--liquid-glass-surface-background-color": liquidGlassConfig.presets.surface.backgroundColor,
  "--liquid-glass-surface-shadow": liquidGlassConfig.presets.surface.shadow,
  "--liquid-glass-surface-backdrop": liquidGlassConfig.presets.surface.backdrop,
  "--liquid-glass-surface-backdrop-webkit": liquidGlassConfig.presets.surface.backdropWebkit,
  "--liquid-glass-header-border": liquidGlassConfig.presets.header.border,
  "--liquid-glass-header-background": liquidGlassConfig.presets.header.background,
  "--liquid-glass-header-background-color": liquidGlassConfig.presets.header.backgroundColor,
  "--liquid-glass-header-shadow": liquidGlassConfig.presets.header.shadow,
  "--liquid-glass-header-backdrop": liquidGlassConfig.presets.header.backdrop,
  "--liquid-glass-header-backdrop-webkit": liquidGlassConfig.presets.header.backdropWebkit,
  "--liquid-glass-shell-border": liquidGlassConfig.presets.shell.border,
  "--liquid-glass-shell-background": liquidGlassConfig.presets.shell.background,
  "--liquid-glass-shell-background-color": liquidGlassConfig.presets.shell.backgroundColor,
  "--liquid-glass-shell-shadow": liquidGlassConfig.presets.shell.shadow,
  "--liquid-glass-shell-backdrop": liquidGlassConfig.presets.shell.backdrop,
  "--liquid-glass-shell-backdrop-webkit": liquidGlassConfig.presets.shell.backdropWebkit,
  "--liquid-glass-capsule-border": liquidGlassConfig.presets.capsule.border,
  "--liquid-glass-capsule-background": liquidGlassConfig.presets.capsule.background,
  "--liquid-glass-capsule-background-color": liquidGlassConfig.presets.capsule.backgroundColor,
  "--liquid-glass-capsule-shadow": liquidGlassConfig.presets.capsule.shadow,
  "--liquid-glass-capsule-backdrop": liquidGlassConfig.presets.capsule.backdrop,
  "--liquid-glass-capsule-backdrop-webkit": liquidGlassConfig.presets.capsule.backdropWebkit,
  "--liquid-glass-capsule-primary-border": liquidGlassConfig.presets.capsulePrimary.border,
  "--liquid-glass-capsule-primary-background": liquidGlassConfig.presets.capsulePrimary.background,
  "--liquid-glass-capsule-primary-background-color":
    liquidGlassConfig.presets.capsulePrimary.backgroundColor,
  "--liquid-glass-capsule-primary-shadow": liquidGlassConfig.presets.capsulePrimary.shadow,
  "--liquid-glass-capsule-primary-backdrop": liquidGlassConfig.presets.capsulePrimary.backdrop,
  "--liquid-glass-capsule-primary-backdrop-webkit":
    liquidGlassConfig.presets.capsulePrimary.backdropWebkit,
} satisfies Record<`--${string}`, string>;
