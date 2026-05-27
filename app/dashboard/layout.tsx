import Link from "next/link";
import { DatabaseIcon, KeyRoundIcon, LayoutDashboardIcon } from "lucide-react";
import { LogoutButton } from "@/components/admin/logout-button";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="mx-auto flex w-full max-w-[92rem] flex-1 flex-col gap-4 px-3 pb-20 pt-4 sm:gap-6 sm:px-5 sm:pb-24 sm:pt-6 lg:px-8">
      <section className="page-surface relative overflow-hidden rounded-2xl p-3 sm:rounded-3xl sm:p-5">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.16),transparent_42%)]" />
        <div className="relative flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-dark">
              Admin
            </p>
            <h1 className="mt-1 truncate text-xl font-semibold text-text-primary sm:text-2xl">
              Dashboard
            </h1>
          </div>
          <nav
            aria-label="Dashboard navigation"
            className="-mx-1 flex max-w-full items-center gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:mx-0 lg:flex-wrap lg:justify-end lg:overflow-visible lg:px-0 lg:pb-0"
          >
            <Link
              href="/dashboard"
              className="inline-flex h-9 min-w-max items-center gap-2 rounded-lg border border-border bg-white/70 px-3 text-sm font-medium text-text-primary transition hover:bg-white"
            >
              <LayoutDashboardIcon className="size-4" />
              Home
            </Link>
            <Link
              href="/dashboard/content"
              className="inline-flex h-9 min-w-max items-center gap-2 rounded-lg border border-border bg-white/70 px-3 text-sm font-medium text-text-primary transition hover:bg-white"
            >
              <DatabaseIcon className="size-4" />
              Content
            </Link>
            <Link
              href="/change-password"
              className="inline-flex h-9 min-w-max items-center gap-2 rounded-lg border border-border bg-white/70 px-3 text-sm font-medium text-text-primary transition hover:bg-white"
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
