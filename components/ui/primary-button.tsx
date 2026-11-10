import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type PrimaryButtonSize = "default" | "compact";
type PrimaryButtonIconVisibility = "always" | "hover";
type PrimaryButtonTone = "default" | "accent" | "white" | "whatsapp";

interface PrimaryButtonProps {
  label: string;
  href?: string;
  Icon?: LucideIcon;
  external?: boolean;
  className?: string;
  size?: PrimaryButtonSize;
  /**
   * "hover" places the icon after the label and nudges it on hover (used for
   * arrows). "always" keeps it in front of the label.
   */
  iconVisibility?: PrimaryButtonIconVisibility;
  iconOnly?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  fullWidth?: boolean;
  iconClassName?: string;
  tone?: PrimaryButtonTone;
}

const toneClassNames: Record<PrimaryButtonTone, string> = {
  default: "",
  accent: "press--accent",
  white: "press--white",
  whatsapp: "press--whatsapp",
};

/**
 * The site's one button: a solid face sitting on a hard offset base that
 * lifts on hover and sinks on press. All motion is CSS transform, so there is
 * no per-button React state or animation loop.
 */
export const PrimaryButton = ({
  label,
  href,
  Icon,
  external = false,
  className,
  size = "default",
  iconVisibility,
  iconOnly = false,
  onClick,
  type = "button",
  disabled = false,
  fullWidth = false,
  iconClassName,
  tone = "default",
}: PrimaryButtonProps) => {
  const isCompact = size === "compact";
  const iconTrails = !iconOnly && (iconVisibility ?? (isCompact ? "hover" : "always")) === "hover";
  const isMailOrPhoneLink = href?.startsWith("mailto:") || href?.startsWith("tel:");
  const shouldRenderAnchor = !!href && (external || isMailOrPhoneLink);
  const shouldOpenNewTab = external && !isMailOrPhoneLink;

  const pressClassName = cn(
    "press group select-none",
    toneClassNames[tone],
    isCompact && "press--compact",
    iconOnly && "press--icon",
    fullWidth && "w-full",
  );

  const icon = Icon ? (
    <Icon
      aria-hidden
      className={cn(
        "shrink-0 transition-transform duration-200 ease-out",
        iconOnly ? "size-5" : "size-[17px]",
        iconTrails && "group-hover:translate-x-1",
        iconClassName,
      )}
      strokeWidth={2.3}
    />
  ) : null;

  const content = iconOnly ? (
    icon
  ) : (
    <>
      {iconTrails ? null : icon}
      <span>{label}</span>
      {iconTrails ? icon : null}
    </>
  );

  return (
    <span className={cn("inline-block", fullWidth && "w-full", className)}>
      {href && shouldRenderAnchor ? (
        <a
          href={href}
          target={shouldOpenNewTab ? "_blank" : undefined}
          rel={shouldOpenNewTab ? "noopener noreferrer" : undefined}
          className={pressClassName}
          aria-label={label}
        >
          {content}
        </a>
      ) : href ? (
        <Link href={href} className={pressClassName} aria-label={label}>
          {content}
        </Link>
      ) : (
        <button
          type={type}
          onClick={onClick}
          disabled={disabled}
          className={pressClassName}
          aria-label={label}
        >
          {content}
        </button>
      )}
    </span>
  );
};
