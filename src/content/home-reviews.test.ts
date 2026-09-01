import assert from "node:assert/strict";
import test from "node:test";
import { GOOGLE_REVIEWS_URL, HOME_REVIEWS } from "./home-reviews.ts";

test("homepage reviews are five curated static excerpts", () => {
  assert.equal(HOME_REVIEWS.length, 5);
  assert.deepEqual(
    HOME_REVIEWS.map((review) => review.initials),
    ["E. H.", "B. J.", "J. A.", "P. R.", "T. H."],
  );
  assert.ok(HOME_REVIEWS.every((review) => review.source === "wordpress-homepage"));
  assert.equal(HOME_REVIEWS.filter((review) => review.familyMember).length, 1);
  assert.equal(HOME_REVIEWS.find((review) => review.familyMember)?.initials, "P. R.");
});

test("review excerpts match the approved published wording", () => {
  const byInitials = Object.fromEntries(HOME_REVIEWS.map((review) => [review.initials, review.text]));
  assert.match(byInitials["E. H."], /knowledgeable and supportive/);
  assert.match(byInitials["B. J."], /patient and thorough with diagnosis/);
  assert.match(byInitials["J. A."], /depression for 45 years/);
  assert.match(byInitials["P. R."], /help and hope we have been so desperately searching for/);
  assert.match(byInitials["T. H."], /top notch/);
  assert.equal(GOOGLE_REVIEWS_URL, "https://share.google/zhQv4Wd5lcK4LFLeJ");
});
