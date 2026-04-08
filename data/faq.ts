import type { FAQSectionConfig } from "@/types";

/**
 * FAQ section content.
 *
 * Static today, but the shape mirrors a backend payload — `items` is an
 * array of `{ id, question, answer }` so this can be swapped for a fetch
 * without touching the component. The CTA reuses `HeroCTAConfig` so the
 * shared `PrimaryButton` renders it as-is.
 */
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
        "To begin, please provide the following: a brief description of your video content or channel, any branding guidelines (colors, fonts, logo), example thumbnails you like or want to emulate, any text or specific imagery you'd like included in the thumbnail, and the video title (if relevant).",
    },
    {
      id: "faq-revisions",
      question: "What if I need more revisions?",
      answer:
        "Every project includes two rounds of focused revisions so we can dial in exactly what you want. If you need more iterations beyond that, we can absolutely keep going — additional rounds are billed at a small flat rate so you always know what to expect.",
    },
    {
      id: "faq-timeline",
      question: "How long will it take to complete my video project?",
      answer:
        "Most thumbnail and short-form projects turn around in 2–4 business days from kickoff. Longer-form work (full landing pages, brand systems) typically takes 1–3 weeks depending on scope. You'll always get a clear timeline before we start.",
    },
    {
      id: "faq-subtitles",
      question: "Do you provide subtitles or captions for videos?",
      answer:
        "Yes — for video deliverables I can include burned-in captions, soft subtitle tracks (.srt / .vtt), or styled lower-thirds. Just let me know which format you need during kickoff and it'll be folded into the timeline.",
    },
    {
      id: "faq-bulk",
      question: "Do you offer a bulk discount for multiple thumbnails?",
      answer:
        "Yes. Packs of 5+ thumbnails get a tiered discount, and ongoing creators on a monthly retainer get the best rate. Reach out with your channel and rough volume and I'll send back a tailored quote.",
    },
    {
      id: "faq-not-happy",
      question: "What if I don't like the thumbnail?",
      answer:
        "Then we keep iterating until you do. The first revision round is the biggest one — we'll change direction completely if needed. I'd rather spend extra time getting it right than ship something you're not excited to publish.",
    },
  ],
} satisfies FAQSectionConfig;
