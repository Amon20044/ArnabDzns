// ============================================
// SHARED TYPE DEFINITIONS
// All shared interfaces live here.
// Import from "@/types" anywhere in the project.
// ============================================

import type { LucideIcon } from "lucide-react";

// --- Navigation ---

/** Identifier for each nav icon — used to look up the Lucide component */
export type NavIconId =
  | "home"
  | "portfolio"
  | "services"
  | "shop"
  | "about"
  | "contact"
  | string; // allows extensibility without breaking the type

export interface NavItemConfig {
  /** Unique identifier — used for icon lookup and keys */
  id: NavIconId;
  /** Display label in the navbar */
  label: string;
  /** Next.js href */
  path: string;
}

export type CTAVariant = "primary" | "secondary";

export interface CTAConfig {
  label: string;
  variant: CTAVariant;
  /** Internal path — use `href` for external links */
  path?: string;
  /** External URL — opens in new tab */
  href?: string;
}

export interface NavigationConfig {
  items: NavItemConfig[];
  /** CTA buttons rendered on the right side, in order */
  ctas: CTAConfig[];
}

/** Maps icon IDs to Lucide components — lives in icon-registry.ts */
export type NavIconRegistry = Record<NavIconId, LucideIcon>;

// --- Site ---

export interface SocialLink {
  platform: string;
  url: string;
  label: string;
}

export interface SiteConfig {
  name: string;
  tagline: string;
  description: string;
  url: string;
  social: SocialLink[];
}
