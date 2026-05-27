import type { SitePagesConfig } from "@/types";

export const sitePages: SitePagesConfig = {
  home: {
    path: "/",
    seo: {
      title:
        "Arnab Designs — Best Graphic & UI/UX Designer in Bangalore & West Bengal | Arnab Shaw (arnabdzns)",
      description:
        "Arnab Shaw (arnabdzns) is a budget-friendly senior graphic, brand, and UI/UX designer based in Bengaluru with West Bengal roots. Premium brand identity, posters, esports/livestream visuals, portfolio sites, launch pages, and Next.js frontend builds. Site by Amon Sharma.",
      keywords: [
        "Arnab Designs",
        "Arnab Shaw",
        "Arnab Shaw designer",
        "arnabdzns",
        "arnab.dzns",
        "best graphic designer in Bangalore",
        "best graphic designer in West Bengal",
        "best UI UX designer in Bangalore",
        "budget friendly graphic designer",
        "user experience designer India",
        "esports graphic designer",
        "livestream graphic designer",
        "Amon Sharma web dev",
        "Amon Sharma developer",
      ],
      pageType: "WebPage",
      openGraphType: "website",
    },
    sitemap: {
      changeFrequency: "weekly",
      priority: 1,
    },
  },
  about: {
    path: "/about",
    navLabel: "About",
    seo: {
      title:
        "About Arnab Shaw — Graphic & UI/UX Designer in Bangalore (arnabdzns)",
      description:
        "Learn how Arnab Shaw (arnabdzns) approaches graphic design, brand identity, UI/UX, and esports/livestream visuals from Bengaluru. Work history with creators, founders, tournament organizers, and growing teams across India and worldwide.",
      keywords: [
        "about Arnab Shaw",
        "Arnab Shaw biography",
        "Arnab Designs about",
        "Arnab designer Bangalore",
        "graphic designer Bengaluru",
        "UI UX designer West Bengal",
        "esports designer India",
        "creative director Bengaluru",
      ],
      pageType: "AboutPage",
      openGraphType: "website",
    },
    sitemap: {
      changeFrequency: "monthly",
      priority: 0.9,
    },
  },
  contact: {
    path: "/contact",
    navLabel: "Contact",
    seo: {
      title:
        "Hire Arnab Shaw — Budget-Friendly Graphic & UI/UX Designer (Bangalore · West Bengal)",
      description:
        "Hire Arnab Shaw (arnabdzns) for brand identity, posters, social creatives, UI/UX, esports & livestream visuals, portfolio sites, and Next.js frontend builds. Reach out via the contact form, email, or WhatsApp +91 6289 135 345.",
      keywords: [
        "hire Arnab Shaw",
        "contact arnabdzns",
        "hire graphic designer Bangalore",
        "hire UI UX designer India",
        "freelance graphic designer Bangalore",
        "budget friendly designer India",
        "WhatsApp design inquiry",
        "Amon Sharma web dev contact",
      ],
      pageType: "ContactPage",
      openGraphType: "website",
    },
    sitemap: {
      changeFrequency: "monthly",
      priority: 0.85,
    },
  },
  shop: {
    path: "/shop",
    navLabel: "Shop",
    seo: {
      title:
        "Shop — Premium Graphic & Brand Templates by Arnab Designs (Coming Soon)",
      description:
        "A coming-soon storefront for premium ecommerce graphics, launch page templates, esports/livestream packs, and creator-ready digital design templates by Arnab Shaw (arnabdzns).",
      keywords: [
        "Arnab Designs shop",
        "premium graphic templates India",
        "ecommerce design templates",
        "esports livestream template pack",
        "launch page templates",
        "creator graphics pack",
        "buy graphic design templates",
      ],
      pageType: "CollectionPage",
      openGraphType: "website",
    },
    sitemap: {
      changeFrequency: "monthly",
      priority: 0.7,
    },
  },
};
