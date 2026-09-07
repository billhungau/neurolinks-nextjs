import type { SectionRewrite } from "./schemas";

export const QUICK_IMPROVE_ACTIONS = [
  ["Shorten", "Shorten the article materially while preserving medically important caveats, evidence limitations, and the direct answer."],
  ["Improve readability", "Improve readability with clearer topic sentences, shorter paragraphs, cleaner transitions, and less jargon."],
  ["More patient-friendly", "Make the article more patient-friendly: explain specialist terms plainly, reduce unnecessary background, and keep a calm professional tone."],
  ["More evidence-led", "Make the article more evidence-led without inventing evidence. Clarify which claims need support and keep unverified claims marked REFERENCE REQUIRED."],
  ["Reduce repetition", "Remove repeated ideas, duplicated caveats, redundant introductions, and repeated conclusions while preserving important clinical nuance."],
  ["Improve headings", "Improve the heading hierarchy so headings are specific, useful for scanning, and aligned with reader intent. Do not add unnecessary sections."],
  ["Stronger opening", "Rewrite the opening so it answers the reader's main question quickly and confidently within the first 100–150 words, without overclaiming."],
  ["Reduce AI-like wording", "Reduce generic AI-like prose, filler transitions, repetitive framing, excessive caveats, and formulaic conclusions. Keep the voice concise, natural, specialist, and human."],
] as const;

export const SECTION_IMPROVE_ACTIONS = [
  ["Shorten", "Shorten this section while preserving its factual meaning, medically important caveats, and any citation markers exactly."],
  ["Improve readability", "Improve readability of this section with clearer sentences and paragraph flow. Preserve all citation markers exactly."],
  ["More patient-friendly", "Make this section easier for patients to understand while preserving clinical accuracy and all citation markers exactly."],
  ["More evidence-led", "Make this section more evidence-led using only evidence already present in the supplied section. Do not invent studies, statistics, or citations. Preserve citation markers exactly."],
  ["Clarify", "Clarify ambiguous or dense wording in this section without changing its factual meaning. Preserve citation markers exactly."],
  ["Reduce repetition", "Remove repetition within this section while preserving medically important qualifications and all citation markers exactly."],
  ["Improve heading", "Improve the section heading for clarity and search/readability value while preserving the section's factual content and citation markers exactly."],
] as const;

type LexicalNode = {
  type?: string;
  tag?: string;
  text?: string;
  style?: string;
  format?: unknown;
  children?: LexicalNode[];
  [key: string]: unknown;
};

type LexicalState = {
  root?: LexicalNode;
  [key: string]: unknown;
};

export type EditableSection = {
  id: string;
  heading: string;
  level: 2 | 3;
  text: string;
  editable: boolean;
  reason?: string;
  fingerprint: string;
};

function nodeText(node: LexicalNode | undefined): string {
  if (!node) return "";
  if (typeof node.text === "string") return node.text;
  return (node.children || []).map(nodeText).join(" ").replace(/\s+/g, " ").trim();
}

function headingLevel(node: LexicalNode | undefined): 2 | 3 | null {
  if (node?.type !== "heading") return null;
  if (node.tag === "h2") return 2;
  if (node.tag === "h3") return 3;
  return null;
}

function simpleTextNode(node: LexicalNode): boolean {
  if (node.type !== "text") return false;
  const format = node.format;
  const noFormatting = format === undefined || format === 0 || format === "";
  return noFormatting && !node.style;
}

function simpleParagraph(node: LexicalNode): boolean {
  return node.type === "paragraph" && (node.children || []).every(simpleTextNode);
}

function simpleListItem(node: LexicalNode): boolean {
  return node.type === "listitem" && (node.children || []).every((child) => simpleTextNode(child) || simpleParagraph(child));
}

function simpleList(node: LexicalNode): boolean {
  return node.type === "list" && (node.children || []).every(simpleListItem);
}

function simpleContentNode(node: LexicalNode): boolean {
  return simpleParagraph(node) || simpleList(node);
}

function sectionId(index: number, heading: string): string {
  const slug = heading.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "section";
  return `section-${index}-${slug}`;
}

function fingerprint(heading: string, text: string): string {
  let hash = 2166136261;
  const input = `${heading}\n${text}`;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `${input.length}-${(hash >>> 0).toString(16)}`;
}

function sectionText(nodes: LexicalNode[]): string {
  return nodes.map(nodeText).filter(Boolean).join("\n\n").trim();
}

