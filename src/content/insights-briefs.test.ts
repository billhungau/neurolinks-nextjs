import assert from "node:assert/strict";
import test from "node:test";
import {
  BANNED_INSIGHTS_PHRASES,
  INSIGHTS_BRIEFS,
} from "./insights-briefs.ts";

test("the three initial Insights shells remain unpublished drafts", () => {
  assert.equal(INSIGHTS_BRIEFS.length, 3);
  for (const brief of INSIGHTS_BRIEFS) {
    assert.equal(brief.published, false);
    assert.match(brief.id, /^drafts\./);
    assert.equal(brief.slug.includes(" "), false);
  }
  assert.equal(
    INSIGHTS_BRIEFS[0]?.title,
    "How VAC authorization for TMS works in British Columbia",
  );
  assert.equal(
    INSIGHTS_BRIEFS[1]?.title,
    "TMS for depression when PTSD and anxiety are also present",
  );
  assert.equal(
    INSIGHTS_BRIEFS[2]?.title,
    "TMS, Spravato and IM ketamine: understanding the differences",
  );
});

test("draft shells do not use banned promotional claims", () => {
  const blob = JSON.stringify(INSIGHTS_BRIEFS).toLowerCase();
  for (const phrase of BANNED_INSIGHTS_PHRASES) {
    assert.equal(blob.includes(phrase), false, phrase);
  }
  assert.match(blob, /not guaranteed|pending medical review|do not publish/);
});
