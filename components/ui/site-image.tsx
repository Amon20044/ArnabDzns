"use client";

import NextImage, { type ImageLoaderProps, type ImageProps } from "next/image";
import { getOptimizedImageUrl, getOptimizedImageSrcSet, hasAvifImage } from "@/lib/optimized-image";

function staticImageLoader({ src, width }: ImageLoaderProps) {
  return getOptimizedImageUrl(src, width) ?? src;
}

/** Use pre-sized CDN files for synced images; retain Next optimization for new uploads. */
export default function SiteImage(props: ImageProps) {
  const hasStaticAsset = typeof props.src === "string" && Boolean(getOptimizedImageUrl(props.src));
  const image = <NextImage {...props} loader={props.loader ?? (hasStaticAsset ? staticImageLoader : undefined)} />;
  if (!hasStaticAsset || typeof props.src !== "string" || props.loader || props.unoptimized || props.preload || props.priority) return image;
  const maxWidth = Number(props.quality ?? 75) >= 90 ? 1920 : 960;
  const sizes = props.sizes ?? (!props.fill && props.width ? `${props.width}px` : "100vw");
  const responsiveSizes = (props.loading ?? "lazy") === "lazy" ? `auto, ${sizes}` : sizes;
  return <picture>
    {maxWidth <= 960 && hasAvifImage(props.src) ? <source type="image/avif" srcSet={getOptimizedImageSrcSet(props.src, "avif", maxWidth)} sizes={responsiveSizes} /> : null}
    <source type="image/webp" srcSet={getOptimizedImageSrcSet(props.src, "webp", maxWidth)} sizes={responsiveSizes} />
    {image}
  </picture>;
}
