import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(root, "HomeForwardMotion.tsx"), "utf8");

test("pathway motion fails open and respects reduced motion", () => {
  assert.match(source, /prefers-reduced-motion:\s*reduce/);
  assert.match(source, /typeof IntersectionObserver === "undefined"/);
  assert.match(source, /observer\.disconnect/);
  assert.match(source, /HOME_FORWARD_FALLBACK_MS/);
  assert.match(source, /home-forward-track--prepare/);
  assert.match(source, /home-forward-track--play/);
  assert.match(source, /className="home-forward-track"/);
});
