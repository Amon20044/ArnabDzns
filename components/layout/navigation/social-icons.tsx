import type { IconComponent } from "@/lib/icons";
import { socialIconRegistry as sharedSocialIconRegistry } from "@/lib/icons";

export type SocialIconComponent = IconComponent;

export const socialIconRegistry: Record<string, SocialIconComponent> =
  sharedSocialIconRegistry;
