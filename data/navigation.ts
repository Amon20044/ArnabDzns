// ============================================
// NAVIGATION CONFIG
// ─────────────────────────────────────────
// Change labels, paths, order, or CTA buttons
// entirely from this one file.
//
// Icon mapping lives in:
//   components/layout/navigation/icon-registry.ts
// ============================================

import { ShoppingBag, CalendarDays } from "lucide-react";
import type { NavigationConfig } from "@/types";

export const navigationConfig: NavigationConfig = {
  /**
   * Main nav links.
   * To reorder: just move the entries.
   * To add:    add entry + matching icon in icon-registry.ts
   * To remove: delete the entry.
   */
  items: [
    { id: "portfolio", label: "Portfolio", path: "/portfolio" },
    { id: "about",     label: "About",     path: "/about"     },
    { id: "services",  label: "Services",  path: "/services"  },
    { id: "contact",   label: "Contact",   path: "/contact"   },
  ],

  /**
   * CTA buttons — rendered right side in order.
   * variant "secondary" = ghost/outline
   * variant "primary"   = filled dark pill
   *
   * Use `path` for internal routes, `href` for external URLs.
   */
  ctas: [
    {
      label:   "Shop",
      variant: "secondary",
      path:    "/shop",
      Icon:    ShoppingBag,
    },
    {
      label:   "Book a Call",
      variant: "primary",
      // href: "https://cal.com/yourname",  // ← uncomment for Calendly / Cal.com
      path:    "/book",
      Icon:    CalendarDays,
    },
  ],
};
