import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { MEDIA } from "../../lib/media.ts";

const root = dirname(fileURLToPath(import.meta.url));
const page = readFileSync(join(root, "page.tsx"), "utf8");
const globalsCss = readFileSync(join(root, "../globals.css"), "utf8");
const homePage = readFileSync(join(root, "../page.tsx"), "utf8");
const ketaminePage = readFileSync(
  join(root, "../ketamine-treatment-resistant-depression-nanaimo/page.tsx"),
  "utf8",
);

test("services ketamine section uses the supplied orchid vial still", () => {
  assert.match(page, /MEDIA\.ketamineOrchidVial/);
  assert.match(page, /Ketamine vial beside white orchids on a clinic windowsill\./);
  assert.equal(page.includes("MEDIA.ketamineVial"), false);
  assert.match(page, /loading="lazy"/);
  assert.match(page, /object-cover object-center/);
  assert.equal(page.includes("object-[68%_62%]"), false);
  assert.equal(
    MEDIA.ketamineOrchidVial,
    "/media/images/neurolinks-ketamine-orchid-real-vial.png",
  );
  const file = join(root, "../../../public", MEDIA.ketamineOrchidVial.replace(/^\//, ""));
  assert.equal(existsSync(file), true, `missing ${MEDIA.ketamineOrchidVial}`);
  assert.equal(readFileSync(file).subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])), true);
  assert.match(globalsCss, /\.svc-photo-ket \{[\s\S]*?aspect-ratio:\s*1\s*\/\s*1/);
  assert.match(page, /MEDIA\.servicesBanner/);
  assert.match(page, /MEDIA\.tmsClinic/);
  assert.equal(homePage.includes("ketamineOrchidVial"), false);
  assert.equal(ketaminePage.includes("ketamineOrchidVial"), false);
});
