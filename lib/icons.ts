import type { ComponentType, SVGProps } from "react";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  Camera,
  CheckCheck,
  CircleHelp,
  Clapperboard,
  Code2,
  Clock3,
  FileText,
  GalleryVerticalEnd,
  Home,
  Layers,
  LayoutTemplate,
  Mail,
  MessageCircleMore,
  MessageSquareQuote,
  MonitorSmartphone,
  Package2,
  PackageCheck,
  Palette,
  PenTool,
  PhoneCall,
  Radio,
  ShieldCheck,
  Shapes,
  Sparkles,
  Target,
  Trophy,
  TrendingDown,
  TrendingUp,
  TrendingUpDown,
  Users,
  type LucideIcon,
  WalletCards,
  WandSparkles,
  Workflow,
} from "lucide-react";
import {
  FaDiscord,
  FaGithub,
  FaInstagram,
  FaLinkedin,
} from "react-icons/fa6";
import {
  SiApple,
  SiDiscord,
  SiFigma,
  SiFramer,
  SiGithub,
  SiGoogle,
  SiGreensock,
  SiNetflix,
  SiNextdotjs,
  SiNodedotjs,
  SiObsstudio,
  SiReact,
  SiReddit,
  SiSpotify,
  SiTailwindcss,
  SiTelegram,
  SiTypescript,
  SiVercel,
  SiYoutube,
} from "react-icons/si";
import type { IconType } from "react-icons";
import type { NavIconRegistry } from "@/types";

export type IconComponent = ComponentType<
  SVGProps<SVGSVGElement> & {
    size?: number | string;
    strokeWidth?: number | string;
  }
>;

export const reactIconPackLoaders = {
  ai: () => import("react-icons/ai"),
  bi: () => import("react-icons/bi"),
  bs: () => import("react-icons/bs"),
  cg: () => import("react-icons/cg"),
  ci: () => import("react-icons/ci"),
  di: () => import("react-icons/di"),
  fa: () => import("react-icons/fa"),
  fa6: () => import("react-icons/fa6"),
  fc: () => import("react-icons/fc"),
  fi: () => import("react-icons/fi"),
  gi: () => import("react-icons/gi"),
  go: () => import("react-icons/go"),
  gr: () => import("react-icons/gr"),
  hi: () => import("react-icons/hi"),
  hi2: () => import("react-icons/hi2"),
  im: () => import("react-icons/im"),
  io: () => import("react-icons/io"),
  io5: () => import("react-icons/io5"),
  lia: () => import("react-icons/lia"),
  lu: () => import("react-icons/lu"),
  md: () => import("react-icons/md"),
  pi: () => import("react-icons/pi"),
  ri: () => import("react-icons/ri"),
  rx: () => import("react-icons/rx"),
  si: () => import("react-icons/si"),
  sl: () => import("react-icons/sl"),
  tb: () => import("react-icons/tb"),
  tfi: () => import("react-icons/tfi"),
  ti: () => import("react-icons/ti"),
  vsc: () => import("react-icons/vsc"),
  wi: () => import("react-icons/wi"),
} as const;

export type ReactIconPack = keyof typeof reactIconPackLoaders;

export type ParsedIconKey =
  | { kind: "none" }
  | { kind: "static"; component: IconComponent }
  | { kind: "lucide"; name: string }
  | { kind: "react-icon"; pack: ReactIconPack; componentName: string }
  | { kind: "material"; symbol: string }
  | { kind: "svg"; src: string; mode: "mask" | "image" };

function asIcon(component: LucideIcon | IconType): IconComponent {
  return component as IconComponent;
}

