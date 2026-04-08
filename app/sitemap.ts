import type { MetadataRoute } from "next";
import { sitePages } from "@/data/site-pages";
import { siteConfig } from "@/data/site";

const lastModified = new Date(siteConfig.seo.updatedAt);

export default function sitemap(): MetadataRoute.Sitemap {
  return Object.values(sitePages)
    .filter((page) => !page.seo.noIndex)
    .map((page) => ({
      url: `${siteConfig.url}${page.path}`,
      lastModified,
      changeFrequency: page.sitemap.changeFrequency,
      priority: page.sitemap.priority,
    }));
}
