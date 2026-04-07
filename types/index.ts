import type { LucideIcon } from "lucide-react";

export type NavIconId =
  | "home"
  | "portfolio"
  | "projects"
  | "services"
  | "shop"
  | "about"
  | "contact"
  | string;

export interface NavItemConfig {
  id: NavIconId;
  label: string;
  path: string;
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
}

export interface SiteConfig {
  name: string;
  tagline: string;
  description: string;
  url: string;
  social: SocialLink[];
}

export type ToolkitIconId =
  | "figma"
  | "framer"
  | "nextjs"
  | "react"
  | "tailwindcss"
  | "gsap";

export interface ToolkitItem {
  id: string;
  icon: ToolkitIconId;
  title: string;
  description: string;
  percentage: number;
}

export interface ToolkitSectionConfig {
  eyebrow: string;
  title: string;
  description: string;
  items: ToolkitItem[];
}
