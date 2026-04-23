"use client";

import { DynamicIcon as DynamicLucideIcon } from "lucide-react/dynamic";
import {
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
  type SVGProps,
} from "react";
import {
  type IconComponent,
  parseIconKey,
  reactIconPackLoaders,
} from "@/lib/icons";
import { cn } from "@/lib/utils";

type IconProps = Omit<SVGProps<SVGSVGElement>, "name"> & {
  name?: string | null;
  fallback?: ReactNode;
  title?: string;
  decorative?: boolean;
};

type AsyncReactIconProps = Omit<IconProps, "name"> & {
  pack: keyof typeof reactIconPackLoaders;
  componentName: string;
};

function getAriaProps(title?: string, decorative?: boolean) {
  if (decorative ?? !title) {
    return { "aria-hidden": true };
  }

  return { role: "img", "aria-label": title };
}

function fallbackElement(fallback: ReactNode) {
  if (!fallback) {
    return null;
  }

  return <>{fallback}</>;
}

function AsyncReactIcon({
  pack,
  componentName,
  fallback = null,
  title,
  decorative,
  ...props
}: AsyncReactIconProps) {
  const [loadedIconState, setLoadedIconState] = useState<{
    pack: keyof typeof reactIconPackLoaders;
    componentName: string;
    Icon: IconComponent | null;
  } | null>(null);
  const LoadedIcon =
    loadedIconState?.pack === pack &&
    loadedIconState.componentName === componentName
      ? loadedIconState.Icon
      : null;

  useEffect(() => {
    let active = true;

    reactIconPackLoaders[pack]()
      .then((module) => {
        const icon = (
          module as unknown as Record<string, IconComponent | undefined>
        )[componentName];

        if (active) {
          setLoadedIconState({
            pack,
            componentName,
            Icon: icon ?? null,
          });
        }
      })
      .catch(() => {
        if (active) {
          setLoadedIconState({
            pack,
            componentName,
            Icon: null,
          });
        }
      });

    return () => {
      active = false;
    };
  }, [componentName, pack]);

  if (!LoadedIcon) {
    return fallbackElement(fallback);
  }

  return <LoadedIcon {...getAriaProps(title, decorative)} {...props} />;
}

function MaterialSymbolIcon({
  symbol,
  className,
  style,
  title,
  decorative,
}: {
  symbol: string;
  className?: string;
  style?: CSSProperties;
  title?: string;
  decorative?: boolean;
}) {
  return (
    <span
      {...getAriaProps(title, decorative)}
      className={cn("material-symbols-rounded inline-flex shrink-0 leading-none", className)}
      style={{
        fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
        ...style,
      }}
    >
      {symbol}
    </span>
  );
}

function SvgAssetIcon({
  src,
  mode,
  className,
  style,
  title,
  decorative,
}: {
  src: string;
  mode: "mask" | "image";
  className?: string;
  style?: CSSProperties;
  title?: string;
  decorative?: boolean;
}) {
  if (mode === "image") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        {...getAriaProps(title, decorative)}
        src={src}
        alt={title ?? ""}
        className={cn("inline-block shrink-0 object-contain", className)}
        style={style}
      />
    );
  }

  return (
    <span
      {...getAriaProps(title, decorative)}
      className={cn("inline-block shrink-0 bg-current", className)}
      style={{
        WebkitMask: `url("${src}") center / contain no-repeat`,
        mask: `url("${src}") center / contain no-repeat`,
        ...style,
      }}
    />
  );
}

export function Icon({
  name,
  fallback = null,
  title,
  decorative,
  className,
  style,
  ...props
}: IconProps) {
  const parsed = parseIconKey(name);

  switch (parsed.kind) {
    case "static": {
      const StaticIcon = parsed.component;

      return (
        <StaticIcon
          {...getAriaProps(title, decorative)}
          className={className}
          style={style}
          {...props}
        />
      );
    }
    case "lucide":
      return (
        <DynamicLucideIcon
          {...getAriaProps(title, decorative)}
          name={parsed.name as never}
          fallback={fallback ? () => fallbackElement(fallback) : undefined}
          className={className}
          style={style}
          {...props}
        />
      );
    case "react-icon":
      return (
        <AsyncReactIcon
          pack={parsed.pack}
          componentName={parsed.componentName}
          fallback={fallback}
          title={title}
          decorative={decorative}
          className={className}
          style={style}
          {...props}
        />
      );
    case "material":
      return (
        <MaterialSymbolIcon
          symbol={parsed.symbol}
          className={className}
          style={style}
          title={title}
          decorative={decorative}
        />
      );
    case "svg":
      return (
        <SvgAssetIcon
          src={parsed.src}
          mode={parsed.mode}
          className={className}
          style={style as CSSProperties}
          title={title}
          decorative={decorative}
        />
      );
    case "none":
    default:
      return fallbackElement(fallback);
  }
}
