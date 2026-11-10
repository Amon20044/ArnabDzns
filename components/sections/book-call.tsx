import {
  ArrowUpRight,
  CalendarClock,
  Mail,
  MessageCircleMore,
  PhoneCall,
} from "lucide-react";
import { Fragment } from "react";
import { ArnabCharacter } from "@/components/illustrations/arnab-character";
import { Burst, ShapeGlyph, Sparkle } from "@/components/illustrations/stickers";
import { socialIconRegistry } from "@/components/layout/navigation/social-icons";
import { bookCallSection } from "@/data/book-call";
import type { BookCallActionIconId, BookCallSectionConfig } from "@/types";
import { cn } from "@/lib/utils";

interface BookCallSectionProps {
  content?: BookCallSectionConfig;
  className?: string;
}

function renderActionIcon(icon: BookCallActionIconId, className: string) {
  switch (icon) {
    case "calendar":
      return <CalendarClock className={className} strokeWidth={2.1} />;
    case "mail":
      return <Mail className={className} strokeWidth={2.1} />;
    case "message":
      return <MessageCircleMore className={className} strokeWidth={2.1} />;
    case "phone-call":
    default:
      return <PhoneCall className={className} strokeWidth={2.1} />;
  }
}

function renderActionValue(value: string) {
  const breakableTokens = new Set([".", "/", "@", "-", "_"]);

  return value.split(/([./@_-])/).map((token, index) => (
    <Fragment key={`${token}-${index}`}>
      {token}
      {breakableTokens.has(token) ? <wbr /> : null}
    </Fragment>
  ));
}

/**
 * Closing panel. It is the page's second block of saturated purple, so the
 * hero arch and this card bookend everything in between.
 */
export function BookCallSection({ content = bookCallSection, className }: BookCallSectionProps) {
  const { hero, panel } = content;
  const action = panel.primaryAction;
  const titleLines = Array.isArray(hero.title) ? hero.title : hero.title.split("\n");
  const tag = hero.badges?.[0]?.label ?? hero.eyebrow;

  return (
    <section className={cn("page-reveal relative", className)}>
      <div className="tray">
        <div className="tray-card relative isolate overflow-hidden bg-[radial-gradient(120%_120%_at_18%_0%,#b56bff_0%,#9333ea_38%,#6b21a8_78%,#581c87_100%)] text-white">
          <Burst
            className="pointer-events-none absolute -right-[12%] -top-[38%] -z-10 w-[62%] text-white/[0.09]"
            style={{ animation: "slow-spin 80s linear infinite" }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-[url('/textures/grain.png')] opacity-50 mix-blend-soft-light max-md:hidden"
          />
          <ShapeGlyph shape="triangle" className="pointer-events-none absolute left-[46%] top-8 size-6 rotate-12 text-white/30 max-lg:hidden" />
          <ShapeGlyph shape="cross" className="pointer-events-none absolute bottom-10 left-[52%] size-6 text-white/30 max-lg:hidden" />
          <Sparkle className="pointer-events-none absolute left-[44%] top-[62%] w-6 text-white/70 max-lg:hidden" />

          <div className="grid items-end gap-x-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <div className="flex flex-col items-center px-6 pb-10 pt-10 text-center sm:px-10 sm:pt-14 lg:items-start lg:pb-14 lg:text-left">
              {tag ? (
                <span className="inline-flex items-center gap-2 rounded-[0.5rem] bg-white/15 px-2.5 py-1.5 text-[0.6875rem] font-semibold uppercase leading-none tracking-[0.14em] text-white">
                  <span className="relative flex size-2">
                    <span className="absolute inset-0 animate-ping rounded-full bg-[#4ade80]/70" />
                    <span className="relative size-2 rounded-full bg-[#4ade80]" />
                  </span>
                  {tag}
                </span>
              ) : null}

              <h2 className="mt-5 text-balance text-[clamp(2.4rem,1.4rem+4.2vw,4.6rem)] font-medium leading-[0.98] tracking-[-0.045em]">
                {titleLines.map((line, index) => (
                  <span key={`${line}-${index}`} className="block">
                    {line}
                  </span>
                ))}
              </h2>

              {hero.description ? (
                <p className="mt-5 max-w-[30rem] text-pretty text-[1.05rem] leading-[1.6] text-white/80">
                  {hero.description}
                </p>
              ) : null}

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                <a
                  href={action.href}
                  target={action.external ? "_blank" : undefined}
                  rel={action.external ? "noopener noreferrer" : undefined}
                  className="press press--white group !px-5"
                >
                  {renderActionIcon(action.icon, "size-[18px] text-purple-700")}
                  {action.label}
                  <ArrowUpRight
                    aria-hidden
                    className="size-[17px] transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    strokeWidth={2.4}
                  />
                </a>

                {panel.socialLinks.map((social) => {
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
                      className="flex size-[3.1rem] items-center justify-center rounded-[0.95rem] bg-white/12 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.22)] transition-[transform,background-color] duration-150 ease-out hover:-translate-y-1 hover:bg-white/22 active:translate-y-0"
                    >
                      <Icon className="size-[18px]" />
                    </a>
                  );
                })}
              </div>

              <a
                href={action.href}
                target={action.external ? "_blank" : undefined}
                rel={action.external ? "noopener noreferrer" : undefined}
                className="mt-6 text-[0.95rem] font-medium text-white/75 underline decoration-white/35 underline-offset-4 transition-colors [overflow-wrap:anywhere] hover:text-white"
              >
                {renderActionValue(action.value)}
              </a>

              {action.description ? (
                <p className="mt-2 max-w-md text-sm text-white/65">{action.description}</p>
              ) : null}
            </div>

            <div className="relative mx-auto w-full max-w-[19rem] self-end px-6 lg:max-w-[23rem] lg:px-0 lg:pr-10">
              <p className="font-hand absolute -left-2 top-[6%] z-10 -rotate-6 text-[1.6rem] leading-none text-white lg:-left-10">
                your move!
              </p>
              <div className="-mb-[2%]">
                <ArnabCharacter title="" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
