import type { CSSProperties } from "react";
import "locomotive-scroll/locomotive-scroll.css";
import { IridescenceBackground } from "@/components/background/iridescence";
import { Header, Navigation } from "@/components/layout/navigation";
import { ProfileBioContent } from "@/components/layout/navigation/profile-bio-content";
import { LocomotiveScrollProvider } from "@/components/providers/locomotive-scroll-provider";
import { StructuredData } from "@/components/site/structured-data";
import { LiquidGlassDefs } from "@/components/ui/liquid-glass-defs";
import { aeonik, poppins } from "@/config/fonts";
import { siteConfig } from "@/data/site";
import { getRootMetadata } from "@/lib/seo";
import { getSiteJsonLd } from "@/lib/structured-data";
import { liquidGlassCssVariables } from "@/lib/liquid-glass";
import "./globals.css";

export const metadata = getRootMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang={siteConfig.seo.language}
      className={`h-full antialiased ${aeonik.variable} ${poppins.variable}`}
    >
      <body
        className="min-h-full flex flex-col overflow-x-hidden bg-transparent text-foreground"
        style={liquidGlassCssVariables as CSSProperties}
      >
        <StructuredData data={getSiteJsonLd()} />
        <LiquidGlassDefs />
        <IridescenceBackground color={[0.93, 0.88, 0.99]} mouseReact amplitude={0.08} speed={0.9} />
        <LocomotiveScrollProvider>
          <Header profileBioContent={<ProfileBioContent />} />
          <div className="flex flex-1 flex-col pt-24">
            {children}
            <footer className="mt-auto px-6 pb-28 pt-10 text-center text-sm text-text-secondary md:px-10 md:pb-24">
              <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
                <span>Arnabdzns &copy; 2026 All Rights Reserved</span>
                <span aria-hidden="true">--</span>
                <span>
                  Made by{" "}
                  <a
                    href="https://amonsharma.com"
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-text-primary transition-colors hover:text-accent"
                  >
                    Amon Sharma
                  </a>
                </span>
              </p>
            </footer>
          </div>
          <Navigation />
        </LocomotiveScrollProvider>
      </body>
    </html>
  );
}
