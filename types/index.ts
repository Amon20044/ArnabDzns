import type { LucideIcon } from "lucide-react";

export type NavIconId =
  | "home"
  | "portfolio"
  | "services"
  | "testimonials"
  | "faq"
  | string;

export interface NavItemConfig {
  id: NavIconId;
  label: string;
  path: string;
  sectionId?: string;
  isNew?: boolean;
}

export type CTAVariant = "primary" | "secondary";

export interface CTAConfig {
  label: string;
  variant: CTAVariant;
  path?: string;
  href?: string;
  Icon?: LucideIcon;
}

export interface NavigationConfig {
  items: NavItemConfig[];
  ctas: CTAConfig[];
}

export interface BrandConfig {
  name: string;
  role: string;
  bio: string;
  path: string;
  logoSrc: string;
  logoAlt: string;
}

export interface SocialConfig {
  id: "discord" | "instagram" | "linkedin" | string;
  label: string;
  href: string;
}

export interface HeaderConfig {
  brand: BrandConfig;
  availabilityLabel: string;
  socials: SocialConfig[];
}

export type NavIconRegistry = Record<NavIconId, LucideIcon>;

export interface SocialLink {
  platform: string;
  url: string;
  label: string;
  seo?: boolean;
}

export interface SiteBrandConfig {
  role: string;
  bio: string;
  logoSrc: string;
  logoAlt: string;
}

export interface SiteContactConfig {
  inquiryPath: string;
  bookingPath: string;
  bookingUrl: string;
  bookingDisplay: string;
  primaryCtaLabel: string;
  emailAddress: string;
  callLabel: string;
  callUrl: string;
  callDisplay: string;
  whatsappLabel: string;
  whatsappUrl: string;
  whatsappDisplay: string;
}

export interface SiteAgendaConfig {
  summary: string;
  audiences: string[];
  services: string[];
  differentiators: string[];
  keywords: string[];
}

export type SitemapChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

export interface SiteSeoConfig {
  locale: string;
  language: string;
  category: string;
  defaultTitle: string;
  titleTemplate: string;
  defaultDescription: string;
  keywords: string[];
  author: string;
  updatedAt: string;
  ogImageAlt: string;
}

export interface SiteConfig {
  name: string;
  tagline: string;
  description: string;
  url: string;
  category: string;
  brand: SiteBrandConfig;
  contact: SiteContactConfig;
  agenda: SiteAgendaConfig;
  seo: SiteSeoConfig;
  social: SocialLink[];
}

export type SitePageKey =
  | "home"
  | "about"
  | "services"
  | "portfolio"
  | "projects"
  | "contact"
  | "book"
  | "shop";

export interface PageSeoConfig {
  title: string;
  description: string;
  keywords: string[];
  pageType?:
    | "WebPage"
    | "AboutPage"
    | "CollectionPage"
    | "ContactPage";
  openGraphType?: "website" | "article";
  noIndex?: boolean;
}

export interface SitePageConfig {
  path: string;
  navLabel?: string;
  seo: PageSeoConfig;
  sitemap: {
    changeFrequency: SitemapChangeFrequency;
    priority: number;
  };
}

export type SitePagesConfig = Record<"home" | "contact", SitePageConfig> &
  Partial<Record<Exclude<SitePageKey, "home" | "contact">, SitePageConfig>>;

export type ToolkitIconId =
  | "figma"
  | "framer"
  | "nextjs"
  | "react"
  | "tailwindcss"
  | "gsap"
  | "typescript"
  | "nodejs"
  | "vercel"
  | "photoshop"
  | "illustrator"
  | "obsstudio"
  | "youtube"
  | "discord";

export type ToolkitCategoryId =
  | "graphic-design"
  | "tournament-organising"
  | "software-design-development"
  | string;

export type ToolkitCategoryIconId =
  | "code"
  | "layout"
  | "sparkles"
  | "palette"
  | "broadcast"
  | "none"
  | string;

export interface ToolkitItem {
  id: string;
  icon: ToolkitIconId;
  title: string;
  description: string;
  percentage: number;
}

export interface ToolkitCategory {
  id: ToolkitCategoryId;
  label: string;
  shortLabel?: string;
  icon?: ToolkitCategoryIconId;
  description?: string;
  items: ToolkitItem[];
}

export interface ToolkitSectionConfig {
  hero: HeroSectionConfig;
  defaultCategoryId?: ToolkitCategoryId;
  categories: ToolkitCategory[];
}

export type HeroBadgeIconId =
  | "stars"
  | "building"
  | "indicator"
  | "quote"
  | "none";

export interface HeroBadgeConfig {
  id?: string;
  label: string;
  icon?: HeroBadgeIconId;
  tone?: string;
  textColor?: string;
  iconColor?: string;
  indicatorColor?: string;
  pulse?: boolean;
  starCount?: number;
}

export type HeroCTAIconId = "arrow-right" | "none";
export type HeroCTAIconVisibility = "always" | "hover";

export interface HeroCTAConfig {
  label: string;
  href: string;
  external?: boolean;
  icon?: HeroCTAIconId;
  iconVisibility?: HeroCTAIconVisibility;
}

export interface HeroSectionConfig {
  eyebrow?: string;
  badges?: HeroBadgeConfig[];
  title: string | string[];
  description?: string;
  cta?: HeroCTAConfig | false;
}

