import Link from "next/link";
import { ArrowUpRight, Layers3, MessageSquareQuote, Sparkles } from "lucide-react";
import { siteConfig } from "@/data/site";

const focusAreas = [
  {
    title: "Design systems with taste",
    description:
      "Landing pages and portfolios that feel premium, intentional, and easy to move through.",
    Icon: Sparkles,
  },
  {
    title: "Frontend that feels expensive",
    description:
      "Motion, layout rhythm, and detail work tuned to make simple interactions feel smooth.",
    Icon: Layers3,
  },
  {
    title: "A clear collaboration loop",
    description:
      "Fast feedback, concise updates, and practical delivery from concept through launch.",
    Icon: MessageSquareQuote,
  },
];

const processSteps = [
  "Clarify the outcome, audience, and constraints first.",
  "Shape a direction that feels distinct instead of generic.",
  "Polish motion and copy so the experience lands with confidence.",
];

export default function Home() {
  return (
    <div className="flex flex-1">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 pb-32 pt-16 md:px-10 md:pb-40 md:pt-24">
        <section className="page-surface page-reveal overflow-hidden p-8 md:p-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.24),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(126,34,206,0.14),transparent_34%)]" />

          <div className="page-stack relative z-10 max-w-4xl">
            <span className="eyebrow-chip">{siteConfig.tagline}</span>
            <h1 className="text-4xl font-semibold tracking-tight text-text-primary md:text-6xl">
              {siteConfig.name} builds polished digital spaces with motion that feels calm, clear,
              and premium.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-text-secondary md:text-lg">
              {siteConfig.description} The focus is clean storytelling, tactile transitions, and
              pages that make people want to keep scrolling.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/portfolio" className="link-pill">
                <span>See portfolio</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link href="/contact" className="link-pill-secondary">
                <span>Start a project</span>
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {focusAreas.map(({ title, description, Icon }) => (
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
        </section>

        <section className="page-surface page-reveal p-8 md:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="page-stack">
              <span className="eyebrow-chip">Process</span>
              <h2 className="text-3xl font-semibold tracking-tight text-text-primary md:text-4xl">
                Small details are carrying a lot of the feeling here.
              </h2>
              <p className="max-w-2xl text-sm leading-7 text-text-secondary md:text-base">
                The work is less about piling on features and more about choosing the right
                interactions, surfaces, and pacing so the whole site feels composed.
              </p>
            </div>

            <div className="page-stack">
              {processSteps.map((step, index) => (
                <div
                  key={step}
                  className="rounded-[1.5rem] border border-border-accent bg-white/75 p-5"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-dark">
                    Step {index + 1}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-text-primary md:text-base">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
