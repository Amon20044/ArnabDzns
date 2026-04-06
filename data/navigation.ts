import { CalendarDays, ShoppingBag } from "lucide-react";
import type { HeaderConfig, NavigationConfig } from "@/types";

export const headerConfig: HeaderConfig = {
  brand: {
    name: "Arnab",
    role: "Designer and Developer",
    bio: "Crafting tactile digital experiences that still feel human.",
    path: "/",
    logoSrc: "/image.png",
    logoAlt: "Arnab brand portrait",
  },
  availabilityLabel: "Available for select freelance work",
  socials: [
    {
      id: "discord",
      label: "Discord",
      href: "https://discord.com/users/your-id",
    },
    {
      id: "instagram",
      label: "Instagram",
      href: "https://instagram.com/yourhandle",
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      href: "https://linkedin.com/in/yourprofile",
    },
  ],
};

export const navigationConfig: NavigationConfig = {
  items: [
    { id: "portfolio", label: "Portfolio", path: "/portfolio" },
    { id: "projects", label: "Projects", path: "/projects", isNew: true },
    { id: "about", label: "About", path: "/about" },
    { id: "services", label: "Services", path: "/services" },
    { id: "contact", label: "Contact", path: "/contact" },
  ],
  ctas: [
    {
      label: "Shop",
      variant: "secondary",
      path: "/shop",
      Icon: ShoppingBag,
    },
    {
      label: "Book a Call",
      variant: "primary",
      path: "/book",
      Icon: CalendarDays,
    },
  ],
};
