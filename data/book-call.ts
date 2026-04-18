import { headerConfig } from "@/data/navigation";
import { siteConfig } from "@/data/site";
import type { BookCallSectionConfig } from "@/types";

export const bookCallSection = {
  hero: {
    badges: [
      {
        id: "book-call-contact",
        label: "Contact",
        icon: "phone-call",
        tone: "#18181b",
        textColor: "#fafafa",
        iconColor: "#fafafa",
      },
    ],
    title: "Book a call",
    description: "Book a free 15-minute call to talk through goals, scope, and the best next step.",
    cta: false,
  },
  panel: {
    primaryAction: {
      id: "book-call-connect-link",
      label: "Let's Connect",
      value: siteConfig.contact.bookingDisplay,
      href: siteConfig.contact.bookingUrl,
      icon: "phone-call",
      external: true,
    },
    socialLinks: headerConfig.socials,
  },
} satisfies BookCallSectionConfig;
