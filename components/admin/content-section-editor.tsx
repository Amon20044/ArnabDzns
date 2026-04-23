"use client";

import {
  ImagePlusIcon,
  Link2Icon,
  LoaderCircleIcon,
  Trash2Icon,
  UploadCloudIcon,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { EditorModal } from "@/components/admin/editor-modal";
import { MarqueeRowsEditor } from "@/components/admin/marquee-rows-editor";
import type { ImageMarqueeRow } from "@/components/ui/image-marquee";
import { Button } from "@/components/ui/button";
import {
  ColorField,
  CollectionEditor,
  EditorSection,
  IconField,
  LongTextField,
  NumberField,
  SectionGrid,
  SelectField,
  StringListEditor,
  TextField,
  ToggleField,
} from "@/components/admin/content-editor-fields";
import type { ContactPageContent } from "@/db/content-defaults";
import type { ContentBlockKey } from "@/db/models/content-block";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type {
  BookCallSectionConfig,
  CTAConfig,
  FAQItem,
  FAQSectionConfig,
  HeaderConfig,
  HeroBadgeConfig,
  HeroCTAConfig,
  HeroSectionConfig,
  ImpactBreakdownSegment,
  ImpactCardConfig,
  ImpactComparisonPoint,
  ImpactPartner,
  ImpactSectionConfig,
  NavItemConfig,
  NavigationConfig,
  RoadmapSectionConfig,
  RoadmapStepConfig,
  ServiceCardItem,
  ServicesSectionConfig,
  SiteConfig,
  TestimonialAvatar,
  TestimonialCategory,
  TestimonialItem,
  TestimonialsSectionConfig,
} from "@/types";
import { cn } from "@/lib/utils";

type NavigationEditorData = {
  header: HeaderConfig;
  navigation: NavigationConfig;
};

type SiteSocialLink = SiteConfig["social"][number];
type HeaderSocialLink = HeaderConfig["socials"][number];

const CTA_ICON_OPTIONS = [
  { label: "Arrow Right", value: "arrow-right" },
  { label: "None", value: "none" },
];

const HERO_CTA_TONE_OPTIONS = [
  { label: "Default", value: "default" },
  { label: "White", value: "white" },
  { label: "WhatsApp", value: "whatsapp" },
];

const HERO_ICON_VISIBILITY_OPTIONS = [
  { label: "Always", value: "always" },
  { label: "On hover", value: "hover" },
];

const CTA_VARIANT_OPTIONS = [
  { label: "Primary", value: "primary" },
  { label: "Secondary", value: "secondary" },
];

const ROADMAP_SIDE_OPTIONS = [
  { label: "Left", value: "left" },
  { label: "Right", value: "right" },
];

const TREND_DIRECTION_OPTIONS = [
  { label: "Up", value: "up" },
  { label: "Down", value: "down" },
  { label: "Flat", value: "flat" },
];

const TREND_STATUS_OPTIONS = [
  { label: "Positive", value: "positive" },
  { label: "Neutral", value: "neutral" },
  { label: "Negative", value: "negative" },
];

const IMPACT_CARD_TYPE_OPTIONS = [
  { label: "Featured", value: "featured" },
  { label: "Stat", value: "stat" },
  { label: "Stat + Trend", value: "stat-trend" },
  { label: "Collaboration Count", value: "collaboration-count" },
  { label: "Comparison", value: "comparison" },
  { label: "Before / After", value: "before-after" },
  { label: "Bar Visualization", value: "bar-visualization" },
  { label: "Sparkline", value: "sparkline" },
  { label: "Breakdown", value: "breakdown" },
  { label: "Partner Mix", value: "partner-mix" },
];

const IMPACT_CARD_SIZE_OPTIONS = [
  { label: "Small", value: "sm" },
  { label: "Medium", value: "md" },
  { label: "Wide", value: "wide" },
  { label: "Tall", value: "tall" },
  { label: "Hero", value: "hero" },
];

const IMPACT_CHART_KIND_OPTIONS = [
  { label: "Sparkline", value: "sparkline" },
  { label: "Bars", value: "bars" },
  { label: "Area", value: "area" },
  { label: "Donut", value: "donut" },
];

function titleToMultiline(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value.join("\n");
  }

  return value ?? "";
}

function multilineToTitle(value: string) {
  const lines = value
    .split(/\r?\n/g)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length <= 1) {
    return lines[0] ?? "";
  }

  return lines;
}

function createHeroBadge(): HeroBadgeConfig {
  return {
    id: "",
    label: "",
    icon: "sparkles",
    tone: "#18181b",
    textColor: "#ffffff",
    iconColor: "#ffffff",
    indicatorColor: "#22c55e",
    showInMobile: true,
    pulse: false,
    starCount: 5,
  };
}

function createHeroCta(): HeroCTAConfig {
  return {
    label: "",
    href: "",
    external: false,
    icon: "arrow-right",
    iconVisibility: "hover",
    tone: "default",
  };
}

function createSiteSocialLink(): SiteSocialLink {
  return {
    platform: "",
    url: "",
    label: "",
    seo: false,
  };
}

function createHeaderSocialLink(): HeaderSocialLink {
  return {
    id: "",
    label: "",
    href: "",
  };
}

function createNavItem(): NavItemConfig {
  return {
    id: "",
    label: "",
    path: "",
    sectionId: "",
    isNew: false,
  };
}

function createNavCta(): CTAConfig {
  return {
    label: "",
    variant: "primary",
    path: "",
    href: "",
    icon: "phone-call",
  };
}

function createServiceItem(): ServiceCardItem {
  return {
    id: "",
    icon: "lucide:sparkles",
    title: "",
    description: "",
  };
}

function createRoadmapItem(): RoadmapStepConfig {
  return {
    id: "",
    label: "",
    icon: "target",
    title: "",
    description: "",
  };
}

function createFaqItem(): FAQItem {
  return {
    id: "",
    question: "",
    answer: "",
  };
}

function createTestimonialAvatar(): TestimonialAvatar {
  return {
    src: "",
    alt: "",
    fallback: "",
  };
}

type UploadedImageAsset = {
  id?: string;
  src: string;
  displaySrc?: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
  alt?: string;
  title?: string;
  desc?: string;
};

type UploadResponse = {
  assets?: UploadedImageAsset[];
  error?: string;
};

function inferAvatarFallback(value: string) {
  const parts = value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (!parts.length) {
    return "";
  }

  return parts
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function getAvatarSummaryLabel(avatar: TestimonialAvatar, fallbackLabel: string) {
  return avatar.alt?.trim() || avatar.fallback?.trim() || fallbackLabel;
}

function AvatarPreview({
  avatar,
  label,
  size = 56,
  className,
}: {
  avatar: TestimonialAvatar;
  label: string;
  size?: number;
  className?: string;
}) {
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    setErrored(false);
  }, [avatar.src]);

  const fallbackLabel =
    avatar.fallback?.trim() || inferAvatarFallback(avatar.alt) || "NA";

  if (!avatar.src || errored) {
    return (
      <span
        aria-label={avatar.alt || label}
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-full bg-accent-muted text-xs font-semibold uppercase tracking-[0.18em] text-accent-dark ring-1 ring-black/8",
          className,
        )}
        style={{ width: size, height: size }}
      >
        {fallbackLabel}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 overflow-hidden rounded-full bg-white ring-1 ring-black/8",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <img
        src={avatar.src}
        alt={avatar.alt || label}
        className="h-full w-full object-cover"
        loading="lazy"
        onError={() => setErrored(true)}
      />
    </span>
  );
}

