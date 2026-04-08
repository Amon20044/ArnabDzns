import type { SiteConfig } from "@/types";

const normalizeUrl = (value: string) => value.replace(/\/+$/, "");

const siteUrl = normalizeUrl(
  process.env.NEXT_PUBLIC_SITE_URL || "https://arnabdzns.com",
);

export const siteConfig: SiteConfig = {
  name: "Arnab",
  tagline: "Designer & Developer",
  description:
    "Brand-forward web design, frontend development, and launch support for creators, founders, and growing teams.",
  url: siteUrl,
  category: "Design & Development",
  brand: {
    role: "Designer and Developer",
    bio: "Crafting tactile digital experiences that still feel human.",
    logoSrc: "/image.png",
    logoAlt: "Arnab brand portrait",
  },
  contact: {
    inquiryPath: "/contact",
    bookingPath: "/contact",
    bookingUrl: "https://connect.arnabdzns.com",
    bookingDisplay: "connect.arnabdzns.com",
    primaryCtaLabel: "Contact",
    emailAddress: "arnabdzns@gmail.com",
    callLabel: "Book a call",
    callUrl: "https://connect.arnabdzns.com",
    callDisplay: "connect.arnabdzns.com",
    whatsappLabel: "Connect on WhatsApp",
    whatsappUrl: "https://connect.arnabdzns.com",
    whatsappDisplay: "connect.arnabdzns.com",
  },
  agenda: {
    summary:
      "Arnab helps creators, founders, and teams launch websites and digital experiences that feel premium, clear, and conversion-ready.",
    audiences: [
      "Creators and personal brands",
      "Founders launching new products",
      "Studios and agencies",
      "Growing startups and teams",
      "Tournament organizers and online communities",
    ],
    services: [
      "Portfolio website design",
      "Brand-forward landing pages",
      "Frontend development in Next.js",
      "Launch refinement and UX polish",
      "Creative direction for digital brands",
    ],
    differentiators: [
      "Strong taste in visual hierarchy and motion",
      "Design and frontend handled as one system",
      "Premium presentation without bloated complexity",
      "Clear communication from scope to launch",
    ],
    keywords: [
      "Arnab designer developer",
      "portfolio website designer",
      "Next.js frontend developer",
      "brand-forward web design",
      "creative portfolio developer",
      "freelance web designer",
      "premium landing page design",
    ],
  },
  seo: {
    locale: "en_US",
    language: "en",
    category: "Portfolio",
    defaultTitle: "Arnab",
    titleTemplate: "%s | Arnab",
    defaultDescription:
      "Explore Arnab's portfolio, services, and process for premium websites, creative direction, and polished frontend experiences.",
    keywords: [
      "Arnab",
      "designer and developer",
      "portfolio website design",
      "Next.js developer",
      "creative developer portfolio",
      "web design for creators",
      "landing page design",
      "frontend development",
    ],
    author: "Arnab",
    updatedAt: "2026-04-08T00:00:00.000Z",
    ogImageAlt: "Arnab designer and developer portfolio preview",
  },
  social: [
    {
      platform: "github",
      url: "https://github.com/Amon20044",
      label: "GitHub",
      seo: true,
    },
    {
      platform: "discord",
      url: "https://discord.com/users/your-id",
      label: "Discord",
      seo: false,
    },
    {
      platform: "instagram",
      url: "https://instagram.com/yourhandle",
      label: "Instagram",
      seo: false,
    },
    {
      platform: "linkedin",
      url: "https://linkedin.com/in/yourprofile",
      label: "LinkedIn",
      seo: false,
    },
  ],
};
