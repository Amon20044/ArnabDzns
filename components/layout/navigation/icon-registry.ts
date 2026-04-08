import {
  CircleHelp,
  Home,
  Layers,
  MessageSquareQuote,
  Sparkles,
} from "lucide-react";
import type { NavIconRegistry } from "@/types";

export const iconRegistry: NavIconRegistry = {
  home: Home,
  portfolio: Layers,
  services: Sparkles,
  testimonials: MessageSquareQuote,
  faq: CircleHelp,
};
