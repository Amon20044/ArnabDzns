import {
  FolderKanban,
  Home,
  Layers,
  Mail,
  ShoppingBag,
  Sparkles,
  User,
} from "lucide-react";
import type { NavIconRegistry } from "@/types";

export const iconRegistry: NavIconRegistry = {
  home: Home,
  portfolio: Layers,
  projects: FolderKanban,
  services: Sparkles,
  shop: ShoppingBag,
  about: User,
  contact: Mail,
};
