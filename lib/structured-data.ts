import { faqSection } from "@/data/faq";
import { sitePages } from "@/data/site-pages";
import { siteConfig } from "@/data/site";
import { absoluteUrl, getSeoSocialLinks } from "@/lib/seo";
import type { SitePageKey } from "@/types";

type JsonLd = Record<string, unknown>;

const personId = absoluteUrl("/#person");
const websiteId = absoluteUrl("/#website");
const businessId = absoluteUrl("/#business");
const developerId = absoluteUrl("/#developer");

const PRIMARY_ALTERNATE_NAMES = [
  "Arnab",
  "Arnab Shaw",
  "Arnab Designs",
  "arnab.dzns",
  "arnabdzns",
];

const AREAS_SERVED: JsonLd[] = [
  { "@type": "City", name: "Bengaluru" },
  { "@type": "City", name: "Bangalore" },
  { "@type": "City", name: "Kolkata" },
  { "@type": "AdministrativeArea", name: "Karnataka" },
  { "@type": "AdministrativeArea", name: "West Bengal" },
  { "@type": "Country", name: "India" },
  { "@type": "Place", name: "Worldwide (remote)" },
];

function getSitePage(pageKey: SitePageKey) {
  return sitePages[pageKey] ?? sitePages.home;
}

function getBasePageEntity(pageKey: SitePageKey): JsonLd {
  const page = getSitePage(pageKey);
  const url = absoluteUrl(page.path);

  return {
    "@type": page.seo.pageType ?? "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: page.seo.title,
    description: page.seo.description,
    inLanguage: siteConfig.seo.language,
    isPartOf: {
      "@id": websiteId,
    },
    about: {
      "@id": personId,
    },
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: absoluteUrl(siteConfig.brand.logoSrc),
    },
  };
}

function getBreadcrumbEntity(pageKey: "about" | "contact" | "shop"): JsonLd {
  const currentPage = getSitePage(pageKey);

  return {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: absoluteUrl(sitePages.home.path),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: currentPage.navLabel ?? currentPage.seo.title,
        item: absoluteUrl(currentPage.path),
      },
    ],
  };
}

function getFaqPageEntity(): JsonLd {
  return {
    "@type": "FAQPage",
    "@id": `${absoluteUrl(sitePages.home.path)}#faq`,
    mainEntity: faqSection.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

function getPersonEntity(): JsonLd {
  const phoneDigits = siteConfig.contact.whatsappDisplay.replace(/[^+\d]/g, "");

  return {
    "@type": "Person",
    "@id": personId,
    name: "Arnab Shaw",
    alternateName: PRIMARY_ALTERNATE_NAMES,
    url: siteConfig.url,
    image: absoluteUrl(siteConfig.brand.logoSrc),
    description: siteConfig.description,
    jobTitle: siteConfig.tagline,
    email: `mailto:${siteConfig.contact.emailAddress}`,
    telephone: phoneDigits,
    sameAs: getSeoSocialLinks(),
    knowsAbout: siteConfig.agenda.services,
    knowsLanguage: ["English", "Hindi", "Bengali"],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bengaluru",
      addressRegion: "Karnataka",
      addressCountry: "IN",
    },
    workLocation: {
      "@type": "Place",
      name: "Bengaluru, Karnataka, India",
    },
    nationality: {
      "@type": "Country",
      name: "India",
    },
    worksFor: {
      "@id": businessId,
    },
  };
}

function getDeveloperEntity(): JsonLd {
  return {
    "@type": "Person",
    "@id": developerId,
    name: "Amon Sharma",
    alternateName: ["Amon", "Amon Sharma web dev", "Amon Sharma developer"],
    jobTitle: "Web Developer & Frontend Engineer",
    description:
      "Amon Sharma is the web developer who designed and built arnabdzns.com on Next.js — focused on premium frontend systems, performance, and motion.",
    url: "https://github.com/Amon20044",
    sameAs: ["https://github.com/Amon20044"],
    knowsAbout: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Frontend performance",
      "Motion design",
      "Web SEO",
    ],
  };
}

function getBusinessEntity(): JsonLd {
  const phoneDigits = siteConfig.contact.whatsappDisplay.replace(/[^+\d]/g, "");

  return {
    "@type": ["ProfessionalService", "LocalBusiness"],
    "@id": businessId,
    name: siteConfig.name,
    alternateName: PRIMARY_ALTERNATE_NAMES,
    url: siteConfig.url,
    image: absoluteUrl(siteConfig.brand.logoSrc),
    logo: absoluteUrl(siteConfig.brand.logoSrc),
    description: siteConfig.description,
    priceRange: "$$",
    currenciesAccepted: "INR, USD",
    paymentAccepted: "UPI, Bank Transfer, PayPal, Card",
    telephone: phoneDigits,
    email: siteConfig.contact.emailAddress,
    founder: { "@id": personId },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bengaluru",
      addressRegion: "Karnataka",
      addressCountry: "IN",
    },
    areaServed: AREAS_SERVED,
    knowsAbout: siteConfig.agenda.services,
    serviceType: siteConfig.agenda.services,
    makesOffer: siteConfig.agenda.services.map((service) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: service,
        provider: { "@id": personId },
        areaServed: AREAS_SERVED,
      },
    })),
    audience: siteConfig.agenda.audiences.map((audience) => ({
      "@type": "Audience",
      audienceType: audience,
    })),
    sameAs: getSeoSocialLinks(),
  };
}

export function getSiteJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@graph": [
      getPersonEntity(),
      getBusinessEntity(),
      getDeveloperEntity(),
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: siteConfig.url,
        name: siteConfig.name,
        alternateName: PRIMARY_ALTERNATE_NAMES,
        description: siteConfig.seo.defaultDescription,
        inLanguage: siteConfig.seo.language,
        publisher: { "@id": personId },
        creator: { "@id": developerId },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${siteConfig.url}/?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
}

export function getPageJsonLd(pageKey: SitePageKey): JsonLd {
  const graph: JsonLd[] = [getBasePageEntity(pageKey)];

  if (pageKey === "contact") {
    graph.push(getBreadcrumbEntity("contact"));
    graph.push({
      "@type": "ContactPoint",
      "@id": `${absoluteUrl(sitePages.contact.path)}#contact-point`,
      contactType: "project inquiries",
      email: siteConfig.contact.emailAddress,
      telephone: siteConfig.contact.whatsappDisplay.replace(/[^+\d]/g, ""),
      url: absoluteUrl(sitePages.contact.path),
      availableLanguage: ["English", "Hindi", "Bengali"],
      areaServed: AREAS_SERVED,
    });
  }

  if (pageKey === "about") {
    graph.push(getBreadcrumbEntity("about"));
  }

  if (pageKey === "shop") {
    graph.push(getBreadcrumbEntity("shop"));
  }

  if (pageKey === "home") {
    graph.push({
      "@type": "OfferCatalog",
      "@id": `${siteConfig.url}/#service-catalog`,
      name: `${siteConfig.name} services`,
      provider: { "@id": personId },
      itemListElement: siteConfig.agenda.services.map((service) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: service,
          provider: { "@id": personId },
          areaServed: AREAS_SERVED,
        },
      })),
    });
    graph.push(getFaqPageEntity());
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}
