import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function read(relative: string) {
  return readFileSync(join(root, relative), "utf8");
}

test("anchor offset uses one measured strategy without doubled CSS offsets", () => {
  const css = read("app/globals.css");
  assert.match(css, /--nl-anchor-offset:/);
  assert.match(css, /--nl-header-height:/);
  assert.match(css, /--nl-subnav-height:/);
  assert.match(css, /--nl-anchor-gap:\s*1rem/);
  assert.equal(css.includes("scroll-padding-top: 4.75rem"), false);
  assert.equal(css.includes("scroll-margin-top: 7.75rem"), false);
  assert.equal(css.includes("scroll-margin-top: 8.5rem"), false);
  assert.match(css, /scroll-margin-top:\s*calc\(var\(--nl-anchor-offset\) - var\(--nl-target-pad-top\)\)/);
  assert.match(css, /\.tms-subnav \{[\s\S]*?top:\s*var\(--nl-header-height\)/);
  assert.match(css, /html:has\(\.tms-subnav\)/);
  assert.match(css, /\.nl-hash-target/);
  assert.match(css, /\.tms-subnav-inner \{[\s\S]*?min-width:\s*0/);
  assert.equal(/html\s*\{[^}]*scroll-padding-top/.test(css), false);
});

test("hash buttons keep native fragment links", () => {
  const source = read("components/ButtonLink.tsx");
  assert.match(source, /href\.startsWith\("#"\)/);
  assert.match(source, /href\.includes\("#"\)/);
});

test("anchor offset observer is cleaned up and ignores open menus", () => {
  const source = read("components/AnchorOffset.tsx");
  assert.match(source, /ResizeObserver/);
  assert.match(source, /observer\.disconnect\(\)/);
  assert.match(source, /visualViewport/);
  assert.match(source, /menuOpen/);
  assert.match(source, /usePathname/);
  assert.match(source, /anchorScrollTarget/);
  assert.match(source, /samePageHashId/);
  assert.match(source, /nl-hash-target/);
});
