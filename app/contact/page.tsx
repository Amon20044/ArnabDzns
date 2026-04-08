import { ContactPageExperience } from "@/components/contact/contact-page-experience";
import { StructuredData } from "@/components/site/structured-data";
import { getPageMetadata } from "@/lib/seo";
import { getPageJsonLd } from "@/lib/structured-data";

export const metadata = getPageMetadata("contact");

export default function ContactPage() {
  return (
    <>
      <StructuredData data={getPageJsonLd("contact")} />
      <ContactPageExperience />
    </>
  );
}