/* --------------------------------------------------------------------------
   Testimonials
   --------------------------------------------------------------------------
   Modeled to be backend-friendly: a section contains many "categories"
   (Clients, Tournament Orgs, Creators, …) and each category bundles a
   trusted-by avatar group plus its own testimonial list. Category ids are
   intentionally widened with `string` so new groups can be added without
   touching the type itself.
   -------------------------------------------------------------------------- */

export type TestimonialCategoryId =
  | "clients"
  | "tournament-orgs"
  | "creators"
  | "organizations"
  | string;

export interface TestimonialAvatar {
  src: string;
  alt: string;
  /** Fallback initials shown if the image fails to load. */
  fallback?: string;
}

export interface TestimonialTrustedBy {
  /** Small avatar stack rendered above the carousel. */
  avatars: TestimonialAvatar[];
  /** Caption underneath the stack, e.g. "Trusted by Visionaries". */
  label: string;
}

export interface TestimonialSourceLink {
  href: string;
  external?: boolean;
}

export interface TestimonialItem {
  id: string;
  /** Display name of the testimonial author or org. */
  name: string;
  /**
   * Secondary line under the name. Free-form so categories can use whatever
   * makes sense — "6.58 lakh subscribers", "Founder, Acme", "12k followers".
   */
  metaLabel: string;
  /** Body of the testimonial. */
  message: string;
  /** 0..5 stars. Fractional values are rounded for display. */
  rating: number;
  avatar: TestimonialAvatar;
  /** Optional link out to the original source (YouTube channel, X post, …). */
  source?: TestimonialSourceLink;
  /** ISO date — useful for sorting once this is wired to a backend. */
  publishedAt?: string;
}

/**
 * Identifier for the icon shown next to a testimonial category in the
 * switcher. Kept as a string union (with `string` widening) so the data
 * layer never imports lucide directly — the section component owns the
 * id → component mapping.
 */
export type TestimonialCategoryIconId =
  | "users"
  | "trophy"
  | "building"
  | "sparkles"
  | "crown"
  | "none"
  | string;

export interface TestimonialCategory {
  id: TestimonialCategoryId;
  /** Long label used in the segmented switcher. */
  label: string;
  /** Optional shorter label for narrow viewports. */
  shortLabel?: string;
  /** Optional icon rendered alongside the label in the switcher. */
  icon?: TestimonialCategoryIconId;
  /** Optional helper copy shown when this category is active. */
  description?: string;
  trustedBy: TestimonialTrustedBy;
  testimonials: TestimonialItem[];
}

export interface TestimonialsSectionConfig {
  eyebrow: string;
  title: string;
  description?: string;
  /** Which category should be active on first render. */
  defaultCategoryId?: TestimonialCategoryId;
  categories: TestimonialCategory[];
}

/* --------------------------------------------------------------------------
   FAQ
   --------------------------------------------------------------------------
   Same shape philosophy as Testimonials: every entity is `id`-keyed, the
   section header reuses Hero's title/description model, and the CTA reuses
   `HeroCTAConfig` so the existing PrimaryButton can render it unchanged.
   -------------------------------------------------------------------------- */

export interface FAQItem {
  id: string;
  question: string;
  /**
   * Single-string answer. Newlines are preserved when rendered, so authors
   * can break long answers into paragraphs without escaping markup.
   */
  answer: string;
}

export interface FAQSectionConfig {
  /** Eyebrow label rendered as a metallic badge ("FAQ"). */
  eyebrow: string;
  title: string | string[];
  description?: string;
  items: FAQItem[];
  /** Which item id should be expanded on first render. Pass `null` for none. */
  defaultOpenId?: string | null;
  /** Small helper line above the CTA — e.g. "Can't find your answer?". */
  helperText?: string;
  /** Reuses the same CTA shape as Hero so PrimaryButton renders it directly. */
  cta?: HeroCTAConfig;
}

/* --------------------------------------------------------------------------
   Roadmap / Process Timeline
   --------------------------------------------------------------------------
   A simple serializable shape for an alternating timeline. The component owns
   the animations and layout rules; data just describes the hero copy, the
   starting side, and the list of steps so this can come from a CMS later.
   -------------------------------------------------------------------------- */

export type RoadmapStartSide = "left" | "right";

export interface RoadmapStepConfig {
  id: string;
  label?: string;
  title: string;
  description: string;
}

export interface RoadmapSectionConfig {
  hero: HeroSectionConfig;
  startFrom?: RoadmapStartSide;
  items: RoadmapStepConfig[];
}

/* --------------------------------------------------------------------------
   Book Call
   --------------------------------------------------------------------------
   Structured so the UI can stay component-driven while the content stays
   serializable. That keeps it straightforward to source from a CMS, admin
   panel, or database later without changing the section component itself.
   -------------------------------------------------------------------------- */

export type BookCallActionIconId =
  | "phone-call"
  | "calendar"
  | "mail"
  | "message"
  | string;

export interface BookCallPrimaryActionConfig {
  id: string;
  label: string;
  value: string;
  href: string;
  icon: BookCallActionIconId;
  external?: boolean;
  description?: string;
}

export interface BookCallPanelConfig {
  primaryAction: BookCallPrimaryActionConfig;
  socialLinks: SocialConfig[];
}

export interface BookCallSectionConfig {
  hero: HeroSectionConfig;
  panel: BookCallPanelConfig;
}
