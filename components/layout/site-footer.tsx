import Link from "next/link";
import { ArnabCharacter } from "@/components/illustrations/arnab-character";
import { ShapeGlyph } from "@/components/illustrations/stickers";
import { siteConfig, storeUrl } from "@/data/site";
import type { SiteConfig } from "@/types";

const currentYear = new Date().getFullYear();

interface SiteFooterProps {
  site?: SiteConfig;
}

const footerLinks = [
  { label: "Work", href: "/#portfolio" },
  { label: "Services", href: "/#services" },
  { label: "FAQ", href: "/#faq" },
  { label: "Shop", href: storeUrl },
  { label: "Contact", href: "/contact" },
];

export function SiteFooter({ site = siteConfig }: SiteFooterProps) {
  return (
    <footer className="mt-auto px-3 pb-28 pt-10 md:px-10 md:pb-28 md:pt-16">
      <div className="tray mx-auto w-full max-w-6xl">
        <div className="tray-card relative overflow-hidden px-6 py-8 sm:px-10 sm:py-10">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="flex items-center gap-4">
              <span
                aria-hidden
                className="relative block size-16 shrink-0 -rotate-6 overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_50%_30%,#c084fc,#7e22ce)] shadow-[0_4px_0_var(--color-purple-900)]"
              >
                <span className="absolute left-1/2 top-[6%] block w-[185%] -translate-x-1/2">
                  <ArnabCharacter title="" />
                </span>
              </span>
              <div>
                <p className="text-[clamp(1.5rem,1.2rem+1.2vw,2.1rem)] font-medium leading-none tracking-[-0.04em] text-text-primary">
                  {site.name}
                </p>
                <p className="mt-2 max-w-[34ch] text-sm leading-snug text-text-secondary">
                  {site.tagline}
                </p>
              </div>
            </div>

            <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="text-[0.95rem] font-medium text-text-primary underline-offset-4 transition-colors hover:text-accent-dark hover:underline"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-dashed border-[rgba(var(--shade-rgb),0.18)] pt-5 text-sm text-text-secondary sm:flex-row sm:items-center sm:justify-between">
            <p>
              &copy; {currentYear} {site.name}. All rights reserved.
            </p>
            <div aria-hidden className="flex items-center gap-2.5">
              <ShapeGlyph shape="triangle" className="size-3.5 text-[var(--sticker-mint)]" />
              <ShapeGlyph shape="circle" className="size-3.5 text-[var(--sticker-red)]" />
              <ShapeGlyph shape="cross" className="size-3.5 text-[var(--sticker-cobalt)]" />
              <ShapeGlyph shape="square" className="size-3.5 text-[var(--sticker-pink)]" />
            </div>
            <p className="flex flex-wrap items-center gap-x-1.5">
              <span>Site by</span>
              <a
                href="https://amonsharma.com"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-text-primary underline-offset-4 transition-colors hover:text-accent-dark hover:underline"
              >
                Amon Sharma
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
