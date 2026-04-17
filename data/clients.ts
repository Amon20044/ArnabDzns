import type { ImageMarqueeRow } from "@/components/ui/image-marquee";

export const clientMarqueeRows: ImageMarqueeRow[] = [
  {
    id: "clients-row-1",
    direction: "left",
    speed: 40,
    images: [
      { id: "client-google", client: "Google", src: "https://cdn.simpleicons.org/google", alt: "Google", link: "https://google.com", width: 160, height: 48 },
      { id: "client-spotify", client: "Spotify", src: "https://cdn.simpleicons.org/spotify", alt: "Spotify", link: "https://spotify.com", width: 160, height: 48 },
      { id: "client-discord", client: "Discord", src: "https://cdn.simpleicons.org/discord", alt: "Discord", link: "https://discord.com", width: 160, height: 48 },
      { id: "client-github", client: "GitHub", src: "https://cdn.simpleicons.org/github", alt: "GitHub", link: "https://github.com", width: 160, height: 48 },
      { id: "client-netflix", client: "Netflix", src: "https://cdn.simpleicons.org/netflix", alt: "Netflix", link: "https://netflix.com", width: 160, height: 48 },
      { id: "client-reddit", client: "Reddit", src: "https://cdn.simpleicons.org/reddit", alt: "Reddit", link: "https://reddit.com", width: 160, height: 48 },
      { id: "client-telegram", client: "Telegram", src: "https://cdn.simpleicons.org/telegram", alt: "Telegram", link: "https://telegram.com", width: 160, height: 48 },
      { id: "client-apple", client: "Apple", src: "https://cdn.simpleicons.org/apple", alt: "Apple", link: "https://apple.com", width: 160, height: 48 },
      { id: "client-youtube", client: "YouTube", src: "https://cdn.simpleicons.org/youtube", alt: "YouTube", link: "https://youtube.com", width: 160, height: 48 },
    ],
  },
];
