/**
 * Builds the web images for each project from the source artwork, plus the
 * site-wide social card. The full-size originals are large, so they are kept
 * out of the repository; put them under Resources/Projects to rebuild.
 * Run: node scripts/generate-media.mjs
 *
 * Each project needs two sources:
 *   card: portrait (4:5), used for the showcase cards
 *   hero: landscape (16:9), used for the case-study header and banner
 * Output: public/media/projects/<slug>-card.jpg and <slug>-hero.jpg
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const SRC = "Resources/Projects";
const OUT = "public/media/projects";

const sources = {
  bodytalk: { card: "BodyTalk/BodyTalk portrait.png", hero: "BodyTalk/BodyTalk landscape.png" },
  fintrack: { card: "Fintrack/fintrack_portrait.png", hero: "Fintrack/fintrack_landscape.png" },
  srmss: { card: "SRMSS/SRMSS portrait.png", hero: "SRMSS/SRMSS landscape.png" },
  "wildlife-chatbot": { card: "Wildlife-Chatbot/02.png", hero: "Wildlife-Chatbot/01.png" },
  smartmed: { card: "SmartMed/smartmed_portrait.png", hero: "SmartMed/smartmed_landscape.png" },
  velora: { card: "Velora Beauty/velora_portrait.png", hero: "Velora Beauty/velora_landscape.png" },
  "fee-management-system": { card: "Fee management/fee_management_portrait.png", hero: "Fee management/fee_management_landscape.png" },
  "velvet-vogue": { card: "E-Commerce/ecommerce_portrait.png", hero: "E-Commerce/ecommerce_landscape.png" },
};

await mkdir(OUT, { recursive: true });
for (const [slug, files] of Object.entries(sources)) {
  for (const [kind, file] of Object.entries(files)) {
    const input = sharp(`${SRC}/${file}`);
    const { width, height } = await input.metadata();
    const portrait = height > width;
    if (portrait !== (kind === "card")) throw new Error(`${file}: expected a ${kind === "card" ? "portrait" : "landscape"} image, got ${width}x${height}`);
    await input.jpeg({ quality: 86, mozjpeg: true }).toFile(`${OUT}/${slug}-${kind}.jpg`);
    console.log("wrote", `${slug}-${kind}.jpg`, `${width}x${height}`);
  }
}

// site-wide social card
const PAPER = "#F1EFE9", INK = "#101010", ACCENT = "#FF4A17";
await sharp(
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="${PAPER}"/><circle cx="300" cy="315" r="260" fill="${INK}"/><rect x="560" y="120" width="520" height="390" fill="none" stroke="${INK}" stroke-width="3"/><circle cx="1040" cy="160" r="22" fill="${ACCENT}"/></svg>`
  )
)
  .jpeg({ quality: 88 })
  .toFile("public/og.jpg");
console.log("wrote og.jpg");
