/**
 * Homepage hero art direction from the existing dual-treatment photograph:
 * TMS coil left, ketamine vial right, without the WordPress banner's navy polygon.
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
  height: 900,
};

const MOBILE = {
  out: "public/media/images/home-hero-mobile.webp",
  width: 1080,
  height: 1600,
};

/** Crops as fractions of the source frame, avoiding the centre polygon. */
const PANELS = {
  tms: { left: 0.012, top: 0.028, width: 0.272, height: 0.94 },
  ketamine: { left: 0.698, top: 0.22, width: 0.228, height: 0.76 },
};

const NAVY = { r: 7, g: 29, b: 52 };

function arg(name) {
  const i = process.argv.indexOf(name);
  return i === -1 ? undefined : process.argv[i + 1];
}

function region(frac, meta) {
  return {
    left: Math.max(0, Math.round(frac.left * meta.width)),
    top: Math.max(0, Math.round(frac.top * meta.height)),
    width: Math.round(frac.width * meta.width),
    height: Math.round(frac.height * meta.height),
  };
}

async function extract(source, frac, meta, width, height, { brighten = false } = {}) {
  let img = sharp(source)
    .extract(region(frac, meta))
    .resize(width, height, { fit: "cover", position: "centre" });
  if (brighten) {
    img = img.modulate({ brightness: 1.08, saturation: 1.04 });
  }
  return img.toBuffer();
}

/** Soft-edge fade on one side so two panels meet without a graphic seam. */
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

async function buildDesktop(source, meta) {
  const { width, height } = DESKTOP;
  const tmsWidth = Math.round(width * 0.62);
  const ketWidth = Math.round(width * 0.48);
  const overlap = tmsWidth + ketWidth - width;
  const ketLeft = width - ketWidth;
  const fadePx = Math.max(overlap + 40, 160);

  const tms = await extract(source, PANELS.tms, meta, tmsWidth, height, { brighten: true });
  const ket = await extract(source, PANELS.ketamine, meta, ketWidth, height);
  const ketFaded = await withSideFade(ket, ketWidth, height, fadePx, "left");

  const wash = Buffer.from(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="l" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="rgb(${NAVY.r},${NAVY.g},${NAVY.b})" stop-opacity="0.14" />
      <stop offset="0.38" stop-color="rgb(${NAVY.r},${NAVY.g},${NAVY.b})" stop-opacity="0.05" />
      <stop offset="0.56" stop-color="rgb(${NAVY.r},${NAVY.g},${NAVY.b})" stop-opacity="0" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#l)" />
</svg>`,
  );

  const out = await sharp({
    create: { width, height, channels: 3, background: NAVY },
  })
    .composite([
      { input: tms, left: 0, top: 0 },
      { input: ketFaded, left: ketLeft, top: 0 },
      { input: wash, left: 0, top: 0 },
    ])
    .webp({ quality: 86 })
    .toBuffer();

  mkdirSync(dirname(DESKTOP.out), { recursive: true });
  writeFileSync(DESKTOP.out, out);
  console.log(`wrote ${DESKTOP.out} ${width}x${height} overlap ${overlap} (${out.length} bytes)`);
}

async function buildMobile(source, meta) {
  const { width, height } = MOBILE;
  const photoHeight = 1080;
  const tmsWidth = Math.round(width * 0.56);
  const ketWidth = Math.round(width * 0.56);
  const ketLeft = width - ketWidth;

  const tms = await extract(source, PANELS.tms, meta, tmsWidth, photoHeight, { brighten: true });
  const ket = await extract(source, PANELS.ketamine, meta, ketWidth, photoHeight);
  const ketFaded = await withSideFade(ket, ketWidth, photoHeight, 200, "left");

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
    .blur(12)
    .modulate({ brightness: 0.9, saturation: 0.96 })
    .toBuffer();

  const bandFaded = await sharp(band)
    .ensureAlpha()
    .composite([{ input: verticalFadeOut(width, photoHeight, 140), blend: "dest-in" }])
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
await buildDesktop(source, meta);
await buildMobile(source, meta);
