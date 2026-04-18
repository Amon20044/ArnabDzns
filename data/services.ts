import type { ServicesSectionConfig } from "@/types";

export const servicesSection: ServicesSectionConfig = {
  hero: {
    badges: [
      {
        id: "services",
        label: "What We Do",
        icon: "none",
        tone: "#a855f7",
        iconColor: "#f5e1ff",
      },
    ],
    title: "Services",
    description:
      "End-to-end creative and technical services - from brand identity to production-ready code.",
    cta: false,
  },
  services: [
    {
      id: "logo-design",
      icon: "lucide:pen-tool",
      title: "Logo Design",
      description:
        "We make logos that feel right. Not just good-looking but meaningful, memorable and built to last for your brand.",
    },
    {
      id: "brand-identity",
      icon: "lucide:shapes",
      title: "Brand Identity Development",
      description:
        "A brand is more than a logo. We help you show up the same way everywhere - online, offline and everything between.",
    },
    {
      id: "packaging-design",
      icon: "lucide:package-2",
      title: "Packaging Design",
      description:
        "Good packaging tells a story before anyone reads a word. We design packs that stand out, feel great and connect.",
    },
    {
      id: "web-design",
      icon: "lucide:monitor-smartphone",
      title: "Website Design & Development",
      description:
        "Your website should work hard and look good. We design sites that are easy to use and built to grow with you.",
    },
    {
      id: "social-media",
      icon: "lucide:camera",
      title: "Social Media Design",
      description:
        "Scroll-stopping creatives for every platform. Consistent, on-brand visuals that keep your audience engaged.",
    },
    {
      id: "motion-graphics",
      icon: "lucide:clapperboard",
      title: "Motion Graphics",
      description:
        "Bring your brand to life with animation. From logo reveals to explainer videos - motion that tells your story.",
    },
  ],
};
