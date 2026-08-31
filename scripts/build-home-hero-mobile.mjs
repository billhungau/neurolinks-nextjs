/**
 * Legacy mobile crop of the WordPress banner. The homepage now uses
 * `scripts/build-home-hero-integrated.mjs`, which writes home-hero-mobile.webp
 * without the navy smear. Keep this script only if you need the older crop.
 *
 * Usage: node scripts/build-home-hero-mobile.mjs [--src path-or-url] [--out path]
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import sharp from "sharp";

const SRC =
  arg("--src") ??
  "https://neurolinks.ca/wp-content/uploads/2024/06/Orange-And-Blue-Modern-Professional-Construction-Banner-Design-2.jpg";
const OUT = arg("--out") ?? "public/media/images/home-hero-mobile.webp";

/** Portrait canvas. ~0.69 ratio matches the mobile hero box, so `cover` barely crops. */
const CANVAS = { width: 1080, height: 1560 };
/** Photograph occupies the top 60%; the rest dissolves into navy. */
const BAND_HEIGHT = 940;
const NAVY = { r: 7, g: 29, b: 52 };

/**
 * Crops as fractions of the source frame so the math survives any derivative
 * size. Both panels are 0.5745 wide/tall to fill half of the photo band.
 */
const PANELS = {
  tms: { left: 0.013, top: 0.031, width: 0.2693, height: 0.9375 },
  ketamine: { left: 0.701, top: 0.274, width: 0.2063, height: 0.7188 },
};

function arg(name) {
  const i = process.argv.indexOf(name);
  return i === -1 ? undefined : process.argv[i + 1];
}

async function loadSource() {
  if (/^https?:/.test(SRC)) {
    const res = await fetch(SRC);
    if (!res.ok) throw new Error(`${SRC} responded ${res.status}`);
    return Buffer.from(await res.arrayBuffer());
  }
  return readFileSync(SRC);
}

function region(frac, meta) {
  return {
    left: Math.round(frac.left * meta.width),
    top: Math.round(frac.top * meta.height),
    width: Math.round(frac.width * meta.width),
    height: Math.round(frac.height * meta.height),
  };
}

async function panel(source, frac, meta) {
  const half = CANVAS.width / 2;
  return sharp(source)
    .extract(region(frac, meta))
    .resize(half, BAND_HEIGHT, { fit: "cover", position: "centre" })
    .toBuffer();
}

/**
 * Vertical smear of the band's last rows: a seamless, detail-free continuation.
 * Its own top edge is faded in so the join with the photograph is not a line.
 */
async function smear(band) {
  const feather = 200;
  const tailHeight = 110;
  const top = BAND_HEIGHT - feather;
  const height = CANVAS.height - top;
  const mask = Buffer.from(
    `<svg width="${CANVAS.width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="m" x1="0" y1="0" x2="0" y2="${feather}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#fff" stop-opacity="0" />
      <stop offset="1" stop-color="#fff" stop-opacity="1" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#m)" />
</svg>`,
  );
  const buffer = await sharp(band)
    .extract({ left: 0, top, width: CANVAS.width, height: tailHeight })
    .resize(CANVAS.width, height, { fit: "fill" })
    .blur(30)
    .ensureAlpha()
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toBuffer();
  return { input: buffer, left: 0, top };
}

/** Navy wash that starts halfway down, so the smear is never read as photograph. */
function navyWash() {
  const svg = `<svg width="${CANVAS.width}" height="${CANVAS.height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0.42" stop-color="rgb(${NAVY.r},${NAVY.g},${NAVY.b})" stop-opacity="0" />
      <stop offset="0.62" stop-color="rgb(${NAVY.r},${NAVY.g},${NAVY.b})" stop-opacity="0.28" />
      <stop offset="0.80" stop-color="rgb(${NAVY.r},${NAVY.g},${NAVY.b})" stop-opacity="0.62" />
      <stop offset="1" stop-color="rgb(${NAVY.r},${NAVY.g},${NAVY.b})" stop-opacity="0.85" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)" />
</svg>`;
  return Buffer.from(svg);
}

const source = await loadSource();
const meta = await sharp(source).metadata();
console.log(`source ${meta.width}x${meta.height} ${meta.format}`);

const band = await sharp({
  create: {
    width: CANVAS.width,
    height: BAND_HEIGHT,
    channels: 3,
    background: NAVY,
  },
})
  .composite([
    { input: await panel(source, PANELS.tms, meta), left: 0, top: 0 },
    { input: await panel(source, PANELS.ketamine, meta), left: CANVAS.width / 2, top: 0 },
  ])
  .png()
  .toBuffer();

const out = await sharp({
  create: { width: CANVAS.width, height: CANVAS.height, channels: 3, background: NAVY },
})
  .composite([
    { input: band, left: 0, top: 0 },
    await smear(band),
    { input: navyWash(), left: 0, top: 0 },
  ])
  .webp({ quality: 84 })
  .toBuffer();

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, out);
console.log(`wrote ${OUT} ${CANVAS.width}x${CANVAS.height} (${out.length} bytes)`);
