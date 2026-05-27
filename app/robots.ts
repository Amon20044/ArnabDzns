import type { MetadataRoute } from "next";
import { siteConfig } from "@/data/site";

// Explicitly allow AI / answer engine crawlers so Arnab Designs content
// (Arnab Shaw, arnabdzns) can be cited by ChatGPT, Claude, Perplexity, Gemini,
// Google's AI Overviews / AI Mode, and other generative answer engines.
// Source list per each provider's published docs:
// - OpenAI: GPTBot, OAI-SearchBot, ChatGPT-User
// - Anthropic: ClaudeBot, anthropic-ai, Claude-Web
// - Perplexity: PerplexityBot
// - Google AI: Google-Extended (controls training inclusion separately from Googlebot)
// - Apple: Applebot-Extended (Apple Intelligence / Siri)
// - Meta: meta-externalagent
// - Common Crawl: CCBot (powers many open-source LLM corpora)
// - Mistral: MistralAI-User
const AI_AND_ANSWER_ENGINE_BOTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "anthropic-ai",
  "Claude-Web",
  "PerplexityBot",
  "Google-Extended",
  "Applebot",
  "Applebot-Extended",
  "meta-externalagent",
  "FacebookBot",
  "Bytespider",
  "CCBot",
  "MistralAI-User",
  "DuckAssistBot",
  "Diffbot",
  "Amazonbot",
  "cohere-ai",
  "YouBot",
];

const DISALLOWED_PATHS = ["/dashboard", "/dashboard/", "/api/"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: DISALLOWED_PATHS,
      },
      {
        userAgent: AI_AND_ANSWER_ENGINE_BOTS,
        allow: "/",
        disallow: DISALLOWED_PATHS,
      },
    ],
    sitemap: [
      `${siteConfig.url}/sitemap.xml`,
      `${siteConfig.url}/llms.txt`,
    ],
    host: siteConfig.url,
  };
}
