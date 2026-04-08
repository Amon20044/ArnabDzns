import type { HeroSectionConfig } from "@/types";

export const homeHeroSection = {
  badges: [
    {
      id: "customers",
      label: "200+ Projects Delivered",
      icon: "stars",
      starCount: 5,
      tone: "#a855f7",
      iconColor: "#f5e1ff",
    },
    {
      id: "orgs",
      label: "10+ Teams and Orgs",
      icon: "building",
      tone: "#2563eb",
      iconColor: "#dbeafe",
    },
  ],
  title: ["Brand-forward websites", "built to feel premium"],
  description:
    "Design, frontend development, and launch polish for creators, founders, and teams that want a sharper digital presence.",
  cta: {
    label: "Get in Touch",
    href: "/contact",
    icon: "arrow-right",
    iconVisibility: "hover",
  },
} satisfies HeroSectionConfig;
