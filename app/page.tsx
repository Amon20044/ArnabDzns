import { BookCallSection } from "@/components/sections/book-call";
import { FAQ } from "@/components/sections/faq";
import { Hero } from "@/components/sections/hero";
import { ProcessRoadmap } from "@/components/sections/process-roadmap";
import { Testimonials } from "@/components/sections/testimonials";
import { Toolkit } from "@/components/sections/toolkit";
import { bookCallSection } from "@/data/book-call";
import { homeHeroSection } from "@/data/home-hero";
import { portfolioSection } from "@/data/portfolio-section";
import { processRoadmapSection } from "@/data/process-roadmap";
import { ImageMarquee } from "@/components/ui/image-marquee";
import { demoImageMarquee, demoImageMarquee2 } from "@/data/demo-image-marquee";

export default function Home() {
  return (
    <div className="flex">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-12 px-6 pb-32 pt-4 md:px-10 md:pb-40">
        <Hero content={homeHeroSection} />

        <section className="page-reveal">

          <ImageMarquee
            rows={demoImageMarquee2}
            height="clamp(14.5rem, 26vw, 20rem)"
            rowGap=".2rem"
            itemGap="1rem"
          />
        </section>
        <Hero content={portfolioSection} />
        <section className="page-reveal">

          <ImageMarquee
            rows={demoImageMarquee}
            height="clamp(8.5rem, 18vw, 13rem)"
            rowGap=".2rem"
            itemGap="1rem"
          />
        </section>

        <Toolkit />

        <Testimonials />

        <ProcessRoadmap
          hero={processRoadmapSection.hero}
          items={processRoadmapSection.items}
          startFrom={processRoadmapSection.startFrom}
        />

        <FAQ />

        <BookCallSection content={bookCallSection} />

      </div>
    </div>
  );
}
