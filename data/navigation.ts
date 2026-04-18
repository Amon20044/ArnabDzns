import { PhoneCall } from "lucide-react";
import type { HeaderConfig, NavigationConfig } from "@/types";
import { siteConfig } from "@/data/site";

export const headerConfig: HeaderConfig = {
  brand: {
    name: siteConfig.name,
    role: siteConfig.brand.role,
    bio: siteConfig.brand.bio,
    path: "/",
    logoSrc: siteConfig.brand.logoSrc,
    logoAlt: siteConfig.brand.logoAlt,
  },
  availabilityLabel: "Available",
  socials: siteConfig.social
    .filter((social) =>
      ["linkedin", "instagram", "discord"].includes(social.platform),
    )
    .sort(
      (left, right) =>
        ["linkedin", "instagram", "discord"].indexOf(left.platform) -
        ["linkedin", "instagram", "discord"].indexOf(right.platform),
    )
    .map((social) => ({
      id: social.platform,
      label: social.label,
      href: social.url,
    })),
};

export const navigationConfig: NavigationConfig = {
  items: [
    {
      id: "home",
      label: "Home",
      path: "/",
      sectionId: "home",
    },
    {
      id: "services",
      label: "Services",
      path: "/#services",
      sectionId: "services",
    },
    {
      id: "portfolio",
      label: "Portfolio",
      path: "/#portfolio",
      sectionId: "portfolio",
    },
    {
      id: "testimonials",
      label: "Testimonials",
      path: "/#testimonials",
      sectionId: "testimonials",
    },
    {
      id: "faq",
      label: "FAQ",
      path: "/#faq",
      sectionId: "faq",
    },
  ],
  ctas: [
    {
      label: "Book a Call",
      variant: "primary",
      path: siteConfig.contact.inquiryPath,
      Icon: PhoneCall,
    },
  ],
};
