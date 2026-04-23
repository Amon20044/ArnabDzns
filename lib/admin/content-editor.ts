import type { ImageMarqueeRow } from "@/components/ui/image-marquee";
import type { ContentBlockRecord, ContentBlockUpdate } from "@/db/content";
import type {
  ContentBlockKey,
  ContentBlockSeed,
  ContentImage,
} from "@/db/models/content-block";
import type { ContactPageContent } from "@/data/contact-page";
import type {
  BookCallSectionConfig,
  CTAConfig,
  FAQSectionConfig,
  HeaderConfig,
  HeroSectionConfig,
  ImpactCardConfig,
  ImpactSectionConfig,
  NavigationConfig,
  RoadmapSectionConfig,
  ServicesSectionConfig,
  SiteConfig,
  TestimonialsSectionConfig,
} from "@/types";

type NavigationEditorData = {
  header: HeaderConfig;
  navigation: NavigationConfig;
};

export interface StructuredContentDraft {
  order: string;
  active: boolean;
  data: unknown;
}

export interface ContentSectionDefinition {
  label: string;
  description: string;
}

export const CONTENT_SECTION_DEFINITIONS: Record<
  ContentBlockKey,
  ContentSectionDefinition
> = {
  site: {
    label: "Site Settings",
    description: "Brand, contact, SEO, and site-wide identity settings.",
  },
  navigation: {
    label: "Navigation",
    description: "Header brand, social links, nav items, and primary CTAs.",
  },
  home_hero: {
    label: "Home Hero",
    description: "Landing hero copy, badges, and call-to-action buttons.",
  },
  clients_marquee: {
    label: "Clients Marquee",
    description: "Scrolling client/logo rows shown on the homepage.",
  },
  showcase_marquee: {
    label: "Showcase Marquee",
    description: "Scrolling gallery rows for featured visuals.",
  },
  portfolio: {
    label: "Portfolio Intro",
    description: "Portfolio section hero heading and supporting copy.",
  },
  portfolio_marquee: {
    label: "Portfolio Marquee",
    description: "Gallery rows for portfolio imagery and references.",
  },
  testimonials: {
    label: "Testimonials",
    description: "Testimonials categories, trusted-by stacks, and quotes.",
  },
  impact: {
    label: "Impact Showcase",
    description: "Impact hero, modal CTA, and the full impact card grid.",
  },
  services: {
    label: "Services",
    description: "Services hero and the editable list of service cards.",
  },
  process_roadmap: {
    label: "Process Roadmap",
    description: "Process hero and the timeline of delivery steps.",
  },
  faq: {
    label: "FAQ",
    description: "Frequently asked questions, helper text, and CTA.",
  },
  book_call: {
    label: "Book Call",
    description: "Booking section hero, primary action, and social links.",
  },
  contact_page: {
    label: "Contact Page",
    description: "Contact page hero and direct-contact support panel.",
  },
};

function cloneJson<T>(value: T): T {
  if (value === undefined || value === null) {
    return value;
  }

  return JSON.parse(JSON.stringify(value)) as T;
}

function getDefaultTitle(key: ContentBlockKey) {
  return CONTENT_SECTION_DEFINITIONS[key].label;
}

function firstBadgeTone(hero: HeroSectionConfig | undefined) {
  return hero?.badges?.find((badge) => badge.tone)?.tone;
}

function serializeHeroSummary(
  hero: HeroSectionConfig,
  fallbackColor?: string,
) {
  return {
    title: hero.title,
    desc: hero.description ?? "",
    text: hero.eyebrow ?? "",
    color: firstBadgeTone(hero) ?? fallbackColor ?? "",
  };
}

