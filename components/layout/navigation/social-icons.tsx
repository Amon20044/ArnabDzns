import type { ComponentType, SVGProps } from "react";
import { FaDiscord, FaInstagram, FaLinkedin } from "react-icons/fa6";

type SocialIconComponent = ComponentType<SVGProps<SVGSVGElement>>;

export const socialIconRegistry: Record<string, SocialIconComponent> = {
  discord: FaDiscord,
  instagram: FaInstagram,
  linkedin: FaLinkedin,
};
