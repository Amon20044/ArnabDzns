import type { Metadata } from "next";
import { Header, Navigation } from "@/components/layout/navigation";
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
      <body className="min-h-full flex flex-col overflow-x-hidden bg-background text-foreground">
        <Header />
        <div className="flex flex-1 flex-col pt-28 sm:pt-32">{children}</div>
        <Navigation />
      </body>
    </html>
  );
}
