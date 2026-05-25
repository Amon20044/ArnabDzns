import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  Download,
  Layers3,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { StructuredData } from "@/components/site/structured-data";
import { getPageMetadata } from "@/lib/seo";
import { getPageJsonLd } from "@/lib/structured-data";

export const metadata = getPageMetadata("shop");
export const revalidate = 300;
export const runtime = "nodejs";

const templatePreviews = [
  {
    title: "Launch Kit",
    category: "Product drops",
    image: "/demo/marquee-01.jpg",
  },
  {
    title: "Storefront Pack",
    category: "Ecommerce graphics",
    image: "/demo/marquee-04.jpg",
  },
  {
    title: "Creator Bundle",
    category: "Social templates",
    image: "/demo/marquee-08.jpg",
  },
];

export default function ShopPage() {
  return (
    <>
      <StructuredData data={getPageJsonLd("shop")} />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-3 pb-32 pt-6 md:px-10 md:pb-40 md:pt-10">
        <section className="page-section-frame page-surface page-reveal relative overflow-hidden px-4 py-7 sm:px-8 sm:py-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(20rem,0.72fr)] lg:items-center">
            <div className="max-w-2xl">
              <span className="eyebrow-chip">
                <ShoppingBag className="size-3.5" />
                Digital shop
              </span>

              <h1 className="mt-5 text-[clamp(2.4rem,8vw,5.8rem)] font-semibold leading-[0.9] tracking-normal text-text-primary">
                Graphic templates are coming soon.
              </h1>

              <p className="mt-5 max-w-xl text-base leading-7 text-text-secondary sm:text-lg">
                Premium ecommerce graphics, editable launch kits, and creator-ready
                template packs are being prepared for the shop.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link href="/contact" className="link-pill">
                  <Bell className="size-4" />
                  Notify me
                </Link>

                <Link href="/" className="link-pill-secondary">
                  <ArrowLeft className="size-4" />
                  Back home
                </Link>
              </div>
            </div>

            <div className="relative min-h-[20rem] overflow-hidden rounded-[1.5rem] border border-white/60 bg-white/70 shadow-[0_24px_70px_rgba(24,24,27,0.12)]">
              <Image
                src="/demo/marquee-04.jpg"
                alt="Preview of a premium ecommerce graphic template"
                fill
                priority
                sizes="(min-width: 1024px) 34vw, 92vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(9,9,11,0.58)_100%)]" />
              <div className="absolute inset-x-4 bottom-4 flex items-center justify-between rounded-full border border-white/28 bg-white/18 px-4 py-3 text-white backdrop-blur-md">
                <span className="inline-flex items-center gap-2 text-sm font-semibold">
                  <Sparkles className="size-4" />
                  First drop
                </span>
                <span className="text-xs font-medium uppercase tracking-[0.16em]">
                  Soon
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="page-reveal mt-4 grid gap-3 sm:grid-cols-3">
          {templatePreviews.map((template) => (
            <article
              key={template.title}
              className="group overflow-hidden rounded-[1.25rem] border border-border-accent/60 bg-white/82 shadow-[0_16px_42px_rgba(24,24,27,0.06)] transition-transform duration-200 hover:-translate-y-0.5"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={template.image}
                  alt={`${template.title} template preview`}
                  fill
                  sizes="(min-width: 768px) 30vw, 92vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
              </div>

              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-semibold text-text-primary">
                    {template.title}
                  </h2>
                  <p className="mt-1 truncate text-xs text-text-secondary">
                    {template.category}
                  </p>
                </div>

                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-surface text-accent-dark">
                  <Download className="size-4" />
                </span>
              </div>
            </article>
          ))}
        </section>

        <section className="page-reveal mt-3 flex flex-wrap items-center justify-between gap-3 rounded-[1.25rem] border border-border-accent/60 bg-white/78 px-4 py-4 text-sm text-text-secondary">
          <span className="inline-flex items-center gap-2 font-medium text-text-primary">
            <Layers3 className="size-4 text-accent" />
            Editable templates for future drops
          </span>
          <span>Built for creators, products, and small brands.</span>
        </section>
      </main>
    </>
  );
}
