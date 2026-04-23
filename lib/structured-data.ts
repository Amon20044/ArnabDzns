import { sitePages } from "@/data/site-pages";
import { siteConfig } from "@/data/site";
import { absoluteUrl, getSeoSocialLinks } from "@/lib/seo";
import type { SitePageKey } from "@/types";

type JsonLd = Record<string, unknown>;

const personId = absoluteUrl("/#person");
const websiteId = absoluteUrl("/#website");

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
  };
}

function getBreadcrumbEntity(pageKey: "about" | "contact"): JsonLd {
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

export function getSiteJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": personId,
        name: siteConfig.name,
        url: siteConfig.url,
        image: absoluteUrl(siteConfig.brand.logoSrc),
        description: siteConfig.description,
        jobTitle: siteConfig.tagline,
        sameAs: getSeoSocialLinks(),
        knowsAbout: siteConfig.agenda.services,
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: siteConfig.url,
        name: siteConfig.name,
        description: siteConfig.seo.defaultDescription,
        inLanguage: siteConfig.seo.language,
        publisher: {
          "@id": personId,
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
      url: absoluteUrl(sitePages.contact.path),
      availableLanguage: [siteConfig.seo.language],
      areaServed: "Worldwide",
    });
  }

  if (pageKey === "about") {
    graph.push(getBreadcrumbEntity("about"));
  }

  if (pageKey === "home") {
    graph.push({
      "@type": "OfferCatalog",
      name: `${siteConfig.name} services`,
      itemListElement: siteConfig.agenda.services.map((service) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: service,
          provider: {
            "@id": personId,
          },
        },
      })),
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}
