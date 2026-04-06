import { PageShell } from "@/components/site/page-shell";

const featuredProjects = [
  {
    title: "Studio launch site",
    summary:
      "A high-contrast portfolio system for a design studio that needed clearer case studies and stronger conversion.",
    tags: ["Strategy", "UI", "Motion"],
  },
  {
    title: "Creative product landing page",
    summary:
      "Narrative-led product storytelling with polished transitions, compact copy, and a stronger product reveal.",
    tags: ["Brand", "Web", "Launch"],
  },
  {
    title: "Personal identity refresh",
    summary:
      "A calm, premium site direction designed to make a solo creator feel more established without feeling corporate.",
    tags: ["Portfolio", "Positioning", "Frontend"],
  },
];

export default function PortfolioPage() {
  return (
    <PageShell
      eyebrow="Portfolio"
      title="A small set of polished outcomes, shaped around clarity, motion, and taste."
      description="This page can grow into full case studies later. For now it gives the site a strong route, richer transitions, and a place to hold featured work."
      cta={{
        href: "/contact",
        label: "Build something similar",
      }}
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {featuredProjects.map((project) => (
          <article key={project.title} className="page-surface page-reveal p-6">
            <div className="page-stack h-full">
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent-dark"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-text-primary">
                  {project.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-text-secondary md:text-base">
                  {project.summary}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
