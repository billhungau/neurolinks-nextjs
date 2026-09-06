"use client";

import { useMemo, useState } from "react";
import { useAllFormFields } from "@payloadcms/ui";
import { ARTICLE_LENGTHS, ARTICLE_TYPES, type ArticleDraft, type ArticleLength, type SEOReview } from "@/ai/schemas";

function fieldValue(fields: Record<string, { value?: unknown }>, name: string): string {
  const value = fields[name]?.value;
  return typeof value === "string" ? value : "";
}

function lexicalText(value: unknown): string {
  if (!value || typeof value !== "object") return "";
  const out: string[] = [];
  const visit = (node: unknown) => {
    if (!node || typeof node !== "object") return;
    const item = node as { text?: unknown; children?: unknown[] };
    if (typeof item.text === "string") out.push(item.text);
    item.children?.forEach(visit);
  };
  visit(value);
  return out.join(" ").replace(/\s+/g, " ").trim();
}

function textNode(text: string) {
  return { detail: 0, format: 0, mode: "normal", style: "", text, type: "text", version: 1 };
}

function paragraphNode(text: string) {
  return {
    children: text ? [textNode(text)] : [],
    direction: "ltr",
    format: "",
    indent: 0,
    type: "paragraph",
    version: 1,
    textFormat: 0,
    textStyle: "",
  };
}

function headingNode(text: string, level: 2 | 3 = 2) {
  return {
    children: [textNode(text)],
    direction: "ltr",
    format: "",
    indent: 0,
    tag: level === 3 ? "h3" : "h2",
    type: "heading",
    version: 1,
  };
}

function draftToLexical(draft: ArticleDraft) {
  const children: unknown[] = [];
  for (const section of draft.sections) {
    if (section.heading?.trim()) children.push(headingNode(section.heading.trim(), section.level === 3 ? 3 : 2));
    for (const paragraph of section.paragraphs) {
      if (paragraph.trim()) children.push(paragraphNode(paragraph.trim()));
    }
    for (const bullet of section.bullets || []) {
      if (bullet.trim()) children.push(paragraphNode(`• ${bullet.trim()}`));
    }
  }
  return {
    root: {
      children,
      direction: "ltr",
      format: "",
      indent: 0,
      type: "root",
      version: 1,
    },
  };
}

