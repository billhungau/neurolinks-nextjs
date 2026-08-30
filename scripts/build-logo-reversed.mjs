/**
 * Builds the reversed (knockout) NeuroLinks wordmark used by the transparent
 * mobile hero header, where the navy original would be illegible on the
 * photograph.
 *
 * The wordmark is navy (g ~40) and the neuron glyph is cyan (g ~165), so the
 * green channel separates them: navy becomes white, the neuron keeps a
 * brightened cyan. Alpha is preserved so the mark stays anti-aliased.
 *
 * Usage: node scripts/build-logo-reversed.mjs
 */
import sharp from "sharp";

const SRC = "public/media/images/New-Logo.png";
const OUT = "public/media/images/New-Logo-reversed.png";
const CYAN = [122, 216, 245];

const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

for (let i = 0; i < data.length; i += 4) {
  if (data[i + 3] === 0) continue;
  const cyanness = Math.min(1, Math.max(0, (data[i + 1] - 80) / 70));
  for (let c = 0; c < 3; c += 1) {
    data[i + c] = Math.round(255 * (1 - cyanness) + CYAN[c] * cyanness);
  }
}

const out = await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
  .png({ compressionLevel: 9, palette: true })
  .toFile(OUT);

console.log(`wrote ${OUT} ${out.width}x${out.height} (${out.size} bytes)`);
