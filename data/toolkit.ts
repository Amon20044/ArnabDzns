import type { ToolkitSectionConfig } from "@/types";

export const toolkitSection = {
  eyebrow: "Toolkit",
  title: "Skills and expertise",
  description: "The tools I lean on when a site needs to feel sharp, expressive, and production-ready.",
  items: [
    {
      id: "toolkit-figma",
      icon: "figma",
      title: "Figma",
      description: "Design systems, landing page directions, and high-fidelity interface work.",
      percentage: 97,
    },
    {
      id: "toolkit-framer",
      icon: "framer",
      title: "Framer",
      description: "Rapid prototypes and polished interactions that help ideas feel real early.",
      percentage: 92,
    },
    {
      id: "toolkit-nextjs",
      icon: "nextjs",
      title: "Next.js",
      description: "Fast App Router builds with cleaner structure, strong performance, and flexible layouts.",
      percentage: 91,
    },
    {
      id: "toolkit-react",
      icon: "react",
      title: "React",
      description: "Reusable components and responsive interfaces that stay maintainable as they grow.",
      percentage: 95,
    },
    {
      id: "toolkit-tailwindcss",
      icon: "tailwindcss",
      title: "Tailwind CSS",
      description: "A consistent visual system with speed in the build loop and nuance in the final UI.",
      percentage: 94,
    },
    {
      id: "toolkit-gsap",
      icon: "gsap",
      title: "GSAP",
      description: "Motion timing, scroll choreography, and transitions that add confidence without noise.",
      percentage: 86,
    },
  ],
} satisfies ToolkitSectionConfig;