function estimateWordCount(draft: ArticleDraft) {
  const text = [
    draft.title,
    draft.summary,
    ...draft.keyPoints,
    ...draft.sections.flatMap((section) => [section.heading || "", ...section.paragraphs, ...(section.bullets || [])]),
  ].join(" ");
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function lengthHint(articleLength: ArticleLength) {
  if (articleLength === "Concise") return "Recommended for most patient-facing articles · usually 650–900 words";
  if (articleLength === "Standard") return "More context while staying scannable · usually 850–1,150 words";
  return "Use for complex topics or evidence reviews · usually 1,100+ words";
}

export function AIArticleAssistant() {
  const [fields, dispatchFields] = useAllFormFields();
  const [topic, setTopic] = useState("");
  const [keyword, setKeyword] = useState("");
  const [audience, setAudience] = useState("Adults considering specialist treatment");
  const [goal, setGoal] = useState("");
  const [location, setLocation] = useState("Vancouver Island, British Columbia");
  const [articleType, setArticleType] = useState<(typeof ARTICLE_TYPES)[number]>("Treatment guide");
  const [articleLength, setArticleLength] = useState<ArticleLength>("Concise");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [draft, setDraft] = useState<ArticleDraft | null>(null);
  const [review, setReview] = useState<SEOReview | null>(null);

  const current = {
    title: fieldValue(fields, "title"), summary: fieldValue(fields, "summary"),
    bodyText: lexicalText(fields.body?.value), seoTitle: fieldValue(fields, "seoTitle"),
    metaDescription: fieldValue(fields, "metaDescription"), slug: fieldValue(fields, "slug"),
  };

  const inputStyle = { width: "100%", padding: "0.55rem 0.65rem", border: "1px solid var(--theme-elevation-200)", borderRadius: 4, background: "var(--theme-input-bg)" } as const;
  const buttonStyle = { padding: "0.6rem 0.8rem", borderRadius: 4, border: "1px solid var(--theme-elevation-300)", cursor: busy ? "wait" : "pointer" } as const;
  const primaryButtonStyle = { ...buttonStyle, background: "var(--theme-elevation-900)", color: "var(--theme-elevation-0)", borderColor: "var(--theme-elevation-900)" } as const;

  function updateField(path: string, value: unknown, remount = false) {
    dispatchFields({ type: "UPDATE", path, value, ...(remount ? { initialValue: value } : {}) });
  }

  function applied(message: string) {
    setNotice(`${message} Review the populated fields, then save as Draft when ready.`);
    setTimeout(() => setNotice(""), 6500);
  }

  function applyTitle() {
    if (!draft) return;
    updateField("title", draft.title);
    updateField("slug", draft.slug);
    applied("Title and slug applied.");
  }

  function applySummary() {
    if (!draft) return;
    updateField("summary", draft.summary);
    updateField("keyPoints", draft.keyPoints.map((text) => ({ text })));
    applied("Summary and key points applied.");
  }

  function applyBody() {
    if (!draft) return;
    updateField("body", draftToLexical(draft), true);
    applied("Article body applied.");
  }

  function applySeo() {
    if (!draft) return;
    updateField("seoTitle", draft.seoTitle);
    updateField("metaDescription", draft.metaDescription);
    updateField("socialTitle", draft.socialTitle);
    updateField("socialDescription", draft.socialDescription);
    if (draft.imageAlt?.trim()) updateField("featuredImageAlt", draft.imageAlt.trim());
    applied("SEO and social metadata applied.");
  }

  function applyFullDraft() {
    if (!draft) return;
    updateField("title", draft.title);
    updateField("slug", draft.slug);
    updateField("summary", draft.summary);
    updateField("keyPoints", draft.keyPoints.map((text) => ({ text })));
    updateField("body", draftToLexical(draft), true);
    updateField("seoTitle", draft.seoTitle);
    updateField("metaDescription", draft.metaDescription);
    updateField("socialTitle", draft.socialTitle);
    updateField("socialDescription", draft.socialDescription);
    if (draft.imageAlt?.trim()) updateField("featuredImageAlt", draft.imageAlt.trim());
    applied("Full AI draft applied. References, categories, topics and publishing status were intentionally left for human review.");
  }

  function applySeoReview() {
    if (!review) return;
    updateField("seoTitle", review.suggestedSeoTitle);
    updateField("metaDescription", review.suggestedMetaDescription);
    updateField("slug", review.suggestedSlug);
    applied("SEO review suggestions applied.");
  }

  async function run(action: "generate" | "improve" | "seo") {
    setBusy(true); setError(""); setNotice(""); setDraft(null); setReview(null);
    try {
      const response = await fetch("/api/admin/ai-article-assistant", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, topic, keyword, audience, goal, location, articleType, articleLength, current }),
      });
      const json = await response.json() as { error?: string; result?: ArticleDraft | SEOReview };
      if (!response.ok || !json.result) throw new Error(json.error || "AI request failed.");
      if (action === "seo") setReview(json.result as SEOReview); else setDraft(json.result as ArticleDraft);
    } catch (e) { setError(e instanceof Error ? e.message : "AI request failed."); }
    finally { setBusy(false); }
  }

  return <section style={{ margin: "1rem 0 1.5rem", padding: "1rem", border: "1px solid var(--theme-elevation-150)", borderRadius: 6, background: "var(--theme-elevation-50)" }}>
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline", marginBottom: 12 }}>
      <div><strong style={{ fontSize: "1rem" }}>AI Article Assistant</strong><div style={{ color: "var(--theme-elevation-600)", fontSize: ".8rem", marginTop: 3 }}>Generate, improve and review a draft. AI never publishes automatically.</div></div>
    </div>
    <div style={{ padding: ".65rem .75rem", marginBottom: 12, borderLeft: "3px solid #e8b923", background: "var(--theme-elevation-100)", fontSize: ".78rem" }}>Public editorial content only. Do not enter patient-identifying or confidential clinical information.</div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 10 }}>
      <label>Topic *<input style={inputStyle} value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. TMS for treatment-resistant depression" /></label>
      <label>Primary search query<input style={inputStyle} value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="e.g. TMS for depression BC" /></label>
      <label>Audience<input style={inputStyle} value={audience} onChange={(e) => setAudience(e.target.value)} /></label>
      <label>Location focus<input style={inputStyle} value={location} onChange={(e) => setLocation(e.target.value)} /></label>
      <label>Article type<select style={inputStyle} value={articleType} onChange={(e) => setArticleType(e.target.value as typeof articleType)}>{ARTICLE_TYPES.map((type) => <option key={type}>{type}</option>)}</select></label>
      <label>Length<select style={inputStyle} value={articleLength} onChange={(e) => setArticleLength(e.target.value as ArticleLength)}>{ARTICLE_LENGTHS.map((length) => <option key={length}>{length}</option>)}</select><span style={{ display: "block", marginTop: 4, color: "var(--theme-elevation-600)", fontSize: ".72rem" }}>{lengthHint(articleLength)}</span></label>
      <label>Article goal<input style={inputStyle} value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="What should the reader understand or do?" /></label>
    </div>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
      <button type="button" style={buttonStyle} disabled={busy || !topic.trim()} onClick={() => run("generate")}>{busy ? "Working…" : "Generate draft"}</button>
      <button type="button" style={buttonStyle} disabled={busy || (!current.title && !current.bodyText)} onClick={() => run("improve")}>Improve article</button>
      <button type="button" style={buttonStyle} disabled={busy || (!current.title && !current.bodyText)} onClick={() => run("seo")}>Improve SEO</button>
    </div>
    {error && <p style={{ marginTop: 12, color: "var(--theme-error-500)" }}>{error}</p>}
    {notice && <p style={{ marginTop: 12, padding: ".6rem .7rem", background: "var(--theme-success-100)", borderRadius: 4 }}>{notice}</p>}
    {draft && <DraftResult draft={draft} onApplyFull={applyFullDraft} onApplyTitle={applyTitle} onApplySummary={applySummary} onApplyBody={applyBody} onApplySeo={applySeo} primaryButtonStyle={primaryButtonStyle} buttonStyle={buttonStyle} />}
    {review && <SEOResult review={review} onApply={applySeoReview} primaryButtonStyle={primaryButtonStyle} />}
  </section>;
}

