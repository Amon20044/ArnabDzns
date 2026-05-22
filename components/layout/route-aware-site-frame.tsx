"use client";

import { usePathname } from "next/navigation";
import { PageTransitionShell } from "@/components/layout/page-transition-shell";
import { Header, Navigation } from "@/components/layout/navigation";
import { SiteFooter } from "@/components/layout/site-footer";
import { shouldHideSiteChrome } from "@/lib/admin/route-visibility";
import { cn } from "@/lib/utils";
import type { HeaderConfig, NavigationConfig, SiteConfig } from "@/types";

export function RouteAwareSiteFrame({
  children,
  header,
  navigation,
  site,
}: Readonly<{
  children: React.ReactNode;
  header: HeaderConfig;
  navigation: NavigationConfig;
  site: SiteConfig;
}>) {
  const pathname = usePathname();
  const hideChrome = shouldHideSiteChrome(pathname);

  return (
    <>
      {/* Header + Navigation are fixed; they MUST stay outside .site-boot-content,
          whose boot transform/filter would otherwise become their containing block
          and break position: fixed. Only the scrolling content carries the reveal. */}
      {hideChrome ? null : <Header content={header} />}
      <div className="site-boot-content flex flex-1 flex-col">
        <div className={cn("flex flex-1 flex-col", hideChrome ? "" : "pt-24")}>
          <PageTransitionShell>{children}</PageTransitionShell>
        </div>
        {hideChrome ? null : <SiteFooter site={site} />}
      </div>
      {hideChrome ? null : <Navigation content={navigation} />}
    </>
  );
}
