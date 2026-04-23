import mongoose, { Schema, type Model, type InferSchemaType } from "mongoose";

export type ContentBlockKey =
  | "site"
  | "navigation"
  | "home_hero"
  | "clients_marquee"
  | "showcase_marquee"
  | "portfolio"
  | "portfolio_marquee"
  | "testimonials"
  | "impact"
  | "services"
  | "process_roadmap"
  | "faq"
  | "book_call"
  | "contact_page";

export const CONTENT_BLOCK_KEYS = [
  "site",
  "navigation",
  "home_hero",
  "clients_marquee",
  "showcase_marquee",
  "portfolio",
  "portfolio_marquee",
  "testimonials",
  "impact",
  "services",
  "process_roadmap",
  "faq",
  "book_call",
  "contact_page",
] as const satisfies readonly ContentBlockKey[];

export type ContentGroup = "site" | "navigation" | "home" | "contact";
export type ContentKind = "singleton" | "section" | "marquee" | "page";

export interface ContentImage {
  id?: string;
  src?: string;
  alt?: string;
  title?: string;
  desc?: string;
  color?: string;
  order?: number;
  width?: number;
  height?: number;
  link?: string;
  icon?: string;
  iconColor?: string;
  client?: string;
  priority?: boolean;
  [key: string]: unknown;
}

export interface ContentBlockSeed {
  key: ContentBlockKey;
  group: ContentGroup;
  kind: ContentKind;
  title?: string | string[];
  desc?: string;
  text?: string;
  color?: string;
  order?: number;
  images?: ContentImage[];
  items?: unknown[];
  data?: unknown;
  active?: boolean;
}

const ImageSchema = new Schema(
  {
    id: String,
    src: String,
    alt: String,
    title: Schema.Types.Mixed,
    desc: String,
    color: String,
    order: Number,
    width: Number,
    height: Number,
    link: String,
    icon: String,
    iconColor: String,
    client: String,
    priority: Boolean,
  },
  {
    _id: false,
    strict: false,
  },
);

const ContentBlockSchema = new Schema(
  {
    key: {
      type: String,
      enum: CONTENT_BLOCK_KEYS,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    group: {
      type: String,
      enum: ["site", "navigation", "home", "contact"],
      required: true,
      index: true,
    },
    kind: {
      type: String,
      enum: ["singleton", "section", "marquee", "page"],
      required: true,
      index: true,
    },
    title: Schema.Types.Mixed,
    desc: String,
    text: String,
    color: String,
    order: {
      type: Number,
      default: 0,
      index: true,
    },
    images: {
      type: [ImageSchema],
      default: [],
    },
    items: {
      type: [Schema.Types.Mixed],
      default: [],
    },
    data: Schema.Types.Mixed,
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
    schemaVersion: {
      type: Number,
      default: 1,
    },
  },
  {
    collection: "content_blocks",
    minimize: false,
    timestamps: true,
  },
);

ContentBlockSchema.index({ group: 1, order: 1 });
ContentBlockSchema.index({ key: 1, active: 1 });

export type ContentBlockDocument = InferSchemaType<typeof ContentBlockSchema>;

export const ContentBlockModel =
  (mongoose.models.ContentBlock as Model<ContentBlockDocument> | undefined) ??
  mongoose.model<ContentBlockDocument>("ContentBlock", ContentBlockSchema);

  