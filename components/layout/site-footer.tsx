"use client";

import { siteConfig } from "@/data/site";
import type { SiteConfig } from "@/types";

const currentYear = new Date().getFullYear();

interface SiteFooterProps {
  site?: SiteConfig;
}

export function SiteFooter({
  site = siteConfig,
}: SiteFooterProps) {
  return (
    <footer className="mt-auto px-4 pb-28 pt-12 md:px-10 md:pb-24 md:pt-16">
      <div className="mx-auto w-full max-w-6xl">
        <div className="relative z-[1] flex flex-col text-sm text-text-secondary md:mt-10 md:flex-row md:items-center md:justify-between">
          <p>
            {site.name}dzns &copy; {currentYear} All Rights Reserved
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
