import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  PATHWAY_DESKTOP_MQ,
  PATHWAY_DESKTOP_OBSERVER,
  PATHWAY_MOBILE_OBSERVER,
  shouldSkipPathwayPrepare,
} from "../lib/motion-policy.ts";

const root = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(root, "HomeForwardMotion.tsx"), "utf8");
const css = readFileSync(join(root, "../app/globals.css"), "utf8");

test("pathway motion fails open only when the observer cannot run", () => {
  assert.equal(
    shouldSkipPathwayPrepare({ reducedMotion: true, observerSupported: true }),
    true,
  );
  assert.equal(
    shouldSkipPathwayPrepare({ reducedMotion: false, observerSupported: false }),
    true,
  );
  assert.equal(
    shouldSkipPathwayPrepare({ reducedMotion: false, observerSupported: true }),
    false,
  );
});

test("pathway observers wait for a meaningful visible portion", () => {
  assert.equal(PATHWAY_DESKTOP_MQ, "(min-width: 1024px)");
  assert.ok(PATHWAY_DESKTOP_OBSERVER.threshold >= 0.3);
  assert.ok(PATHWAY_MOBILE_OBSERVER.threshold >= 0.3);
  assert.match(PATHWAY_DESKTOP_OBSERVER.rootMargin, /-16%/);
  assert.match(source, /\.home-forward-item/);
  assert.match(source, /home-forward-item--play/);
  assert.match(source, /unobserve/);
});

test("pathway motion has no load-time fallback and cleans up observers", () => {
  assert.equal(source.includes("HOME_FORWARD_FALLBACK_MS"), false);
  assert.equal(source.includes("setTimeout"), false);
  assert.match(source, /prefers-reduced-motion:\s*reduce/);
  assert.match(source, /typeof IntersectionObserver/);
  assert.match(source, /observer\?\.disconnect|observer\.disconnect/);
  assert.match(source, /cancelAnimationFrame/);
  assert.match(source, /home-forward-track--prepare/);
  assert.match(source, /home-forward-track--play/);
  assert.match(source, /className="home-forward-track"/);
  assert.equal(source.includes("clearTimeout(fallback)"), false);
});

test("desktop pathway timing is a visible 2.2–2.5s progression", () => {
  assert.match(css, /scale\(0\.82\)/);
  assert.match(
    css,
    /\.home-forward-track--prepare\.home-forward-track--play[\s\S]*?stroke-dashoffset: 0;[\s\S]*?2300ms/,
  );
  assert.match(
    css,
    /\.home-forward-track--prepare\.home-forward-track--play \.home-forward-item:nth-child\(1\) \.home-forward-node \{[\s\S]*?420ms var\(--nl-ease\) 0ms/,
  );
  assert.match(
    css,
    /\.home-forward-track--prepare\.home-forward-track--play \.home-forward-item:nth-child\(2\) \.home-forward-node \{[\s\S]*?420ms var\(--nl-ease\) 380ms/,
  );
  assert.match(
    css,
    /\.home-forward-track--prepare\.home-forward-track--play \.home-forward-item:nth-child\(3\) \.home-forward-node \{[\s\S]*?420ms var\(--nl-ease\) 760ms/,
  );
  assert.match(
    css,
    /\.home-forward-track--prepare\.home-forward-track--play \.home-forward-item:nth-child\(4\) \.home-forward-node \{[\s\S]*?1140ms both,[\s\S]*?home-forward-glow 580ms var\(--nl-ease\) 1560ms/,
  );
  assert.match(css, /\.home-forward-item--play \.home-forward-node/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});
