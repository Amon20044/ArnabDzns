import type { FAQSectionConfig } from "@/types";

export const faqSection = {
  eyebrow: "FAQ",
  title: ["Frequently Asked", "Questions"],
  description: "Everything you need to know before getting started.",
  defaultOpenId: "faq-getting-started",
  helperText: "Can't find your answer?",
  cta: {
    label: "Get in touch",
    href: "/contact",
    icon: "arrow-right",
    iconVisibility: "hover",
  },
  items: [
    {
      id: "faq-getting-started",
      question: "What do you need from me to get started?",
      answer:
        "A short brief, your goals, the audience you want to reach, and any references or brand materials you already trust are enough to start. If the direction still feels messy, that is fine too.",
    },
    {
      id: "faq-revisions",
      question: "What if I need more revisions?",
      answer:
        "Every project includes focused revision rounds so I can refine the direction without losing momentum. If the scope grows beyond the original plan, I can keep iterating with a clear add-on structure instead of letting things get vague.",
    },
    {
      id: "faq-timeline",
      question: "How long does a typical project take?",
      answer:
        "Smaller updates and focused design passes can move quickly, while full portfolio sites, launch pages, and broader brand systems usually take one to three weeks depending on scope. You will always get a clear timeline before work begins.",
    },
    {
      id: "faq-stack",
      question: "Do you only design, or do you also build the site?",
      answer:
        "Both. Projects can stay at the design and direction stage, or move through full frontend implementation in Next.js so the final experience matches the intended polish more closely.",
    },
    {
      id: "faq-fit",
      question: "What kind of projects are the best fit?",
      answer:
        "The strongest fit is usually portfolio websites, launch pages, personal brand sites, and premium marketing experiences that need better hierarchy, presentation, and frontend polish.",
    },
    {
      id: "faq-content",
      question: "Can you help if the copy or direction still feels rough?",
      answer:
        "Yes. You do not need a polished brief to get useful help. Rough notes, references, and half-formed ideas are enough to start shaping a clearer direction together.",
    },
  ],
} satisfies FAQSectionConfig;
