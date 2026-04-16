import type { ComponentPropsWithoutRef, ReactNode } from "react";
import type { MDXComponents } from "mdx/types";
import { cn } from "@/lib/utils";

interface ImpactCalloutProps {
  title?: string;
  children: ReactNode;
}

interface ImpactStatGridProps {
  children: ReactNode;
  className?: string;
}

interface ImpactStatProps {
  label: string;
  value: string;
  note?: string;
}

function ImpactCallout({ title = "Impact note", children }: ImpactCalloutProps) {
  return (
    <div className="rounded-[1.5rem] border border-border-accent/70 bg-accent-surface/80 p-4 shadow-[0_18px_48px_rgba(88,28,135,0.10)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent-dark/78">
        {title}
      </p>
      <div className="mt-3 text-[0.98rem] leading-7 text-text-primary/86">{children}</div>
    </div>
  );
}

function ImpactStatGrid({ children, className }: ImpactStatGridProps) {
  return <div className={cn("grid gap-3 sm:grid-cols-2", className)}>{children}</div>;
}

function ImpactStat({ label, value, note }: ImpactStatProps) {
  return (
    <div className="rounded-[1.35rem] border border-border-accent/55 bg-white/76 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary/78">{label}</p>
      <p className="mt-2 text-[1.5rem] font-semibold tracking-[-0.03em] text-text-primary">{value}</p>
      {note ? <p className="mt-1 text-sm leading-6 text-text-secondary">{note}</p> : null}
    </div>
  );
}

export const impactMdxComponents: MDXComponents = {
  h2: ({ className, ...props }: ComponentPropsWithoutRef<"h2">) => (
    <h2
      className={cn(
        "mt-10 text-[1.65rem] font-semibold leading-[1.05] tracking-[-0.03em] text-text-primary first:mt-0",
        className,
      )}
      {...props}
    />
  ),
  h3: ({ className, ...props }: ComponentPropsWithoutRef<"h3">) => (
    <h3
      className={cn(
        "mt-8 text-[1.18rem] font-semibold leading-[1.2] tracking-[-0.02em] text-text-primary",
        className,
      )}
      {...props}
    />
  ),
  p: ({ className, ...props }: ComponentPropsWithoutRef<"p">) => (
    <p className={cn("mt-4 text-[1rem] leading-8 text-text-secondary", className)} {...props} />
  ),
  ul: ({ className, ...props }: ComponentPropsWithoutRef<"ul">) => (
    <ul className={cn("mt-5 space-y-2.5 pl-5 text-text-secondary", className)} {...props} />
  ),
  ol: ({ className, ...props }: ComponentPropsWithoutRef<"ol">) => (
    <ol className={cn("mt-5 space-y-2.5 pl-5 text-text-secondary", className)} {...props} />
  ),
  li: ({ className, ...props }: ComponentPropsWithoutRef<"li">) => (
    <li className={cn("pl-1 text-[0.98rem] leading-7 marker:text-accent-dark/76", className)} {...props} />
  ),
  blockquote: ({ className, ...props }: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      className={cn(
        "mt-6 rounded-[1.6rem] border border-border-accent/75 bg-[linear-gradient(135deg,rgba(243,232,255,0.94)_0%,rgba(255,255,255,0.86)_100%)] px-5 py-4 text-[1rem] leading-7 text-text-primary shadow-[0_20px_52px_rgba(76,29,149,0.10)]",
        className,
      )}
      {...props}
    />
  ),
  strong: ({ className, ...props }: ComponentPropsWithoutRef<"strong">) => (
    <strong className={cn("font-semibold text-text-primary", className)} {...props} />
  ),
  hr: ({ className, ...props }: ComponentPropsWithoutRef<"hr">) => (
    <hr className={cn("my-8 border-border-accent/65", className)} {...props} />
  ),
  a: ({ className, href = "", ...props }: ComponentPropsWithoutRef<"a">) => {
    const isExternal = href.startsWith("http://") || href.startsWith("https://");

    return (
      <a
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className={cn("font-medium text-accent-dark underline decoration-accent/35 underline-offset-4", className)}
        {...props}
      />
    );
  },
  code: ({ className, ...props }: ComponentPropsWithoutRef<"code">) => (
    <code
      className={cn(
        "rounded-md border border-border-accent/70 bg-accent-surface/80 px-1.5 py-0.5 font-mono text-[0.88em] text-text-primary",
        className,
      )}
      {...props}
    />
  ),
  pre: ({ className, ...props }: ComponentPropsWithoutRef<"pre">) => (
    <pre
      className={cn(
        "mt-6 overflow-x-auto rounded-[1.5rem] border border-border-accent/70 bg-[linear-gradient(180deg,#18181b_0%,#09090b_100%)] p-4 text-sm leading-7 text-white/84 shadow-[0_18px_46px_rgba(15,23,42,0.20)]",
        className,
      )}
      {...props}
    />
  ),
  table: ({ className, ...props }: ComponentPropsWithoutRef<"table">) => (
    <div className="mt-6 overflow-x-auto rounded-[1.5rem] border border-border-accent/65 bg-white/80">
      <table className={cn("min-w-full border-collapse text-left text-sm text-text-secondary", className)} {...props} />
    </div>
  ),
  thead: ({ className, ...props }: ComponentPropsWithoutRef<"thead">) => (
    <thead className={cn("bg-accent-surface/72", className)} {...props} />
  ),
  tbody: ({ className, ...props }: ComponentPropsWithoutRef<"tbody">) => (
    <tbody className={cn("divide-y divide-border-accent/55", className)} {...props} />
  ),
  tr: ({ className, ...props }: ComponentPropsWithoutRef<"tr">) => (
    <tr className={cn("align-top", className)} {...props} />
  ),
  th: ({ className, ...props }: ComponentPropsWithoutRef<"th">) => (
    <th
      className={cn("px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary/78", className)}
      {...props}
    />
  ),
  td: ({ className, ...props }: ComponentPropsWithoutRef<"td">) => (
    <td className={cn("px-4 py-3 leading-7 text-text-secondary", className)} {...props} />
  ),
  Callout: ImpactCallout,
  StatGrid: ImpactStatGrid,
  Stat: ImpactStat,
};
