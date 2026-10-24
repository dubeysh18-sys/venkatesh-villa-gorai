#!/usr/bin/env node
// Builds a single 1200x630 OG/share image from the gallery's hero photo,
// with the villa name overlaid. WhatsApp link previews (the main way this
// site gets shared) use this image, so it must exist before every build.
// Runs before eleventy via the "presite" npm script, same as sync-gallery.

import sharp from "sharp";
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const galleryDataPath = path.join(repoRoot, "src/_data/gallery.json");
const galleryDir = path.join(repoRoot, "src/images/gallery");
const siteImagesDir = path.join(repoRoot, "src/images/site");
const outputPath = path.join(siteImagesDir, "og-image.jpg");

const WIDTH = 1200;
const HEIGHT = 630;

function escapeXml(str) {
  return str.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&apos;",
  }[c]));
}

async function main() {
  if (!existsSync(galleryDataPath)) {
    console.warn("[og-image] No gallery.json found, skipping.");
    return;
  }
  const gallery = JSON.parse(readFileSync(galleryDataPath, "utf8"));
  const heroSlide =
    gallery.slides.find((s) => s.hero && s.show && !s.missing) ||
    gallery.slides.find((s) => s.show && !s.missing);

  if (!heroSlide) {
    console.warn("[og-image] No usable hero slide found in gallery.json, skipping.");
    return;
  }

  const sourcePath = path.join(galleryDir, heroSlide.file);
  if (!existsSync(sourcePath)) {
    console.warn(`[og-image] WARNING: ${sourcePath} does not exist, skipping.`);
    return;
  }

  if (!existsSync(siteImagesDir)) mkdirSync(siteImagesDir, { recursive: true });

  const title = "Venkatesh Villa Gorai";
  const subtitle = "Private 4BHK villa · Stays & celebrations near Gorai Beach, Mumbai";

  const overlaySvg = `
    <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="scrim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#231916" stop-opacity="0"/>
          <stop offset="55%" stop-color="#231916" stop-opacity="0.55"/>
          <stop offset="100%" stop-color="#231916" stop-opacity="0.92"/>
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="${WIDTH}" height="${HEIGHT}" fill="url(#scrim)"/>
      <text x="64" y="${HEIGHT - 140}" font-family="Georgia, 'Times New Roman', serif" font-size="64" font-weight="700" fill="#fff8f6">${escapeXml(title)}</text>
      <text x="64" y="${HEIGHT - 88}" font-family="Arial, sans-serif" font-size="28" fill="#f2ded9">${escapeXml(subtitle)}</text>
    </svg>
  `;

  await sharp(sourcePath)
    .resize(WIDTH, HEIGHT, { fit: "cover", position: "attention" })
    .composite([{ input: Buffer.from(overlaySvg), top: 0, left: 0 }])
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(outputPath);

  console.log(`[og-image] Generated ${path.relative(repoRoot, outputPath)} from ${heroSlide.file}`);
}

main().catch((err) => {
  console.warn(`[og-image] WARNING: failed to generate OG image: ${err.message}`);
});