function AvatarImageField({
  label,
  value,
  fallbackLabel,
  onChange,
}: {
  label: string;
  value: TestimonialAvatar;
  fallbackLabel: string;
  onChange: (value: TestimonialAvatar) => void;
}) {
  const [open, setOpen] = useState(false);
  const [urlDraft, setUrlDraft] = useState(value.src ?? "");
  const [feedback, setFeedback] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const summaryLabel = getAvatarSummaryLabel(value, fallbackLabel);

  function openModal() {
    setUrlDraft(value.src ?? "");
    setFeedback("");
    setOpen(true);
  }

  function closeModal() {
    setFeedback("");
    setOpen(false);
  }

  function applyImage(src: string, suggestedAlt?: string) {
    const normalizedSrc = src.trim();
    const nextAlt = value.alt?.trim() || suggestedAlt?.trim() || "";
    const nextFallback = value.fallback?.trim() || inferAvatarFallback(nextAlt);

    onChange({
      ...value,
      src: normalizedSrc,
      alt: nextAlt,
      fallback: nextFallback,
    });
  }

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setIsUploading(true);
    setFeedback("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/uploads/imgbb", {
        method: "POST",
        credentials: "same-origin",
        body: formData,
      });
      const result = (await response.json()) as UploadResponse;

      if (!response.ok) {
        throw new Error(result.error ?? "Image upload failed.");
      }

      const asset = result.assets?.[0];

      if (!asset?.src) {
        throw new Error("ImgBB did not return an image URL.");
      }

      applyImage(asset.src, asset.alt ?? asset.title);
      setUrlDraft(asset.src);
      setOpen(false);
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "Image upload failed.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  function handleApplyUrl() {
    const trimmedUrl = urlDraft.trim();

    if (!trimmedUrl) {
      setFeedback("Paste a direct image URL first.");
      return;
    }

    applyImage(trimmedUrl);
    setFeedback("");
    setOpen(false);
  }

  function clearImage() {
    onChange({
      ...value,
      src: "",
    });
    setUrlDraft("");
    setFeedback("");
    setOpen(false);
  }

  return (
    <>
      <Field className="md:col-span-2">
        <FieldLabel>{label}</FieldLabel>
        <FieldContent>
          <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/70 p-3">
            <AvatarPreview avatar={value} label={summaryLabel} size={52} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {value.src || "No image selected yet."}
              </p>
              <FieldDescription>
                Upload to ImgBB or paste a public direct image URL. Save the
                section afterward to persist it to Mongo.
              </FieldDescription>
            </div>
            <Button type="button" variant="outline" onClick={openModal}>
              <ImagePlusIcon />
              Manage
            </Button>
          </div>
        </FieldContent>
      </Field>

      <EditorModal
        open={open}
        onClose={closeModal}
        title={label}
        description="Upload a fresh image to ImgBB or use an existing direct image URL."
        size="md"
      >
        <div className="grid gap-4">
          <div className="rounded-2xl border border-border/70 bg-white/80 p-4">
            <p className="text-sm font-semibold text-foreground">Current preview</p>
            <div className="mt-3 flex items-center gap-3">
              <AvatarPreview avatar={value} label={summaryLabel} size={64} />
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {summaryLabel}
                </p>
                <p className="mt-1 break-all text-xs text-muted-foreground">
                  {value.src || "No image URL selected yet."}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-white/80 p-4">
            <p className="text-sm font-semibold text-foreground">Upload image</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Pick a local file and we will upload it to ImgBB, then drop the
              final URL into this avatar.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <LoaderCircleIcon className="animate-spin" />
                ) : (
                  <UploadCloudIcon />
                )}
                {isUploading ? "Uploading..." : "Choose image"}
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-white/80 p-4">
            <p className="text-sm font-semibold text-foreground">Use image URL</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Paste a public image URL. The live site will render it directly,
              so the source must stay available and allow hotlinking.
            </p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <Input
                value={urlDraft}
                onChange={(event) => setUrlDraft(event.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={handleApplyUrl}>
                <Link2Icon />
                Use URL
              </Button>
            </div>
          </div>

          {feedback ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {feedback}
            </div>
          ) : null}

          {value.src ? (
            <div className="flex justify-end">
              <Button type="button" variant="destructive" onClick={clearImage}>
                <Trash2Icon />
                Clear image
              </Button>
            </div>
          ) : null}
        </div>
      </EditorModal>
    </>
  );
}

function createTestimonialItem(): TestimonialItem {
  return {
    id: "",
    name: "",
    metaLabel: "",
    message: "",
    rating: 5,
    avatar: createTestimonialAvatar(),
    source: {
      href: "",
      external: false,
    },
    publishedAt: "",
  };
}

function createTestimonialCategory(): TestimonialCategory {
  return {
    id: "",
    label: "",
    shortLabel: "",
    icon: "users",
    description: "",
    trustedBy: {
      label: "",
      avatars: [createTestimonialAvatar()],
    },
    testimonials: [createTestimonialItem()],
  };
}

function createImpactComparisonPoint(): ImpactComparisonPoint {
  return {
    label: "",
    value: 0,
    display: "",
  };
}

function createImpactBreakdownSegment(): ImpactBreakdownSegment {
  return {
    id: "",
    label: "",
    value: 0,
    share: 0,
    accent: "violet",
  };
}

function createImpactPartner(): ImpactPartner {
  return {
    id: "",
    name: "",
    role: "",
  };
}

function createImpactCard(): ImpactCardConfig {
  return {
    id: "",
    slug: "",
    title: "",
    subtitle: "",
    shortLabel: "",
    category: "",
    tags: [],
    type: "stat",
    size: "md",
    accent: "violet",
    priority: 0,
    featured: false,
    active: true,
    metric: {
      value: 0,
      unit: "",
      display: "",
      label: "",
    },
    trend: {
      direction: "up",
      status: "positive",
      changePercent: 0,
      display: "",
      timeframe: "",
    },
    comparison: {
      baseline: createImpactComparisonPoint(),
      current: createImpactComparisonPoint(),
      multiplier: "",
    },
    beforeAfter: {
      baseline: createImpactComparisonPoint(),
      current: createImpactComparisonPoint(),
      multiplier: "",
    },
    chart: {
      kind: "sparkline",
      points: [{ label: "", value: 0 }],
      max: 0,
    },
    breakdown: [createImpactBreakdownSegment()],
    partners: [createImpactPartner()],
    campaignStats: {
      impressions: 0,
      likes: 0,
      reach: 0,
      engagementRate: 0,
      clickThroughRate: 0,
    },
    bodySlug: "",
    metadata: {},
    createdAt: "",
    updatedAt: "",
  };
}

function HeroCtaFields({
  title,
  value,
  emptyValue,
  onChange,
}: {
  title: string;
  value: HeroCTAConfig | false | undefined;
  emptyValue: false | undefined;
  onChange: (value: HeroCTAConfig | false | undefined) => void;
}) {
  const isEnabled = value !== false && value !== undefined;

  return (
    <EditorSection
      title={title}
      description="Optional call-to-action button for this section."
    >
      <div className="grid gap-4">
        <ToggleField
          label={isEnabled ? "CTA enabled" : "CTA disabled"}
          checked={isEnabled}
          onCheckedChange={(checked) =>
            onChange(checked ? createHeroCta() : emptyValue)
          }
          description="Turn this button on or off without losing the rest of the section."
        />
        {isEnabled ? (
          <SectionGrid>
            <TextField
              label="Label"
              value={value?.label}
              onChange={(label) => onChange({ ...(value as HeroCTAConfig), label })}
            />
            <TextField
              label="Href"
              value={value?.href}
              onChange={(href) => onChange({ ...(value as HeroCTAConfig), href })}
            />
            <SelectField
              label="Icon"
              value={value?.icon}
              onChange={(icon) =>
                onChange({
                  ...(value as HeroCTAConfig),
                  icon: icon as HeroCTAConfig["icon"],
                })
              }
              options={CTA_ICON_OPTIONS}
            />
            <SelectField
              label="Icon visibility"
              value={value?.iconVisibility}
              onChange={(iconVisibility) =>
                onChange({
                  ...(value as HeroCTAConfig),
                  iconVisibility:
                    iconVisibility as HeroCTAConfig["iconVisibility"],
                })
              }
              options={HERO_ICON_VISIBILITY_OPTIONS}
            />
            <SelectField
              label="Tone"
              value={value?.tone}
              onChange={(tone) =>
                onChange({
                  ...(value as HeroCTAConfig),
                  tone: tone as HeroCTAConfig["tone"],
                })
              }
              options={HERO_CTA_TONE_OPTIONS}
            />
            <ToggleField
              label="Open externally"
              checked={Boolean(value?.external)}
              onCheckedChange={(external) =>
                onChange({ ...(value as HeroCTAConfig), external })
              }
              description="Use for external scheduling, social, or WhatsApp links."
            />
          </SectionGrid>
        ) : null}
      </div>
    </EditorSection>
  );
}

function HeroBadgesEditor({
  badges,
  onChange,
}: {
  badges: HeroBadgeConfig[] | undefined;
  onChange: (value: HeroBadgeConfig[]) => void;
}) {
  return (
    <CollectionEditor
      title="Hero Badges"
      description="Reusable pill badges shown above the main title."
      items={badges ?? []}
      onChange={onChange}
      createItem={createHeroBadge}
      addLabel="Add badge"
      emptyText="No badges yet. Add one to surface credibility, status, or highlights."
      getItemLabel={(badge, index) => badge.label || badge.id || `Badge ${index + 1}`}
      renderItem={(badge, _index, onItemChange) => (
        <div className="grid gap-4">
          <SectionGrid>
            <TextField
              label="ID"
              value={badge.id}
              onChange={(id) => onItemChange({ ...badge, id })}
            />
            <TextField
              label="Label"
              value={badge.label}
              onChange={(label) => onItemChange({ ...badge, label })}
            />
            <IconField
              label="Icon"
              value={badge.icon}
              onChange={(icon) =>
                onItemChange({
                  ...badge,
                  icon: icon as HeroBadgeConfig["icon"],
                })
              }
              description='Use ids like "sparkles", "chart", or "shield-check".'
            />
            <NumberField
              label="Star count"
              value={badge.starCount}
              onChange={(starCount) => onItemChange({ ...badge, starCount })}
            />
            <ColorField
              label="Tone"
              value={badge.tone}
              onChange={(tone) => onItemChange({ ...badge, tone })}
              placeholder="#18181b"
            />
            <ColorField
              label="Text color"
              value={badge.textColor}
              onChange={(textColor) => onItemChange({ ...badge, textColor })}
              placeholder="#ffffff"
            />
            <ColorField
              label="Icon color"
              value={badge.iconColor}
              onChange={(iconColor) => onItemChange({ ...badge, iconColor })}
              placeholder="#ffffff"
            />
            <ColorField
              label="Indicator color"
              value={badge.indicatorColor}
              onChange={(indicatorColor) =>
                onItemChange({ ...badge, indicatorColor })
              }
              placeholder="#22c55e"
            />
          </SectionGrid>
          <SectionGrid>
            <ToggleField
              label="Show on mobile"
              checked={badge.showInMobile !== false}
              onCheckedChange={(showInMobile) =>
                onItemChange({ ...badge, showInMobile })
              }
            />
            <ToggleField
              label="Pulse animation"
              checked={Boolean(badge.pulse)}
              onCheckedChange={(pulse) => onItemChange({ ...badge, pulse })}
            />
          </SectionGrid>
        </div>
      )}
    />
  );
}

