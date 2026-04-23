import { bookCallSection } from "@/data/book-call";
import { clientMarqueeRows } from "@/data/clients";
import { contactPageContent, type ContactPageContent } from "@/data/contact-page";
import { demoImageMarquee, demoImageMarquee2 } from "@/data/demo-image-marquee";
import { faqSection } from "@/data/faq";
import { homeHeroSection } from "@/data/home-hero";
import { impactSection } from "@/data/impact";
import { headerConfig, navigationConfig } from "@/data/navigation";
import { portfolioSection } from "@/data/portfolio-section";
import { processRoadmapSection } from "@/data/process-roadmap";
import { servicesSection } from "@/data/services";
import { siteConfig } from "@/data/site";
import { testimonialsSection } from "@/data/testimonials";
import type { ImageMarqueeRow } from "@/components/ui/image-marquee";
import type {
  BookCallSectionConfig,
  FAQSectionConfig,
  HeaderConfig,
  HeroSectionConfig,
  ImpactSectionConfig,
  NavigationConfig,
  RoadmapSectionConfig,
  ServicesSectionConfig,
  SiteConfig,
  TestimonialsSectionConfig,
} from "@/types";
import type {
  ContentBlockKey,
  ContentBlockSeed,
  ContentImage,
} from "./models/content-block";

export { contactPageContent };
export type { ContactPageContent };

export interface LayoutContent {
  site: SiteConfig;
  header: HeaderConfig;
  navigation: NavigationConfig;
}

export interface HomeContent {
  homeHero: HeroSectionConfig;
  clientsMarquee: ImageMarqueeRow[];
  showcaseMarquee: ImageMarqueeRow[];
  portfolio: HeroSectionConfig;
  portfolioMarquee: ImageMarqueeRow[];
  testimonials: TestimonialsSectionConfig;
  impact: ImpactSectionConfig;
  services: ServicesSectionConfig;
  processRoadmap: RoadmapSectionConfig;
  faq: FAQSectionConfig;
  bookCall: BookCallSectionConfig;
}

export const defaultLayoutContent: LayoutContent = {
  site: siteConfig,
  header: headerConfig,
  navigation: navigationConfig,
};

export const defaultHomeContent: HomeContent = {
  homeHero: homeHeroSection,
  clientsMarquee: clientMarqueeRows,
  showcaseMarquee: demoImageMarquee2,
  portfolio: portfolioSection,
  portfolioMarquee: demoImageMarquee,
  testimonials: testimonialsSection,
  impact: impactSection,
  services: servicesSection,
  processRoadmap: processRoadmapSection,
  faq: faqSection,
  bookCall: bookCallSection,
};

function firstBadgeColor(content: HeroSectionConfig) {
  return content.badges?.find((badge) => badge.tone)?.tone;
}

function summarizeHero(content: HeroSectionConfig) {
  return {
    title: content.title,
    desc: content.description,
    color: firstBadgeColor(content),
    items: content.badges?.map((badge, index) => ({
      ...badge,
      id: badge.id ?? `badge-${index + 1}`,
      title: badge.label,
      color: badge.tone,
      order: index,
    })),
  };
}

function flattenMarqueeImages(rows: ImageMarqueeRow[]) {
  return rows.flatMap((row, rowIndex) =>
    row.images.map(
      (image, imageIndex): ContentImage => ({
        ...image,
        order: rowIndex * 1000 + imageIndex,
        rowId: row.id ?? `row-${rowIndex + 1}`,
        rowOrder: rowIndex,
      }),
    ),
  );
}

function serializeNavigation(content: NavigationConfig): NavigationConfig {
  return {
    items: content.items.map((item) => ({ ...item })),
    ctas: content.ctas.map((cta) => ({
      label: cta.label,
      variant: cta.variant,
      path: cta.path,
      href: cta.href,
      icon: cta.icon ?? "phone-call",
    })),
  };
}

