import Link from "next/link";
import { ArrowRight, PackageOpen } from "lucide-react";
import { PageShell } from "@/components/site/page-shell";

export default function ShopPage() {
  return (
    <PageShell
      eyebrow="Shop"
      title="A placeholder shop page with enough structure to feel alive while products are still being prepared."
      description="This keeps the existing CTA route valid and gives the project a stronger in-between state than a blank or missing page."
    >
      <article className="page-surface page-reveal p-8 md:p-10">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-accent/10 text-accent">
            <PackageOpen className="h-8 w-8" />
          </div>

          <div className="page-stack">
            <h2 className="text-3xl font-semibold tracking-tight text-text-primary">
              Digital products and templates can live here next.
            </h2>
            <p className="text-sm leading-7 text-text-secondary md:text-base">
              Think polished portfolio starters, launch page kits, motion-ready sections, or
              presentation assets. Until then, this route works as a clean holding space.
            </p>
            <Link href="/contact" className="link-pill-secondary">
              <span>Ask about custom work</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </article>
    </PageShell>
  );
}
