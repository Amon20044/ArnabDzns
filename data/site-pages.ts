import type { SitePagesConfig } from "@/types";

export const sitePages: SitePagesConfig = {
  home: {
    path: "/",
    seo: {
      title: "Designer, Developer, and Creative Partner for Premium Websites",
      description:
        "Arnab designs and builds premium portfolio sites, launch pages, and polished digital experiences for creators, founders, and growing teams.",
      keywords: [
        "Arnab portfolio",
        "designer developer",
        "premium website design",
        "Next.js portfolio developer",
        "creative frontend developer",
      ],
      pageType: "WebPage",
      openGraphType: "website",
    },
    sitemap: {
      changeFrequency: "weekly",
      priority: 1,
    },
  },
  contact: {
    path: "/contact",
    navLabel: "Contact",
    seo: {
      title: "Start a Project",
      description:
        "Start a project with Arnab through the contact form or quick-connect flow for portfolio websites, launch pages, brand refreshes, and custom frontend builds.",
      keywords: [
        "contact Arnab",
        "hire web designer",
        "project inquiry",
        "portfolio website quote",
        "WhatsApp design inquiry",
        "frontend project contact",
      ],
      pageType: "ContactPage",
      openGraphType: "website",
    },
    sitemap: {
      changeFrequency: "monthly",
      priority: 0.85,
    },
  },
};
