import "server-only";

import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import type { ImageMarqueeRow } from "@/components/ui/image-marquee";
import type {
  BookCallSectionConfig,
  FAQItem,
  FAQSectionConfig,
  HeaderConfig,
  HeroSectionConfig,
  ImpactCardConfig,
  ImpactSectionConfig,
  NavigationConfig,
  RoadmapSectionConfig,
  RoadmapStepConfig,
  ServicesSectionConfig,
  SiteConfig,
  TestimonialsSectionConfig,
} from "@/types";
import {
  TAG_CONTACT_PAGE,
  TAG_HEADER,
  TAG_NAVIGATION,
  TAG_SITE,
  tagForSection,
} from "./cache-tags";
import { connectMongo, hasMongoConfig } from "./client";
import type {
  ContactPageContent,
  HomeContent,
  LayoutContent,
} from "./content-defaults";
import {
  CONTENT_BLOCK_KEYS,
  ContentBlockModel,
  type ContentBlockKey,
  type ContentBlockSeed,
  type ContentImage,
} from "./models/content-block";
import { SITE_REVALIDATE_SECONDS } from "@/lib/site-revalidate";

const parsedContentRevalidateSeconds = Number(
  process.env.CONTENT_REVALIDATE_SECONDS ?? SITE_REVALIDATE_SECONDS,
);

const CONTENT_REVALIDATE_SECONDS =
  Number.isFinite(parsedContentRevalidateSeconds) &&
  parsedContentRevalidateSeconds > 0
    ? parsedContentRevalidateSeconds
    : SITE_REVALIDATE_SECONDS;

export type ContentBlockRecord = ContentBlockSeed & {
  createdAt?: string;
  updatedAt?: string;
  schemaVersion?: number;
  source?: "database";
};

export type ContentBlockUpdate = Partial<
  Omit<ContentBlockSeed, "key" | "group" | "kind">
> & {
  desc?: string;
  description?: string;
};

export function isContentBlockKey(value: string): value is ContentBlockKey {
  return (CONTENT_BLOCK_KEYS as readonly string[]).includes(value);
}

export function tagsForContentKey(key: ContentBlockKey) {
  switch (key) {
    case "site":
      return [TAG_SITE, TAG_HEADER, TAG_NAVIGATION];
    case "navigation":
      return [TAG_NAVIGATION, TAG_HEADER];
    case "contact_page":
      return [TAG_CONTACT_PAGE];
    case "portfolio_marquee":
      return [tagForSection("portfolio")];
    default:
      return [tagForSection(key)];
  }
}

export function pathsForContentKey(key: ContentBlockKey) {
  switch (key) {
    case "site":
    case "navigation":
      return ["/", "/contact"];
    case "contact_page":
      return ["/contact"];
    default:
      return ["/"];
  }
}

function cloneJson<T>(value: T): T {
  if (value === undefined || value === null) {
    return value;
  }

  return JSON.parse(JSON.stringify(value)) as T;
}

function serializeBlock(block: unknown): ContentBlockRecord | null {
  if (!block || typeof block !== "object") {
    return null;
  }

  const plain = JSON.parse(JSON.stringify(block)) as ContentBlockRecord & {
    _id?: string;
    __v?: number;
  };

  delete plain._id;
  delete plain.__v;
  return {
    ...plain,
    source: "database",
  };
}

function requireMongoContentStore() {
  if (!hasMongoConfig()) {
    throw new Error(
      "MongoDB is required for content storage. Set MONGODB_URI and MONGODB_DB.",
    );
  }
}

async function readContentBlockNoCache(key: ContentBlockKey) {
  requireMongoContentStore();
  await connectMongo();

  const block = await ContentBlockModel.findOne({ key }).lean().exec();
  const serializedBlock = serializeBlock(block);

  if (!serializedBlock) {
    throw new Error(
      `Content block "${key}" was not found in MongoDB. MongoDB is now the only content source.`,
    );
  }

  return serializedBlock;
}

export async function getContentBlock(key: ContentBlockKey) {
  return unstable_cache(
    () => readContentBlockNoCache(key),
    [`content-block:${key}`],
    {
      tags: tagsForContentKey(key),
      revalidate: CONTENT_REVALIDATE_SECONDS,
    },
  )();
}

export async function listContentBlocks() {
  requireMongoContentStore();
  await connectMongo();

  const blocks = await ContentBlockModel.find({})
    .sort({ group: 1, order: 1, key: 1 })
    .lean()
    .exec();

  return blocks
    .map(serializeBlock)
    .filter((block): block is ContentBlockRecord => Boolean(block))
    .sort((left, right) => (left.order ?? 0) - (right.order ?? 0));
}

function normalizeBlockUpdate(input: ContentBlockUpdate) {
  const update: Partial<ContentBlockSeed> = {};

  if ("title" in input) update.title = input.title;
  if ("desc" in input) update.desc = input.desc;
  if ("description" in input) update.desc = input.description;
  if ("text" in input) update.text = input.text;
  if ("color" in input) update.color = input.color;
  if ("order" in input) update.order = input.order;
  if ("images" in input) update.images = input.images;
  if ("items" in input) update.items = input.items;
  if ("data" in input) update.data = input.data;
  if ("active" in input) update.active = input.active;

  return update;
}

