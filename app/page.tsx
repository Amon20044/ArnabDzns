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
  return (
    <div className="flex">
      <div className="page-section-stack mx-auto flex w-full max-w-6xl flex-1 flex-col px-2 pb-32 pt-4 md:px-10 md:pb-40">
        <StructuredData data={getPageJsonLd("home") ?? {}} />
        <div id="home" data-nav-section="home" className="scroll-target">
          <HomeLandingHero content={content.homeHero} />
        </div>

        <section className="page-reveal client-marquee-shell" style={homeHeroToClientsGapStyle}>
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

        <section className="page-reveal" style={homeHeroToClientsGapStyle}>
          <ImageMarquee
            rows={content.showcaseMarquee}
            height="clamp(24.5rem, 43.94vw, 33.8rem)"
            rowGap="1rem"
            itemGap="1rem"
            fullBleed
            arrangeAsGrid
            draggable
            enableLightbox
          />
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