function HeroEditor({
  title,
  value,
  onChange,
}: {
  title?: string;
  value: HeroSectionConfig;
  onChange: (value: HeroSectionConfig) => void;
}) {
  return (
    <div className="grid gap-4">
      <EditorSection
        title={title ?? "Hero Copy"}
        description="Shared hero structure used across sections."
      >
        <div className="grid gap-4">
          <SectionGrid>
            <TextField
              label="Eyebrow"
              value={value.eyebrow}
              onChange={(eyebrow) => onChange({ ...value, eyebrow })}
            />
            <LongTextField
              label="Title"
              value={titleToMultiline(value.title)}
              onChange={(nextTitle) =>
                onChange({ ...value, title: multilineToTitle(nextTitle) })
              }
              rows={3}
              description="Use multiple lines to preserve the designed line breaks."
            />
          </SectionGrid>
          <LongTextField
            label="Description"
            value={value.description}
            onChange={(description) => onChange({ ...value, description })}
            rows={4}
          />
        </div>
      </EditorSection>
      <HeroCtaFields
        title="Primary CTA"
        value={value.cta}
        emptyValue={false}
        onChange={(cta) => onChange({ ...value, cta })}
      />
      <HeroCtaFields
        title="Secondary CTA"
        value={value.secondaryCta}
        emptyValue={undefined}
        onChange={(secondaryCta) =>
          onChange({ ...value, secondaryCta: secondaryCta || undefined })
        }
      />
      <HeroBadgesEditor
        badges={value.badges}
        onChange={(badges) => onChange({ ...value, badges })}
      />
    </div>
  );
}

function SiteSocialLinksEditor({
  items,
  onChange,
}: {
  items: SiteSocialLink[];
  onChange: (items: SiteSocialLink[]) => void;
}) {
  return (
    <CollectionEditor
      title="Site Social Links"
      description="Site-wide social links used in metadata and the UI."
      items={items}
      onChange={onChange}
      createItem={createSiteSocialLink}
      addLabel="Add social link"
      emptyText="No social links configured yet."
      getItemLabel={(item, index) => item.label || item.platform || `Social ${index + 1}`}
      renderItem={(item, _index, onItemChange) => (
        <div className="grid gap-4">
          <SectionGrid>
            <TextField
              label="Platform"
              value={item.platform}
              onChange={(platform) => onItemChange({ ...item, platform })}
            />
            <TextField
              label="Label"
              value={item.label}
              onChange={(label) => onItemChange({ ...item, label })}
            />
            <TextField
              label="URL"
              value={item.url}
              onChange={(url) => onItemChange({ ...item, url })}
            />
            <ToggleField
              label="Include in SEO"
              checked={Boolean(item.seo)}
              onCheckedChange={(seo) => onItemChange({ ...item, seo })}
            />
          </SectionGrid>
        </div>
      )}
    />
  );
}

function HeaderSocialLinksEditor({
  items,
  onChange,
}: {
  items: HeaderSocialLink[];
  onChange: (items: HeaderSocialLink[]) => void;
}) {
  return (
    <CollectionEditor
      title="Header Social Links"
      description="Compact social links shown in the navigation header."
      items={items}
      onChange={onChange}
      createItem={createHeaderSocialLink}
      addLabel="Add header social"
      emptyText="No header socials yet."
      getItemLabel={(item, index) => item.label || item.id || `Header social ${index + 1}`}
      renderItem={(item, _index, onItemChange) => (
        <SectionGrid>
          <TextField
            label="ID"
            value={item.id}
            onChange={(id) => onItemChange({ ...item, id })}
          />
          <TextField
            label="Label"
            value={item.label}
            onChange={(label) => onItemChange({ ...item, label })}
          />
          <TextField
            label="Href"
            value={item.href}
            onChange={(href) => onItemChange({ ...item, href })}
          />
        </SectionGrid>
      )}
    />
  );
}

function NavigationItemsEditor({
  items,
  onChange,
}: {
  items: NavItemConfig[];
  onChange: (items: NavItemConfig[]) => void;
}) {
  return (
    <CollectionEditor
      title="Navigation Items"
      description="Main navigation items used across the site."
      items={items}
      onChange={onChange}
      createItem={createNavItem}
      addLabel="Add navigation item"
      emptyText="No navigation items configured yet."
      getItemLabel={(item, index) => item.label || item.id || `Item ${index + 1}`}
      renderItem={(item, _index, onItemChange) => (
        <div className="grid gap-4">
          <SectionGrid>
            <TextField
              label="ID"
              value={item.id}
              onChange={(id) => onItemChange({ ...item, id })}
            />
            <TextField
              label="Label"
              value={item.label}
              onChange={(label) => onItemChange({ ...item, label })}
            />
            <TextField
              label="Path"
              value={item.path}
              onChange={(path) => onItemChange({ ...item, path })}
            />
            <TextField
              label="Section ID"
              value={item.sectionId}
              onChange={(sectionId) => onItemChange({ ...item, sectionId })}
            />
          </SectionGrid>
          <ToggleField
            label="Mark as new"
            checked={Boolean(item.isNew)}
            onCheckedChange={(isNew) => onItemChange({ ...item, isNew })}
          />
        </div>
      )}
    />
  );
}

function NavigationCtasEditor({
  items,
  onChange,
}: {
  items: CTAConfig[];
  onChange: (items: CTAConfig[]) => void;
}) {
  return (
    <CollectionEditor
      title="Navigation CTAs"
      description="Primary and secondary call-to-action buttons in the nav."
      items={items}
      onChange={onChange}
      createItem={createNavCta}
      addLabel="Add navigation CTA"
      emptyText="No navigation CTAs configured yet."
      getItemLabel={(item, index) => item.label || `CTA ${index + 1}`}
      renderItem={(item, _index, onItemChange) => (
        <div className="grid gap-4">
          <SectionGrid>
            <TextField
              label="Label"
              value={item.label}
              onChange={(label) => onItemChange({ ...item, label })}
            />
            <SelectField
              label="Variant"
              value={item.variant}
              onChange={(variant) =>
                onItemChange({ ...item, variant: variant as CTAConfig["variant"] })
              }
              options={CTA_VARIANT_OPTIONS}
            />
            <TextField
              label="Path"
              value={item.path}
              onChange={(path) => onItemChange({ ...item, path })}
            />
            <TextField
              label="Href"
              value={item.href}
              onChange={(href) => onItemChange({ ...item, href })}
            />
            <IconField
              label="Icon"
              value={item.icon}
              onChange={(icon) => onItemChange({ ...item, icon })}
            />
          </SectionGrid>
        </div>
      )}
    />
  );
}

function ServiceItemsEditor({
  items,
  onChange,
}: {
  items: ServiceCardItem[];
  onChange: (items: ServiceCardItem[]) => void;
}) {
  return (
    <CollectionEditor
      title="Service Cards"
      description="Each card powers one service tile in the section."
      items={items}
      onChange={onChange}
      createItem={createServiceItem}
      addLabel="Add service"
      emptyText="No services configured yet."
      getItemLabel={(item, index) => item.title || item.id || `Service ${index + 1}`}
      renderItem={(item, _index, onItemChange) => (
        <div className="grid gap-4">
          <SectionGrid>
            <TextField
              label="ID"
              value={item.id}
              onChange={(id) => onItemChange({ ...item, id })}
            />
            <IconField
              label="Icon"
              value={item.icon}
              onChange={(icon) => onItemChange({ ...item, icon })}
            />
            <TextField
              label="Title"
              value={item.title}
              onChange={(title) => onItemChange({ ...item, title })}
            />
          </SectionGrid>
          <LongTextField
            label="Description"
            value={item.description}
            onChange={(description) => onItemChange({ ...item, description })}
            rows={4}
          />
        </div>
      )}
    />
  );
}

