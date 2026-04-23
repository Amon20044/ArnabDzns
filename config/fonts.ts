import localFont from "next/font/local";
import { Caveat, Poppins } from "next/font/google";

export const aeonik = localFont({
  src: [
    {
      path: "../public/fonts/aeonik/core/aeonik-regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/aeonik/core/aeonik-bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-aeonik",
  display: "swap",
});

export const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const caveat = Caveat({
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
});

