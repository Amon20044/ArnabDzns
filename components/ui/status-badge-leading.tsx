import type { ReactNode } from "react";
import { Star } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import type { HeroBadgeConfig, HeroBadgeIconId } from "@/types";

type BadgeLeadingInput =
  | Pick<HeroBadgeConfig, "icon" | "starCount">
  | HeroBadgeIconId
  | undefined;

function normalizeInput(input: BadgeLeadingInput) {
  if (typeof input === "string") {
    return { icon: input, starCount: undefined };
  }

  return input;
}

export function renderStatusBadgeLeading(input: BadgeLeadingInput): ReactNode {
  const badge = normalizeInput(input);
  const icon = badge?.icon;
  const starCount = badge?.starCount ?? 5;

  switch (icon) {
    case "stars":
      return (
        <span className="flex items-center gap-0.5">
          {Array.from({ length: starCount }, (_, index) => (
            <Star
              key={`badge-star-${index}`}
              className="size-[14px] fill-current stroke-current"
              strokeWidth={1.5}
            />
          ))}
        </span>
      );
    case "indicator":
    case "none":
    case undefined:
      return undefined;
    default:
      return (
        <span className="inline-flex shrink-0 items-center justify-center">
          <Icon name={icon} className="size-[14px]" strokeWidth={2.2} />
        </span>
      );
  }
}
