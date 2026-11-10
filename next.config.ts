import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const withMDX = createMDX({
  extension: /\.(md|mdx)$/,
});

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  async redirects() {
    return [
      // The storefront moved to its own subdomain. Temporary (307) so the
      // target can change later without browsers having cached it forever.
      {
        source: "/shop/:path*",
        destination: "https://store.arnabdzns.com/:path*",
        permanent: false,
      },
      // The profile page was replaced by the bio bubble in the header.
      { source: "/about", destination: "/", permanent: false },
    ];
  },
  async headers() {
    return [{
      source: "/media/:path*",
      headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
    }];
  },
  images: {
    deviceSizes: [640, 960, 1280, 1920],
    imageSizes: [64, 128, 256, 384],
    dangerouslyAllowSVG: true,
    contentDispositionType: "inline",
    minimumCacheTTL: 2_678_400,
    qualities: [50, 75, 90, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.simpleicons.org",
      },
      {
        protocol: "https",
        hostname: "i.ibb.co",
      },
      {
        protocol: "https",
        hostname: "liquipedia.net",
      },
    ],
  },
};

export default withMDX(nextConfig);