function DraftResult({ draft, onApplyFull, onApplyTitle, onApplySummary, onApplyBody, onApplySeo, primaryButtonStyle, buttonStyle }: {
  draft: ArticleDraft;
  onApplyFull: () => void;
  onApplyTitle: () => void;
  onApplySummary: () => void;
  onApplyBody: () => void;
  onApplySeo: () => void;
  primaryButtonStyle: React.CSSProperties;
  buttonStyle: React.CSSProperties;
}) {
  const wordCount = useMemo(() => estimateWordCount(draft), [draft]);
  return <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--theme-elevation-150)" }}>
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
      <div><strong>Proposed draft</strong><div style={{ fontSize: ".78rem", color: "var(--theme-elevation-600)", marginTop: 2 }}>About {wordCount.toLocaleString()} words · review before applying</div></div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        <button type="button" style={primaryButtonStyle} onClick={onApplyFull}>Apply full draft</button>
        <button type="button" style={buttonStyle} onClick={onApplyTitle}>Apply title</button>
        <button type="button" style={buttonStyle} onClick={onApplySummary}>Apply summary</button>
        <button type="button" style={buttonStyle} onClick={onApplyBody}>Apply body</button>
        <button type="button" style={buttonStyle} onClick={onApplySeo}>Apply SEO</button>
      </div>
    </div>

    <details open style={{ marginTop: 12 }}><summary style={{ cursor: "pointer", fontWeight: 600 }}>Article preview</summary>
      <div style={{ paddingTop: 8 }}><h3 style={{ margin: "4px 0" }}>{draft.title}</h3><p>{draft.summary}</p>
      {draft.keyPoints.length > 0 && <><strong>Key points</strong><ul>{draft.keyPoints.map((x) => <li key={x}>{x}</li>)}</ul></>}
      {draft.sections.map((section, i) => <div key={`${section.heading}-${i}`}><h4>{section.heading}</h4>{section.paragraphs.map((p) => <p key={p}>{p}</p>)}{(section.bullets?.length ?? 0) > 0 && <ul>{section.bullets?.map((b) => <li key={b}>{b}</li>)}</ul>}</div>)}</div>
    </details>

    <details style={{ marginTop: 10 }}><summary style={{ cursor: "pointer", fontWeight: 600 }}>SEO & social metadata</summary>
      <div style={{ paddingTop: 8 }}><p><strong>Slug:</strong> {draft.slug}<br/><strong>SEO title:</strong> {draft.seoTitle}<br/><strong>Meta:</strong> {draft.metaDescription}<br/><strong>Social title:</strong> {draft.socialTitle}<br/><strong>Social description:</strong> {draft.socialDescription}</p><p><strong>Image concept:</strong> {draft.imageConcept}<br/><strong>Suggested image alt:</strong> {draft.imageAlt}</p></div>
    </details>

    <details style={{ marginTop: 10 }}><summary style={{ cursor: "pointer", fontWeight: 600 }}>References to verify ({draft.referenceRequirements.length})</summary>
      <div style={{ paddingTop: 8 }}>{draft.referenceRequirements.length > 0 ? <ul>{draft.referenceRequirements.map((x) => <li key={x}>{x}</li>)}</ul> : <p>No reference requirements were returned.</p>}</div>
    </details>

    <details style={{ marginTop: 10 }}><summary style={{ cursor: "pointer", fontWeight: 600 }}>Internal-link suggestions ({draft.suggestedInternalLinks.length})</summary>
      <div style={{ paddingTop: 8 }}>{draft.suggestedInternalLinks.length > 0 ? <ul>{draft.suggestedInternalLinks.map((x) => <li key={`${x.href}-${x.anchor}`}><code>{x.anchor}</code> → {x.href} — {x.reason}</li>)}</ul> : <p>No internal-link suggestions were returned.</p>}</div>
    </details>

    <p style={{ fontSize: ".78rem", color: "var(--theme-elevation-600)", marginTop: 12 }}>Applying changes populates the edit form only. It does not save, publish, create reference records, or change article status.</p>
  </div>;
}