function RoadmapItemsEditor({
  items,
  onChange,
}: {
  items: RoadmapStepConfig[];
  onChange: (items: RoadmapStepConfig[]) => void;
}) {
  return (
    <CollectionEditor
      title="Roadmap Steps"
      description="Timeline steps shown in the process section."
      items={items}
      onChange={onChange}
      createItem={createRoadmapItem}
      addLabel="Add roadmap step"
      emptyText="No roadmap steps configured yet."
      getItemLabel={(item, index) => item.title || item.id || `Step ${index + 1}`}
      renderItem={(item, _index, onItemChange) => (
        <div className="grid gap-4">
          <SectionGrid>
            <TextField
              label="ID"
              value={item.id}
              onChange={(id) => onItemChange({ ...item, id })}
            />
            <TextField
              label="Step label"
              value={item.label}
              onChange={(label) => onItemChange({ ...item, label })}
            />
            <IconField
              label="Icon"
              value={item.icon}
              onChange={(icon) => onItemChange({ ...item, icon })}
            />
            <TextField
              label="Title"
              value={item.title}
              onChange={(title) => onItemChange({ ...item, title })}
            />
          </SectionGrid>
          <LongTextField
            label="Description"
            value={item.description}
            onChange={(description) => onItemChange({ ...item, description })}
            rows={4}
          />
        </div>
      )}
    />
  );
}

function FaqItemsEditor({
  items,
  onChange,
}: {
  items: FAQItem[];
  onChange: (items: FAQItem[]) => void;
}) {
  return (
    <CollectionEditor
      title="FAQ Items"
      description="Question and answer pairs shown inside the accordion."
      items={items}
      onChange={onChange}
      createItem={createFaqItem}
      addLabel="Add FAQ item"
      emptyText="No FAQ items configured yet."
      getItemLabel={(item, index) =>
        item.question || item.id || `FAQ item ${index + 1}`
      }
      renderItem={(item, _index, onItemChange) => (
        <div className="grid gap-4">
          <SectionGrid>
            <TextField
              label="ID"
              value={item.id}
              onChange={(id) => onItemChange({ ...item, id })}
            />
            <TextField
              label="Question"
              value={item.question}
              onChange={(question) => onItemChange({ ...item, question })}
            />
          </SectionGrid>
          <LongTextField
            label="Answer"
            value={item.answer}
            onChange={(answer) => onItemChange({ ...item, answer })}
            rows={5}
          />
        </div>
      )}
    />
  );
}

function TestimonialAvatarsEditor({
  items,
  onChange,
}: {
  items: TestimonialAvatar[];
  onChange: (items: TestimonialAvatar[]) => void;
}) {
  return (
    <CollectionEditor
      title="Trusted By Avatars"
      description="Avatar stack shown above the active testimonial category."
      items={items}
      onChange={onChange}
      createItem={createTestimonialAvatar}
      addLabel="Add avatar"
      emptyText="No avatars configured yet."
      getItemLabel={(item, index) => item.alt || item.fallback || `Avatar ${index + 1}`}
      renderItem={(item, _index, onItemChange) => (
        <SectionGrid>
          <AvatarImageField
            label="Image source"
            value={item}
            fallbackLabel="Trusted avatar"
            onChange={onItemChange}
          />
          <TextField
            label="Alt text"
            value={item.alt}
            onChange={(alt) => onItemChange({ ...item, alt })}
          />
          <TextField
            label="Fallback"
            value={item.fallback}
            onChange={(fallback) => onItemChange({ ...item, fallback })}
          />
        </SectionGrid>
      )}
    />
  );
}

function TestimonialItemsEditor({
  items,
  onChange,
}: {
  items: TestimonialItem[];
  onChange: (items: TestimonialItem[]) => void;
}) {
  return (
    <CollectionEditor
      title="Testimonials"
      description="Quotes, author details, and optional source links."
      items={items}
      onChange={onChange}
      createItem={createTestimonialItem}
      addLabel="Add testimonial"
      emptyText="No testimonials configured yet."
      getItemLabel={(item, index) => item.name || item.id || `Testimonial ${index + 1}`}
      renderItem={(item, _index, onItemChange) => (
        <div className="grid gap-4">
          <SectionGrid>
            <TextField
              label="ID"
              value={item.id}
              onChange={(id) => onItemChange({ ...item, id })}
            />
            <TextField
              label="Name"
              value={item.name}
              onChange={(name) => onItemChange({ ...item, name })}
            />
            <TextField
              label="Meta label"
              value={item.metaLabel}
              onChange={(metaLabel) => onItemChange({ ...item, metaLabel })}
            />
            <NumberField
              label="Rating"
              value={item.rating}
              onChange={(rating) => onItemChange({ ...item, rating })}
            />
            <AvatarImageField
              label="Avatar source"
              value={item.avatar}
              fallbackLabel={item.name || "Testimonial avatar"}
              onChange={(avatar) => onItemChange({ ...item, avatar })}
            />
            <TextField
              label="Avatar alt"
              value={item.avatar.alt}
              onChange={(alt) =>
                onItemChange({ ...item, avatar: { ...item.avatar, alt } })
              }
            />
            <TextField
              label="Avatar fallback"
              value={item.avatar.fallback}
              onChange={(fallback) =>
                onItemChange({ ...item, avatar: { ...item.avatar, fallback } })
              }
            />
            <TextField
              label="Published at"
              value={item.publishedAt}
              onChange={(publishedAt) => onItemChange({ ...item, publishedAt })}
            />
          </SectionGrid>
          <LongTextField
            label="Message"
            value={item.message}
            onChange={(message) => onItemChange({ ...item, message })}
            rows={5}
          />
          <SectionGrid>
            <TextField
              label="Source href"
              value={item.source?.href}
              onChange={(href) =>
                onItemChange({
                  ...item,
                  source: { ...(item.source ?? { external: false }), href },
                })
              }
            />
            <ToggleField
              label="Source opens externally"
              checked={Boolean(item.source?.external)}
              onCheckedChange={(external) =>
                onItemChange({
                  ...item,
                  source: { ...(item.source ?? { href: "" }), external },
                })
              }
            />
          </SectionGrid>
        </div>
      )}
    />
  );
}

function TestimonialCategoriesEditor({
  items,
  onChange,
}: {
  items: TestimonialCategory[];
  onChange: (items: TestimonialCategory[]) => void;
}) {
  return (
    <CollectionEditor
      title="Testimonial Categories"
      description="Each category contains its own trusted-by group and testimonials."
      items={items}
      onChange={onChange}
      createItem={createTestimonialCategory}
      addLabel="Add testimonial category"
      emptyText="No testimonial categories configured yet."
      getItemLabel={(item, index) => item.label || item.id || `Category ${index + 1}`}
      renderItem={(item, _index, onItemChange) => (
        <div className="grid gap-4">
          <SectionGrid>
            <TextField
              label="ID"
              value={item.id}
              onChange={(id) => onItemChange({ ...item, id })}
            />
            <TextField
              label="Label"
              value={item.label}
              onChange={(label) => onItemChange({ ...item, label })}
            />
            <TextField
              label="Short label"
              value={item.shortLabel}
              onChange={(shortLabel) => onItemChange({ ...item, shortLabel })}
            />
            <TextField
              label="Icon"
              value={item.icon}
              onChange={(icon) => onItemChange({ ...item, icon })}
            />
          </SectionGrid>
          <LongTextField
            label="Description"
            value={item.description}
            onChange={(description) => onItemChange({ ...item, description })}
            rows={3}
          />
          <TextField
            label="Trusted by label"
            value={item.trustedBy.label}
            onChange={(label) =>
              onItemChange({
                ...item,
                trustedBy: { ...item.trustedBy, label },
              })
            }
          />
          <TestimonialAvatarsEditor
            items={item.trustedBy.avatars}
            onChange={(avatars) =>
              onItemChange({
                ...item,
                trustedBy: { ...item.trustedBy, avatars },
              })
            }
          />
          <TestimonialItemsEditor
            items={item.testimonials}
            onChange={(testimonials) => onItemChange({ ...item, testimonials })}
          />
        </div>
      )}
    />
  );
}

function ImpactComparisonFields({
  title,
  value,
  onChange,
}: {
  title: string;
  value: NonNullable<ImpactCardConfig["comparison"]>;
  onChange: (value: NonNullable<ImpactCardConfig["comparison"]>) => void;
}) {
  return (
    <EditorSection title={title} description="Comparison values used for before/after and side-by-side visuals.">
      <div className="grid gap-4">
        <SectionGrid>
          <TextField
            label="Baseline label"
            value={value.baseline.label}
            onChange={(label) =>
              onChange({ ...value, baseline: { ...value.baseline, label } })
            }
          />
          <NumberField
            label="Baseline value"
            value={value.baseline.value}
            onChange={(baselineValue) =>
              onChange({
                ...value,
                baseline: { ...value.baseline, value: baselineValue },
              })
            }
          />
          <TextField
            label="Baseline display"
            value={value.baseline.display}
            onChange={(display) =>
              onChange({ ...value, baseline: { ...value.baseline, display } })
            }
          />
          <TextField
            label="Current label"
            value={value.current.label}
            onChange={(label) =>
              onChange({ ...value, current: { ...value.current, label } })
            }
          />
          <NumberField
            label="Current value"
            value={value.current.value}
            onChange={(currentValue) =>
              onChange({
                ...value,
                current: { ...value.current, value: currentValue },
              })
            }
          />
          <TextField
            label="Current display"
            value={value.current.display}
            onChange={(display) =>
              onChange({ ...value, current: { ...value.current, display } })
            }
          />
          <TextField
            label="Multiplier"
            value={value.multiplier}
            onChange={(multiplier) => onChange({ ...value, multiplier })}
          />
        </SectionGrid>
      </div>
    </EditorSection>
  );
}

