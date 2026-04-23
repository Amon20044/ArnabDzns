import { AboutPage } from "@/components/about/about-page";
import { StructuredData } from "@/components/site/structured-data";
import { getLayoutContent } from "@/db/content";
import { getPageMetadata } from "@/lib/seo";
import { getPageJsonLd } from "@/lib/structured-data";

export const metadata = getPageMetadata("about");
export const revalidate = 300;
export const runtime = "nodejs";

export default async function AboutRoute() {
  const layout = await getLayoutContent();

  return (
    <>
      <StructuredData data={getPageJsonLd("about")} />
      <AboutPage site={layout.site} />
    </>
  );
}
