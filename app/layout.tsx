import type { Metadata } from "next";
import "locomotive-scroll/locomotive-scroll.css";
import { IridescenceBackground } from "@/components/background/iridescence";
import { Header, Navigation } from "@/components/layout/navigation";
import { LocomotiveScrollProvider } from "@/components/providers/locomotive-scroll-provider";
import { siteConfig } from "@/data/site";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col overflow-x-hidden bg-transparent text-foreground">
        <IridescenceBackground color={[0.93, 0.88, 0.99]} mouseReact amplitude={0.08} speed={0.9} />
        <LocomotiveScrollProvider>
          <Header />
          <div className="flex flex-1 flex-col pt-24">{children}</div>
          <Navigation />
        </LocomotiveScrollProvider>
      </body>
    </html>
  );
}
