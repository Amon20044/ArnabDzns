/**
 * Central registry of Next.js cache tags for MongoDB-backed public content.
 *
 * The public app reads content through cached Mongoose queries. Any admin
 * update should revalidate the matching tag with `revalidateTag(tag, "max")`
 * and revalidate the affected route path so Vercel can refresh the stale page
 * on the next visit.
 */

const NS = "arnab";

export const TAG_SITE = `${NS}:site` as const;
export const TAG_SITE_SOCIAL = `${NS}:site:social` as const;
export const TAG_SITE_AGENDA = `${NS}:site:agenda` as const;
export const TAG_NAVIGATION = `${NS}:navigation` as const;
export const TAG_HEADER = `${NS}:header` as const;
export const TAG_CONTACT_PAGE = `${NS}:contact-page` as const;

export const tagForPageSeo = (pageKey: string) =>
  `${NS}:page-seo:${pageKey}` as const;

export type SectionKey =
  | "home_hero"
  | "clients_marquee"
  | "showcase_marquee"
  | "portfolio"
  | "testimonials"
  | "impact"
  | "services"
  | "toolkit"
  | "process_roadmap"
  | "faq"
  | "book_call";

export const tagForSection = (key: SectionKey) =>
  `${NS}:section:${key}` as const;

export const tagForImpactCard = (slug: string) =>
  `${NS}:impact:card:${slug}` as const;
export const tagForImpactBody = (slug: string) =>
  `${NS}:impact:body:${slug}` as const;
export const tagForTestimonial = (id: string) =>
  `${NS}:testimonial:${id}` as const;
export const tagForFaqItem = (id: string) => `${NS}:faq:${id}` as const;
export const tagForServiceItem = (id: string) =>
  `${NS}:service:${id}` as const;
export const tagForToolkitItem = (id: string) =>
  `${NS}:toolkit:${id}` as const;
export const tagForMarqueeRow = (id: string) =>
  `${NS}:marquee:${id}` as const;
export const tagForRoadmapStep = (id: string) =>
  `${NS}:roadmap:${id}` as const;
export const tagForBookCallAction = (id: string) =>
  `${NS}:book-call:${id}` as const;

export const TAG_INQUIRY_LIST = `${NS}:inquiry:list` as const;
export const tagForInquiry = (id: string) => `${NS}:inquiry:${id}` as const;
