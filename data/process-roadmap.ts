import type { RoadmapSectionConfig } from "@/types";

export const processRoadmapSection = {
  hero: {
    badges: [
      {
        id: "roadmap-process",
        label: "Process",
        icon: "none",
        tone: "#18181b",
        textColor: "#fafafa",
        iconColor: "#fafafa",
      },
    ],
    title: ["Getting your projects done", "has never been easier"],
    description: "The easy way to get projects done.",
    cta: false,
  },
  startFrom: "right",
  items: [
    {
      id: "roadmap-define-goals",
      label: "Step #1",
      title: "Define your project goals",
      description:
        "Identify what you need most, who it is for, and what a strong result should feel like before design starts.",
    },
    {
      id: "roadmap-scope-budget",
      label: "Step #2",
      title: "Discuss timeline and budget",
      description:
        "We align on delivery windows, revision scope, and the level of polish so the whole project moves with clarity.",
    },
    {
      id: "roadmap-build-review",
      label: "Step #3",
      title: "Build, refine, and review",
      description:
        "Design directions turn into polished working screens, with feedback folded in quickly and without losing momentum.",
    },
    {
      id: "roadmap-final-delivery",
      label: "Step #4",
      title: "Approve and receive final files",
      description:
        "Once everything feels right, you get the final assets and handoff in the formats you need to ship confidently.",
    },
  ],
} satisfies RoadmapSectionConfig;
