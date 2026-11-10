import type { CSSProperties } from "react";
import { BookCallSection } from "@/components/sections/book-call";
import { FAQ } from "@/components/sections/faq";
import { HomeLandingHero } from "@/components/sections/home-landing-hero";
import { ImpactSection } from "@/components/impact/impact-section";
import { ProcessRoadmap } from "@/components/sections/process-roadmap";
import { StructuredData } from "@/components/site/structured-data";
import { Testimonials } from "@/components/sections/testimonials";
import { Toolkit } from "@/components/sections/toolkit";
import { ImageMarquee } from "@/components/ui/image-marquee";
import { getHomeContent } from "@/db/content";
import { getPageMetadata } from "@/lib/seo";
import { getPageJsonLd } from "@/lib/structured-data";

export const metadata = getPageMetadata("home");
export const revalidate = 300;
export const runtime = "nodejs";

const homeHeroToClientsGapStyle = {
  "--page-section-gap": "clamp(0.75rem, 2vw, 1.1rem)",
} as CSSProperties;

export default async function Home() {
  const content = await getHomeContent();
  // Two landscape pieces from the showcase ride along in the hero as loose
  // thumbnails, so real work is on screen before any scrolling.
  const heroWork = content.showcaseMarquee
    .flatMap((row) => row.images)
    .filter(
      (image) =>
        Boolean(image.src) &&
        (!image.width || !image.height || image.width / image.height > 1.3),
    )
    .slice(0, 2)
    .map((image, index) => ({
      id: image.id ?? `hero-work-${index}`,
      src: image.src as string,
      alt: image.alt || image.title || "Portfolio artwork by Arnab Shaw",
    }));

  return (
    <div className="flex">
      <div className="page-section-stack mx-auto flex w-full max-w-6xl flex-1 flex-col px-2 pb-32 pt-4 md:px-10 md:pb-40">
        <StructuredData data={getPageJsonLd("home") ?? {}} />
        <div id="home" data-nav-section="home" className="scroll-target">
          <HomeLandingHero content={content.homeHero} work={heroWork} />
        </div>

        <section className="client-marquee-shell" style={homeHeroToClientsGapStyle}>
          <div className="mb-3 flex items-center gap-4 px-2">
            <span aria-hidden className="h-px flex-1 border-t border-dashed border-[rgba(var(--shade-rgb),0.2)]" />
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-text-secondary">
              Trusted by <span className="text-text-primary">teams and brands like</span>
            </p>
            <span aria-hidden className="h-px flex-1 border-t border-dashed border-[rgba(var(--shade-rgb),0.2)]" />
          </div>
          <ImageMarquee
            rows={content.clientsMarquee}
            type="clients"
            height="var(--client-marquee-logo-height)"
            rowGap=".25rem"
            itemGap="var(--client-marquee-logo-gap)"
            minItemsPerRow={16}
            className="py-1 sm:py-2"
            rowClassName="py-1 sm:py-2"
            fullBleed
          />
        </section>

        <section id="portfolio" data-nav-section="portfolio" className="scroll-target">
          <div className="image-marquee-full-bleed desk-rule" aria-hidden />
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3 px-2 pb-6 pt-10 sm:pt-14">
            <div>
              <span className="section-tag">Selected work</span>
              <h2 className="mt-4 max-w-[18ch] text-balance text-[clamp(1.875rem,1.21rem+2.86vw,3.25rem)] font-medium leading-[1.05] tracking-[-0.038em] text-text-primary">
                Thumbnails, posters and matchday creatives.
              </h2>
            </div>
            <p className="font-hand -rotate-2 text-[1.35rem] leading-none text-text-secondary">
              drag the wall &middot; tap a piece to open it
            </p>
          </div>
          <ImageMarquee
            rows={content.showcaseMarquee}
            height="clamp(24.5rem, 43.94vw, 33.8rem)"
            rowGap="0.6rem"
            itemGap="0.6rem"
            fullBleed
            arrangeAsGrid
            draggable
            enableLightbox
          />
          <div className="image-marquee-full-bleed desk-rule mt-8" aria-hidden />
        </section>

        <div
          id="testimonials"
          data-nav-section="testimonials"
          className="scroll-target"
        >
          <Testimonials content={content.testimonials} />
        </div>
        <div id="impact" className="scroll-target">
          <ImpactSection content={content.impact} />
        </div>


        <div id="services" data-nav-section="services" className="scroll-target">
          <Toolkit content={content.services} />
        </div>



        <ProcessRoadmap
          hero={content.processRoadmap.hero}
          items={content.processRoadmap.items}
          startFrom={content.processRoadmap.startFrom}
        />

        <div id="faq" data-nav-section="faq" className="scroll-target">
          <FAQ content={content.faq} />
        </div>

        <BookCallSection content={content.bookCall} />
      </div>
    </div>
  );
}
