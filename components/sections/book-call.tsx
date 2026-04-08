import {
  CalendarClock,
  Mail,
  MessageCircleMore,
  PhoneCall,
} from "lucide-react";
import { socialIconRegistry } from "@/components/layout/navigation/social-icons";
import { Hero } from "@/components/sections/hero";
import { Heading, Text } from "@/components/ui/typography";
import { bookCallSection } from "@/data/book-call";
import type {
  BookCallActionIconId,
  BookCallPrimaryActionConfig,
  BookCallSectionConfig,
} from "@/types";
import { cn } from "@/lib/utils";

interface BookCallSectionProps {
  content?: BookCallSectionConfig;
  className?: string;
}

function renderActionIcon(icon: BookCallActionIconId, className: string) {
  switch (icon) {
    case "calendar":
      return <CalendarClock className={className} strokeWidth={1.9} />;
    case "mail":
      return <Mail className={className} strokeWidth={1.9} />;
    case "message":
      return <MessageCircleMore className={className} strokeWidth={1.9} />;
    case "phone-call":
    default:
      return <PhoneCall className={className} strokeWidth={1.9} />;
  }
}

function BookCallActionCard({
  action,
  socialLinks,
}: {
  action: BookCallPrimaryActionConfig;
  socialLinks: BookCallSectionConfig["panel"]["socialLinks"];
}) {
  return (
    <div className="mx-auto w-full max-w-[40rem]">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.97)_0%,rgba(255,255,255,0.88)_100%)] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.12)] ring-1 ring-black/5 transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_30px_100px_rgba(15,23,42,0.16)] sm:p-8 md:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-10 top-10 h-28 rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.12)_0%,transparent_70%)] blur-2xl"
        />

        <a
          href={action.href}
          target={action.external ? "_blank" : undefined}
          rel={action.external ? "noopener noreferrer" : undefined}
          className="group mx-auto flex size-24 items-center justify-center rounded-[1.75rem] bg-[linear-gradient(180deg,#2b2b31_0%,#141418_100%)] text-white shadow-[0_14px_34px_rgba(17,24,39,0.28)] transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_18px_42px_rgba(17,24,39,0.32)]"
          aria-label={action.label}
        >
          {renderActionIcon(
            action.icon,
            "size-10 transition-transform duration-300 ease-out group-hover:scale-105 group-hover:-rotate-6",
          )}
        </a>

        <div className="mt-6 text-center">
          <Text
            as="span"
            variant="p3"
            className="text-[0.72rem] uppercase tracking-[0.18em] text-text-secondary/80"
          >
            {action.label}
          </Text>

          <Heading variant="h3" as="h2" className="mt-3 text-balance">
            <a
              href={action.href}
              target={action.external ? "_blank" : undefined}
              rel={action.external ? "noopener noreferrer" : undefined}
              className="transition-colors duration-200 hover:text-accent"
            >
              {action.value}
            </a>
          </Heading>

          {action.description ? (
            <Text variant="p2" className="mx-auto mt-4 max-w-lg text-center">
              {action.description}
            </Text>
          ) : null}
        </div>

        {socialLinks.length ? (
          <div className="mt-8 flex items-center justify-center gap-3">
            {socialLinks.map((social) => {
              const Icon = socialIconRegistry[social.id];

              if (!Icon) {
                return null;
              }

              return (
                <a
                  key={social.id}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex size-11 items-center justify-center rounded-xl border border-border-accent/70 bg-white/88 text-text-primary shadow-[0_8px_24px_rgba(15,23,42,0.08)] transition-[transform,border-color,box-shadow,color] duration-200 ease-out hover:-translate-y-1 hover:border-accent/25 hover:text-accent hover:shadow-[0_12px_30px_rgba(168,85,247,0.14)]"
                >
                  <Icon className="size-[18px]" />
                </a>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function BookCallSection({
  content = bookCallSection,
  className,
}: BookCallSectionProps) {
  return (
    <section
      className={cn(
        "page-surface page-reveal relative overflow-hidden p-8 md:p-10 lg:p-12",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.10),transparent_46%)]"
      />

      <Hero
        content={content.hero}
        className="min-h-0 py-4 sm:py-8"
        childrenClassName="mt-12"
      >
        <BookCallActionCard
          action={content.panel.primaryAction}
          socialLinks={content.panel.socialLinks}
        />
      </Hero>
    </section>
  );
}
