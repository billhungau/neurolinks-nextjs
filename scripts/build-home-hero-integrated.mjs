/**
 * Homepage hero from the supplied TMS + ketamine clinic composite.
 *
 * Source: public/media/images/home-hero-source.png (1774×887, 2:1).
 * Contrast for type stays in CSS (.home-hero-wash), not in the photograph.
 *
 * Usage: node scripts/build-home-hero-integrated.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import sharp from "sharp";

const SOURCE = "public/media/images/home-hero-source.png";

const DESKTOP = {
  out: "public/media/images/home-hero-desktop.webp",
  width: 1920,
  height: 960,
};

const MOBILE = {
  out: "public/media/images/home-hero-portrait.webp",
  width: 1080,
  height: 1600,
};

function verticalFadeOut(width, height, fadePx) {
  const y1 = height - fadePx;
  return Buffer.from(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="${y1}" x2="0" y2="${height}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#fff" stop-opacity="1" />
      <stop offset="1" stop-color="#fff" stop-opacity="0" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)" />
</svg>`,
  );
}

async function withMask(buffer, mask) {
  return sharp(buffer)
    .ensureAlpha()
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toBuffer();
}

async function buildDesktop() {
  const { width, height, out } = DESKTOP;
  const buffer = await sharp(SOURCE)
    .resize(width, height, { fit: "cover", position: "centre" })
    .webp({ quality: 86 })
    .toBuffer();
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, buffer);
  console.log(`wrote ${out} ${width}x${height} (${buffer.length} bytes)`);
}

async function buildMobile() {
  const { width, height, out } = MOBILE;
  // Keep the full diptych (no side crop). 2:1 source → 1080×540 band.
  const bandHeight = Math.round(width / 2);
  const band = await sharp(SOURCE)
    .resize(width, bandHeight, { fit: "fill" })
    .png()
    .toBuffer();

  const atmosphere = await sharp(SOURCE)
    .resize(width, height, { fit: "cover", position: "centre" })
    .blur(22)
    .modulate({ brightness: 0.55, saturation: 0.82 })
    .toBuffer();

  const bandFaded = await withMask(band, verticalFadeOut(width, bandHeight, 160));

  const buffer = await sharp(atmosphere)
    .composite([{ input: bandFaded, left: 0, top: 0 }])
    .webp({ quality: 84 })
    .toBuffer();

  writeFileSync(out, buffer);
  console.log(`wrote ${out} ${width}x${height} (${buffer.length} bytes)`);
}

const meta = await sharp(SOURCE).metadata();
if (!meta.width || !meta.height) {
  throw new Error("Could not read hero source dimensions");
}
console.log(`source ${meta.width}x${meta.height}`);
await buildDesktop();
await buildMobile();
