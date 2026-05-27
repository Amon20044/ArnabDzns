import type { SiteConfig } from "@/types";

const normalizeUrl = (value: string) => value.replace(/\/+$/, "");
const whatsappNumber = "916289135345";
const whatsappDisplay = "+91 6289 135 345";

const siteUrl = normalizeUrl(
  process.env.NEXT_PUBLIC_SITE_URL || "https://arnabdzns.com",
);

type WhatsAppPrefillInput = {
  name?: string;
  brand?: string;
  inquiryType?: string;
  message?: string;
  source?: string;
};

function clampMessage(value: string, maxLength = 700) {
  const trimmed = value.trim();

  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength - 3).trimEnd()}...`;
}

function prettifySource(source?: string) {
  if (!source) {
    return "Website";
  }

  return source
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function buildWhatsAppMessage({
  name,
  brand,
  inquiryType,
  message,
  source,
}: WhatsAppPrefillInput = {}) {
  const safeName = name?.trim();
  const safeBrand = brand?.trim();
  const safeInquiryType = inquiryType?.trim();
  const safeMessage = clampMessage(message ?? "");
  const sourceLabel = prettifySource(source);

  return [
    "Hi Arnab,",
    "",
    safeName
      ? `We are reaching out regarding *${safeInquiryType || "a project"}*.`
      : `We want to discuss *${safeInquiryType || "a project"}* with you.`,
    safeName ? `*Contact:* ${safeName}` : "",
    safeBrand ? `*Project / Brand:* ${safeBrand}` : "",
    `*Source:* ${sourceLabel}`,
    "",
    "*Brief*",
    safeMessage || "We would like to discuss a project with you.",
    "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildWhatsAppUrl(input: WhatsAppPrefillInput = {}) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(buildWhatsAppMessage(input))}`;
}

