import type { ComponentType, SVGProps } from "react";

type SocialIconProps = SVGProps<SVGSVGElement>;
type SocialIconComponent = ComponentType<SocialIconProps>;

export const DiscordIcon = (props: SocialIconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    {...props}
  >
    <path
      d="M8.2 7.2a8.9 8.9 0 0 1 7.6 0"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
    <path
      d="M7.1 17c1.4.9 3.1 1.35 4.9 1.35S15.5 17.9 16.9 17l1-6.74a2.6 2.6 0 0 0-1.82-2.85l-1.1-.32-.66 1.18a10.1 10.1 0 0 0-4.62 0l-.66-1.18-1.1.32A2.6 2.6 0 0 0 6.1 10.26L7.1 17Z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
    <circle cx="9.65" cy="12.1" r="0.95" fill="currentColor" />
    <circle cx="14.35" cy="12.1" r="0.95" fill="currentColor" />
  </svg>
);

export const InstagramIcon = (props: SocialIconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    {...props}
  >
    <rect
      x="3.75"
      y="3.75"
      width="16.5"
      height="16.5"
      rx="5.25"
      stroke="currentColor"
      strokeWidth="1.7"
    />
    <circle cx="12" cy="12" r="4.1" stroke="currentColor" strokeWidth="1.7" />
    <circle cx="17.1" cy="6.9" r="1.1" fill="currentColor" />
  </svg>
);

export const LinkedInIcon = (props: SocialIconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    {...props}
  >
    <rect
      x="3.75"
      y="3.75"
      width="16.5"
      height="16.5"
      rx="4.75"
      stroke="currentColor"
      strokeWidth="1.7"
    />
    <circle cx="8.15" cy="8.15" r="1.15" fill="currentColor" />
    <path
      d="M8.15 10.6V16.25"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
    <path
      d="M12 16.25v-3.4a2.2 2.2 0 0 1 4.4 0v3.4"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 10.6v5.65"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  </svg>
);

export const socialIconRegistry: Record<string, SocialIconComponent> = {
  discord: DiscordIcon,
  instagram: InstagramIcon,
  linkedin: LinkedInIcon,
};
