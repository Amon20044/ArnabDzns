import { Brush, Code2, Rocket } from "lucide-react";
import { PageShell } from "@/components/site/page-shell";

const services = [
  {
    title: "Brand-forward web design",
    description:
      "Direction, layout systems, and interface polish for portfolio sites, launch pages, and personal brands.",
    Icon: Brush,
  },
  {
    title: "Frontend implementation",
    description:
      "Responsive builds in Next.js with motion, reusable components, and cleaner transitions between pages.",
    Icon: Code2,
  },
  {
    title: "Launch refinement",
    description:
      "The pass that tightens copy, spacing, hierarchy, and conversion points right before publishing.",
    Icon: Rocket,
  },
];

export default function ServicesPage() {
  return (
    <PageShell
      eyebrow="Services"
      title="Design, frontend, and launch support shaped around premium personal and product sites."
      description="These cards give the route enough structure to feel intentional now, while still leaving room for deeper packages later."
      cta={{
        href: "/contact",
        label: "Ask about your scope",
      }}
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {services.map(({ title, description, Icon }) => (
          <article key={title} className="page-surface page-reveal p-6">
            <div className="page-stack">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-text-primary">
                  {title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-text-secondary md:text-base">
                  {description}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
