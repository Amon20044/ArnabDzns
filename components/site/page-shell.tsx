import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface PageShellProps {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  cta?: {
    href: string;
    label: string;
  };
}

export function PageShell({
  eyebrow,
  title,
  description,
  children,
  cta,
}: PageShellProps) {
  return (
    <div className="flex flex-1">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 pb-32 pt-16 md:px-10 md:pb-40 md:pt-24">
        <section className="page-surface page-reveal overflow-hidden p-8 md:p-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.18),transparent_42%)]" />

          <div className="page-stack relative z-10 max-w-3xl">
            <span className="eyebrow-chip">{eyebrow}</span>
            <h1 className="text-4xl font-semibold tracking-tight text-text-primary md:text-6xl">
              {title}
            </h1>
            <p className="max-w-2xl text-base leading-7 text-text-secondary md:text-lg">
              {description}
            </p>

            {cta ? (
              <Link href={cta.href} className="link-pill">
                <span>{cta.label}</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            ) : null}
          </div>
        </section>

        {children}
      </main>
    </div>
  );
}