export async function upsertContentBlock(
  key: ContentBlockKey,
  input: ContentBlockUpdate,
) {
  requireMongoContentStore();

  const update = normalizeBlockUpdate(input);

  try {
    await connectMongo();

    const block = await ContentBlockModel.findOneAndUpdate(
      { key },
      {
        $set: update,
      },
      {
        new: true,
        runValidators: true,
        lean: true,
      },
    ).exec();

    if (!block) {
      throw new Error(
        `Content block "${key}" does not exist in MongoDB. Seed Mongo first, then update it.`,
      );
    }

    return serializeBlock(block);
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : `Failed to persist content block "${key}" to MongoDB.`,
    );
  }
}

export function revalidateContentKey(key: ContentBlockKey) {
  for (const tag of tagsForContentKey(key)) {
    revalidateTag(tag, "max");
  }

  for (const path of pathsForContentKey(key)) {
    revalidatePath(path);
  }
}

function requireBlockData<T>(block: ContentBlockSeed) {
  if (block.data === undefined || block.data === null) {
    throw new Error(
      `Content block "${block.key}" is missing structured MongoDB data.`,
    );
  }

  return cloneJson(block.data as T);
}

function applyHeroOverrides(
  hero: HeroSectionConfig,
  block: ContentBlockSeed,
): HeroSectionConfig {
  const next: HeroSectionConfig = {
    ...hero,
    badges: hero.badges?.map((badge) => ({ ...badge })),
  };

  if (block.title !== undefined) {
    next.title = block.title as HeroSectionConfig["title"];
  }

  if (block.desc !== undefined) {
    next.description = block.desc;
  }

  if (block.color && next.badges?.[0]) {
    next.badges[0] = {
      ...next.badges[0],
      tone: block.color,
    };
  }

  return next;
}

function blockImagesToMarqueeRows(
  block: ContentBlockSeed,
) {
  if (Array.isArray(block.data)) {
    return cloneJson(block.data as ImageMarqueeRow[]);
  }

  if (block.images?.length && !block.data) {
    const images = [...block.images].sort(
      (left, right) => (left.order ?? 0) - (right.order ?? 0),
    );

    return [
      {
        id: `${block.key}-row`,
        images: images.map((image) => {
          const cleanImage = { ...image };
          delete cleanImage.order;
          delete cleanImage.desc;
          return cleanImage as ImageMarqueeRow["images"][number];
        }),
      },
    ] satisfies ImageMarqueeRow[];
  }

  return [];
}

function resolveHeroBlock(
  block: ContentBlockSeed,
) {
  return applyHeroOverrides(requireBlockData<HeroSectionConfig>(block), block);
}

function resolveServicesBlock(block: ContentBlockSeed) {
  const data = requireBlockData<ServicesSectionConfig>(block);

  const services = block.items?.length
    ? block.items.map((item, index) => {
        const value = item as Record<string, unknown>;

        return {
          id: String(value.id ?? `service-${index + 1}`),
          icon: String(value.icon ?? "lucide:sparkles"),
          title: String(value.title ?? ""),
          description: String(value.description ?? value.desc ?? ""),
        };
      })
    : data.services;

  return {
    ...data,
    hero: applyHeroOverrides(data.hero, block),
    services,
  } satisfies ServicesSectionConfig;
}

function resolveRoadmapBlock(block: ContentBlockSeed) {
  const data = requireBlockData<RoadmapSectionConfig>(block);

  const items = block.items?.length
    ? block.items.map((item, index): RoadmapStepConfig => {
        const value = item as Record<string, unknown>;

        return {
          id: String(value.id ?? `roadmap-step-${index + 1}`),
          label: typeof value.label === "string" ? value.label : undefined,
          icon: typeof value.icon === "string" ? value.icon : undefined,
          title: String(value.title ?? ""),
          description: String(value.description ?? value.desc ?? ""),
        };
      })
    : data.items;

  return {
    ...data,
    hero: applyHeroOverrides(data.hero, block),
    items,
  } satisfies RoadmapSectionConfig;
}

function resolveFaqBlock(block: ContentBlockSeed) {
  const data = requireBlockData<FAQSectionConfig>(block);

  const items = block.items?.length
    ? block.items.map((item, index): FAQItem => {
        const value = item as Record<string, unknown>;

        return {
          id: String(value.id ?? `faq-${index + 1}`),
          question: String(value.question ?? value.title ?? ""),
          answer: String(value.answer ?? value.desc ?? ""),
        };
      })
    : data.items;

  return {
    ...data,
    title: block.title ?? data.title,
    description: block.desc ?? data.description,
    eyebrow: block.text ?? data.eyebrow,
    items,
  } satisfies FAQSectionConfig;
}

