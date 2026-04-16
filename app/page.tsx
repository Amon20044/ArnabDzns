import { BookCallSection } from "@/components/sections/book-call";
import { FAQ } from "@/components/sections/faq";
import { Hero } from "@/components/sections/hero";
import { ImpactSection } from "@/components/impact/impact-section";
import { ProcessRoadmap } from "@/components/sections/process-roadmap";
import { StructuredData } from "@/components/site/structured-data";
import { Testimonials } from "@/components/sections/testimonials";
import { Toolkit } from "@/components/sections/toolkit";
import { bookCallSection } from "@/data/book-call";
import { homeHeroSection } from "@/data/home-hero";
import { portfolioSection } from "@/data/portfolio-section";
import { processRoadmapSection } from "@/data/process-roadmap";
import { ImageMarquee } from "@/components/ui/image-marquee";
import { demoImageMarquee, demoImageMarquee2 } from "@/data/demo-image-marquee";
import { getPageMetadata } from "@/lib/seo";
import { getPageJsonLd } from "@/lib/structured-data";
import { impactSection } from "@/data/impact";

export const metadata = getPageMetadata("home");

export default function Home() {
  return (
    <div className="flex">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-12 px-6 pb-32 pt-4 md:px-10 md:pb-40">
        <StructuredData data={getPageJsonLd("home") ?? {}} />
        <div id="home" data-nav-section="home" className="scroll-target">
          <Hero content={homeHeroSection} />
        </div>

        <section className="page-reveal">
          <ImageMarquee
            rows={demoImageMarquee2}
            height="clamp(14.5rem, 26vw, 20rem)"
            rowGap=".2rem"
            itemGap="1rem"
          />
        </section>
        <div id="portfolio" data-nav-section="portfolio" className="scroll-target">
          <Hero content={portfolioSection} />
          <section className="page-reveal">
            <ImageMarquee
              rows={demoImageMarquee}
              height="clamp(8.5rem, 18vw, 13rem)"
              rowGap=".2rem"
              itemGap="1rem"
            />
          </section>
        </div>

        <div id="services" data-nav-section="services" className="scroll-target">
          <Toolkit />
        </div>

        <div id="impact" className="scroll-target">
          <ImpactSection content={impactSection} />
        </div>

        <div
          id="testimonials"
          data-nav-section="testimonials"
          className="scroll-target"
        >
          <Testimonials />
        </div>

        <ProcessRoadmap
          hero={processRoadmapSection.hero}
          items={processRoadmapSection.items}
          startFrom={processRoadmapSection.startFrom}
        />

        <div id="faq" data-nav-section="faq" className="scroll-target">
          <FAQ />
        </div>

        <BookCallSection content={bookCallSection} />
      </div>
    </div>
  );
}