function ImpactBreakdownEditor({
  items,
  onChange,
}: {
  items: ImpactBreakdownSegment[];
  onChange: (items: ImpactBreakdownSegment[]) => void;
}) {
  return (
    <CollectionEditor
      title="Breakdown Segments"
      description="Segments for donut, breakdown, and mix visualizations."
      items={items}
      onChange={onChange}
      createItem={createImpactBreakdownSegment}
      addLabel="Add breakdown segment"
      emptyText="No breakdown segments configured yet."
      getItemLabel={(item, index) => item.label || item.id || `Segment ${index + 1}`}
      renderItem={(item, _index, onItemChange) => (
        <SectionGrid>
          <TextField
            label="ID"
            value={item.id}
            onChange={(id) => onItemChange({ ...item, id })}
          />
          <TextField
            label="Label"
            value={item.label}
            onChange={(label) => onItemChange({ ...item, label })}
          />
          <NumberField
            label="Value"
            value={item.value}
            onChange={(value) => onItemChange({ ...item, value })}
          />
          <NumberField
            label="Share"
            value={item.share}
            onChange={(share) => onItemChange({ ...item, share })}
          />
          <TextField
            label="Accent"
            value={item.accent}
            onChange={(accent) => onItemChange({ ...item, accent })}
          />
        </SectionGrid>
      )}
    />
  );
}

function ImpactPartnersEditor({
  items,
  onChange,
}: {
  items: ImpactPartner[];
  onChange: (items: ImpactPartner[]) => void;
}) {
  return (
    <CollectionEditor
      title="Partners"
      description="Optional partner or collaborator list used inside cards."
      items={items}
      onChange={onChange}
      createItem={createImpactPartner}
      addLabel="Add partner"
      emptyText="No partner entries configured yet."
      getItemLabel={(item, index) => item.name || item.id || `Partner ${index + 1}`}
      renderItem={(item, _index, onItemChange) => (
        <SectionGrid>
          <TextField
            label="ID"
            value={item.id}
            onChange={(id) => onItemChange({ ...item, id })}
          />
          <TextField
            label="Name"
            value={item.name}
            onChange={(name) => onItemChange({ ...item, name })}
          />
          <TextField
            label="Role"
            value={item.role}
            onChange={(role) => onItemChange({ ...item, role })}
          />
        </SectionGrid>
      )}
    />
  );
}

function ImpactChartEditor({
  value,
  onChange,
}: {
  value: NonNullable<ImpactCardConfig["chart"]>;
  onChange: (value: NonNullable<ImpactCardConfig["chart"]>) => void;
}) {
  return (
    <CollectionEditor
      title="Chart Points"
      description="Chart kind, cap, and data points used for bars, sparklines, and area charts."
      items={value.points}
      onChange={(points) => onChange({ ...value, points })}
      createItem={() => ({ label: "", value: 0 })}
      addLabel="Add chart point"
      emptyText="No chart points configured yet."
      getItemLabel={(item, index) => item.label || `Point ${index + 1}`}
      renderItem={(item, _index, onItemChange) => (
        <SectionGrid>
          <SelectField
            label="Chart kind"
            value={value.kind}
            onChange={(kind) =>
              onChange({ ...value, kind: kind as typeof value.kind })
            }
            options={IMPACT_CHART_KIND_OPTIONS}
          />
          <NumberField
            label="Chart max"
            value={value.max}
            onChange={(max) => onChange({ ...value, max })}
          />
          <TextField
            label="Point label"
            value={item.label}
            onChange={(label) => onItemChange({ ...item, label })}
          />
          <NumberField
            label="Point value"
            value={item.value}
            onChange={(pointValue) =>
              onItemChange({ ...item, value: pointValue })
            }
          />
        </SectionGrid>
      )}
    />
  );
}

function ImpactCardsEditor({
  items,
  onChange,
}: {
  items: ImpactCardConfig[];
  onChange: (items: ImpactCardConfig[]) => void;
}) {
  return (
    <CollectionEditor
      title="Impact Cards"
      description="The full impact card set used by the bento grid and expanded modal."
      items={items}
      onChange={onChange}
      createItem={createImpactCard}
      addLabel="Add impact card"
      emptyText="No impact cards configured yet."
      getItemLabel={(item, index) =>
        item.shortLabel || item.title || item.id || `Card ${index + 1}`
      }
      renderItem={(item, _index, onItemChange) => (
        <div className="grid gap-4">
          <SectionGrid>
            <TextField
              label="ID"
              value={item.id}
              onChange={(id) => onItemChange({ ...item, id })}
            />
            <TextField
              label="Slug"
              value={item.slug}
              onChange={(slug) => onItemChange({ ...item, slug })}
            />
            <TextField
              label="Title"
              value={item.title}
              onChange={(title) => onItemChange({ ...item, title })}
            />
            <TextField
              label="Subtitle"
              value={item.subtitle}
              onChange={(subtitle) => onItemChange({ ...item, subtitle })}
            />
            <TextField
              label="Short label"
              value={item.shortLabel}
              onChange={(shortLabel) => onItemChange({ ...item, shortLabel })}
            />
            <TextField
              label="Category"
              value={item.category}
              onChange={(category) => onItemChange({ ...item, category })}
            />
            <SelectField
              label="Type"
              value={item.type}
              onChange={(type) => onItemChange({ ...item, type })}
              options={IMPACT_CARD_TYPE_OPTIONS}
            />
            <SelectField
              label="Size"
              value={item.size}
              onChange={(size) =>
                onItemChange({ ...item, size: size as ImpactCardConfig["size"] })
              }
              options={IMPACT_CARD_SIZE_OPTIONS}
            />
            <TextField
              label="Accent"
              value={item.accent}
              onChange={(accent) => onItemChange({ ...item, accent })}
            />
            <NumberField
              label="Priority"
              value={item.priority}
              onChange={(priority) => onItemChange({ ...item, priority })}
            />
            <TextField
              label="Body slug"
              value={item.bodySlug}
              onChange={(bodySlug) => onItemChange({ ...item, bodySlug })}
            />
            <TextField
              label="Created at"
              value={item.createdAt}
              onChange={(createdAt) => onItemChange({ ...item, createdAt })}
            />
            <TextField
              label="Updated at"
              value={item.updatedAt}
              onChange={(updatedAt) => onItemChange({ ...item, updatedAt })}
            />
          </SectionGrid>
          <SectionGrid>
            <ToggleField
              label="Featured"
              checked={Boolean(item.featured)}
              onCheckedChange={(featured) => onItemChange({ ...item, featured })}
            />
            <ToggleField
              label="Active"
              checked={item.active !== false}
              onCheckedChange={(active) => onItemChange({ ...item, active })}
            />
          </SectionGrid>
          <EditorSection
            title="Metric"
            description="Primary metric values used on the card face."
          >
            <SectionGrid>
              <NumberField
                label="Value"
                value={item.metric.value}
                onChange={(value) =>
                  onItemChange({
                    ...item,
                    metric: { ...item.metric, value },
                  })
                }
              />
              <TextField
                label="Unit"
                value={item.metric.unit}
                onChange={(unit) =>
                  onItemChange({ ...item, metric: { ...item.metric, unit } })
                }
              />
              <TextField
                label="Display"
                value={item.metric.display}
                onChange={(display) =>
                  onItemChange({
                    ...item,
                    metric: { ...item.metric, display },
                  })
                }
              />
              <TextField
                label="Label"
                value={item.metric.label}
                onChange={(label) =>
                  onItemChange({ ...item, metric: { ...item.metric, label } })
                }
              />
            </SectionGrid>
          </EditorSection>
          <EditorSection
            title="Trend"
            description="Signed trend info shown on trend-focused cards."
          >
            <SectionGrid>
              <SelectField
                label="Direction"
                value={item.trend?.direction}
                onChange={(direction) =>
                  onItemChange({
                    ...item,
                    trend: {
                      ...(item.trend ?? {
                        direction: "up",
                        status: "positive",
                        changePercent: 0,
                        display: "",
                        timeframe: "",
                      }),
                      direction: direction as NonNullable<
                        ImpactCardConfig["trend"]
                      >["direction"],
                    },
                  })
                }
                options={TREND_DIRECTION_OPTIONS}
              />
              <SelectField
                label="Status"
                value={item.trend?.status}
                onChange={(status) =>
                  onItemChange({
                    ...item,
                    trend: {
                      ...(item.trend ?? {
                        direction: "up",
                        status: "positive",
                        changePercent: 0,
                        display: "",
                        timeframe: "",
                      }),
                      status: status as NonNullable<
                        ImpactCardConfig["trend"]
                      >["status"],
                    },
                  })
                }
                options={TREND_STATUS_OPTIONS}
              />
              <NumberField
                label="Change percent"
                value={item.trend?.changePercent}
                onChange={(changePercent) =>
                  onItemChange({
                    ...item,
                    trend: {
                      ...(item.trend ?? {
                        direction: "up",
                        status: "positive",
                        display: "",
                        timeframe: "",
                      }),
                      changePercent,
                    },
                  })
                }
              />
              <TextField
                label="Display"
                value={item.trend?.display}
                onChange={(display) =>
                  onItemChange({
                    ...item,
                    trend: {
                      ...(item.trend ?? {
                        direction: "up",
                        status: "positive",
                        changePercent: 0,
                        timeframe: "",
                      }),
                      display,
                    },
                  })
                }
              />
              <TextField
                label="Timeframe"
                value={item.trend?.timeframe}
                onChange={(timeframe) =>
                  onItemChange({
                    ...item,
                    trend: {
                      ...(item.trend ?? {
                        direction: "up",
                        status: "positive",
                        changePercent: 0,
                        display: "",
                      }),
                      timeframe,
                    },
                  })
                }
              />
            </SectionGrid>
          </EditorSection>
          <ImpactComparisonFields
            title="Comparison"
            value={
              item.comparison ?? {
                baseline: createImpactComparisonPoint(),
                current: createImpactComparisonPoint(),
                multiplier: "",
              }
            }
            onChange={(comparison) => onItemChange({ ...item, comparison })}
          />
          <ImpactComparisonFields
            title="Before / After"
            value={
              item.beforeAfter ?? {
                baseline: createImpactComparisonPoint(),
                current: createImpactComparisonPoint(),
                multiplier: "",
              }
            }
            onChange={(beforeAfter) => onItemChange({ ...item, beforeAfter })}
          />
          <ImpactChartEditor
            value={
              item.chart ?? {
                kind: "sparkline",
                points: [{ label: "", value: 0 }],
                max: 0,
              }
            }
            onChange={(chart) => onItemChange({ ...item, chart })}
          />
          <ImpactBreakdownEditor
            items={item.breakdown ?? []}
            onChange={(breakdown) => onItemChange({ ...item, breakdown })}
          />
          <ImpactPartnersEditor
            items={item.partners ?? []}
            onChange={(partners) => onItemChange({ ...item, partners })}
          />
          <EditorSection
            title="Campaign Stats"
            description="Optional stats used in expanded impact cards."
          >
            <SectionGrid>
              <NumberField
                label="Impressions"
                value={item.campaignStats?.impressions}
                onChange={(impressions) =>
                  onItemChange({
                    ...item,
                    campaignStats: {
                      ...(item.campaignStats ?? {}),
                      impressions,
                    },
                  })
                }
              />
              <NumberField
                label="Likes"
                value={item.campaignStats?.likes}
                onChange={(likes) =>
                  onItemChange({
                    ...item,
                    campaignStats: { ...(item.campaignStats ?? {}), likes },
                  })
                }
              />
              <NumberField
                label="Reach"
                value={item.campaignStats?.reach}
                onChange={(reach) =>
                  onItemChange({
                    ...item,
                    campaignStats: { ...(item.campaignStats ?? {}), reach },
                  })
                }
              />
              <NumberField
                label="Engagement rate"
                value={item.campaignStats?.engagementRate}
                onChange={(engagementRate) =>
                  onItemChange({
                    ...item,
                    campaignStats: {
                      ...(item.campaignStats ?? {}),
                      engagementRate,
                    },
                  })
                }
              />
              <NumberField
                label="CTR"
                value={item.campaignStats?.clickThroughRate}
                onChange={(clickThroughRate) =>
                  onItemChange({
                    ...item,
                    campaignStats: {
                      ...(item.campaignStats ?? {}),
                      clickThroughRate,
                    },
                  })
                }
              />
            </SectionGrid>
          </EditorSection>
          <StringListEditor
            title="Tags"
            description="Tags help group and label cards."
            values={item.tags ?? []}
            onChange={(tags) => onItemChange({ ...item, tags })}
            addLabel="Add tag"
            placeholder="Add a tag"
          />
        </div>
      )}
    />
  );
}

