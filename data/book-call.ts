import { headerConfig } from "@/data/navigation";
import type { BookCallSectionConfig } from "@/types";

export const bookCallSection = {
  hero: {
    badges: [
      {
        id: "book-call-contact",
        label: "Contact",
        icon: "none",
        tone: "#18181b",
        textColor: "#fafafa",
        iconColor: "#fafafa",
      },
    ],
    title: "Book a call",
    description: "Book a free 15-minute call with me",
    cta: false,
  },
  panel: {
    primaryAction: {
      id: "book-call-connect-link",
      label: "Let's Connect",
      value: "connect.arnabdzns.com",
      href: "https://connect.arnabdzns.com",
      icon: "phone-call",
      external: true,
    },
    socialLinks: headerConfig.socials,
  },
} satisfies BookCallSectionConfig;
