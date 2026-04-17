"use client";

import {
  Mail,
  MessageCircleMore,
} from "lucide-react";
import { InquiryForm } from "@/components/forms/inquiry-form";
import { Hero } from "@/components/sections/hero";
import { StatusBadge } from "@/components/ui/status-badge";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Heading, Text } from "@/components/ui/typography";
import { siteConfig } from "@/data/site";
import type { HeroSectionConfig } from "@/types";

const heroContent: HeroSectionConfig = {
  badges: [
    {
      id: "contact-primary",
      label: "Contact",
      icon: "none",
      tone: "#18181b",
      textColor: "#fafafa",
      iconColor: "#fafafa",
    },
    {
      id: "contact-response",
      label: "Replies within 1 business day",
      icon: "indicator",
      tone: "#059669",
      indicatorColor: "#34d399",
      pulse: true,
    },
  ],
  title: ["Tell me what you are building."],
  description:
    "Share the scope, context, and goal. If WhatsApp is faster, jump straight into chat.",
  cta: false,
};


export function ContactPageExperience() {
  return (
    <div className="flex flex-1">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 pb-32 pt-16 md:px-10 md:pb-40 md:pt-24">
        <section className="page-surface page-reveal relative overflow-hidden p-8 md:p-10 lg:p-12">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.18),transparent_42%),radial-gradient(circle_at_left_center,rgba(255,255,255,0.42),transparent_30%)]" />

          <Hero
            content={heroContent}
            className="min-h-0 py-2 sm:py-4"
            childrenClassName="mt-12"
          >
            <div className="mx-auto max-w-4xl">
              <div className="liquid-glass-shell relative overflow-hidden rounded-[2rem] border border-white/70 p-6 text-left shadow-[0_22px_58px_rgba(88,28,135,0.12)] sm:p-7">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"
                />
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <StatusBadge tone="#a855f7" iconColor="#f5e1ff">
                      WhatsApp direct
                    </StatusBadge>
                    <Heading variant="h5" as="h2" className="mt-4">
                      Need a faster route?
                    </Heading>
                    <Text variant="p2" className="mt-2 max-w-xl">
                      Message me directly on WhatsApp for the fastest route. For fuller project
                      context, use the form below.
                    </Text>
                  </div>

                  <div className="flex flex-col items-start gap-3 md:items-end [&>*]:w-full [&>*]:min-w-[14.5rem]">
                    <PrimaryButton
                      label={siteConfig.contact.callLabel}
                      href={siteConfig.contact.callUrl}
                      external
                      Icon={MessageCircleMore}
                      fullWidth
                    />
                    <PrimaryButton
                      label="Email directly"
                      href={`mailto:${siteConfig.contact.emailAddress}`}
                      Icon={Mail}
                      tone="white"
                      fullWidth
                    />
                    <PrimaryButton
                      label={siteConfig.contact.whatsappLabel}
                      href={siteConfig.contact.whatsappUrl}
                      external
                      Icon={MessageCircleMore}
                      tone="whatsapp"
                      fullWidth
                    />
                  </div>
                </div>
              </div>
            </div>
          </Hero>
        </section>

        <section>
          <InquiryForm
            source="contact-page"
            defaultInquiryType="Portfolio website"
            submitLabel="Send message"
          />
        </section>
      </main>
    </div>
  );
}
