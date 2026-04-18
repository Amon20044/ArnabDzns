import type { ReactNode } from "react";
import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CheckCheck,
  CircleHelp,
  Clock3,
  FileText,
  GalleryVerticalEnd,
  LayoutTemplate,
  Mail,
  MessageCircleMore,
  MessageSquareQuote,
  PackageCheck,
  PenTool,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingDown,
  TrendingUp,
  TrendingUpDown,
  type LucideIcon,
  WalletCards,
  WandSparkles,
  Workflow,
} from "lucide-react";
import type { HeroBadgeConfig, HeroBadgeIconId } from "@/types";

type BadgeLeadingInput = Pick<HeroBadgeConfig, "icon" | "starCount"> | HeroBadgeIconId | undefined;

const badgeIconRegistry: Partial<
  Record<
    Exclude<HeroBadgeIconId, "building" | "indicator" | "none" | "quote" | "stars">,
    LucideIcon
  >
> = {
  briefcase: BriefcaseBusiness,
  chart: BarChart3,
  "check-check": CheckCheck,
  clock: Clock3,
  "file-text": FileText,
  gallery: GalleryVerticalEnd,
  "help-circle": CircleHelp,
  layout: LayoutTemplate,
  mail: Mail,
  message: MessageCircleMore,
  "package-check": PackageCheck,
  "pen-tool": PenTool,
  "phone-call": PhoneCall,
  "shield-check": ShieldCheck,
  sparkles: Sparkles,
  target: Target,
  "trending-down": TrendingDown,
  "trending-up": TrendingUp,
  "trending-up-down": TrendingUpDown,
  wallet: WalletCards,
  wand: WandSparkles,
  workflow: Workflow,
};

function normalizeInput(input: BadgeLeadingInput) {
  if (typeof input === "string") {
    return { icon: input, starCount: undefined };
  }

  return input;
}

export function renderStatusBadgeLeading(input: BadgeLeadingInput): ReactNode {
  const badge = normalizeInput(input);

  switch (badge?.icon) {
    case "stars":
      return (
        <span className="flex items-center gap-0.5">
          {Array.from({ length: badge.starCount ?? 5 }, (_, index) => (
            <Star
              key={`badge-star-${index}`}
              className="size-[14px] fill-current stroke-current"
              strokeWidth={1.5}
            />
          ))}
        </span>
      );
    case "building":
      return (
        <span className="inline-flex shrink-0 items-center justify-center">
          <Building2 className="size-[14px]" strokeWidth={2.2} />
        </span>
      );
    case "quote":
      return (
        <span className="inline-flex shrink-0 items-center justify-center">
          <MessageSquareQuote className="size-[14px]" strokeWidth={2.2} />
        </span>
      );
    case "indicator":
    case "none":
    case undefined:
      return undefined;
    default: {
      if (!badge?.icon) {
        return undefined;
      }

      const Icon = badgeIconRegistry[badge.icon];

      if (!Icon) {
        return undefined;
      }

      return (
        <span className="inline-flex shrink-0 items-center justify-center">
          <Icon className="size-[14px]" strokeWidth={2.2} />
        </span>
      );
    }
  }
}
