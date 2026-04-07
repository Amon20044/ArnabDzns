import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  typography,
  type HeadingVariant,
  type TextVariant,
} from "@/lib/style";

/* --------------------------------------------------------------------------
   <Heading variant="h1" />
   --------------------------------------------------------------------------
   Defaults to rendering the matching semantic tag (h1, h2, …). Override with
   `as` when the visual size doesn't match the document outline (e.g. you want
   an `<h2>` styled like the display h1).
   -------------------------------------------------------------------------- */
type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  variant: HeadingVariant;
  as?: HeadingTag;
  children: ReactNode;
}

export const Heading = ({
  variant,
  as,
  className,
  children,
  ...props
}: HeadingProps) => {
  const Tag = (as ?? variant) as HeadingTag;
  return (
    <Tag
      className={cn(typography.heading[variant], "text-text-primary", className)}
      {...props}
    >
      {children}
    </Tag>
  );
};

/* --------------------------------------------------------------------------
   <Text variant="p2" />
   --------------------------------------------------------------------------
   Body copy. Defaults to <p>. Use `as="span"` for inline use.
   -------------------------------------------------------------------------- */
type TextTag = "p" | "span" | "div";

interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  variant?: TextVariant;
  as?: TextTag;
  children: ReactNode;
}

export const Text = ({
  variant = "p2",
  as = "p",
  className,
  children,
  ...props
}: TextProps) => {
  const Tag = as;
  return (
    <Tag
      className={cn(
        typography.text[variant],
        "text-text-secondary",
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
};
