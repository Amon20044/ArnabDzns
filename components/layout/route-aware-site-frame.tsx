"use client";

import { usePathname } from "next/navigation";
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
  profileBioContent,
}: Readonly<{
  children: React.ReactNode;
  header: HeaderConfig;
  navigation: NavigationConfig;
  site: SiteConfig;
  profileBioContent: React.ReactNode;
}>) {
  const pathname = usePathname();
  const hideChrome = shouldHideSiteChrome(pathname);

  return (
    <>
      {hideChrome ? null : (
        <Header content={header} profileBioContent={profileBioContent} />
      )}
      <div className={cn("flex flex-1 flex-col", hideChrome ? "" : "pt-24")}>
        {children}
      </div>
      {hideChrome ? null : <SiteFooter site={site} />}
      {hideChrome ? null : <Navigation content={navigation} />}
    </>
  );
}
