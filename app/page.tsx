import type { CSSProperties } from "react";
import { BookCallSection } from "@/components/sections/book-call";
import { FAQ } from "@/components/sections/faq";
import { Hero } from "@/components/sections/hero";
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
export const revalidate = 3600;
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

        <section className="page-reveal" style={homeHeroToClientsGapStyle}>
          <ImageMarquee
            rows={content.clientsMarquee}
            type="clients"
            height="3rem"
            rowGap=".25rem"
            itemGap="3rem"
            minItemsPerRow={16}
            fullBleed
          />
        </section>

        <section className="page-reveal" style={homeHeroToClientsGapStyle}>
          <ImageMarquee
            rows={content.showcaseMarquee}
            height="clamp(14.5rem, 26vw, 20rem)"
            rowGap=".2rem"
            itemGap="1rem"
            fullBleed
          />
        </section>
        <div id="portfolio" data-nav-section="portfolio" className="scroll-target">
          <Hero content={content.portfolio} />
          <section className="page-reveal">
            <ImageMarquee
              rows={content.portfolioMarquee}
              height="clamp(8.5rem, 18vw, 13rem)"
              rowGap=".2rem"
              itemGap="1rem"
              fullBleed
            />
          </section>
        </div>
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
