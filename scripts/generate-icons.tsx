/**
 * Builds the site icons from the character illustration, so the favicon
 * always matches the drawing. Run with `npm run icons:generate` after
 * changing `components/illustrations/arnab-character.tsx`.
 *
 * Writes app/icon.svg, app/apple-icon.png and app/favicon.ico.
 */
import { writeFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import sharp from "sharp";
import { ArnabCharacter } from "@/components/illustrations/arnab-character";

// The head and headset, with a little room around them, from the 480x520 art.
const CROP = { x: 96, y: 6, size: 288 };

function buildIconSvg() {
  const markup = renderToStaticMarkup(createElement(ArnabCharacter, { title: "" }));
  const inner = markup.slice(markup.indexOf(">") + 1, markup.lastIndexOf("</svg>"));
  const { x, y, size } = CROP;
  const radius = size * 0.23;

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${size} ${size}" width="512" height="512">`,
    `<defs>`,
    `<radialGradient id="icon-bg" cx="0.5" cy="0.3" r="0.8">`,
    `<stop offset="0" stop-color="#c084fc"/><stop offset="0.55" stop-color="#9333ea"/><stop offset="1" stop-color="#6b21a8"/>`,
    `</radialGradient>`,
    `<clipPath id="icon-clip"><rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${radius}"/></clipPath>`,
    `</defs>`,
    `<g clip-path="url(#icon-clip)">`,
    `<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="url(#icon-bg)"/>`,
    `<g transform="translate(0 14)">${inner}</g>`,
    `</g>`,
    `</svg>`,
  ].join("");
}

/** Wrap PNGs in an ICO container (PNG-in-ICO, supported by every current browser). */
function buildIco(images: { size: number; data: Buffer }[]) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  let offset = 6 + images.length * 16;
  const entries = images.map(({ size, data }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    return entry;
  });

  return Buffer.concat([header, ...entries, ...images.map((image) => image.data)]);
}

async function main() {
  const svg = buildIconSvg();
  const source = Buffer.from(svg);
  const png = (size: number) =>
    sharp(source, { density: 300 }).resize(size, size).png().toBuffer();

  writeFileSync("app/icon.svg", svg);
  // iOS masks the icon itself, so the apple icon is flattened onto purple.
  writeFileSync(
    "app/apple-icon.png",
    await sharp(source, { density: 300 }).resize(180, 180).flatten({ background: "#7e22ce" }).png().toBuffer(),
  );
  writeFileSync(
    "app/favicon.ico",
    buildIco(await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await png(size) })))),
  );

  console.log("Wrote app/icon.svg, app/apple-icon.png, app/favicon.ico");
}

main();
