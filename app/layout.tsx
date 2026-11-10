import type { Viewport } from "next";
import "lenis/dist/lenis.css";
import { RouteAwareSiteFrame } from "@/components/layout/route-aware-site-frame";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";
import { StructuredData } from "@/components/site/structured-data";
import { aeonik, caveat } from "@/config/fonts";
import { getLayoutContent } from "@/db/content";
import { getRootMetadata } from "@/lib/seo";
import { getSiteJsonLd } from "@/lib/structured-data";
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
      className={`h-full antialiased font-sans ${aeonik.variable} ${caveat.variable}`}
    >
      <body className="min-h-full flex flex-col overflow-x-hidden bg-transparent text-foreground">
        <StructuredData data={getSiteJsonLd()} />
        <SmoothScrollProvider>
          <RouteAwareSiteFrame
            header={content.header}
            navigation={content.navigation}
            site={content.site}
          >
            {children}
          </RouteAwareSiteFrame>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