function SiteEditor({
  value,
  onChange,
}: {
  value: SiteConfig;
  onChange: (value: SiteConfig) => void;
}) {
  return (
    <div className="grid gap-4">
      <EditorSection
        title="Site Basics"
        description="Core site identity, description, and public URL."
      >
        <SectionGrid>
          <TextField
            label="Name"
            value={value.name}
            onChange={(name) => onChange({ ...value, name })}
          />
          <TextField
            label="Tagline"
            value={value.tagline}
            onChange={(tagline) => onChange({ ...value, tagline })}
          />
          <TextField
            label="Site URL"
            value={value.url}
            onChange={(url) => onChange({ ...value, url })}
          />
          <TextField
            label="Category"
            value={value.category}
            onChange={(category) => onChange({ ...value, category })}
          />
          <LongTextField
            label="Description"
            value={value.description}
            onChange={(description) => onChange({ ...value, description })}
            rows={4}
          />
        </SectionGrid>
      </EditorSection>
      <EditorSection
        title="Brand"
        description="Logo asset and brand voice used in the header and SEO."
      >
        <SectionGrid>
          <TextField
            label="Role"
            value={value.brand.role}
            onChange={(role) =>
              onChange({ ...value, brand: { ...value.brand, role } })
            }
          />
          <TextField
            label="Logo source"
            value={value.brand.logoSrc}
            onChange={(logoSrc) =>
              onChange({ ...value, brand: { ...value.brand, logoSrc } })
            }
          />
          <TextField
            label="Logo alt"
            value={value.brand.logoAlt}
            onChange={(logoAlt) =>
              onChange({ ...value, brand: { ...value.brand, logoAlt } })
            }
          />
          <LongTextField
            label="Bio"
            value={value.brand.bio}
            onChange={(bio) =>
              onChange({ ...value, brand: { ...value.brand, bio } })
            }
            rows={4}
          />
        </SectionGrid>
      </EditorSection>
      <EditorSection
        title="Contact"
        description="Primary contact endpoints and booking links."
      >
        <SectionGrid>
          <TextField
            label="Inquiry path"
            value={value.contact.inquiryPath}
            onChange={(inquiryPath) =>
              onChange({
                ...value,
                contact: { ...value.contact, inquiryPath },
              })
            }
          />
          <TextField
            label="Booking path"
            value={value.contact.bookingPath}
            onChange={(bookingPath) =>
              onChange({
                ...value,
                contact: { ...value.contact, bookingPath },
              })
            }
          />
          <TextField
            label="Booking URL"
            value={value.contact.bookingUrl}
            onChange={(bookingUrl) =>
              onChange({
                ...value,
                contact: { ...value.contact, bookingUrl },
              })
            }
          />
          <TextField
            label="Booking display"
            value={value.contact.bookingDisplay}
            onChange={(bookingDisplay) =>
              onChange({
                ...value,
                contact: { ...value.contact, bookingDisplay },
              })
            }
          />
          <TextField
            label="Primary CTA label"
            value={value.contact.primaryCtaLabel}
            onChange={(primaryCtaLabel) =>
              onChange({
                ...value,
                contact: { ...value.contact, primaryCtaLabel },
              })
            }
          />
          <TextField
            label="Email address"
            value={value.contact.emailAddress}
            onChange={(emailAddress) =>
              onChange({
                ...value,
                contact: { ...value.contact, emailAddress },
              })
            }
          />
          <TextField
            label="Call label"
            value={value.contact.callLabel}
            onChange={(callLabel) =>
              onChange({ ...value, contact: { ...value.contact, callLabel } })
            }
          />
          <TextField
            label="Call URL"
            value={value.contact.callUrl}
            onChange={(callUrl) =>
              onChange({ ...value, contact: { ...value.contact, callUrl } })
            }
          />
          <TextField
            label="Call display"
            value={value.contact.callDisplay}
            onChange={(callDisplay) =>
              onChange({
                ...value,
                contact: { ...value.contact, callDisplay },
              })
            }
          />
          <TextField
            label="WhatsApp label"
            value={value.contact.whatsappLabel}
            onChange={(whatsappLabel) =>
              onChange({
                ...value,
                contact: { ...value.contact, whatsappLabel },
              })
            }
          />
          <TextField
            label="WhatsApp URL"
            value={value.contact.whatsappUrl}
            onChange={(whatsappUrl) =>
              onChange({
                ...value,
                contact: { ...value.contact, whatsappUrl },
              })
            }
          />
          <TextField
            label="WhatsApp display"
            value={value.contact.whatsappDisplay}
            onChange={(whatsappDisplay) =>
              onChange({
                ...value,
                contact: { ...value.contact, whatsappDisplay },
              })
            }
          />
        </SectionGrid>
      </EditorSection>
      <EditorSection
        title="Agenda"
        description="Audience, services, and strategic positioning copy."
      >
        <div className="grid gap-4">
          <LongTextField
            label="Summary"
            value={value.agenda.summary}
            onChange={(summary) =>
              onChange({ ...value, agenda: { ...value.agenda, summary } })
            }
            rows={5}
          />
        </div>
      </EditorSection>
      <StringListEditor
        title="Audiences"
        values={value.agenda.audiences}
        onChange={(audiences) =>
          onChange({ ...value, agenda: { ...value.agenda, audiences } })
        }
        addLabel="Add audience"
      />
      <StringListEditor
        title="Agenda Services"
        values={value.agenda.services}
        onChange={(services) =>
          onChange({ ...value, agenda: { ...value.agenda, services } })
        }
        addLabel="Add service"
      />
      <StringListEditor
        title="Differentiators"
        values={value.agenda.differentiators}
        onChange={(differentiators) =>
          onChange({
            ...value,
            agenda: { ...value.agenda, differentiators },
          })
        }
        addLabel="Add differentiator"
      />
      <StringListEditor
        title="Agenda Keywords"
        values={value.agenda.keywords}
        onChange={(keywords) =>
          onChange({ ...value, agenda: { ...value.agenda, keywords } })
        }
        addLabel="Add keyword"
      />
      <EditorSection
        title="SEO"
        description="Default SEO values used throughout the site."
      >
        <SectionGrid>
          <TextField
            label="Locale"
            value={value.seo.locale}
            onChange={(locale) =>
              onChange({ ...value, seo: { ...value.seo, locale } })
            }
          />
          <TextField
            label="Language"
            value={value.seo.language}
            onChange={(language) =>
              onChange({ ...value, seo: { ...value.seo, language } })
            }
          />
          <TextField
            label="SEO category"
            value={value.seo.category}
            onChange={(category) =>
              onChange({ ...value, seo: { ...value.seo, category } })
            }
          />
          <TextField
            label="Default title"
            value={value.seo.defaultTitle}
            onChange={(defaultTitle) =>
              onChange({ ...value, seo: { ...value.seo, defaultTitle } })
            }
          />
          <TextField
            label="Title template"
            value={value.seo.titleTemplate}
            onChange={(titleTemplate) =>
              onChange({ ...value, seo: { ...value.seo, titleTemplate } })
            }
          />
          <TextField
            label="Author"
            value={value.seo.author}
            onChange={(author) =>
              onChange({ ...value, seo: { ...value.seo, author } })
            }
          />
          <TextField
            label="Updated at"
            value={value.seo.updatedAt}
            onChange={(updatedAt) =>
              onChange({ ...value, seo: { ...value.seo, updatedAt } })
            }
          />
          <TextField
            label="OG image alt"
            value={value.seo.ogImageAlt}
            onChange={(ogImageAlt) =>
              onChange({ ...value, seo: { ...value.seo, ogImageAlt } })
            }
          />
          <LongTextField
            label="Default description"
            value={value.seo.defaultDescription}
            onChange={(defaultDescription) =>
              onChange({
                ...value,
                seo: { ...value.seo, defaultDescription },
              })
            }
            rows={4}
          />
        </SectionGrid>
      </EditorSection>
      <StringListEditor
        title="SEO Keywords"
        values={value.seo.keywords}
        onChange={(keywords) =>
          onChange({ ...value, seo: { ...value.seo, keywords } })
        }
        addLabel="Add SEO keyword"
      />
      <SiteSocialLinksEditor
        items={value.social}
        onChange={(social) => onChange({ ...value, social })}
      />
    </div>
  );
}

