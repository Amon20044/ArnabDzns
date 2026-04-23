import { ContactPageExperience } from "@/components/contact/contact-page-experience";
import { StructuredData } from "@/components/site/structured-data";
import { getContactPageContent, getLayoutContent } from "@/db/content";
import { getPageMetadata } from "@/lib/seo";
import { getPageJsonLd } from "@/lib/structured-data";

export const metadata = getPageMetadata("contact");
export const revalidate = 300;
export const runtime = "nodejs";

export default async function ContactPage() {
  const [content, layout] = await Promise.all([
    getContactPageContent(),
    getLayoutContent(),
  ]);

  return (
    <>
      <StructuredData data={getPageJsonLd("contact")} />
      <ContactPageExperience content={content} site={layout.site} />
    </>
  );
}