export const defaultContentBlocks: ContentBlockSeed[] = [
  {
    key: "site",
    group: "site",
    kind: "singleton",
    title: siteConfig.name,
    desc: siteConfig.description,
    text: siteConfig.tagline,
    color: siteConfig.category,
    order: 0,
    images: [
      {
        id: "brand-logo",
        src: siteConfig.brand.logoSrc,
        alt: siteConfig.brand.logoAlt,
        title: siteConfig.name,
        desc: siteConfig.brand.role,
        order: 0,
      },
    ],
    items: siteConfig.social.map((social, index) => ({
      id: social.platform,
      title: social.label,
      desc: social.url,
      order: index,
      ...social,
    })),
    data: siteConfig,
  },
  {
    key: "navigation",
    group: "navigation",
    kind: "singleton",
    title: headerConfig.brand.name,
    desc: headerConfig.brand.role,
    text: headerConfig.availabilityLabel,
    order: 1,
    images: [
      {
        id: "header-brand",
        src: headerConfig.brand.logoSrc,
        alt: headerConfig.brand.logoAlt,
        title: headerConfig.brand.name,
        desc: headerConfig.brand.role,
        order: 0,
      },
    ],
    items: navigationConfig.items.map((item, index) => ({
      ...item,
      id: item.id,
      title: item.label,
      desc: item.path,
      order: index,
    })),
    data: {
      header: headerConfig,
      navigation: serializeNavigation(navigationConfig),
    },
  },
  {
    key: "home_hero",
    group: "home",
    kind: "section",
    order: 10,
    ...summarizeHero(homeHeroSection),
    data: homeHeroSection,
  },
  {
    key: "clients_marquee",
    group: "home",
    kind: "marquee",
    title: "Clients marquee",
    order: 20,
    images: flattenMarqueeImages(clientMarqueeRows),
    data: clientMarqueeRows,
  },
  {
    key: "showcase_marquee",
    group: "home",
    kind: "marquee",
    title: "Showcase marquee",
    order: 30,
    images: flattenMarqueeImages(demoImageMarquee2),
    data: demoImageMarquee2,
  },
  {
    key: "portfolio",
    group: "home",
    kind: "section",
    order: 40,
    ...summarizeHero(portfolioSection),
    data: portfolioSection,
  },
  {
    key: "portfolio_marquee",
    group: "home",
    kind: "marquee",
    title: "Portfolio marquee",
    order: 45,
    images: flattenMarqueeImages(demoImageMarquee),
    data: demoImageMarquee,
  },
  {
    key: "testimonials",
    group: "home",
    kind: "section",
    title: testimonialsSection.title,
    desc: testimonialsSection.description,
    text: testimonialsSection.eyebrow,
    color: "#a855f7",
    order: 50,
    items: testimonialsSection.categories.flatMap((category, categoryIndex) =>
      category.testimonials.map((testimonial, testimonialIndex) => ({
        ...testimonial,
        id: testimonial.id,
        title: testimonial.name,
        desc: testimonial.message,
        category: category.id,
        order: categoryIndex * 1000 + testimonialIndex,
      })),
    ),
    data: testimonialsSection,
  },
  {
    key: "impact",
    group: "home",
    kind: "section",
    order: 60,
    ...summarizeHero(impactSection.hero),
    items: impactSection.cards.map((card, index) => ({
      ...card,
      id: card.id,
      title: card.title,
      desc: card.subtitle,
      color: card.accent,
      order: card.priority ?? index,
    })),
    data: impactSection,
  },
  {
    key: "services",
    group: "home",
    kind: "section",
    order: 70,
    ...summarizeHero(servicesSection.hero),
    items: servicesSection.services.map((service, index) => ({
      ...service,
      id: service.id,
      title: service.title,
      desc: service.description,
      order: index,
    })),
    data: servicesSection,
  },
  {
    key: "process_roadmap",
    group: "home",
    kind: "section",
    order: 80,
    ...summarizeHero(processRoadmapSection.hero),
    items: processRoadmapSection.items.map((step, index) => ({
      ...step,
      id: step.id,
      title: step.title,
      desc: step.description,
      order: index,
    })),
    data: processRoadmapSection,
  },
  {
    key: "faq",
    group: "home",
    kind: "section",
    title: faqSection.title,
    desc: faqSection.description,
    text: faqSection.eyebrow,
    color: "#18181b",
    order: 90,
    items: faqSection.items.map((item, index) => ({
      ...item,
      id: item.id,
      title: item.question,
      desc: item.answer,
      order: index,
    })),
    data: faqSection,
  },
  {
    key: "book_call",
    group: "home",
    kind: "section",
    order: 100,
    ...summarizeHero(bookCallSection.hero),
    items: [
      {
        ...bookCallSection.panel.primaryAction,
        id: bookCallSection.panel.primaryAction.id,
        title: bookCallSection.panel.primaryAction.label,
        desc: bookCallSection.panel.primaryAction.value,
        order: 0,
      },
    ],
    data: bookCallSection,
  },
  {
    key: "contact_page",
    group: "contact",
    kind: "page",
    order: 10,
    ...summarizeHero(contactPageContent.hero),
    desc: contactPageContent.hero.description,
    text: contactPageContent.direct.desc,
    data: contactPageContent,
  },
];

export const defaultContentBlockMap = defaultContentBlocks.reduce(
  (blocks, block) => {
    blocks[block.key] = block;
    return blocks;
  },
  {} as Record<ContentBlockKey, ContentBlockSeed>,
);

export function getDefaultBlockData<T>(key: ContentBlockKey, fallback: T) {
  return (defaultContentBlockMap[key]?.data as T | undefined) ?? fallback;
}
