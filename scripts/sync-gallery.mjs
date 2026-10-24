#!/usr/bin/env node
// Keeps src/_data/gallery.json in sync with the photos actually present in
// src/images/gallery/. Runs automatically before every build (see "presite"
// in package.json), both locally and in CI.
//
// - New image in the folder but not in gallery.json -> added with show:true,
//   a generated alt text, and an empty caption (owner fills the caption in).
// - gallery.json entry whose file has been deleted -> flagged missing and
//   show is forced to false, so the build never crashes on a broken path.
// - Existing alt text / captions are never overwritten.

import { readdirSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const galleryDir = path.join(repoRoot, "src/images/gallery");
const dataPath = path.join(repoRoot, "src/_data/gallery.json");

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

// Pre-filled captions/alt text for the villa's named spots (see AGENTS.md
// Section 4). Keyed by exact source file name so a matching upload is
// captioned automatically.
const NAMED_SPOTS = {
  "kashi-kutir.jpg": {
    caption: "Kashi Kutir · Ground floor: our wooden gazebo in the garden, made for long chai chats",
    alt: "Wooden garden gazebo named Kashi Kutir at Venkatesh Villa Gorai",
  },
  "savan-jhula.jpg": {
    caption: "Savan Jhula · Ground floor: a garden swing under the palms, for endless jhoola sessions",
    alt: "Garden swing named Savan Jhula under palm trees at Venkatesh Villa Gorai",
  },
  "lawn.jpg": {
    caption: "Lawn · Ground floor: barefoot evenings on soft green grass lined with coconut trees",
    alt: "Green lawn lined with coconut trees at Venkatesh Villa Gorai",
  },
  "food-court.jpg": {
    caption: "Food Court · First floor: a covered dining deck with a green view, where chai turns into dinner plans",
    alt: "Covered dining deck at Venkatesh Villa Gorai overlooking greenery",
  },
  "balcony.jpg": {
    caption: "Balcony · First floor: banana trees, breeze and a quiet sip",
    alt: "Balcony with a view of banana trees at Venkatesh Villa Gorai",
  },
  "vrindavan-terrace.jpg": {
    caption: "Vrindavan · Terrace: our rooftop garden with green turf and wooden seating, for sunsets & sangeet nights",
    alt: "Rooftop terrace garden named Vrindavan with turf and wooden seating at Venkatesh Villa Gorai",
  },
  "tirumala-hills.jpg": {
    caption: "Tirumala Hills · The very top: a tiny lookout above the terrace, the highest chai in Gorai and the best view in the house",
    alt: "Small rooftop lookout named Tirumala Hills above the terrace at Venkatesh Villa Gorai",
  },
};

function titleCaseFromFilename(file) {
  const base = path.basename(file, path.extname(file));
  return base
    .replace(/[-_]+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function generateAlt(file) {
  const named = NAMED_SPOTS[file.toLowerCase()];
  if (named) return named.alt;
  const title = titleCaseFromFilename(file);
  return `${title} at Venkatesh Villa Gorai`;
}

function generateCaption(file) {
  const named = NAMED_SPOTS[file.toLowerCase()];
  return named ? named.caption : "";
}

function main() {
  if (!existsSync(galleryDir)) {
    console.warn(`[sync-gallery] WARNING: ${galleryDir} does not exist, skipping.`);
    return;
  }

  let data = { autoplay: false, intervalSeconds: 5, slides: [] };
  if (existsSync(dataPath)) {
    try {
      data = JSON.parse(readFileSync(dataPath, "utf8"));
    } catch (err) {
      console.warn(`[sync-gallery] WARNING: could not parse ${dataPath}, starting fresh: ${err.message}`);
    }
  }
  if (!Array.isArray(data.slides)) data.slides = [];

  const filesOnDisk = readdirSync(galleryDir).filter((f) =>
    IMAGE_EXTENSIONS.has(path.extname(f).toLowerCase())
  );
  const filesOnDiskSet = new Set(filesOnDisk);
  const knownFiles = new Set(data.slides.map((s) => s.file));

  let added = 0;
  let missing = 0;

  // Flag slides whose file disappeared, without deleting the record.
  for (const slide of data.slides) {
    if (!filesOnDiskSet.has(slide.file)) {
      if (!slide.missing) {
        console.warn(`[sync-gallery] WARNING: ${slide.file} is in gallery.json but missing from src/images/gallery/. Hiding it.`);
        missing++;
      }
      slide.missing = true;
      slide.show = false;
    } else if (slide.missing) {
      delete slide.missing;
    }
  }

  // Add new files found on disk.
  for (const file of filesOnDisk) {
    if (knownFiles.has(file)) continue;
    data.slides.push({
      file,
      alt: generateAlt(file),
      caption: generateCaption(file),
      show: true,
      hero: data.slides.length === 0 && data.slides.filter((s) => s.hero).length === 0,
    });
    added++;
    console.log(`[sync-gallery] Added new photo: ${file}`);
  }

  if (!data.slides.some((s) => s.hero && s.show)) {
    const firstVisible = data.slides.find((s) => s.show && !s.missing);
    if (firstVisible) firstVisible.hero = true;
  }

  writeFileSync(dataPath, JSON.stringify(data, null, 2) + "\n", "utf8");

  console.log(`[sync-gallery] Done. ${added} added, ${missing} missing, ${data.slides.length} total slides.`);
}

main();