function resolveImpactBlock(block: ContentBlockSeed) {
  const data = requireBlockData<ImpactSectionConfig>(block);

  const exactCards = block.items?.filter((item): item is ImpactCardConfig => {
    const value = item as Partial<ImpactCardConfig>;
    return Boolean(value.id && value.slug && value.metric);
  });

  return {
    ...data,
    hero: applyHeroOverrides(data.hero, block),
    cards: exactCards?.length ? exactCards : data.cards,
  } satisfies ImpactSectionConfig;
}

function resolveTestimonialsBlock(block: ContentBlockSeed) {
  const data = requireBlockData<TestimonialsSectionConfig>(block);

  return {
    ...data,
    title: typeof block.title === "string" ? block.title : data.title,
    description: block.desc ?? data.description,
    eyebrow: block.text ?? data.eyebrow,
  } satisfies TestimonialsSectionConfig;
}

function resolveBookCallBlock(block: ContentBlockSeed) {
  const data = requireBlockData<BookCallSectionConfig>(block);

  return {
    ...data,
    hero: applyHeroOverrides(data.hero, block),
  } satisfies BookCallSectionConfig;
}

function resolveSiteBlock(block: ContentBlockSeed) {
  const data = requireBlockData<SiteConfig>(block);
  const brandImage = block.images?.[0];

  return {
    ...data,
    name: typeof block.title === "string" ? block.title : data.name,
    description: block.desc ?? data.description,
    tagline: block.text ?? data.tagline,
    brand: {
      ...data.brand,
      logoSrc: brandImage?.src ?? data.brand.logoSrc,
      logoAlt: brandImage?.alt ?? data.brand.logoAlt,
      role: brandImage?.desc ?? data.brand.role,
    },
  } satisfies SiteConfig;
}

function resolveNavigationBlock(
  block: ContentBlockSeed,
  site: SiteConfig,
): Pick<LayoutContent, "header" | "navigation"> {
  const data = requireBlockData<{
    header: HeaderConfig;
    navigation: NavigationConfig;
  }>(block);

  const brandImage = block.images?.[0];
  const header: HeaderConfig = {
    ...data.header,
    availabilityLabel: block.text ?? data.header.availabilityLabel,
    brand: {
      ...data.header.brand,
      name: typeof block.title === "string" ? block.title : site.name,
      role: block.desc ?? site.brand.role,
      logoSrc: brandImage?.src ?? site.brand.logoSrc,
      logoAlt: brandImage?.alt ?? site.brand.logoAlt,
    },
  };

  return {
    header,
    navigation: data.navigation,
  };
}

export async function getLayoutContent(): Promise<LayoutContent> {
  const [siteBlock, navigationBlock] = await Promise.all([
    getContentBlock("site"),
    getContentBlock("navigation"),
  ]);

  const site = resolveSiteBlock(siteBlock);
  const { header, navigation } = resolveNavigationBlock(navigationBlock, site);

  return {
    site,
    header,
    navigation,
  };
}

export async function getHomeContent(): Promise<HomeContent> {
  const [
    homeHeroBlock,
    clientsMarqueeBlock,
    showcaseMarqueeBlock,
    portfolioBlock,
    portfolioMarqueeBlock,
    testimonialsBlock,
    impactBlock,
    servicesBlock,
    processRoadmapBlock,
    faqBlock,
    bookCallBlock,
  ] = await Promise.all([
    getContentBlock("home_hero"),
    getContentBlock("clients_marquee"),
    getContentBlock("showcase_marquee"),
    getContentBlock("portfolio"),
    getContentBlock("portfolio_marquee"),
    getContentBlock("testimonials"),
    getContentBlock("impact"),
    getContentBlock("services"),
    getContentBlock("process_roadmap"),
    getContentBlock("faq"),
    getContentBlock("book_call"),
  ]);

  return {
    homeHero: resolveHeroBlock(homeHeroBlock),
    clientsMarquee: blockImagesToMarqueeRows(clientsMarqueeBlock),
    showcaseMarquee: blockImagesToMarqueeRows(showcaseMarqueeBlock),
    portfolio: resolveHeroBlock(portfolioBlock),
    portfolioMarquee: blockImagesToMarqueeRows(portfolioMarqueeBlock),
    testimonials: resolveTestimonialsBlock(testimonialsBlock),
    impact: resolveImpactBlock(impactBlock),
    services: resolveServicesBlock(servicesBlock),
    processRoadmap: resolveRoadmapBlock(processRoadmapBlock),
    faq: resolveFaqBlock(faqBlock),
    bookCall: resolveBookCallBlock(bookCallBlock),
  };
}

export async function getContactPageContent(): Promise<ContactPageContent> {
  const block = await getContentBlock("contact_page");
  const data = requireBlockData<ContactPageContent>(block);

  return {
    ...data,
    hero: applyHeroOverrides(data.hero, block),
    direct: {
      ...data.direct,
      desc: block.text ?? data.direct.desc,
    },
  };
}

export function sanitizeContentImages(value: unknown) {
  if (!Array.isArray(value)) {
    return undefined;
  }

  return value.filter((item): item is ContentImage => {
    return Boolean(item && typeof item === "object");
  });
}
