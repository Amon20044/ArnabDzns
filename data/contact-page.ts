import type { HeroSectionConfig } from "@/types";

export interface ContactPageContent {
  hero: HeroSectionConfig;
  direct: {
    badgeLabel: string;
    title: string;
    desc: string;
    emailLabel: string;
  };
}

export const contactPageContent: ContactPageContent = {
  hero: {
    badges: [
      {
        id: "contact-primary",
        label: "Contact",
        icon: "mail",
        tone: "#18181b",
        textColor: "#fafafa",
        iconColor: "#fafafa",
      },
      {
        id: "contact-response",
        label: "Replies within 1 business day",
        icon: "clock",
        tone: "#059669",
        textColor: "#ecfdf5",
        iconColor: "#bbf7d0",
      },
    ],
    title: ["Tell us what you are building."],
    description:
      "Share the scope, context, and goal. If WhatsApp is faster, jump straight into chat.",
    cta: false,
  },
  direct: {
    badgeLabel: "WhatsApp direct",
    title: "Need a faster route?",
    desc: "Message us directly on WhatsApp for the fastest route. For fuller project context, use the form below.",
    emailLabel: "Email directly",
  },
};
