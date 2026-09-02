import assert from "node:assert/strict";
import test from "node:test";
import { samePageHashId } from "./anchor-target.ts";

test("same-page hash ids resolve for local fragments", () => {
  assert.equal(samePageHashId("#faqs", "/about-tms-treatment-on-psychiatric-illness/", ""), "faqs");
  assert.equal(samePageHashId("#faqs", "/about-tms-treatment-on-psychiatric-illness", ""), "faqs");
  assert.equal(
    samePageHashId(
      "/about-tms-treatment-on-psychiatric-illness/#coverage",
      "/about-tms-treatment-on-psychiatric-illness/",
      "",
    ),
    "coverage",
  );
  assert.equal(
    samePageHashId(
      "/about-tms-treatment-on-psychiatric-illness/#team",
      "/psychiatrist-tms-nanaimo/",
      "",
    ),
    null,
  );
  assert.equal(samePageHashId("/contact/", "/contact/", ""), null);
  assert.equal(samePageHashId("#main-content", "/", ""), "main-content");
});
