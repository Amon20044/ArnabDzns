import type { HeroBadgeConfig, HeroSectionConfig } from "@/types";

export interface AboutIntroCardContent {
  badges: HeroBadgeConfig[];
  portraitEyebrow: string;
  name: string;
  role: string;
  location: string;
  sinceLabel: string;
  shortVersionLabel: string;
  title: string;
  paragraphs: string[];
  signature: string;
  timezone: string;
}

export interface AboutAvailabilityStat {
  id: string;
  label: string;
  value: string;
  meta?: string;
  statusColor?: string;
}

export interface AboutExperienceItem {
  id: string;
  company: string;
  companyImageUrl?: string;
  role: string;
  summary: string;
  dates: string;
  location: string;
  initials: string;
  tone: string;
}

export interface AboutManifestoContent {
  eyebrow: string;
  lead: string;
  accent: string;
  middle: string;
  tail: string;
  description: string;
  principles: Array<{
    id: string;
    title: string;
    description: string;
  }>;
}

export interface AboutTeamMemberRow {
  label: string | [string] | [string, string];
  value: string;
  labelHighlightColor?: string;
}

export interface AboutTeamMember {
  id: string;
  name: string;
  designation: string;
  imageSrc: string;
  imageAlt?: string;
  rows: AboutTeamMemberRow[];
}

export interface AboutContactContent {
  badge: HeroBadgeConfig;
  lead: string;
  accent: string;
  tail: string;
  description: string;
  primaryLabel: string;
  secondaryLabel: string;
}

export interface AboutPageContent {
  intro: AboutIntroCardContent;
  availability: AboutAvailabilityStat[];
  experienceHero: HeroSectionConfig;
  experienceMeta: string;
  experience: AboutExperienceItem[];
  manifesto: AboutManifestoContent;
  teamHero: HeroSectionConfig;
  team: AboutTeamMember[];
  contact: AboutContactContent;
}

