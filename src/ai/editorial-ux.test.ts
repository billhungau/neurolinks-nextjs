import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  QUICK_IMPROVE_ACTIONS,
  extractEditableSections,
  preservesCitationMarkers,
  replaceEditableSection,
} from "./editorial-ux.ts";

const here = dirname(fileURLToPath(import.meta.url));
const read = (relative: string) => readFileSync(join(here, relative), "utf8");
const assistant = read("../payload/components/AIArticleAssistant.tsx");
const provider = read("provider.ts");
const schemas = read("schemas.ts");

function bodyState() {
  return {
    root: {
      children: [
        { type: "heading", tag: "h2", children: [{ type: "text", text: "What the evidence shows" }] },
        { type: "paragraph", children: [{ type: "text", text: "Current evidence supports careful assessment [1]." }] },
        { type: "heading", tag: "h2", children: [{ type: "text", text: "Next steps" }] },
        { type: "paragraph", children: [{ type: "text", text: "Discuss options with the treating clinician." }] },
      ],
      type: "root",
    },
  };
}

test("quick Improve actions map to explicit existing Improve Article instructions", () => {
  assert.deepEqual(QUICK_IMPROVE_ACTIONS.map(([label]) => label), [
    "Shorten",
    "Improve readability",
    "More patient-friendly",
    "More evidence-led",
    "Reduce repetition",
    "Improve headings",
    "Stronger opening",
    "Reduce AI-like wording",
  ]);
  assert.match(assistant, /QUICK_IMPROVE_ACTIONS\.map/);
  assert.match(assistant, /run\("improve", instruction\)/);
  assert.doesNotMatch(assistant, /onChange=.*run\("improve"/);
});

test("assistant is document-scoped, collapsible, and never changes publishing status", () => {
  assert.match(assistant, /setExpanded\(documentId == null\)/);
  assert.match(assistant, /currentDocumentKey/);
  assert.match(assistant, /generatedForPath !== currentDocumentKey/);
  assert.match(assistant, /sectionGeneratedForPath !== currentDocumentKey/);
  assert.match(assistant, /aria-expanded=\{expanded\}/);
  assert.doesNotMatch(assistant, /updateField\("_status"/);
});

test("section-level AI uses the existing endpoint and sends only minimal article context", () => {
  assert.match(schemas, /"section"/);
  assert.match(provider, /request\.action === "section"/);
  assert.match(provider, /Return only a replacement heading, paragraphs and optional bullets/i);
  assert.match(assistant, /action: "section"/);
  assert.match(assistant, /current: \{ title: current\.title, summary: current\.summary \}/);
  assert.doesNotMatch(assistant, /action: "section"[\s\S]{0,500}bodyText/);
});

test("only simple H2/H3 sections are eligible and replacing one leaves other sections untouched", () => {
  const original = bodyState();
  const sections = extractEditableSections(original);
  assert.equal(sections.length, 2);
  assert.equal(sections[0].editable, true);
  const replacement = replaceEditableSection(original, sections[0].id, {
    heading: "What the evidence shows",
    paragraphs: ["Evidence supports careful assessment and individualized treatment planning [1]."],
    bullets: [],
  }, sections[0].fingerprint);
  assert.equal(replacement.error, undefined);
  const text = JSON.stringify(replacement.value);
  assert.match(text, /individualized treatment planning/);
  assert.match(text, /Next steps/);
  assert.match(text, /Discuss options with the treating clinician/);
});

test("structured sections are excluded rather than flattened", () => {
  const state = bodyState();
  state.root.children.splice(1, 1, {
    type: "paragraph",
    children: [{ type: "link", url: "/tms/", children: [{ type: "text", text: "TMS" }] }],
  } as never);
  const section = extractEditableSections(state)[0];
  assert.equal(section.editable, false);
  assert.match(section.reason || "", /structured content/i);
});

test("citation markers must survive section replacement exactly", () => {
  assert.equal(preservesCitationMarkers("Evidence [1]. REFERENCE REQUIRED: response rate", "Reworded evidence [1]. REFERENCE REQUIRED: response rate"), true);
  assert.equal(preservesCitationMarkers("Evidence [1].", "Reworded evidence."), false);
  const state = bodyState();
  const section = extractEditableSections(state)[0];
  const refused = replaceEditableSection(state, section.id, {
    heading: section.heading,
    paragraphs: ["Evidence supports careful assessment."],
    bullets: [],
  }, section.fingerprint);
  assert.match(refused.error || "", /citation markers/i);
});

test("section suggestion refuses stale content after the editor changes the section", () => {
  const state = bodyState();
  const section = extractEditableSections(state)[0];
  state.root.children[1] = { type: "paragraph", children: [{ type: "text", text: "The editor changed this section [1]." }] } as never;
  const refused = replaceEditableSection(state, section.id, {
    heading: section.heading,
    paragraphs: ["A proposed replacement [1]."],
    bullets: [],
  }, section.fingerprint);
  assert.match(refused.error || "", /changed after the AI suggestion/i);
});
