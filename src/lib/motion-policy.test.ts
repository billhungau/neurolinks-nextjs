import assert from "node:assert/strict";
import test from "node:test";
import {
  PATHWAY_DESKTOP_OBSERVER,
  PATHWAY_MOBILE_OBSERVER,
  shouldRevealImmediately,
  shouldSkipPathwayPrepare,
} from "./motion-policy.ts";

test("in-view sections stay under observer control when motion is allowed", () => {
  assert.equal(
    shouldRevealImmediately({ reducedMotion: false, observerSupported: true }),
    false,
  );
  assert.equal(
    shouldSkipPathwayPrepare({ reducedMotion: false, observerSupported: true }),
    false,
  );
});

test("unsupported observers fail open instead of leaving content hidden", () => {
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
    shouldSkipPathwayPrepare({ reducedMotion: false, observerSupported: false }),
    true,
  );
});

test("reduced motion never waits for an observer", () => {
  assert.equal(
    shouldRevealImmediately({ reducedMotion: true, observerSupported: true }),
    true,
  );
  assert.equal(
    shouldSkipPathwayPrepare({ reducedMotion: true, observerSupported: true }),
    true,
  );
});

test("pathway observers require more than a sliver of the track", () => {
  assert.ok(PATHWAY_DESKTOP_OBSERVER.threshold > 0.08);
  assert.ok(PATHWAY_MOBILE_OBSERVER.threshold > 0.08);
});
