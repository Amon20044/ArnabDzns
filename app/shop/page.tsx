import Image from "next/image";
import { Download, Layers3, Sparkles } from "lucide-react";
import { ShopHero } from "@/components/shop/shop-hero";
import { StructuredData } from "@/components/site/structured-data";
import { StatusBadge } from "@/components/ui/status-badge";
import { getPageMetadata } from "@/lib/seo";
import { getPageJsonLd } from "@/lib/structured-data";

export const metadata = getPageMetadata("shop");
export const revalidate = 300;
export const runtime = "nodejs";

const shopItems = [
  {
    title: "Festival Carousel System",
    category: "Social campaign pack",
    image: "/shop/image.png",
    width: 2048,
    height: 1536,
    badge: "Editorial",
    description: "A full carousel layout system for event programs, poster drops, and launch announcements.",
  },
  {
    title: "Glitch Action Kit",
    category: "Creative template pack",
    image: "/shop/image2.png",
    width: 1200,
    height: 800,
    badge: "Actions",
    description: "Bold editable visuals for quick creator promos, pack reveals, and high-contrast thumbnails.",
  },
];

export default function ShopPage() {
  return (
    <>
      <StructuredData data={getPageJsonLd("shop")} />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-3 pb-32 pt-6 md:px-10 md:pb-40 md:pt-10">
        <section className="page-reveal grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] lg:items-end">
          <ShopHero />

          <div className="grid gap-3 sm:grid-cols-2 lg:gap-4">
            {shopItems.map((item, index) => (
              <article
                key={item.title}
                className="group relative overflow-hidden rounded-[1.5rem] border border-border-accent/60 bg-white/84 shadow-[0_18px_52px_rgba(24,24,27,0.08)] max-md:!shadow-none"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-surface">
                  <Image
                    src={item.image}
                    alt={`${item.title} preview`}
                    fill
                    priority={index === 0}
                    sizes="(min-width: 1024px) 28vw, (min-width: 640px) 45vw, 94vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.035]"
                  />
                </div>

                <div className="grid gap-4 px-4 py-4 sm:px-5 sm:py-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                        {item.category}
                      </p>
                      <h2 className="mt-1 text-lg font-semibold leading-tight tracking-normal text-text-primary">
                        {item.title}
                      </h2>
                    </div>

                    <StatusBadge compact tone={index === 0 ? "#a855f7" : "#09090b"}>
                      {item.badge}
                    </StatusBadge>
                  </div>

                  <p className="text-sm leading-6 text-text-secondary">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between gap-3 border-t border-border-accent/50 pt-3">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-text-primary">
                      <Sparkles className="size-4 text-accent" />
                      Coming soon
                    </span>
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-surface text-accent-dark">
                      <Download className="size-4" />
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="page-reveal mt-4 flex flex-wrap items-center justify-between gap-3 border-y border-border-accent/60 py-4 text-sm text-text-secondary">
          <span className="inline-flex items-center gap-2 font-semibold text-text-primary">
            <Layers3 className="size-4 text-accent" />
            Built as editable template systems
          </span>
          <span>Responsive packs for creators, launches, products, and small brands.</span>
        </section>
      </main>
    </>
  );
}