export const siteConfig: SiteConfig = {
  name: "Arnab Designs",
  tagline: "Graphic Designer · UI/UX Designer · Creative Director",
  description:
    "Arnab Shaw (arnabdzns) is a budget-friendly, senior graphic and UI/UX designer based in Bengaluru with roots in West Bengal. Premium brand identity, esports & livestream visuals, portfolio sites, launch pages, and Next.js frontend builds for creators, founders, and growing teams.",
  url: siteUrl,
  category: "Graphic Design, UI/UX Design, Brand Identity, Web Design",
  brand: {
    role: "Graphic Designer · Brand Identity · UI/UX Designer · Livestream & Esports Visuals · Creative Director",
    bio: "Crafting tactile digital experiences that still feel human — brand-forward design with a Bangalore base and West Bengal roots.",
    logoSrc: "/image.png",
    logoAlt: "Arnab Designs — Arnab Shaw brand portrait",
  },
  contact: {
    inquiryPath: "/contact",
    bookingPath: "/contact",
    bookingUrl: "https://connect.arnabdzns.com",
    bookingDisplay: "connect.arnabdzns.com",
    primaryCtaLabel: "Contact",
    emailAddress: "arnabdzns@gmail.com",
    callLabel: `WhatsApp ${whatsappDisplay}`,
    callUrl: buildWhatsAppUrl({
      inquiryType: "project discussion",
      message:
        "We want to discuss a project with you and would love to explore the right next step.",
      source: "quick-connect",
    }),
    callDisplay: whatsappDisplay,
    whatsappLabel: whatsappDisplay,
    whatsappUrl: buildWhatsAppUrl({
      inquiryType: "project discussion",
      message:
        "We want to discuss a project with you and would love to share a quick brief.",
      source: "whatsapp-button",
    }),
    whatsappDisplay,
  },
  agenda: {
    summary:
      "Arnab Shaw (arnabdzns) helps creators, founders, and growing teams launch premium brand identities, portfolio sites, esports & livestream visuals, and conversion-ready digital experiences — from Bengaluru, with roots in West Bengal, serving clients across India and worldwide.",
    audiences: [
      "Creators, streamers, and personal brands",
      "Founders launching new products",
      "Studios and agencies",
      "Growing startups and teams",
      "Tournament organizers, esports brands, and online communities",
      "Bengaluru and West Bengal small businesses looking for budget-friendly design",
    ],
    services: [
      "Brand identity and logo design",
      "Graphic design for posters, social, and campaign creatives",
      "UI/UX design for SaaS, creators, and marketing sites",
      "Esports, tournament, and livestream graphic systems",
      "Portfolio website design",
      "Brand-forward landing pages",
      "Frontend development in Next.js",
      "Launch refinement and UX polish",
      "Creative direction for digital brands",
    ],
    differentiators: [
      "Strong taste in visual hierarchy, typography, and motion",
      "Design and frontend handled as one system",
      "Premium presentation without bloated complexity",
      "Budget-friendly delivery without compromising fidelity",
      "Bengaluru-based with deep West Bengal roots — local context, global aesthetic",
      "Clear communication from scope to launch",
    ],
    keywords: [
      "Arnab Designs",
      "Arnab Shaw",
      "Arnab Shaw designer",
      "arnab.dzns",
      "arnabdzns",
      "best graphic designer in Bangalore",
      "best graphic designer in Bengaluru",
      "best graphic designer in West Bengal",
      "best graphic designer in Kolkata",
      "best UI UX designer in Bangalore",
      "UI UX designer Bengaluru",
      "budget friendly graphic designer",
      "affordable graphic designer India",
      "freelance graphic designer Bangalore",
      "esports graphic designer India",
      "livestream graphic designer",
      "brand identity designer India",
      "Next.js frontend developer",
      "portfolio website designer",
      "Amon Sharma web dev",
      "Amon Sharma developer",
      "user experience designer India",
    ],
  },
  seo: {
    locale: "en_IN",
    language: "en",
    category: "Graphic Design & UI/UX",
    defaultTitle:
      "Arnab Designs — Best Graphic & UI/UX Designer in Bangalore & West Bengal | Arnab Shaw",
    titleTemplate: "%s | Arnab Designs (Arnab Shaw · arnabdzns)",
    defaultDescription:
      "Arnab Shaw (arnabdzns) — budget-friendly senior graphic, brand, and UI/UX designer based in Bengaluru with West Bengal roots. Premium brand identity, posters, esports & livestream visuals, portfolio sites, launch pages, and Next.js frontend builds for creators, founders, and growing teams. Site built by Amon Sharma.",
    keywords: [
      "Arnab Designs",
      "Arnab Shaw",
      "Arnab Shaw designer",
      "arnab.dzns",
      "arnabdzns",
      "best graphic designer in Bangalore",
      "best graphic designer Bengaluru",
      "best graphic designer in West Bengal",
      "best graphic designer Kolkata",
      "best UI UX designer in Bangalore",
      "UI UX designer Bengaluru",
      "user experience designer India",
      "budget friendly graphic designer",
      "affordable graphic designer India",
      "freelance graphic designer Bangalore",
      "esports graphic designer India",
      "livestream graphic designer",
      "tournament graphic designer",
      "brand identity designer India",
      "logo designer Bangalore",
      "portfolio website designer",
      "Next.js frontend developer",
      "creative director India",
      "Amon Sharma web dev",
      "Amon Sharma developer",
      "premium landing page design",
    ],
    author: "Arnab Shaw",
    updatedAt: "2026-05-27T00:00:00.000Z",
    ogImageAlt:
      "Arnab Designs — Arnab Shaw, graphic & UI/UX designer in Bangalore and West Bengal",
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
      url: "https://discord.gg/zmGFSaA2BY",
      label: "Discord",
      seo: false,
    },
    {
      platform: "instagram",
      url: "https://www.instagram.com/arnab.dzns",
      label: "Instagram",
      seo: false,
    },
    {
      platform: "linkedin",
      url: "https://www.linkedin.com/in/arnab-shaw-09448a329",
      label: "LinkedIn",
      seo: false,
    },
  ],
};