function locateSections(value: unknown) {
  if (!value || typeof value !== "object") return [] as Array<{ start: number; end: number; section: EditableSection }>;
  const state = value as LexicalState;
  const children = Array.isArray(state.root?.children) ? state.root!.children! : [];
  const result: Array<{ start: number; end: number; section: EditableSection }> = [];
  for (let start = 0; start < children.length; start += 1) {
    const level = headingLevel(children[start]);
    if (!level) continue;
    let end = start + 1;
    while (end < children.length && !headingLevel(children[end])) end += 1;
    const heading = nodeText(children[start]).trim();
    const content = children.slice(start + 1, end);
    const text = sectionText(content);
    const editable = content.length > 0 && content.every(simpleContentNode);
    result.push({
      start,
      end,
      section: {
        id: sectionId(start, heading),
        heading,
        level,
        text,
        editable,
        reason: editable ? undefined : "Contains links, formatting, citations as structured nodes, callouts, media, or other rich content that should be edited manually.",
        fingerprint: fingerprint(heading, text),
      },
    });
  }
  return result;
}

export function extractEditableSections(value: unknown): EditableSection[] {
  return locateSections(value).map((item) => item.section);
}

function textNode(text: string): LexicalNode {
  return { detail: 0, format: 0, mode: "normal", style: "", text, type: "text", version: 1 };
}

function paragraphNode(text: string): LexicalNode {
  return { children: text ? [textNode(text)] : [], direction: "ltr", format: "", indent: 0, type: "paragraph", version: 1, textFormat: 0, textStyle: "" };
}

function headingNode(text: string, level: 2 | 3): LexicalNode {
  return { children: [textNode(text)], direction: "ltr", format: "", indent: 0, tag: level === 3 ? "h3" : "h2", type: "heading", version: 1 };
}

function bulletListNode(items: string[]): LexicalNode {
  return {
    children: items.map((text, index) => ({
      children: [textNode(text)],
      direction: "ltr",
      format: "",
      indent: 0,
      type: "listitem",
      version: 1,
      value: index + 1,
    })),
    direction: "ltr",
    format: "",
    indent: 0,
    listType: "bullet",
    start: 1,
    tag: "ul",
    type: "list",
    version: 1,
  };
}

export function sectionRewriteText(rewrite: SectionRewrite): string {
  return [rewrite.heading, ...rewrite.paragraphs, ...rewrite.bullets].filter(Boolean).join("\n");
}

export function citationMarkers(text: string): string[] {
  const numeric = text.match(/\[(?:\d+(?:\s*[-,]\s*\d+)*)\]/g) || [];
  const required = text.match(/REFERENCE REQUIRED(?:\s*[:—-]\s*[^\n.;]+)?/gi) || [];
  return [...numeric, ...required].map((value) => value.trim()).sort();
}

export function preservesCitationMarkers(original: string, replacement: string): boolean {
  return JSON.stringify(citationMarkers(original)) === JSON.stringify(citationMarkers(replacement));
}

export function replaceEditableSection(
  value: unknown,
  sectionIdValue: string,
  rewrite: SectionRewrite,
  expectedFingerprint: string,
): { value?: unknown; error?: string } {
  const located = locateSections(value).find((item) => item.section.id === sectionIdValue);
  if (!located) return { error: "That section no longer exists in the current article." };
  if (!located.section.editable) return { error: located.section.reason || "This section contains structured content and cannot be replaced safely." };
  if (located.section.fingerprint !== expectedFingerprint) return { error: "That section changed after the AI suggestion was generated. Generate a new section suggestion before applying." };
  if (!preservesCitationMarkers(located.section.text, sectionRewriteText(rewrite))) return { error: "The proposed section changed or removed citation markers, so it was not applied." };
  if (!value || typeof value !== "object") return { error: "The article body is unavailable." };

  const state = structuredClone(value as LexicalState);
  const children = state.root?.children;
  if (!Array.isArray(children)) return { error: "The article body is unavailable." };
  const replacement: LexicalNode[] = [headingNode(rewrite.heading.trim() || located.section.heading, located.section.level)];
  for (const paragraph of rewrite.paragraphs) if (paragraph.trim()) replacement.push(paragraphNode(paragraph.trim()));
  const bullets = rewrite.bullets.map((bullet) => bullet.trim()).filter(Boolean);
  if (bullets.length) replacement.push(bulletListNode(bullets));
  children.splice(located.start, located.end - located.start, ...replacement);
  return { value: state };
}
