import type { HeroSectionConfig } from "@/types";

export const homeHeroSection = {
  badges: [
    {
      id: "returning",
      label: "1000+ Returning Clients",
      showInMobile: true,
      icon: "building",
      tone: "#2563eb",
      iconColor: "#dbeafe",
    },
    {
      id: "customers",
      label: "20000+ Projects Delivered",
      showInMobile: false,
      icon: "stars",
      starCount: 5,
      tone: "#a855f7",
      iconColor: "#f5e1ff",
    },
    {
      id: "orgs",
      label: "30+ Orgs",
      showInMobile: false,
      icon: "building",
      tone: "#2563eb",
      iconColor: "#dbeafe",
    },
  ],
  title: ["Your audience judges in seconds.", " We win those seconds."],
  description:
    "Every creative decision is built for one thing, making your brand the obvious choice",
  cta: {
    label: "Get in Touch",
    href: "/contact",
    icon: "arrow-right",
    iconVisibility: "hover",
  },
  secondaryCta: {
    label: "Explore Services",
    href: "#services",
    icon: "arrow-right",
    iconVisibility: "hover",
    tone: "white",
  },
} satisfies HeroSectionConfig;