function NavigationEditor({
  value,
  onChange,
}: {
  value: NavigationEditorData;
  onChange: (value: NavigationEditorData) => void;
}) {
  return (
    <div className="grid gap-4">
      <EditorSection
        title="Header Brand"
        description="Header-specific brand and availability details."
      >
        <SectionGrid>
          <TextField
            label="Brand name"
            value={value.header.brand.name}
            onChange={(name) =>
              onChange({
                ...value,
                header: {
                  ...value.header,
                  brand: { ...value.header.brand, name },
                },
              })
            }
          />
          <TextField
            label="Role"
            value={value.header.brand.role}
            onChange={(role) =>
              onChange({
                ...value,
                header: {
                  ...value.header,
                  brand: { ...value.header.brand, role },
                },
              })
            }
          />
          <TextField
            label="Brand path"
            value={value.header.brand.path}
            onChange={(path) =>
              onChange({
                ...value,
                header: {
                  ...value.header,
                  brand: { ...value.header.brand, path },
                },
              })
            }
          />
          <TextField
            label="Availability label"
            value={value.header.availabilityLabel}
            onChange={(availabilityLabel) =>
              onChange({
                ...value,
                header: { ...value.header, availabilityLabel },
              })
            }
          />
          <TextField
            label="Logo source"
            value={value.header.brand.logoSrc}
            onChange={(logoSrc) =>
              onChange({
                ...value,
                header: {
                  ...value.header,
                  brand: { ...value.header.brand, logoSrc },
                },
              })
            }
          />
          <TextField
            label="Logo alt"
            value={value.header.brand.logoAlt}
            onChange={(logoAlt) =>
              onChange({
                ...value,
                header: {
                  ...value.header,
                  brand: { ...value.header.brand, logoAlt },
                },
              })
            }
          />
          <LongTextField
            label="Brand bio"
            value={value.header.brand.bio}
            onChange={(bio) =>
              onChange({
                ...value,
                header: {
                  ...value.header,
                  brand: { ...value.header.brand, bio },
                },
              })
            }
            rows={4}
          />
        </SectionGrid>
      </EditorSection>
      <HeaderSocialLinksEditor
        items={value.header.socials}
        onChange={(socials) =>
          onChange({ ...value, header: { ...value.header, socials } })
        }
      />
      <NavigationItemsEditor
        items={value.navigation.items}
        onChange={(items) =>
          onChange({ ...value, navigation: { ...value.navigation, items } })
        }
      />
      <NavigationCtasEditor
        items={value.navigation.ctas}
        onChange={(ctas) =>
          onChange({ ...value, navigation: { ...value.navigation, ctas } })
        }
      />
    </div>
  );
}

function ServicesEditor({
  value,
  onChange,
}: {
  value: ServicesSectionConfig;
  onChange: (value: ServicesSectionConfig) => void;
}) {
  return (
    <div className="grid gap-4">
      <HeroEditor
        value={value.hero}
        onChange={(hero) => onChange({ ...value, hero })}
      />
      <ServiceItemsEditor
        items={value.services}
        onChange={(services) => onChange({ ...value, services })}
      />
    </div>
  );
}

function RoadmapEditor({
  value,
  onChange,
}: {
  value: RoadmapSectionConfig;
  onChange: (value: RoadmapSectionConfig) => void;
}) {
  return (
    <div className="grid gap-4">
      <HeroEditor
        value={value.hero}
        onChange={(hero) => onChange({ ...value, hero })}
      />
      <EditorSection
        title="Timeline Settings"
        description="Controls the alternating timeline direction."
      >
        <SelectField
          label="Start from"
          value={value.startFrom}
          onChange={(startFrom) =>
            onChange({ ...value, startFrom: startFrom as "left" | "right" })
          }
          options={ROADMAP_SIDE_OPTIONS}
        />
      </EditorSection>
      <RoadmapItemsEditor
        items={value.items}
        onChange={(items) => onChange({ ...value, items })}
      />
    </div>
  );
}

function FaqEditor({
  value,
  onChange,
}: {
  value: FAQSectionConfig;
  onChange: (value: FAQSectionConfig) => void;
}) {
  return (
    <div className="grid gap-4">
      <EditorSection
        title="FAQ Intro"
        description="Heading and support copy for the FAQ section."
      >
        <SectionGrid>
          <TextField
            label="Eyebrow"
            value={value.eyebrow}
            onChange={(eyebrow) => onChange({ ...value, eyebrow })}
          />
          <LongTextField
            label="Title"
            value={titleToMultiline(value.title)}
            onChange={(title) => onChange({ ...value, title: multilineToTitle(title) })}
            rows={3}
          />
          <LongTextField
            label="Description"
            value={value.description}
            onChange={(description) => onChange({ ...value, description })}
            rows={4}
          />
          <TextField
            label="Default open ID"
            value={value.defaultOpenId ?? ""}
            onChange={(defaultOpenId) => onChange({ ...value, defaultOpenId })}
          />
          <TextField
            label="Helper text"
            value={value.helperText}
            onChange={(helperText) => onChange({ ...value, helperText })}
          />
        </SectionGrid>
      </EditorSection>
      <HeroCtaFields
        title="FAQ CTA"
        value={value.cta}
        emptyValue={undefined}
        onChange={(cta) => onChange({ ...value, cta: cta || undefined })}
      />
      <FaqItemsEditor
        items={value.items}
        onChange={(items) => onChange({ ...value, items })}
      />
    </div>
  );
}

