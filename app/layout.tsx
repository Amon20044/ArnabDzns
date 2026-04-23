import type { CSSProperties } from "react";
import "locomotive-scroll/locomotive-scroll.css";
import { IridescenceBackground } from "@/components/background/iridescence";
import { SiteFooter } from "@/components/layout/site-footer";
import { Header, Navigation } from "@/components/layout/navigation";
import { ProfileBioContent } from "@/components/layout/navigation/profile-bio-content";
import { LocomotiveScrollProvider } from "@/components/providers/locomotive-scroll-provider";
import { StructuredData } from "@/components/site/structured-data";
import { LiquidGlassDefs } from "@/components/ui/liquid-glass-defs";
import { aeonik, poppins } from "@/config/fonts";
import { getLayoutContent } from "@/db/content";
import { getRootMetadata } from "@/lib/seo";
import { getSiteJsonLd } from "@/lib/structured-data";
import { liquidGlassCssVariables } from "@/lib/liquid-glass";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata = getRootMetadata();
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
      className={cn("h-full", "antialiased", aeonik.variable, poppins.variable, "font-sans", geist.variable)}
    >
      <body
        className="min-h-full flex flex-col overflow-x-hidden bg-transparent text-foreground"
        style={liquidGlassCssVariables as CSSProperties}
      >
        <StructuredData data={getSiteJsonLd()} />
        <LiquidGlassDefs />
        <IridescenceBackground color={[0.93, 0.88, 0.99]} mouseReact amplitude={0.08} speed={0.9} />
        <LocomotiveScrollProvider>
          <Header
            content={content.header}
            profileBioContent={<ProfileBioContent />}
          />
          <div className="flex flex-1 flex-col pt-24">
            {children}
          </div>
          <SiteFooter site={content.site} />
          <Navigation content={content.navigation} />
        </LocomotiveScrollProvider>
      </body>
    </html>
  );
}
