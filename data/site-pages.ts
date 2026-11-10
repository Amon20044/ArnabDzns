import type { SitePagesConfig } from "@/types";

export const sitePages: SitePagesConfig = {
  home: {
    path: "/",
    seo: {
      title:
        "Arnab Shaw | Graphic & UI/UX Designer in Bangalore",
      description:
        "Explore Arnab Shaw’s graphic design, brand identity, UI/UX, and esports portfolio. Based in Bangalore, working with creators and brands worldwide.",
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
        "About Arnab Shaw — Graphic & UI/UX Designer",
      description:
        "Meet Arnab Shaw, a Bangalore-based graphic and UI/UX designer creating brand identities, esports visuals, and digital experiences for clients worldwide.",
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
        "Hire Arnab Shaw — Graphic & UI/UX Design",
      description:
        "Have a design project? Contact Arnab Shaw for brand identity, graphic design, UI/UX, and esports visuals. Share your brief by email, WhatsApp, or the contact form.",
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
        "Design Templates — Coming Soon",
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
