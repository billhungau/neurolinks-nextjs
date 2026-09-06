import assert from "node:assert/strict";
import test from "node:test";
import {
  lexicalHasBlock,
  lexicalHeadings,
  lexicalPlainText,
  lexicalWordCount,
  resolveMetaDescription,
  resolveSeoTitle,
  resolveSocialDescription,
  resolveSocialTitle,
  type LexicalState,
} from "./insights-content.ts";

function paragraph(text: string) {
  return { type: "paragraph", children: [{ type: "text", text }] };
}

function heading(tag: string, text: string) {
  return { type: "heading", tag, children: [{ type: "text", text }] };
}

const body: LexicalState = {
  root: {
    type: "root",
    children: [
      paragraph("Repetitive transcranial magnetic stimulation is delivered in a clinic."),
      heading("h2", "How VAC authorization works"),
      paragraph("Authorization depends on eligibility."),
      heading("h3", "A sub-section that stays out of the contents list"),
      heading("h2", "How VAC authorization works"),
      {
        type: "block",
        fields: {
          blockType: "keyPointsBox",
          id: "abc123",
          blockName: "Key points",
          heading: "Key points",
          points: [{ text: "Coverage is never guaranteed.", id: "p1" }],
        },
      },
      {
        type: "inlineBlock",
        fields: { blockType: "citation", number: 2, id: "c1" },
      },
    ],
  },
};

test("plain text includes paragraph copy and text stored inside editorial blocks", () => {
  const text = lexicalPlainText(body);
  assert.match(text, /Repetitive transcranial magnetic stimulation/);
  assert.match(text, /Authorization depends on eligibility\./);
  assert.match(text, /Coverage is never guaranteed\./);
  // Block plumbing never counts as prose.
  assert.equal(text.includes("keyPointsBox"), false);
  assert.equal(text.includes("abc123"), false);
  assert.equal(lexicalPlainText(null), "");
  assert.equal(lexicalPlainText({}), "");
});

test("reading time counts every readable word once", () => {
  assert.equal(lexicalWordCount(body), lexicalPlainText(body).split(/\s+/).length);
  assert.equal(lexicalWordCount(null), 0);
});

test("the table of contents lists H2 headings with stable, unique anchors", () => {
  assert.deepEqual(lexicalHeadings(body), [
    { text: "How VAC authorization works", id: "how-vac-authorization-works" },
    { text: "How VAC authorization works", id: "how-vac-authorization-works-2" },
  ]);
  assert.deepEqual(lexicalHeadings(null), []);
});

test("blocks already present in the body are detected so CTAs are not duplicated", () => {
  assert.equal(lexicalHasBlock(body, "keyPointsBox"), true);
  assert.equal(lexicalHasBlock(body, "contextualCta"), false);
  assert.equal(lexicalHasBlock(null, "contextualCta"), false);
});

test("SEO fields fall back to the title, summary and each other", () => {
  const bare = { title: "TMS for Veterans", summary: "An educational outline." };
  assert.equal(resolveSeoTitle(bare, "NeuroLinks"), "TMS for Veterans | NeuroLinks");
  assert.equal(resolveSeoTitle({ ...bare, seoTitle: "VAC and TMS" }, "NeuroLinks"), "VAC and TMS");

  assert.equal(resolveMetaDescription(bare, "fallback"), "An educational outline.");
  assert.equal(resolveMetaDescription({ title: "T" }, "fallback"), "fallback");
  assert.equal(
    resolveMetaDescription({ ...bare, metaDescription: "Custom." }, "fallback"),
    "Custom.",
  );

  assert.equal(resolveSocialTitle(bare, "SEO title"), "SEO title");
  assert.equal(resolveSocialTitle({ ...bare, socialTitle: "Share me" }, "SEO title"), "Share me");
  assert.equal(resolveSocialDescription(bare, "Meta."), "Meta.");
  assert.equal(
    resolveSocialDescription({ ...bare, socialDescription: "Social." }, "Meta."),
    "Social.",
  );
});

test("whitespace-only CMS values are treated as empty", () => {
  const blanks = { title: "TMS for Veterans", seoTitle: "   ", metaDescription: "\n" };
  assert.equal(resolveSeoTitle(blanks, "NeuroLinks"), "TMS for Veterans | NeuroLinks");
  assert.equal(resolveMetaDescription(blanks, "fallback"), "fallback");
});