export const aboutPageContent: AboutPageContent = {
  intro: {
    badges: [
      {
        id: "about-me",
        label: "About Me",
        icon: "briefcase",
        tone: "#2f1544",
        textColor: "#faf5ff",
        iconColor: "#faf5ff",
      },
      {
        id: "about-years",
        label: "5+ Years designing",
        icon: "sparkles",
        tone: "#ffffff",
        textColor: "#18181b",
        iconColor: "#7e22ce",
      },
    ],
    portraitEyebrow: "// portrait - say hi",
    name: "Arnab Shaw",
    role: "Graphic Designer",
    location: "Bengaluru, IN",
    sinceLabel: "EST. 2021",
    shortVersionLabel: "The short version",
    title: "A designer who cares more about clarity than decoration.",
    paragraphs: [
      "I build visual systems for brands, creators, and teams that mostly live online. The work usually shows up as identity, campaign art, social creative, and the occasional landing page, but the throughline is always the same: a strong point of view, held together by structure you can actually use.",
      "I started in gaming and esports, which taught me how to design for speed, noise, and scroll. Today I bring that same discipline to brand-forward work, keeping the polish and dropping the flash.",
    ],
    signature: "Arnab",
    timezone: "BLR | GMT+5:30",
  },
  availability: [
    {
      id: "status",
      label: "Status",
      value: "Available",
      statusColor: "#22c55e",
    },
    {
      id: "ongoing",
      label: "Ongoing",
      value: "02 Projects",
    },
    {
      id: "shipped",
      label: "Shipped",
      value: "60+ Projects",
    },
    {
      id: "next-up",
      label: "Next Up",
      value: "04 In queue",
    },
  ],
  experienceHero: {
    badges: [
      {
        id: "experience",
        label: "Experience",
        icon: "briefcase",
        tone: "#2f1544",
        textColor: "#faf5ff",
        iconColor: "#faf5ff",
      },
    ],
    title: ["Where I've been", "putting the hours in."],
    description:
      "Five years across gaming, esports, and brand-first studios. A condensed view of the places that sharpened my speed, systems thinking, and taste.",
    cta: false,
  },
  experienceMeta: "05 roles | 2022 - Present",
  experience: [
    {
      id: "gods-reign",
      company: "Gods Reign",
      companyImageUrl: "https://gods-reign.vercel.app/_next/image?url=%2FGR-icon.webp&w=1920&q=75",
      role: "Senior Graphic Designer",
      summary:
        "Lead visuals aligned with brand presence, performance content, and digital communication across the esports roster.",
      dates: "Apr 2024 - Present",
      location: "Bengaluru, IN",
      initials: "GR",
      tone: "#f6e5ff",
    },
    {
      id: "lets-game-now-senior",
      company: "Lets Game Now",
      companyImageUrl: "https://media.licdn.com/dms/image/v2/D560BAQFM0UISqu7SvA/company-logo_200_200/company-logo_200_200/0/1721459640006?e=1778716800&v=beta&t=a2WD9qJ7o49nK46zp1NsRNXGF_F6KvY43Sju4yBg_Do",
      role: "Senior Graphic Designer",
      summary:
        "Led visual execution across brand communication, campaign assets, and digital content systems for a creator-led gaming platform.",
      dates: "Sep 2024 - Jun 2025",
      location: "Bengaluru, IN",
      initials: "LG",
      tone: "#ede9fe",
    },
    {
      id: "lets-game-now-graphic",
      company: "Lets Game Now",
      companyImageUrl: "",
      role: "Graphic Designer",
      summary:
        "Creative production, digital assets, and structured visual communication for the community side of the brand.",
      dates: "Jul 2024 - Dec 2024",
      location: "Bengaluru, IN",
      initials: "LG",
      tone: "#eefcf2",
    },
    {
      id: "carnival-esports",
      company: "Carnival Esports",
      companyImageUrl: "https://liquipedia.net/commons/images/7/7f/Carnival_Gaming_allmode.png",
      role: "Senior Graphics Designer",
      summary:
        "Esports-focused visuals and content assets for tournaments, rosters, and launches with strong stylistic consistency.",
      dates: "Jan 2024 - Jun 2024",
      location: "Mumbai, IN",
      initials: "CE",
      tone: "#ffe7df",
    },
    {
      id: "s8ul",
      company: "S8UL",
      companyImageUrl: "https://liquipedia.net/commons/images/5/57/Team_Soul_2019_allmode.png",
      role: "Graphics Designer",
      summary:
        "Graphics and content-led creative assets for a major gaming and esports brand, the foundation for how I think about speed and scroll.",
      dates: "Sep 2022 - Dec 2023",
      location: "Mumbai, IN",
      initials: "S8",
      tone: "#2f1544",
    },
  ],
  manifesto: {
    eyebrow: "Personal POV",
    lead: "I design",
    accent: "visual systems",
    middle: "that make brands feel",
    tail: "intentional.",
    description:
      "Hi, I'm Arnab - a visual designer working across brand presence, social-first creative, and digital surfaces. My work sits where taste meets execution: sharp, memorable, and built to read fast.",
    principles: [
      {
        id: "systems",
        title: "Systems over decoration",
        description:
          "The aesthetic should help the work travel, not just make the first frame look pretty.",
      },
      {
        id: "speed",
        title: "Built for speed",
        description:
          "I care about first-glance readability, rhythm, and the kind of pacing that survives real feeds and fast scroll.",
      },
      {
        id: "taste",
        title: "Taste with structure",
        description:
          "Every decision is aimed at making the brand feel more deliberate, more usable, and easier to grow.",
      },
    ],
  },
  teamHero: {
    badges: [
      {
        id: "meet-team",
        label: "Meet The Team",
        icon: "sparkles",
        tone: "#2f1544",
        textColor: "#faf5ff",
        iconColor: "#faf5ff",
      },
    ],
    title: ["The people I ship with."],
    description:
      "Projects rarely happen alone. When the work needs code, motion, or scale, these are the folks I bring in.",
    cta: false,
  },
  team: [
    {
      id: "amon-sharma",
      name: "Amon Sharma",
      designation: "Software Engineer | Architect",
      imageSrc: "/Amon.svg",
      imageAlt: "Illustration of Amon Sharma",
      rows: [
        {
          label: ["Upcoming", "Projects"],
          value: "02",
          labelHighlightColor: "#fef9c3",
        },
        {
          label: ["Ongoing", "Projects"],
          value: "01",
          labelHighlightColor: "#fce7f3",
        },
        {
          label: ["Shipped", "Projects"],
          value: "08",
          labelHighlightColor: "#dcfce7",
        },
      ],
    },
    {
      id: "siddha-bhatia",
      name: "Siddha Bhatia",
      designation: "Video & FX Editor",
      imageSrc: "/Siddha.svg",
      imageAlt: "Illustration of Siddha Bhatia",
      rows: [
        {
          label: ["Upcoming", "Projects"],
          value: "01",
          labelHighlightColor: "#fef9c3",
        },
        {
          label: ["Ongoing", "Projects"],
          value: "02",
          labelHighlightColor: "#fce7f3",
        },
        {
          label: ["Shipped", "Projects"],
          value: "06",
          labelHighlightColor: "#dcfce7",
        },
      ],
    },
  ],
  contact: {
    badge: {
      id: "about-availability",
      label: "Available | Apr - Jun 2026",
      icon: "indicator",
      tone: "#ffffff",
      textColor: "#ffffff",
      indicatorColor: "#22c55e",
      pulse: true,
    },
    lead: "Taking on a small number of",
    accent: "selective",
    tail: "projects this quarter.",
    description:
      "If you're working on something brand-forward, creator-led, or digital-first, send a short brief and I'll reply within a working day.",
    primaryLabel: "Start a project",
    secondaryLabel: "Book a 15-min call",
  },
};