function flattenMarqueeRows(rows: ImageMarqueeRow[]) {
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

function serializeSectionCTA(cta: CTAConfig, index: number) {
  return {
    ...cta,
    id: `${cta.label.toLowerCase().replace(/\s+/g, "-")}-${index + 1}`,
    title: cta.label,
    desc: cta.path ?? cta.href ?? "",
    order: index,
  };
}

function serializeSiteBlock(site: SiteConfig): ContentBlockUpdate {
  return {
    title: site.name,
    desc: site.description,
    text: site.tagline,
    color: site.category,
    images: [
      {
        id: "brand-logo",
        src: site.brand.logoSrc,
        alt: site.brand.logoAlt,
        title: site.name,
        desc: site.brand.role,
        order: 0,
      },
    ],
    items: site.social.map((social, index) => ({
      id: social.platform,
      title: social.label,
      desc: social.url,
      order: index,
      ...social,
    })),
    data: site,
  };
}

function serializeNavigationBlock(
  data: NavigationEditorData,
): ContentBlockUpdate {
  return {
    title: data.header.brand.name,
    desc: data.header.brand.role,
    text: data.header.availabilityLabel,
    images: [
      {
        id: "header-brand",
        src: data.header.brand.logoSrc,
        alt: data.header.brand.logoAlt,
        title: data.header.brand.name,
        desc: data.header.brand.role,
        order: 0,
      },
    ],
    items: [
      ...data.navigation.items.map((item, index) => ({
        ...item,
        id: item.id,
        title: item.label,
        desc: item.path,
        order: index,
      })),
      ...data.navigation.ctas.map((cta, index) => serializeSectionCTA(cta, index)),
    ],
    data,
  };
}

function serializeHeroBlock(
  hero: HeroSectionConfig,
  fallbackColor?: string,
): ContentBlockUpdate {
  return {
    ...serializeHeroSummary(hero, fallbackColor),
    items:
      hero.badges?.map((badge, index) => ({
        ...badge,
        id: badge.id ?? `badge-${index + 1}`,
        title: badge.label,
        color: badge.tone,
        order: index,
      })) ?? [],
    data: hero,
  };
}

function serializeServicesBlock(
  data: ServicesSectionConfig,
  fallbackColor?: string,
): ContentBlockUpdate {
  return {
    ...serializeHeroSummary(data.hero, fallbackColor),
    items: data.services.map((service, index) => ({
      ...service,
      id: service.id,
      title: service.title,
      desc: service.description,
      order: index,
    })),
    data,
  };
}

function serializeRoadmapBlock(
  data: RoadmapSectionConfig,
  fallbackColor?: string,
): ContentBlockUpdate {
  return {
    ...serializeHeroSummary(data.hero, fallbackColor),
    items: data.items.map((step, index) => ({
      ...step,
      id: step.id,
      title: step.title,
      desc: step.description,
      order: index,
    })),
    data,
  };
}

function serializeFaqBlock(
  data: FAQSectionConfig,
  fallbackColor?: string,
): ContentBlockUpdate {
  return {
    title: data.title,
    desc: data.description ?? "",
    text: data.eyebrow ?? "",
    color: fallbackColor ?? "",
    items: data.items.map((item, index) => ({
      ...item,
      id: item.id,
      title: item.question,
      desc: item.answer,
      order: index,
    })),
    data,
  };
}

function serializeTestimonialsBlock(
  data: TestimonialsSectionConfig,
  fallbackColor?: string,
): ContentBlockUpdate {
  return {
    title: data.title,
    desc: data.description ?? "",
    text: data.eyebrow ?? "",
    color: fallbackColor ?? "",
    items: data.categories.flatMap((category, categoryIndex) =>
      category.testimonials.map((testimonial, testimonialIndex) => ({
        ...testimonial,
        id: testimonial.id,
        title: testimonial.name,
        desc: testimonial.message,
        category: category.id,
        order: categoryIndex * 1000 + testimonialIndex,
      })),
    ),
    data,
  };
}

function serializeImpactBlock(
  data: ImpactSectionConfig,
  fallbackColor?: string,
): ContentBlockUpdate {
  return {
    ...serializeHeroSummary(data.hero, fallbackColor),
    items: data.cards.map((card, index) => ({
      ...card,
      id: card.id,
      title: card.title,
      desc: card.subtitle,
      color: card.accent,
      order: card.priority ?? index,
    })),
    data,
  };
}

function serializeBookCallBlock(
  data: BookCallSectionConfig,
  fallbackColor?: string,
): ContentBlockUpdate {
  return {
    ...serializeHeroSummary(data.hero, fallbackColor),
    items: [
      {
        ...data.panel.primaryAction,
        id: data.panel.primaryAction.id,
        title: data.panel.primaryAction.label,
        desc: data.panel.primaryAction.value,
        order: 0,
      },
      ...data.panel.socialLinks.map((social, index) => ({
        ...social,
        id: social.id,
        title: social.label,
        desc: social.href,
        order: index + 1,
      })),
    ],
    data,
  };
}

function serializeContactPageBlock(
  data: ContactPageContent,
  fallbackColor?: string,
): ContentBlockUpdate {
  return {
    title: data.hero.title,
    desc: data.hero.description ?? "",
    text: data.direct.desc ?? "",
    color: firstBadgeTone(data.hero) ?? fallbackColor ?? "",
    items: [
      {
        id: "direct-contact-panel",
        title: data.direct.title,
        desc: data.direct.desc,
        badgeLabel: data.direct.badgeLabel,
        emailLabel: data.direct.emailLabel,
        order: 0,
      },
    ],
    data,
  };
}

function imagesToMarqueeRows(images: ContentImage[]) {
  const rows = new Map<
    string,
    {
      id: string;
      order: number;
      images: ImageMarqueeRow["images"];
    }
  >();

  const sortedImages = [...images].sort(
    (left, right) => (left.order ?? 0) - (right.order ?? 0),
  );

  sortedImages.forEach((image, index) => {
    const rowOrder =
      typeof image.rowOrder === "number" && Number.isFinite(image.rowOrder)
        ? image.rowOrder
        : 0;
    const rowId =
      typeof image.rowId === "string" && image.rowId.trim()
        ? image.rowId
        : `row-${rowOrder + 1}`;
    const currentRow = rows.get(rowId) ?? {
      id: rowId,
      order: rowOrder,
      images: [],
    };
    const cleanImage = { ...image };

    delete cleanImage.order;
    delete cleanImage.rowId;
    delete cleanImage.rowOrder;
    delete cleanImage.desc;

    currentRow.images.push({
      ...(cleanImage as ImageMarqueeRow["images"][number]),
      id: cleanImage.id ?? `${rowId}-image-${index + 1}`,
    });
    rows.set(rowId, currentRow);
  });

  return [...rows.values()]
    .sort((left, right) => left.order - right.order)
    .map(({ order: _order, ...row }) => row);
}

export function createStructuredContentDraft(
  block: ContentBlockRecord,
): StructuredContentDraft {
  return {
    order: String(block.order ?? 0),
    active: block.active !== false,
    data:
      block.data !== undefined && block.data !== null
        ? cloneJson(block.data)
        : block.kind === "marquee"
          ? imagesToMarqueeRows(block.images ?? [])
          : null,
  };
}

function parseDraftOrder(order: string) {
  const value = Number(order);

  if (!Number.isFinite(value)) {
    throw new Error("Order must be a number.");
  }

  return value;
}

export function buildContentUpdateFromDraft(
  key: ContentBlockKey,
  draft: StructuredContentDraft,
): ContentBlockUpdate {
  const meta = {
    order: parseDraftOrder(draft.order),
    active: draft.active,
  };

  switch (key) {
    case "site":
      return {
        ...meta,
        ...serializeSiteBlock(draft.data as SiteConfig),
      };
    case "navigation":
      return {
        ...meta,
        ...serializeNavigationBlock(draft.data as NavigationEditorData),
      };
    case "home_hero":
    case "portfolio":
      return {
        ...meta,
        ...serializeHeroBlock(draft.data as HeroSectionConfig),
      };
    case "clients_marquee":
    case "showcase_marquee":
    case "portfolio_marquee": {
      const rows = draft.data as ImageMarqueeRow[];
      return {
        ...meta,
        title: getDefaultTitle(key),
        images: flattenMarqueeRows(rows),
        data: rows,
      };
    }
    case "services":
      return {
        ...meta,
        ...serializeServicesBlock(draft.data as ServicesSectionConfig),
      };
    case "process_roadmap":
      return {
        ...meta,
        ...serializeRoadmapBlock(draft.data as RoadmapSectionConfig),
      };
    case "faq":
      return {
        ...meta,
        ...serializeFaqBlock(draft.data as FAQSectionConfig),
      };
    case "testimonials":
      return {
        ...meta,
        ...serializeTestimonialsBlock(draft.data as TestimonialsSectionConfig),
      };
    case "impact":
      return {
        ...meta,
        ...serializeImpactBlock(draft.data as ImpactSectionConfig),
      };
    case "book_call":
      return {
        ...meta,
        ...serializeBookCallBlock(draft.data as BookCallSectionConfig),
      };
    case "contact_page":
      return {
        ...meta,
        ...serializeContactPageBlock(draft.data as ContactPageContent),
      };
    default:
      return meta;
  }
}

export function getSectionDefinition(key: ContentBlockKey) {
  return CONTENT_SECTION_DEFINITIONS[key];
}

export function getSectionSummary(block: ContentBlockSeed) {
  if (typeof block.title === "string" && block.title.trim()) {
    return block.title;
  }

  if (Array.isArray(block.title) && block.title.length) {
    return block.title.join(" ");
  }

  return CONTENT_SECTION_DEFINITIONS[block.key].label;
}

export function countBlockItems(block: ContentBlockRecord) {
  if (Array.isArray(block.items) && block.items.length) {
    return block.items.length;
  }

  if (Array.isArray(block.images) && block.images.length) {
    return block.images.length;
  }

  if (block.key === "impact") {
    return (block.data as ImpactSectionConfig | undefined)?.cards?.length ?? 0;
  }

  if (block.key === "testimonials") {
    return (
      (block.data as TestimonialsSectionConfig | undefined)?.categories?.reduce(
        (total, category) => total + category.testimonials.length,
        0,
      ) ?? 0
    );
  }

  return 0;
}

export function getImpactCardLabel(card: ImpactCardConfig) {
  return card.shortLabel || card.title || card.id;
}
