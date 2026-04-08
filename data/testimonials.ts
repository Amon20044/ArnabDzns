import type { TestimonialsSectionConfig } from "@/types";

/**
 * Testimonials section content.
 *
 * Today this is statically authored, but the shape mirrors what a backend
 * payload would look like — `categories` is an array, every entity has an
 * `id`, and every category carries its own `trustedBy` group plus its own
 * list. To wire this to a CMS later, swap this constant for a fetch and
 * keep the same shape.
 */
export const testimonialsSection = {
  eyebrow: "Testimonials",
  title: "What Our Clients Say",
  description:
    "Feedback from clients who turned their ideas into success with my expertise.",
  defaultCategoryId: "clients",
  categories: [
    {
      id: "clients",
      label: "Clients",
      shortLabel: "Clients",
      icon: "users",
      description: "Creators and brands I've shipped thumbnail and design work for.",
      trustedBy: {
        label: "Trusted by Visionaries",
        avatars: [
          {
            src: "/demo/avatars/onespot.png",
            alt: "Onespot Tech",
            fallback: "OT",
          },
          {
            src: "/demo/avatars/creator-2.png",
            alt: "Independent creator",
            fallback: "IC",
          },
          {
            src: "/demo/avatars/creator-3.png",
            alt: "Studio partner",
            fallback: "SP",
          },
        ],
      },
      testimonials: [
        {
          id: "client-onespot",
          name: "Onespot Tech",
          metaLabel: "6.58 lakh subscribers",
          message:
            "Absolutely loved the thumbnails! The designer truly understands what works for my audience and created vibrant, engaging designs that stand out. The process was smooth, and they were open to my feedback, making sure everything was perfect before finalizing. I've already seen an increase in views since switching to these new thumbnails.",
          rating: 5,
          avatar: {
            src: "/demo/avatars/onespot.png",
            alt: "Onespot Tech",
            fallback: "OT",
          },
          source: { href: "https://youtube.com", external: true },
        },
        {
          id: "client-pixelroom",
          name: "Pixel Room",
          metaLabel: "1.2M subscribers",
          message:
            "The level of detail was unreal. Every thumbnail felt purposeful — color, composition, hierarchy — and our CTR jumped within the first week. Easily the smoothest design partnership I've had this year.",
          rating: 5,
          avatar: {
            src: "/demo/avatars/creator-2.png",
            alt: "Pixel Room",
            fallback: "PR",
          },
        },
        {
          id: "client-studio-loop",
          name: "Studio Loop",
          metaLabel: "Founder, Studio Loop",
          message:
            "Communication was sharp, turnaround was fast, and the work landed exactly where we needed it. Felt like having a senior designer embedded with the team rather than a vendor.",
          rating: 5,
          avatar: {
            src: "/demo/avatars/creator-3.png",
            alt: "Studio Loop",
            fallback: "SL",
          },
        },
      ],
    },
    {
      id: "tournament-orgs",
      label: "Tournament Orgs",
      shortLabel: "TOs",
      icon: "trophy",
      description: "Esports tournament organizers I've designed brands and broadcasts for.",
      trustedBy: {
        label: "Trusted by Tournament Organizers",
        avatars: [
          {
            src: "/demo/avatars/to-1.png",
            alt: "Skyline Esports",
            fallback: "SE",
          },
          {
            src: "/demo/avatars/to-2.png",
            alt: "Apex League",
            fallback: "AL",
          },
          {
            src: "/demo/avatars/to-3.png",
            alt: "Vanguard Cup",
            fallback: "VC",
          },
        ],
      },
      testimonials: [
        {
          id: "to-skyline",
          name: "Skyline Esports",
          metaLabel: "32-team championship",
          message:
            "Brand identity, broadcast overlays, and bracket graphics — everything tied together so cleanly that our production team didn't need a single revision on stream day. Genuinely raised the bar for our event.",
          rating: 5,
          avatar: {
            src: "/demo/avatars/to-1.png",
            alt: "Skyline Esports",
            fallback: "SE",
          },
        },
        {
          id: "to-apex",
          name: "Apex League",
          metaLabel: "Pro circuit operator",
          message:
            "We needed a look that felt premium without losing the competitive edge our players love. The final identity hit both, and our sponsors immediately noticed the upgrade.",
          rating: 5,
          avatar: {
            src: "/demo/avatars/to-2.png",
            alt: "Apex League",
            fallback: "AL",
          },
        },
      ],
    },
    {
      id: "organizations",
      label: "Organizations",
      shortLabel: "Orgs",
      icon: "building",
      description: "Teams and orgs that brought me in for longer-form brand and product work.",
      trustedBy: {
        label: "Trusted by Growing Teams",
        avatars: [
          {
            src: "/demo/avatars/org-1.png",
            alt: "Northwind Labs",
            fallback: "NL",
          },
          {
            src: "/demo/avatars/org-2.png",
            alt: "Lumen Studio",
            fallback: "LS",
          },
        ],
      },
      testimonials: [
        {
          id: "org-northwind",
          name: "Northwind Labs",
          metaLabel: "Series A startup",
          message:
            "Took our marketing site from generic to genuinely memorable. The motion details and surface treatments make the product feel five times its size. Our investors actually commented on the new site.",
          rating: 5,
          avatar: {
            src: "/demo/avatars/org-1.png",
            alt: "Northwind Labs",
            fallback: "NL",
          },
        },
      ],
    },
  ],
} satisfies TestimonialsSectionConfig;
