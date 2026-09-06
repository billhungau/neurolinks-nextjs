import { countWords, slugifyHeading, uniqueHeadingIds } from "./insights.ts";

/**
 * Pure helpers for reading Payload's Lexical article body and for resolving
 * the SEO fallback chain.
 *
 * Nothing here imports Payload or Next, so the rules that decide what readers
 * and search engines see are unit tested directly.
 */

export type LexicalNode = {
  type?: string;
  tag?: string;
  text?: string;
  children?: LexicalNode[];
  fields?: Record<string, unknown> & { blockType?: string };
  [key: string]: unknown;
};

export type LexicalState = {
  root?: LexicalNode;
} | null | undefined;

function walk(node: LexicalNode | undefined, visit: (node: LexicalNode) => void) {
  if (!node || typeof node !== "object") return;
  visit(node);
  const children = Array.isArray(node.children) ? node.children : [];
  for (const child of children) walk(child, visit);
}

function nodeText(node: LexicalNode | undefined): string {
  if (!node) return "";
  const parts: string[] = [];
  walk(node, (current) => {
    if (typeof current.text === "string") parts.push(current.text);
  });
  return parts.join("");
}

/** Every readable word in the body, including text inside editorial blocks. */
export function lexicalPlainText(state: LexicalState): string {
  if (!state?.root) return "";
  const parts: string[] = [];
  walk(state.root, (node) => {
    if (typeof node.text === "string" && node.text.length > 0) {
      parts.push(node.text);
      return;
    }
    // Editorial blocks store their copy in plain fields rather than in text
    // nodes, so pull the strings out of those too.
    if (node.type === "block" || node.type === "inlineBlock") {
      collectBlockText(node.fields, parts);
    }
  });
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

function collectBlockText(value: unknown, parts: string[], depth = 0) {
  if (depth > 6 || value == null) return;
  if (typeof value === "string") {
    if (value.trim()) parts.push(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const entry of value) collectBlockText(entry, parts, depth + 1);
    return;
  }
  if (typeof value === "object") {
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      // Skip identifiers, relationship payloads and block plumbing.
      if (key === "id" || key === "blockType" || key === "blockName") continue;
      if (typeof entry === "string" || Array.isArray(entry) || typeof entry === "object") {
        collectBlockText(entry, parts, depth + 1);
      }
    }
  }
}

/** H2 headings, with the stable anchor ids the table of contents links to. */
export function lexicalHeadings(state: LexicalState): { id: string; text: string }[] {
  if (!state?.root) return [];
  const texts: string[] = [];
  walk(state.root, (node) => {
    if (node.type === "heading" && node.tag === "h2") {
      const text = nodeText(node).trim();
      if (text) texts.push(text);
    }
  });
  const ids = uniqueHeadingIds(texts);
  return texts.map((text, index) => ({ text, id: ids[index] ?? slugifyHeading(text) }));
}

/** True when the body already contains a block of the given type. */
export function lexicalHasBlock(state: LexicalState, blockType: string): boolean {
  if (!state?.root) return false;
  let found = false;
  walk(state.root, (node) => {
    if (node.type === "block" && node.fields?.blockType === blockType) found = true;
  });
  return found;
}

export function lexicalWordCount(state: LexicalState): number {
  return countWords(lexicalPlainText(state));
}

/**
 * SEO fallbacks. Editors fill in what they want to control and NeuroLinks
 * derives the rest, so no field is ever mandatory.
 */

type SeoArticle = {
  title: string;
  summary?: string | null;
  seoTitle?: string | null;
  metaDescription?: string | null;
  socialTitle?: string | null;
  socialDescription?: string | null;
};

function firstNonEmpty(...values: (string | null | undefined)[]): string | undefined {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) return value.trim();
  }
  return undefined;
}

/** custom SEO title → article title */
export function resolveSeoTitle(article: SeoArticle, suffix: string): string {
  const custom = firstNonEmpty(article.seoTitle);
  if (custom) return custom;
  return `${article.title} | ${suffix}`;
}

/** custom description → article summary → section description */
export function resolveMetaDescription(article: SeoArticle, fallback: string): string {
  return firstNonEmpty(article.metaDescription, article.summary, fallback) ?? fallback;
}

/** social title → SEO title → article title */
export function resolveSocialTitle(article: SeoArticle, seoTitle: string): string {
  return firstNonEmpty(article.socialTitle) ?? seoTitle;
}

/** social description → meta description */
export function resolveSocialDescription(
  article: SeoArticle,
  metaDescription: string,
): string {
  return firstNonEmpty(article.socialDescription) ?? metaDescription;
}
