import { Hero } from "@/components/sections/hero";
import type { HeroCTAConfig, HeroSectionConfig } from "@/types";

interface PageShellProps {
  eyebrow?: string;
  title?: string | string[];
  description?: string;
  children: React.ReactNode;
  cta?: HeroCTAConfig | false;
  hero?: HeroSectionConfig;
}

export function PageShell({
  eyebrow,
  title,
  description,
  children,
  cta,
  hero,
}: PageShellProps) {
  const heroContent: HeroSectionConfig = hero ?? {
    eyebrow,
    title: title ?? "",
    description,
    cta,
  };

  return (
    <div className="flex flex-1">
      <main className="page-section-stack mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 pb-32 pt-16 md:px-10 md:pb-40 md:pt-24">
        <section className="page-section-frame page-surface page-reveal relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.18),transparent_42%)]" />

          <Hero content={heroContent} className="min-h-0 py-2 sm:py-4" />
        </section>

        {children}
      </main>
    </div>
  );
}