function SEOResult({ review, onApply, primaryButtonStyle }: { review: SEOReview; onApply: () => void; primaryButtonStyle: React.CSSProperties }) {
  return <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--theme-elevation-150)" }}>
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 10, alignItems: "center" }}><strong>SEO & Content Review — {review.score}/100 · {review.readiness}</strong><button type="button" style={primaryButtonStyle} onClick={onApply}>Apply SEO suggestions</button></div>
    <details open style={{ marginTop: 10 }}><summary style={{ cursor: "pointer", fontWeight: 600 }}>Review checks</summary><ul>{review.checks.map((c) => <li key={c.label}><strong>{c.label}:</strong> {c.status} — {c.note}</li>)}</ul></details>
    <details style={{ marginTop: 10 }}><summary style={{ cursor: "pointer", fontWeight: 600 }}>Recommendations</summary><ul>{review.recommendations.map((x) => <li key={x}>{x}</li>)}</ul></details>
    <details style={{ marginTop: 10 }}><summary style={{ cursor: "pointer", fontWeight: 600 }}>Suggested metadata</summary><p><strong>Suggested SEO title:</strong> {review.suggestedSeoTitle}<br/><strong>Suggested meta description:</strong> {review.suggestedMetaDescription}<br/><strong>Suggested slug:</strong> {review.suggestedSlug}</p></details>
    {review.referenceRequirements.length > 0 && <details style={{ marginTop: 10 }}><summary style={{ cursor: "pointer", fontWeight: 600 }}>Claims needing verified references ({review.referenceRequirements.length})</summary><ul>{review.referenceRequirements.map((x) => <li key={x}>{x}</li>)}</ul></details>}
  </div>;
}
