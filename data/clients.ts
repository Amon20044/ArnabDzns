import type { ImageMarqueeRow } from "@/components/ui/image-marquee";

export const clientMarqueeRows: ImageMarqueeRow[] = [
  {
    id: "clients-row-1",
    direction: "left",
    speed: 40,
    images: [
      { id: "client-google", client: "Google", icon: "google", iconColor: "#4285F4", alt: "Google", link: "https://google.com" },
      { id: "client-spotify", client: "Spotify", icon: "spotify", iconColor: "#1DB954", alt: "Spotify", link: "https://spotify.com" },
      { id: "client-discord", client: "Discord", icon: "discord", iconColor: "#5865F2", alt: "Discord", link: "https://discord.com" },
      { id: "client-github", client: "GitHub", icon: "github", iconColor: "#181717", alt: "GitHub", link: "https://github.com" },
      { id: "client-netflix", client: "Netflix", icon: "netflix", iconColor: "#E50914", alt: "Netflix", link: "https://netflix.com" },
      { id: "client-reddit", client: "Reddit", icon: "reddit", iconColor: "#FF4500", alt: "Reddit", link: "https://reddit.com" },
      { id: "client-telegram", client: "Telegram", icon: "telegram", iconColor: "#26A5E4", alt: "Telegram", link: "https://telegram.com" },
      { id: "client-apple", client: "Apple", icon: "apple", iconColor: "#111111", alt: "Apple", link: "https://apple.com" },
      { id: "client-youtube", client: "YouTube", icon: "youtube", iconColor: "#FF0000", alt: "YouTube", link: "https://youtube.com" },
    ],
  },
];