export function toKebabIconName(value: string) {
  return value
    .trim()
    .replace(/^lucide:/i, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function normalizeMaterialSymbol(value: string) {
  return value
    .trim()
    .replace(/^material(-symbols?)?:/i, "")
    .replace(/^google(-font|-icon)?:/i, "")
    .replace(/[\s-]+/g, "_")
    .toLowerCase();
}

function isReactIconPack(value: string): value is ReactIconPack {
  return value in reactIconPackLoaders;
}

export const staticIconRegistry: Record<string, IconComponent> = {
  "arrow-right": asIcon(ArrowRight),
  "bar-chart-3": asIcon(BarChart3),
  briefcase: asIcon(BriefcaseBusiness),
  "briefcase-business": asIcon(BriefcaseBusiness),
  broadcast: asIcon(Radio),
  building: asIcon(Building2),
  "building-2": asIcon(Building2),
  calendar: asIcon(CalendarClock),
  "calendar-clock": asIcon(CalendarClock),
  camera: asIcon(Camera),
  chart: asIcon(BarChart3),
  "check-check": asIcon(CheckCheck),
  clapperboard: asIcon(Clapperboard),
  clock: asIcon(Clock3),
  "clock-3": asIcon(Clock3),
  code: asIcon(Code2),
  discord: asIcon(FaDiscord),
  "file-text": asIcon(FileText),
  figma: asIcon(SiFigma),
  framer: asIcon(SiFramer),
  gallery: asIcon(GalleryVerticalEnd),
  "gallery-vertical-end": asIcon(GalleryVerticalEnd),
  github: asIcon(FaGithub),
  google: asIcon(SiGoogle),
  gsap: asIcon(SiGreensock),
  home: asIcon(Home),
  illustrator: asIcon(Shapes),
  instagram: asIcon(FaInstagram),
  layout: asIcon(LayoutTemplate),
  layers: asIcon(Layers),
  linkedin: asIcon(FaLinkedin),
  mail: asIcon(Mail),
  message: asIcon(MessageCircleMore),
  "message-circle-more": asIcon(MessageCircleMore),
  "message-square-quote": asIcon(MessageSquareQuote),
  "monitor-smartphone": asIcon(MonitorSmartphone),
  netflix: asIcon(SiNetflix),
  nextjs: asIcon(SiNextdotjs),
  nodejs: asIcon(SiNodedotjs),
  obsstudio: asIcon(SiObsstudio),
  "package-2": asIcon(Package2),
  "package-check": asIcon(PackageCheck),
  palette: asIcon(Palette),
  "pen-tool": asIcon(PenTool),
  "phone-call": asIcon(PhoneCall),
  photoshop: asIcon(PenTool),
  portfolio: asIcon(Layers),
  quote: asIcon(MessageSquareQuote),
  react: asIcon(SiReact),
  reddit: asIcon(SiReddit),
  services: asIcon(Sparkles),
  shapes: asIcon(Shapes),
  "shield-check": asIcon(ShieldCheck),
  sparkles: asIcon(Sparkles),
  spotify: asIcon(SiSpotify),
  tailwindcss: asIcon(SiTailwindcss),
  target: asIcon(Target),
  telegram: asIcon(SiTelegram),
  testimonials: asIcon(MessageSquareQuote),
  trophy: asIcon(Trophy),
  "trending-down": asIcon(TrendingDown),
  "trending-up": asIcon(TrendingUp),
  "trending-up-down": asIcon(TrendingUpDown),
  typescript: asIcon(SiTypescript),
  users: asIcon(Users),
  vercel: asIcon(SiVercel),
  wallet: asIcon(WalletCards),
  "wallet-cards": asIcon(WalletCards),
  wand: asIcon(WandSparkles),
  "wand-sparkles": asIcon(WandSparkles),
  workflow: asIcon(Workflow),
  youtube: asIcon(SiYoutube),
  "si:apple": asIcon(SiApple),
  "si:discord": asIcon(SiDiscord),
  "si:github": asIcon(SiGithub),
};

export const navigationIconRegistry: NavIconRegistry = {
  home: Home,
  portfolio: Layers,
  services: Sparkles,
  testimonials: MessageSquareQuote,
  faq: CircleHelp,
};

export const socialIconRegistry: Record<string, IconComponent> = {
  discord: asIcon(FaDiscord),
  github: asIcon(FaGithub),
  instagram: asIcon(FaInstagram),
  linkedin: asIcon(FaLinkedin),
};

export function getIconComponent(iconKey?: string | null) {
  if (!iconKey) {
    return undefined;
  }

  const raw = iconKey.trim();

  if (!raw || raw === "none") {
    return undefined;
  }

  const direct = staticIconRegistry[raw] ?? staticIconRegistry[raw.toLowerCase()];

  if (direct) {
    return direct;
  }

  const [prefixRaw, ...rest] = raw.split(":");

  if (!rest.length) {
    return staticIconRegistry[toKebabIconName(raw)];
  }

  const prefix = prefixRaw.toLowerCase();
  const value = rest.join(":");

  if (prefix === "lucide") {
    return staticIconRegistry[toKebabIconName(value)];
  }

  if (prefix === "si" && staticIconRegistry[`si:${value.toLowerCase()}`]) {
    return staticIconRegistry[`si:${value.toLowerCase()}`];
  }

  return undefined;
}

export function parseIconKey(iconKey?: string | null): ParsedIconKey {
  if (!iconKey) {
    return { kind: "none" };
  }

  const raw = iconKey.trim();

  if (!raw || raw === "none") {
    return { kind: "none" };
  }

  const staticComponent = getIconComponent(raw);

  if (staticComponent) {
    return { kind: "static", component: staticComponent };
  }

  if (raw.startsWith("/") || raw.startsWith("http")) {
    return {
      kind: "svg",
      src: raw,
      mode: raw.toLowerCase().includes(".svg") ? "mask" : "image",
    };
  }

  const [prefixRaw, ...rest] = raw.split(":");

  if (!rest.length) {
    return { kind: "lucide", name: toKebabIconName(raw) };
  }

  const prefix = prefixRaw.toLowerCase();
  const value = rest.join(":");

  if (prefix === "svg" || prefix === "mask") {
    return { kind: "svg", src: value, mode: "mask" };
  }

  if (prefix === "img" || prefix === "image") {
    return { kind: "svg", src: value, mode: "image" };
  }

  if (prefix === "lucide") {
    return { kind: "lucide", name: toKebabIconName(value) };
  }

  if (
    prefix === "material" ||
    prefix === "material-symbol" ||
    prefix === "material-symbols" ||
    prefix === "google" ||
    prefix === "google-font" ||
    prefix === "google-icon"
  ) {
    return { kind: "material", symbol: normalizeMaterialSymbol(value) };
  }

  const reactIconPack = prefix.startsWith("react-icons/")
    ? prefix.replace("react-icons/", "")
    : prefix;

  if (isReactIconPack(reactIconPack)) {
    return { kind: "react-icon", pack: reactIconPack, componentName: value };
  }

  return { kind: "lucide", name: toKebabIconName(raw) };
}
