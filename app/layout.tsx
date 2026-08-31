import type { CSSProperties } from "react";
import type { Viewport } from "next";
import "locomotive-scroll/locomotive-scroll.css";
import { IridescenceBackground } from "@/components/background/iridescence";
import { RouteAwareSiteFrame } from "@/components/layout/route-aware-site-frame";
import { LocomotiveScrollProvider } from "@/components/providers/locomotive-scroll-provider";
import { StructuredData } from "@/components/site/structured-data";
import { LiquidGlassDefs } from "@/components/ui/liquid-glass-defs";
import { aeonik } from "@/config/fonts";
import { getLayoutContent } from "@/db/content";
import { getRootMetadata } from "@/lib/seo";
import { getSiteJsonLd } from "@/lib/structured-data";
import { liquidGlassCssVariables } from "@/lib/liquid-glass";
import "./globals.css";

export const metadata = getRootMetadata();
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};
export const revalidate = 300;
export const runtime = "nodejs";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = await getLayoutContent();

  return (
    <html
      lang={content.site.seo.language}
      className={`h-full antialiased font-sans ${aeonik.variable}`}
    >
      <body
        className="min-h-full flex flex-col overflow-x-hidden bg-transparent text-foreground"
        style={liquidGlassCssVariables as CSSProperties}
      >
        <StructuredData data={getSiteJsonLd()} />
        <LiquidGlassDefs />
        {/* Keep fixed chrome outside the brief startup reveal wrapper. */}
        <IridescenceBackground color={[0.93, 0.88, 0.99]} mouseReact amplitude={0.08} speed={0.9} />
        <LocomotiveScrollProvider>
          <RouteAwareSiteFrame
            header={content.header}
            navigation={content.navigation}
            site={content.site}
          >
            {children}
          </RouteAwareSiteFrame>
        </LocomotiveScrollProvider>
        <div className="site-boot-loader" aria-label="Loading site" role="status">
          <div className="site-loader-card">
            <span className="site-loader-mark" />
            <span className="site-loader-line site-loader-line-wide" />
            <span className="site-loader-line site-loader-line-short" />
          </div>
        </div>
      </body>
    </html>
  );
}
