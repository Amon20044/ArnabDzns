import { ArrowUpRight, CalendarClock, Mail } from "lucide-react";
import Link from "next/link";
import { socialIconRegistry } from "@/components/layout/navigation/social-icons";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Heading, Text } from "@/components/ui/typography";
import { navigationConfig } from "@/data/navigation";
import { siteConfig } from "@/data/site";

const currentYear = new Date().getFullYear();

const footerHighlights = [
  siteConfig.tagline,
  siteConfig.category,
  `${siteConfig.agenda.audiences.length}+ audience types served`,
];

const featuredServices = siteConfig.agenda.services.slice(0, 4);

const footerLinks = navigationConfig.items.map((item) => ({
  label: item.label,
  href: item.path,
}));

const footerSocials = siteConfig.social.filter((social) =>
  ["github", "instagram", "linkedin", "discord"].includes(social.platform),
);

export function SiteFooter() {
  return (
    <footer className="mt-auto px-6 pb-28 pt-10 md:px-10 md:pb-24 md:pt-14">
      <div className="mx-auto w-full max-w-6xl">
        <section className="page-surface relative overflow-hidden px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.16),transparent_34%),radial-gradient(circle_at_85%_18%,rgba(255,255,255,0.52),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.12),transparent_32%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"
          />

          <div className="relative z-[1] grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(19rem,0.9fr)] lg:gap-10">
            <div className="max-w-2xl">
              <Text as="span" variant="p3" className="eyebrow-chip">
                Designed to feel unforgettable
              </Text>

              <Heading variant="h3" as="h2" className="mt-5 max-w-xl text-balance">
                Let&apos;s build a digital presence that feels premium before a word is read.
              </Heading>

              <Text variant="p1" className="mt-4 max-w-xl text-balance">
                {siteConfig.description}
              </Text>

              <div className="mt-6 flex flex-wrap gap-2.5">
                {footerHighlights.map((highlight) => (
                  <span
                    key={highlight}
                    className="rounded-full border border-border-accent/70 bg-white/72 px-4 py-2 text-[0.78rem] font-semibold tracking-[0.02em] text-text-primary shadow-[0_10px_28px_rgba(88,28,135,0.08)]"
                  >
                    {highlight}
                  </span>
                ))}
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <PrimaryButton
                  label="Book a Call"
                  href={siteConfig.contact.bookingUrl}
                  external
                />
                <PrimaryButton
                  label="Email Directly"
                  href={`mailto:${siteConfig.contact.emailAddress}`}
                  tone="white"
                />
              </div>
            </div>

            <div className="liquid-glass-shell relative overflow-hidden rounded-[2rem] border border-white/70 p-5 shadow-[0_22px_60px_rgba(88,28,135,0.12)] sm:p-6">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"
              />

              <div className="relative z-[1]">
                <Text as="span" variant="p3" className="text-text-secondary/75">
                  Quick connect
                </Text>

                <Heading variant="h5" as="h3" className="mt-3">
                  Start with the channel that matches your pace.
                </Heading>

                <div className="mt-5 grid gap-3">
                  <a
                    href={`mailto:${siteConfig.contact.emailAddress}`}
                    className="group rounded-[1.45rem] border border-border-accent/70 bg-white/78 p-4 shadow-[0_12px_28px_rgba(88,28,135,0.08)] transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:border-accent/30 hover:shadow-[0_18px_34px_rgba(88,28,135,0.12)]"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-[1rem] bg-accent/10 text-accent">
                        <Mail className="size-5" strokeWidth={1.9} />
                      </div>
                      <div className="min-w-0">
                        <Text as="span" variant="p3" className="block text-text-secondary/78">
                          Email
                        </Text>
                        <p className="mt-1 break-all text-[0.98rem] font-semibold tracking-tight text-text-primary">
                          {siteConfig.contact.emailAddress}
                        </p>
                      </div>
                      <ArrowUpRight className="ml-auto mt-1 size-4.5 shrink-0 text-text-secondary transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </div>
                  </a>

                  <a
                    href={siteConfig.contact.bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group rounded-[1.45rem] border border-accent/20 bg-[linear-gradient(135deg,rgba(24,24,27,0.96)_0%,rgba(88,28,135,0.92)_100%)] p-4 text-white shadow-[0_18px_38px_rgba(88,28,135,0.16)] transition-transform duration-200 hover:-translate-y-1"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-[1rem] bg-white/12 text-white">
                        <CalendarClock className="size-5" strokeWidth={1.9} />
                      </div>
                      <div className="min-w-0">
                        <Text as="span" variant="p3" className="block text-white/72">
                          Booking link
                        </Text>
                        <p className="mt-1 text-[0.98rem] font-semibold tracking-tight text-white">
                          {siteConfig.contact.bookingDisplay}
                        </p>
                      </div>
                      <ArrowUpRight className="ml-auto mt-1 size-4.5 shrink-0 text-white/76 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-[1] mt-8 h-px bg-gradient-to-r from-transparent via-border-accent/70 to-transparent lg:mt-10" />

          <div className="relative z-[1] mt-8 grid gap-8 md:grid-cols-3 lg:mt-10">
            <div>
              <Text as="span" variant="p3" className="text-text-secondary/75">
                Navigate
              </Text>
              <div className="mt-4 flex flex-col gap-3">
                {footerLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group inline-flex items-center gap-2 text-[0.98rem] font-medium text-text-primary transition-colors duration-200 hover:text-accent"
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight className="size-4 text-text-secondary transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <Text as="span" variant="p3" className="text-text-secondary/75">
                Selected services
              </Text>
              <ul className="mt-4 space-y-3">
                {featuredServices.map((service) => (
                  <li
                    key={service}
                    className="text-[0.98rem] font-medium tracking-tight text-text-primary"
                  >
                    {service}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <Text as="span" variant="p3" className="text-text-secondary/75">
                Socials
              </Text>
              <div className="mt-4 flex flex-wrap gap-3">
                {footerSocials.map((social) => {
                  const Icon = socialIconRegistry[social.platform];

                  if (!Icon) {
                    return (
                      <a
                        key={social.platform}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full border border-border-accent/70 bg-white/78 px-4 py-2 text-[0.82rem] font-semibold text-text-primary transition-[transform,border-color,color] duration-200 hover:-translate-y-0.5 hover:border-accent/30 hover:text-accent"
                      >
                        {social.label}
                      </a>
                    );
                  }

                  return (
                    <a
                      key={social.platform}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="liquid-glass flex size-11 items-center justify-center rounded-2xl text-text-primary transition-[transform,color,border-color] duration-200 hover:-translate-y-1 hover:border-accent/30 hover:text-accent"
                    >
                      <Icon className="size-[18px]" />
                    </a>
                  );
                })}
              </div>
              <Text variant="p2" className="mt-4 max-w-sm">
                {siteConfig.brand.bio}
              </Text>
            </div>
          </div>

          <div className="relative z-[1] mt-8 flex flex-col gap-3 border-t border-white/55 pt-5 text-sm text-text-secondary md:mt-10 md:flex-row md:items-center md:justify-between">
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
        </section>
      </div>
    </footer>
  );
}
