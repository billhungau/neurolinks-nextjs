/**
 * Homepage hero crops from the WordPress original (1920×960):
 *
 * Desktop — encode the original photograph. CSS `object-cover` handles the
 * slightly shorter hero box so the vial stays at its native prominence.
 *
 * Mobile — a portrait canvas cannot show the full 2:1 scene via object-cover.
 * Wide TMS + ketamine panels are taken from the original (not a tight vial
 * product-shot) so both treatments remain visible without enlarging the vial.
 *
 * Usage: node scripts/build-home-hero-integrated.mjs [--src path]
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import sharp from "sharp";

const SRC = arg("--src") ?? "public/media/images/home-hero-banner.jpg";

const DESKTOP = {
  out: "public/media/images/home-hero-integrated.webp",
  width: 1920,
  height: 960,
};

const MOBILE = {
  out: "public/media/images/home-hero-mobile.webp",
  width: 1080,
  height: 1600,
};

/**
 * Fractions of the original frame. Wide enough to keep window / chair context
 * and skip the centre navy chevron so the mobile join is a soft fade, not a
 * second V overlay.
 */
const PANELS = {
  tms: { left: 0.0, top: 0.0, width: 0.4, height: 1.0 },
  ketamine: { left: 0.6, top: 0.0, width: 0.4, height: 1.0 },
};

const NAVY = { r: 7, g: 29, b: 52 };

function arg(name) {
  const i = process.argv.indexOf(name);
  return i === -1 ? undefined : process.argv[i + 1];
}

function region(frac, meta) {
  const left = Math.max(0, Math.round(frac.left * meta.width));
  const top = Math.max(0, Math.round(frac.top * meta.height));
  const width = Math.min(meta.width - left, Math.round(frac.width * meta.width));
  const height = Math.min(meta.height - top, Math.round(frac.height * meta.height));
  return { left, top, width, height };
}

async function extract(source, frac, meta, width, height, { brighten = false } = {}) {
  let img = sharp(source)
    .extract(region(frac, meta))
    .resize(width, height, { fit: "cover", position: "centre" });
  if (brighten) {
    img = img.modulate({ brightness: 1.04, saturation: 1.02 });
  }
  return img.toBuffer();
}

function sideFadeMask(width, height, fadePx, from) {
  const x1 = from === "left" ? 0 : width;
  const x2 = from === "left" ? fadePx : width - fadePx;
  return Buffer.from(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="${x1}" y1="0" x2="${x2}" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#fff" stop-opacity="0" />
      <stop offset="0.55" stop-color="#fff" stop-opacity="0.7" />
      <stop offset="1" stop-color="#fff" stop-opacity="1" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)" />
</svg>`,
  );
}

async function withSideFade(buffer, width, height, fadePx, from) {
  return sharp(buffer)
    .ensureAlpha()
    .composite([{ input: sideFadeMask(width, height, fadePx, from), blend: "dest-in" }])
    .png()
    .toBuffer();
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

async function buildDesktop(source) {
  const { width, height } = DESKTOP;
  const out = await sharp(source)
    .resize(width, height, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 86 })
    .toBuffer();

  mkdirSync(dirname(DESKTOP.out), { recursive: true });
  writeFileSync(DESKTOP.out, out);
  console.log(`wrote ${DESKTOP.out} ${width}x${height} (${out.length} bytes)`);
}

async function buildMobile(source, meta) {
  const { width, height } = MOBILE;
  const photoHeight = 1020;
  const tmsWidth = Math.round(width * 0.56);
  const ketWidth = Math.round(width * 0.56);
  const ketLeft = width - ketWidth;
  const fadePx = 180;

  const tms = await extract(source, PANELS.tms, meta, tmsWidth, photoHeight, { brighten: true });
  const ket = await extract(source, PANELS.ketamine, meta, ketWidth, photoHeight);
  const ketFaded = await withSideFade(ket, ketWidth, photoHeight, fadePx, "left");

  const band = await sharp({
    create: { width, height: photoHeight, channels: 3, background: NAVY },
  })
    .composite([
      { input: tms, left: 0, top: 0 },
      { input: ketFaded, left: ketLeft, top: 0 },
    ])
    .png()
    .toBuffer();

  const atmosphere = await sharp(band)
    .resize(width, height, { fit: "cover", position: "bottom" })
    .blur(14)
    .modulate({ brightness: 0.88, saturation: 0.94 })
    .toBuffer();

  const bandFaded = await sharp(band)
    .ensureAlpha()
    .composite([{ input: verticalFadeOut(width, photoHeight, 160), blend: "dest-in" }])
    .png()
    .toBuffer();

  const out = await sharp(atmosphere)
    .composite([{ input: bandFaded, left: 0, top: 0 }])
    .webp({ quality: 84 })
    .toBuffer();

  writeFileSync(MOBILE.out, out);
  console.log(`wrote ${MOBILE.out} ${width}x${height} (${out.length} bytes)`);
}

const source = /^https?:/.test(SRC)
  ? Buffer.from(await (await fetch(SRC)).arrayBuffer())
  : readFileSync(SRC);
const meta = await sharp(source).metadata();
if (!meta.width || !meta.height) {
  throw new Error(`Could not read dimensions from ${SRC} (${meta.format})`);
}
console.log(`source ${meta.width}x${meta.height} ${meta.format}`);
if (meta.width < 1600) {
  console.warn(
    `warning: source is ${meta.width}px wide; expected the 1920×960 WordPress original`,
  );
}
await buildDesktop(source);
await buildMobile(source, meta);
