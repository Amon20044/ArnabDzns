import type { ComponentType } from "react";
import type { MDXComponents } from "mdx/types";
import BeforeAfterCampaign from "./before-after-campaign.mdx";
import CategoryMix from "./category-mix.mdx";
import Creators from "./creators.mdx";
import CtaUplift from "./cta-uplift.mdx";
import Engagement from "./engagement.mdx";
import Impressions from "./impressions.mdx";
import LiveStreamingCollaborations from "./live-streaming-collaborations.mdx";
import ReachGrowth from "./reach-growth.mdx";
import SocialLikes from "./social-likes.mdx";
import TournamentOrganizers from "./tournament-organizers.mdx";

export type ImpactBodyComponent = ComponentType<{ components?: MDXComponents }>;

export const impactBodyRegistry: Record<string, ImpactBodyComponent> = {
  "tournament-organizers": TournamentOrganizers,
  creators: Creators,
  impressions: Impressions,
  "cta-uplift": CtaUplift,
  "reach-growth": ReachGrowth,
  engagement: Engagement,
  "social-likes": SocialLikes,
  "before-after-campaign": BeforeAfterCampaign,
  "category-mix": CategoryMix,
  "live-streaming-collaborations": LiveStreamingCollaborations,
};