function TestimonialsEditor({
  value,
  onChange,
}: {
  value: TestimonialsSectionConfig;
  onChange: (value: TestimonialsSectionConfig) => void;
}) {
  return (
    <div className="grid gap-4">
      <EditorSection
        title="Testimonials Intro"
        description="Section heading and default selected category."
      >
        <SectionGrid>
          <TextField
            label="Eyebrow"
            value={value.eyebrow}
            onChange={(eyebrow) => onChange({ ...value, eyebrow })}
          />
          <TextField
            label="Title"
            value={value.title}
            onChange={(title) => onChange({ ...value, title })}
          />
          <LongTextField
            label="Description"
            value={value.description}
            onChange={(description) => onChange({ ...value, description })}
            rows={4}
          />
          <TextField
            label="Default category ID"
            value={value.defaultCategoryId}
            onChange={(defaultCategoryId) =>
              onChange({ ...value, defaultCategoryId })
            }
          />
        </SectionGrid>
      </EditorSection>
      <TestimonialCategoriesEditor
        items={value.categories}
        onChange={(categories) => onChange({ ...value, categories })}
      />
    </div>
  );
}

function ImpactEditor({
  value,
  onChange,
}: {
  value: ImpactSectionConfig;
  onChange: (value: ImpactSectionConfig) => void;
}) {
  return (
    <div className="grid gap-4">
      <HeroEditor
        value={value.hero}
        onChange={(hero) => onChange({ ...value, hero })}
      />
      <HeroCtaFields
        title="Modal CTA"
        value={value.modalCTA}
        emptyValue={undefined}
        onChange={(modalCTA) =>
          onChange({ ...value, modalCTA: modalCTA || undefined })
        }
      />
      <ImpactCardsEditor
        items={value.cards}
        onChange={(cards) => onChange({ ...value, cards })}
      />
    </div>
  );
}

function BookCallEditor({
  value,
  onChange,
}: {
  value: BookCallSectionConfig;
  onChange: (value: BookCallSectionConfig) => void;
}) {
  return (
    <div className="grid gap-4">
      <HeroEditor
        value={value.hero}
        onChange={(hero) => onChange({ ...value, hero })}
      />
      <EditorSection
        title="Primary Booking Action"
        description="Primary book-call card action."
      >
        <SectionGrid>
          <TextField
            label="ID"
            value={value.panel.primaryAction.id}
            onChange={(id) =>
              onChange({
                ...value,
                panel: {
                  ...value.panel,
                  primaryAction: { ...value.panel.primaryAction, id },
                },
              })
            }
          />
          <TextField
            label="Label"
            value={value.panel.primaryAction.label}
            onChange={(label) =>
              onChange({
                ...value,
                panel: {
                  ...value.panel,
                  primaryAction: { ...value.panel.primaryAction, label },
                },
              })
            }
          />
          <TextField
            label="Value"
            value={value.panel.primaryAction.value}
            onChange={(valueLabel) =>
              onChange({
                ...value,
                panel: {
                  ...value.panel,
                  primaryAction: {
                    ...value.panel.primaryAction,
                    value: valueLabel,
                  },
                },
              })
            }
          />
          <TextField
            label="Href"
            value={value.panel.primaryAction.href}
            onChange={(href) =>
              onChange({
                ...value,
                panel: {
                  ...value.panel,
                  primaryAction: { ...value.panel.primaryAction, href },
                },
              })
            }
          />
          <IconField
            label="Icon"
            value={value.panel.primaryAction.icon}
            onChange={(icon) =>
              onChange({
                ...value,
                panel: {
                  ...value.panel,
                  primaryAction: { ...value.panel.primaryAction, icon },
                },
              })
            }
          />
          <ToggleField
            label="Open externally"
            checked={Boolean(value.panel.primaryAction.external)}
            onCheckedChange={(external) =>
              onChange({
                ...value,
                panel: {
                  ...value.panel,
                  primaryAction: {
                    ...value.panel.primaryAction,
                    external,
                  },
                },
              })
            }
          />
          <LongTextField
            label="Description"
            value={value.panel.primaryAction.description}
            onChange={(description) =>
              onChange({
                ...value,
                panel: {
                  ...value.panel,
                  primaryAction: {
                    ...value.panel.primaryAction,
                    description,
                  },
                },
              })
            }
            rows={4}
          />
        </SectionGrid>
      </EditorSection>
      <HeaderSocialLinksEditor
        items={value.panel.socialLinks}
        onChange={(socialLinks) =>
          onChange({ ...value, panel: { ...value.panel, socialLinks } })
        }
      />
    </div>
  );
}

function ContactPageEditor({
  value,
  onChange,
}: {
  value: ContactPageContent;
  onChange: (value: ContactPageContent) => void;
}) {
  return (
    <div className="grid gap-4">
      <HeroEditor
        value={value.hero}
        onChange={(hero) => onChange({ ...value, hero })}
      />
      <EditorSection
        title="Direct Contact Panel"
        description="WhatsApp and direct-contact support block on the contact page."
      >
        <SectionGrid>
          <TextField
            label="Badge label"
            value={value.direct.badgeLabel}
            onChange={(badgeLabel) =>
              onChange({ ...value, direct: { ...value.direct, badgeLabel } })
            }
          />
          <TextField
            label="Title"
            value={value.direct.title}
            onChange={(title) =>
              onChange({ ...value, direct: { ...value.direct, title } })
            }
          />
          <TextField
            label="Email label"
            value={value.direct.emailLabel}
            onChange={(emailLabel) =>
              onChange({ ...value, direct: { ...value.direct, emailLabel } })
            }
          />
          <LongTextField
            label="Description"
            value={value.direct.desc}
            onChange={(desc) =>
              onChange({ ...value, direct: { ...value.direct, desc } })
            }
            rows={4}
          />
        </SectionGrid>
      </EditorSection>
    </div>
  );
}

function HeroOnlyEditor({
  value,
  onChange,
}: {
  value: HeroSectionConfig;
  onChange: (value: HeroSectionConfig) => void;
}) {
  return <HeroEditor value={value} onChange={onChange} />;
}

export function StructuredSectionEditor({
  blockKey,
  value,
  onChange,
  onPersist,
}: {
  blockKey: ContentBlockKey;
  value: unknown;
  onChange: (value: unknown) => void;
  onPersist?: (value: unknown) => Promise<boolean>;
}) {
  switch (blockKey) {
    case "site":
      return (
        <SiteEditor
          value={value as SiteConfig}
          onChange={(nextValue) => onChange(nextValue)}
        />
      );
    case "navigation":
      return (
        <NavigationEditor
          value={value as NavigationEditorData}
          onChange={(nextValue) => onChange(nextValue)}
        />
      );
    case "home_hero":
    case "portfolio":
      return (
        <HeroOnlyEditor
          value={value as HeroSectionConfig}
          onChange={(nextValue) => onChange(nextValue)}
        />
      );
    case "clients_marquee":
      return (
        <MarqueeRowsEditor
          rows={value as ImageMarqueeRow[]}
          type="clients"
          onChange={(nextValue) => onChange(nextValue)}
          onPersistRows={(nextValue) => onPersist?.(nextValue) ?? Promise.resolve(true)}
        />
      );
    case "showcase_marquee":
    case "portfolio_marquee":
      return (
        <MarqueeRowsEditor
          rows={value as ImageMarqueeRow[]}
          type="gallery"
          onChange={(nextValue) => onChange(nextValue)}
          onPersistRows={(nextValue) => onPersist?.(nextValue) ?? Promise.resolve(true)}
        />
      );
    case "services":
      return (
        <ServicesEditor
          value={value as ServicesSectionConfig}
          onChange={(nextValue) => onChange(nextValue)}
        />
      );
    case "process_roadmap":
      return (
        <RoadmapEditor
          value={value as RoadmapSectionConfig}
          onChange={(nextValue) => onChange(nextValue)}
        />
      );
    case "faq":
      return (
        <FaqEditor
          value={value as FAQSectionConfig}
          onChange={(nextValue) => onChange(nextValue)}
        />
      );
    case "testimonials":
      return (
        <TestimonialsEditor
          value={value as TestimonialsSectionConfig}
          onChange={(nextValue) => onChange(nextValue)}
        />
      );
    case "impact":
      return (
        <ImpactEditor
          value={value as ImpactSectionConfig}
          onChange={(nextValue) => onChange(nextValue)}
        />
      );
    case "book_call":
      return (
        <BookCallEditor
          value={value as BookCallSectionConfig}
          onChange={(nextValue) => onChange(nextValue)}
        />
      );
    case "contact_page":
      return (
        <ContactPageEditor
          value={value as ContactPageContent}
          onChange={(nextValue) => onChange(nextValue)}
        />
      );
    default:
      return null;
  }
}
