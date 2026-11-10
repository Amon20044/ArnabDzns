import type { MetadataRoute } from "next";
import { sitePages } from "@/data/site-pages";
import { siteConfig } from "@/data/site";
import { getHomeContent } from "@/db/content";
import { getOptimizedImageUrl } from "@/lib/optimized-image";

const lastModified = new Date(siteConfig.seo.updatedAt);

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = await getHomeContent();
  const images = [...new Set(content.showcaseMarquee.flatMap((row) =>
    row.images.flatMap((image) => image.src
      ? [new URL(getOptimizedImageUrl(image.src) ?? image.src, siteConfig.url).href]
      : []),
  ))];
  return Object.values(sitePages)
    .filter((page) => !page.seo.noIndex)
    .map((page) => ({
      url: `${siteConfig.url}${page.path}`,
      lastModified,
      changeFrequency: page.sitemap.changeFrequency,
      priority: page.sitemap.priority,
      images: page.path === "/" ? images : undefined,
    }));
}
