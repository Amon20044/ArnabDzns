import type { ComponentType, SVGProps } from "react";
import { FaDiscord, FaGithub, FaInstagram, FaLinkedin } from "react-icons/fa6";

type SocialIconComponent = ComponentType<SVGProps<SVGSVGElement>>;

export const socialIconRegistry: Record<string, SocialIconComponent> = {
  discord: FaDiscord,
  github: FaGithub,
  instagram: FaInstagram,
  linkedin: FaLinkedin,
};
