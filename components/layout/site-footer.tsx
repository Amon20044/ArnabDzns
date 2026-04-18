"use client";

import {
  ArrowUpRight,
  CalendarClock,
  Mail,
  MessageCircleMore,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { socialIconRegistry } from "@/components/layout/navigation/social-icons";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Heading, Text } from "@/components/ui/typography";
import { navigationConfig } from "@/data/navigation";
import { siteConfig } from "@/data/site";

const currentYear = new Date().getFullYear();

const footerHighlights = [
  "Replies within 1 business day",
  siteConfig.category,
  `${siteConfig.agenda.audiences.length}+ audience types served`,
];

const featuredServices = siteConfig.agenda.services.slice(0, 4);

const footerLinks = [
  ...navigationConfig.items.map((item) => ({
    label: item.label,
    href: item.path,
  })),
  {
    label: "Contact",
    href: siteConfig.contact.inquiryPath,
  },
];

const socialOrder = ["linkedin", "instagram", "github", "discord"];

const footerSocials = socialOrder
  .map((platform) =>
    siteConfig.social.find((social) => social.platform === platform),
  )
  .filter((social): social is NonNullable<(typeof siteConfig.social)[number]> => !!social);

const engagementCards = [
  {
    id: "whatsapp",
    label: "WhatsApp",
    value: siteConfig.contact.whatsappDisplay,
    description: "Best for fast alignment, launch urgency, and quick project context.",
    href: siteConfig.contact.whatsappUrl,
    Icon: MessageCircleMore,
    tone: "accent" as const,
  },
  {
    id: "email",
    label: "Email",
    value: siteConfig.contact.emailAddress,
    description: "Best for fuller briefs, references, and keeping decision trails clean.",
    href: `mailto:${siteConfig.contact.emailAddress}`,
    Icon: Mail,
    tone: "neutral" as const,
  },
  {
    id: "booking",
    label: "Book a call",
    value: siteConfig.contact.bookingDisplay,
    description: "Best for structured conversations when scope and timing need clarity.",
    href: siteConfig.contact.bookingUrl,
    Icon: CalendarClock,
    tone: "dark" as const,
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto px-4 pb-28 pt-12 md:px-10 md:pb-24 md:pt-16">
      <div className="mx-auto w-full max-w-6xl">
        <div className="relative z-[1] flex flex-coltext-sm text-text-secondary md:mt-10 md:flex-row md:items-center md:justify-between">
          <p>
            Arnabdzns &copy; {currentYear} All Rights Reserved
          </p>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>Made by</span>
            <a
              href="https://amonsharma.com"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-text-primary transition-colors hover:text-accent"
            >
              Amon Sharma
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
