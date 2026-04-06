import { PageShell } from "@/components/site/page-shell";

const principles = [
  "Keep interfaces light enough to feel fast and rich enough to feel intentional.",
  "Use motion to guide attention, not to decorate without purpose.",
  "Design and frontend should support the same story instead of pulling in different directions.",
];

export default function AboutPage() {
  return (
    <PageShell
      eyebrow="About"
      title="Designer, developer, and detail collector with a soft spot for polished interactions."
      description="This route adds a more personal layer to the project and gives the navigation a real destination instead of a dead end."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.95fr)]">
        <article className="page-surface page-reveal p-7 md:p-8">
          <div className="page-stack">
            <span className="eyebrow-chip">Approach</span>
            <h2 className="text-2xl font-semibold tracking-tight text-text-primary">
              The aim is to make websites feel composed, human, and expensive without overdesigning
              them.
            </h2>
            <p className="text-sm leading-7 text-text-secondary md:text-base">
              Good personal sites usually do three things well: they make a clear impression fast,
              they stay easy to navigate, and they leave enough personality in the details that the
              experience feels memorable. That balance is the goal across this project.
            </p>
          </div>
        </article>

        <article className="page-surface page-reveal p-7 md:p-8">
          <div className="page-stack">
            <span className="eyebrow-chip">Principles</span>
            {principles.map((principle, index) => (
              <div
                key={principle}
                className="rounded-[1.5rem] border border-border-accent bg-white/70 p-5"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-dark">
                  0{index + 1}
                </p>
                <p className="mt-2 text-sm leading-6 text-text-primary md:text-base">
                  {principle}
                </p>
              </div>
            ))}
          </div>
        </article>
      </div>
    </PageShell>
  );
}
