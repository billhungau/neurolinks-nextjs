import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { shouldRevealImmediately } from "../lib/motion-policy.ts";

const root = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(root, "Reveal.tsx"), "utf8");
const layout = readFileSync(join(root, "../app/layout.tsx"), "utf8");
const chrome = readFileSync(join(root, "SiteChrome.tsx"), "utf8");

test("Reveal fails open only when motion or the observer cannot run", () => {
  assert.equal(
    shouldRevealImmediately({ reducedMotion: true, observerSupported: true }),
    true,
  );
  assert.equal(
    shouldRevealImmediately({ reducedMotion: false, observerSupported: false }),
    true,
  );
  assert.equal(
    shouldRevealImmediately({
      reducedMotion: false,
      observerSupported: true,
      observerAttachFailed: true,
    }),
    true,
  );
  assert.equal(
    shouldRevealImmediately({ reducedMotion: false, observerSupported: true }),
    false,
  );
});

test("Reveal lets IntersectionObserver own below-fold timing", () => {
  assert.equal(source.includes("REVEAL_FALLBACK_MS"), false);
  assert.equal(source.includes("setTimeout"), false);
  assert.match(source, /requestAnimationFrame/);
  assert.match(source, /cancelAnimationFrame/);
  assert.match(source, /observer\.disconnect/);
  assert.match(source, /typeof IntersectionObserver/);
  assert.equal(source.includes("isInOrPastView"), false);
});

test("MotionReady is mounted once from the root layout", () => {
  assert.match(layout, /<MotionReady \/>/);
  assert.equal((layout.match(/<MotionReady/g) ?? []).length, 1);
  assert.equal(chrome.includes("MotionReady"), false);
});
