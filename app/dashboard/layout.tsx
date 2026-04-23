import Link from "next/link";
import { DatabaseIcon, KeyRoundIcon, LayoutDashboardIcon } from "lucide-react";
import { LogoutButton } from "@/components/admin/logout-button";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 pb-24 pt-6 sm:px-6 lg:px-8">
      <section className="page-surface relative overflow-hidden rounded-3xl p-4 sm:p-5">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.16),transparent_42%)]" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-dark">
              Admin
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-text-primary">
              Dashboard
            </h1>
          </div>
          <nav className="flex flex-wrap items-center gap-2">
            <Link
              href="/dashboard"
              className="inline-flex h-8 items-center gap-2 rounded-lg border border-border bg-white/70 px-3 text-sm font-medium text-text-primary transition hover:bg-white"
            >
              <LayoutDashboardIcon className="size-4" />
              Home
            </Link>
            <Link
              href="/dashboard/content"
              className="inline-flex h-8 items-center gap-2 rounded-lg border border-border bg-white/70 px-3 text-sm font-medium text-text-primary transition hover:bg-white"
            >
              <DatabaseIcon className="size-4" />
              Content
            </Link>
            <Link
              href="/change-password"
              className="inline-flex h-8 items-center gap-2 rounded-lg border border-border bg-white/70 px-3 text-sm font-medium text-text-primary transition hover:bg-white"
            >
              <KeyRoundIcon className="size-4" />
              Password
            </Link>
            <LogoutButton />
          </nav>
        </div>
      </section>
      {children}
    </main>
  );
}
