import localFont from "next/font/local";
import { Caveat } from "next/font/google";

export const aeonik = localFont({
  src: "../public/fonts/aeonik/pro/aeonik-pro-vf.woff2",
  weight: "100 900",
  style: "normal",
  variable: "--font-aeonik",
  display: "swap",
});

export const caveat = Caveat({
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
});
