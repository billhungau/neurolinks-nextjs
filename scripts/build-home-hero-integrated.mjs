/**
 * Homepage hero: TMS coil + ketamine vial without the baked-in Canva chevron.
 *
 * WordPress media 5544 embeds an opaque navy V in both photographs. WordPress
 * does not publish uncomposited originals of that banner. This script:
 *   - takes the TMS coil, arm, chair and window from the left of 5544
 *   - takes the clean clinic windowsill still (ketamine-vial-sill-source.webp)
 *     for the right, so the overlay is not present in the ketamine photograph
 *   - lays the vial photograph over the inner TMS edge with a horizontal fade
 *     (no clip-path, no diagonal polygon, no hard central seam)
 *
 * Contrast for type is a CSS gradient, not a shape in the image.
 *
 * Usage: node scripts/build-home-hero-integrated.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import sharp from "sharp";

const BANNER = "public/media/images/home-hero-banner.jpg";
const VIAL_SRC = "public/media/images/ketamine-vial-sill-source.webp";

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

/**
 * Left side of media 5544, stopping before most of the chevron. A remnant at
 * the inner top-right is covered by the overlapping vial photograph.
 */
const TMS_REGION = { left: 0, top: 16, width: 520, height: 928 };

/**
 * Full-height landscape take from the 1536×1024 windowsill still. Width is
 * large enough that covering 960px of height does not enlarge the vial.
 */
const VIAL_REGION = { left: 180, top: 0, width: 1356, height: 1024 };

function horizontalFadeInFromLeft(width, height, fadePx) {
  return Buffer.from(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="${fadePx}" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#fff" stop-opacity="0" />
      <stop offset="0.22" stop-color="#fff" stop-opacity="0.28" />
      <stop offset="0.48" stop-color="#fff" stop-opacity="0.7" />
      <stop offset="0.78" stop-color="#fff" stop-opacity="0.94" />
      <stop offset="1" stop-color="#fff" stop-opacity="1" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)" />
</svg>`,
  );
}

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

async function extractCover(source, region, width, height, position) {
  return sharp(source)
    .extract(region)
    .resize(width, height, { fit: "cover", position })
    .toBuffer();
}

async function withMask(buffer, mask) {
  return sharp(buffer)
    .ensureAlpha()
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toBuffer();
}

async function composeBand({ width, height, tmsWidth, ketWidth, fadePx }) {
  const ketLeft = width - ketWidth;
  const tms = await extractCover(BANNER, TMS_REGION, tmsWidth, height, "left");
  const ket = await extractCover(VIAL_SRC, VIAL_REGION, ketWidth, height, "right");
  const ketFaded = await withMask(ket, horizontalFadeInFromLeft(ketWidth, height, fadePx));

  return sharp({
    create: { width, height, channels: 3, background: { r: 42, g: 52, b: 62 } },
  })
    .composite([
      { input: tms, left: 0, top: 0 },
      { input: ketFaded, left: ketLeft, top: 0 },
    ])
    .png()
    .toBuffer();
}

async function buildDesktop() {
  const { width, height } = DESKTOP;
  const band = await composeBand({
    width,
    height,
    tmsWidth: Math.round(width * 0.56),
    ketWidth: Math.round(width * 0.68),
    fadePx: 520,
  });
  const out = await sharp(band).webp({ quality: 86 }).toBuffer();
  mkdirSync(dirname(DESKTOP.out), { recursive: true });
  writeFileSync(DESKTOP.out, out);
  console.log(`wrote ${DESKTOP.out} ${width}x${height} (${out.length} bytes)`);
}

async function buildMobile() {
  const { width, height } = MOBILE;
  const photoHeight = 1020;
  const band = await composeBand({
    width,
    height: photoHeight,
    tmsWidth: Math.round(width * 0.54),
    ketWidth: Math.round(width * 0.72),
    fadePx: 480,
  });

  const atmosphere = await sharp(band)
    .resize(width, height, { fit: "cover", position: "bottom" })
    .blur(18)
    .modulate({ brightness: 0.7, saturation: 0.88 })
    .toBuffer();

  const bandFaded = await withMask(band, verticalFadeOut(width, photoHeight, 200));

  const out = await sharp(atmosphere)
    .composite([{ input: bandFaded, left: 0, top: 0 }])
    .webp({ quality: 84 })
    .toBuffer();

  writeFileSync(MOBILE.out, out);
  console.log(`wrote ${MOBILE.out} ${width}x${height} (${out.length} bytes)`);
}

const banner = await sharp(BANNER).metadata();
const vial = await sharp(VIAL_SRC).metadata();
if (!banner.width || !banner.height || !vial.width || !vial.height) {
  throw new Error("Could not read hero source dimensions");
}
console.log(`banner ${banner.width}x${banner.height}  vial ${vial.width}x${vial.height}`);
await buildDesktop();
await buildMobile();
