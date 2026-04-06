// ============================================
// ICON REGISTRY
// Maps nav item IDs → Lucide icon components.
//
// To add a new nav item:
//  1. Add the entry in data/navigation.ts
//  2. Import the icon here and add the mapping.
// ============================================

import {
  Home,
  Layers,
  Sparkles,
  ShoppingBag,
  User,
  Mail,
} from "lucide-react";

import type { NavIconRegistry } from "@/types";

export const iconRegistry: NavIconRegistry = {
  home:      Home,
  portfolio: Layers,
  services:  Sparkles,
  shop:      ShoppingBag,
  about:     User,
  contact:   Mail,
};
