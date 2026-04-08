import type { HeroSectionConfig } from "@/types";

export const homeHeroSection = {
  badges: [
    {
      id: "customers",
      label: "200+ Satisfied Customers",
      icon: "stars",
      starCount: 5,
      tone: "#a855f7",
      iconColor: "#f5e1ff",
    },
    {
      id: "orgs",
      label: "10+ Satisfied Orgs",
      icon: "building",
      tone: "#2563eb",
      iconColor: "#dbeafe",
    },
  ],
  title: ["Your Vision", "My creativity"],
  description: "Let's turn ideas into stunning designs.",
  cta: {
    label: "Get in Touch",
    href: "/contact",
    icon: "arrow-right",
    iconVisibility: "hover",
  },
} satisfies HeroSectionConfig;
