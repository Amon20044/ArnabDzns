import type { Metadata } from "next";
import { sitePages } from "@/data/site-pages";
import { siteConfig } from "@/data/site";
import type { SitePageKey } from "@/types";

const placeholderPatterns = [
  "yourhandle",
  "yourprofile",
  "your-id",
  "yoursite.com",
];

export function isPlaceholderUrl(url: string) {
  return placeholderPatterns.some((pattern) => url.includes(pattern));
}

export function getSeoSocialLinks() {
  return siteConfig.social
    .filter((social) => social.seo && !isPlaceholderUrl(social.url))
    .map((social) => social.url);
}

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString();
}

function getSitePage(pageKey: SitePageKey) {
  return sitePages[pageKey] ?? sitePages.home;
}

function getRouteKeywords(pageKey: SitePageKey) {
  const page = getSitePage(pageKey);

  return Array.from(
    new Set([
      ...siteConfig.seo.keywords,
      ...siteConfig.agenda.keywords,
      ...page.seo.keywords,
    ]),
  );
}

export function getRootMetadata(): Metadata {
  return {
    metadataBase: new URL(siteConfig.url),
    applicationName: siteConfig.name,
    title: {
      default: siteConfig.seo.defaultTitle,
      template: siteConfig.seo.titleTemplate,
    },
    description: siteConfig.seo.defaultDescription,
    alternates: {
      canonical: "/",
    },
    authors: [{ name: siteConfig.seo.author, url: siteConfig.url }],
    creator: siteConfig.seo.author,
    publisher: siteConfig.seo.author,
    category: siteConfig.seo.category,
    keywords: getRouteKeywords("home"),
    referrer: "origin-when-cross-origin",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      type: "website",
      locale: siteConfig.seo.locale,
      url: "/",
      siteName: siteConfig.name,
      title: siteConfig.name,
      description: siteConfig.seo.defaultDescription,
    },
    twitter: {
      card: "summary_large_image",
      title: siteConfig.name,
      description: siteConfig.seo.defaultDescription,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export function getPageMetadata(pageKey: SitePageKey): Metadata {
  const page = getSitePage(pageKey);

  return {
    title:
      pageKey === "home"
        ? {
            absolute: page.seo.title,
          }
        : page.seo.title,
    description: page.seo.description,
    keywords: getRouteKeywords(pageKey),
    alternates: {
      canonical: page.path,
    },
    category: siteConfig.category,
    openGraph: {
      type: page.seo.openGraphType ?? "website",
      locale: siteConfig.seo.locale,
      url: page.path,
      siteName: siteConfig.name,
      title: page.seo.title,
      description: page.seo.description,
    },
    twitter: {
      card: "summary_large_image",
      title: page.seo.title,
      description: page.seo.description,
    },
    robots: page.seo.noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
        },
  };
}
