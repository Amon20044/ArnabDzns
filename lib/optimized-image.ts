import imageAssets from "@/lib/image-assets.json";

const assets: Record<string, { base: string; widths: number[]; avif?: boolean; full?: { base: string; widths: number[] } }> = imageAssets;

export function getOptimizedImageUrl(src: string, width = 1920, format: "webp" | "avif" = "webp"): string | undefined {
  const entry = assets[src];
  const asset = format === "webp" && width > 960 ? entry?.full ?? entry : entry;
  if (!asset) return undefined;
  const size = asset.widths.find((candidate) => candidate >= width) ?? asset.widths.at(-1);
  return `${asset.base}-${size}.${format}`;
}

export function hasAvifImage(src: string): boolean {
  return Boolean(assets[src]?.avif);
}

export function getOptimizedImageSrcSet(src: string, format: "webp" | "avif", maxWidth: number): string | undefined {
  const entry = assets[src];
  const asset = format === "webp" && maxWidth > 960 ? entry?.full ?? entry : entry;
  if (!asset) return undefined;
  const widths = asset.widths.filter(width => width <= maxWidth);
  return (widths.length ? widths : [asset.widths[0]])
    .map(width => `${asset.base}-${width}.${format} ${width}w`).join(", ");
}
