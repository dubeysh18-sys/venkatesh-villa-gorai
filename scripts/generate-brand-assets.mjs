#!/usr/bin/env node
// One-time generator: rasterizes src/assets/brand/logo.svg into the PNG/ICO
// sizes the site references (apple-touch-icon, manifest icons, favicon.ico).
// Not wired into the "presite" chain -- run manually
// (`node scripts/generate-brand-assets.mjs`) whenever logo.svg changes.
// If the owner supplies a real logo file later, replace logo.svg and re-run
// this once.

import sharp from "sharp";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const brandDir = path.resolve(__dirname, "..", "src/assets/brand");

function pngToIco(pngBuffer, size) {
  // Minimal single-image ICO container wrapping a PNG payload (the
  // "PNG-in-ICO" format supported by every modern OS/browser).
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // image count

  const entry = Buffer.alloc(16);
  entry.writeUInt8(size >= 256 ? 0 : size, 0); // width (0 = 256)
  entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
  entry.writeUInt8(0, 2); // palette
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // color planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(pngBuffer.length, 8); // image size
  entry.writeUInt32LE(header.length + entry.length, 12); // offset

  return Buffer.concat([header, entry, pngBuffer]);
}

async function main() {
  const logoSvg = readFileSync(path.join(brandDir, "logo.svg"));

  const icon192 = await sharp(logoSvg).resize(192, 192).png().toBuffer();
  writeFileSync(path.join(brandDir, "icon-192.png"), icon192);

  const icon512 = await sharp(logoSvg).resize(512, 512).png().toBuffer();
  writeFileSync(path.join(brandDir, "icon-512.png"), icon512);

  const appleTouch = await sharp(logoSvg).resize(180, 180).flatten({ background: "#FFF8F6" }).png().toBuffer();
  writeFileSync(path.join(brandDir, "apple-touch-icon.png"), appleTouch);

  const favicon32 = await sharp(logoSvg).resize(32, 32).png().toBuffer();
  writeFileSync(path.join(brandDir, "favicon.ico"), pngToIco(favicon32, 32));

  const logoWhiteSvg = readFileSync(path.join(brandDir, "logo-white.svg"));
  const logoWhitePng = await sharp(logoWhiteSvg).resize(256, 256).png().toBuffer();
  writeFileSync(path.join(brandDir, "logo-white.png"), logoWhitePng);

  console.log("[generate-brand-assets] Wrote icon-192.png, icon-512.png, apple-touch-icon.png, favicon.ico, logo-white.png");
}

main();
