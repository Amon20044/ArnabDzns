import { cn } from "@/lib/utils";

type LiquidGlassBackdropVariant = "header" | "shell";

type LiquidGlassBackdropProps = {
  className?: string;
  variant?: LiquidGlassBackdropVariant;
};

/**
 * Flat surface layer for the header and dock.
 *
 * This used to build a canvas displacement map and an SVG refraction filter
 * per element. The site no longer uses glass, so it is now a plain opaque
 * layer: no canvas, no ResizeObserver, no backdrop-filter. The component name
 * and props are unchanged so callers did not need to move.
 */
export function LiquidGlassBackdrop({
  className,
  variant = "header",
}: LiquidGlassBackdropProps) {
  return (
    <div
      aria-hidden
      className={cn(
        variant === "shell" ? "liquid-glass-shell" : "liquid-glass-header",
        "pointer-events-none absolute inset-0",
        className,
      )}
    />
  );
}
