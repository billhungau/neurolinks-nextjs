import assert from "node:assert/strict";
import test from "node:test";
import { expandRedirectSources, lookupRedirect, pageRedirects } from "./redirects.ts";

test("known multilingual TMS URLs redirect to the English TMS page", () => {
  assert.equal(
    lookupRedirect("/quest-ce-que-le-tms/"),
    "/about-tms-treatment-on-psychiatric-illness/",
  );
  assert.equal(
    lookupRedirect("/quest-ce-que-le-tms"),
    "/about-tms-treatment-on-psychiatric-illness/",
  );
  assert.equal(lookupRedirect("/关于tms/"), "/about-tms-treatment-on-psychiatric-illness/");
  assert.equal(
    lookupRedirect("/%e5%85%b3%e4%ba%8etms/"),
    "/about-tms-treatment-on-psychiatric-illness/",
  );
  assert.equal(
    lookupRedirect("/%E5%85%B3%E4%BA%8Etms/"),
    "/about-tms-treatment-on-psychiatric-illness/",
  );
});

test("percent-encoding variants do not double-encode", () => {
  const sources = expandRedirectSources("/关于tms/");
  assert.ok(sources.includes("/关于tms/"));
  assert.ok(sources.includes("/%E5%85%B3%E4%BA%8Etms/"));
  assert.equal(sources.some((source) => source.includes("%25")), false);
});

test("equivalent multilingual pages map to the matching English route", () => {
  assert.equal(lookupRedirect("/聯絡我們/"), "/contact/");
  assert.equal(lookupRedirect("/sur-le-traitement-a-la-ketamine-des-maladies-psychiatriques/"), "/ketamine-treatment-resistant-depression-nanaimo/");
  assert.equal(lookupRedirect("/服務/"), "/services-psychiatric-tms-ketamine-treatment/");
  assert.equal(lookupRedirect("/關於我們/"), "/psychiatrist-tms-nanaimo/");
  assert.equal(lookupRedirect("/stimulation-magnetique-transcranienne/"), "/");
});

test("unrelated legacy URLs are not redirected to the homepage", () => {
  assert.equal(lookupRedirect("/shop-2/"), null);
  assert.equal(lookupRedirect("/2022/03/28/hello-world/"), null);
  assert.equal(lookupRedirect("/does-not-exist/"), null);
});

test("WordPress referral PDF and treatment videos have replacements", () => {
  assert.equal(
    lookupRedirect("/wp-content/uploads/2024/04/physician_referral_form-2.pdf"),
    "/documents/physician-referral-form.pdf",
  );
  assert.equal(
    lookupRedirect("/wp-content/uploads/2025/05/TMS-FINAL-COPYYYY-JULIE-USE.mp4"),
    "/media/videos/tms-introduction.mp4",
  );
  assert.equal(
    lookupRedirect("/wp-content/uploads/2025/05/KETAMINE-VIDEO-JULIE-USE.mp4"),
    "/media/videos/ketamine-introduction.mp4",
  );
});

test("redirect table destinations are English site paths", () => {
  for (const rule of pageRedirects()) {
    assert.equal(rule.statusCode, 301);
    assert.match(rule.destination, /^\/([a-z0-9-]+\/)*$/);
  }
});
