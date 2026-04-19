import type { HeroSectionConfig } from "@/types";

export const homeHeroSection = {
  badges: [
    {
      id: "returning",
      label: "200+ Returning Clients",
      showInMobile: true,
      icon: "building",
      tone: "#2563eb",
      iconColor: "#dbeafe",
    },
    {
      id: "customers",
      label: "200+ Projects Delivered",
      showInMobile: false,
      icon: "stars",
      starCount: 5,
      tone: "#a855f7",
      iconColor: "#f5e1ff",
    },
    {
      id: "orgs",
      label: "10+ Teams and Orgs",
      showInMobile: false,
      icon: "building",
      tone: "#2563eb",
      iconColor: "#dbeafe",
    },
  ],
  title: ["Good design gets noticed.", " Great design gets chosen."],
  description:
    "Creative work built for clicks, trust, and attention. We help brands and businesses connect with their audience through thoughtful, strategic design.",
  cta: {
    label: "Get in Touch",
    href: "/contact",
    icon: "arrow-right",
    iconVisibility: "hover",
  },
  secondaryCta: {
    label: "Explore Services",
    href: "#services",
    icon: "none",
    tone: "white",
  },
} satisfies HeroSectionConfig;
