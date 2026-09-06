"use client";

import { useState } from "react";
import { useAllFormFields } from "@payloadcms/ui";
import { ARTICLE_TYPES, type ArticleDraft, type SEOReview } from "@/ai/schemas";

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

export function AIArticleAssistant() {
  const [fields] = useAllFormFields();
  const [topic, setTopic] = useState("");
  const [keyword, setKeyword] = useState("");
  const [audience, setAudience] = useState("Adults considering specialist treatment");
  const [goal, setGoal] = useState("");
  const [location, setLocation] = useState("Vancouver Island, British Columbia");
  const [articleType, setArticleType] = useState<(typeof ARTICLE_TYPES)[number]>("Treatment guide");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState<ArticleDraft | null>(null);
  const [review, setReview] = useState<SEOReview | null>(null);

  const current = {
    title: fieldValue(fields, "title"), summary: fieldValue(fields, "summary"),
    bodyText: lexicalText(fields.body?.value), seoTitle: fieldValue(fields, "seoTitle"),
    metaDescription: fieldValue(fields, "metaDescription"), slug: fieldValue(fields, "slug"),
  };

  async function run(action: "generate" | "improve" | "seo") {
    setBusy(true); setError(""); setDraft(null); setReview(null);
    try {
      const response = await fetch("/api/admin/ai-article-assistant", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, topic, keyword, audience, goal, location, articleType, current }),
      });
      const json = await response.json() as { error?: string; result?: ArticleDraft | SEOReview };
      if (!response.ok || !json.result) throw new Error(json.error || "AI request failed.");
      if (action === "seo") setReview(json.result as SEOReview); else setDraft(json.result as ArticleDraft);
    } catch (e) { setError(e instanceof Error ? e.message : "AI request failed."); }
    finally { setBusy(false); }
  }

  const inputStyle = { width: "100%", padding: "0.55rem 0.65rem", border: "1px solid var(--theme-elevation-200)", borderRadius: 4, background: "var(--theme-input-bg)" } as const;
  const buttonStyle = { padding: "0.6rem 0.8rem", borderRadius: 4, border: "1px solid var(--theme-elevation-300)", cursor: busy ? "wait" : "pointer" } as const;

  return <section style={{ margin: "1rem 0 1.5rem", padding: "1rem", border: "1px solid var(--theme-elevation-150)", borderRadius: 6, background: "var(--theme-elevation-50)" }}>
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline", marginBottom: 12 }}>
      <div><strong style={{ fontSize: "1rem" }}>AI Article Assistant</strong><div style={{ color: "var(--theme-elevation-600)", fontSize: ".8rem", marginTop: 3 }}>Generate, improve and review a draft. Nothing is published automatically.</div></div>
    </div>
    <div style={{ padding: ".65rem .75rem", marginBottom: 12, borderLeft: "3px solid #e8b923", background: "var(--theme-elevation-100)", fontSize: ".78rem" }}>Public editorial content only. Do not enter patient-identifying or confidential clinical information.</div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 10 }}>
      <label>Topic *<input style={inputStyle} value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. TMS for treatment-resistant depression" /></label>
      <label>Primary search query<input style={inputStyle} value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="e.g. TMS for depression BC" /></label>
      <label>Audience<input style={inputStyle} value={audience} onChange={(e) => setAudience(e.target.value)} /></label>
      <label>Location focus<input style={inputStyle} value={location} onChange={(e) => setLocation(e.target.value)} /></label>
      <label>Article type<select style={inputStyle} value={articleType} onChange={(e) => setArticleType(e.target.value as typeof articleType)}>{ARTICLE_TYPES.map((type) => <option key={type}>{type}</option>)}</select></label>
      <label>Article goal<input style={inputStyle} value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="What should the reader understand or do?" /></label>
    </div>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
      <button type="button" style={buttonStyle} disabled={busy || !topic.trim()} onClick={() => run("generate")}>{busy ? "Working…" : "Generate draft"}</button>
      <button type="button" style={buttonStyle} disabled={busy || (!current.title && !current.bodyText)} onClick={() => run("improve")}>Improve article</button>
      <button type="button" style={buttonStyle} disabled={busy || (!current.title && !current.bodyText)} onClick={() => run("seo")}>Improve SEO</button>
    </div>
    {error && <p style={{ marginTop: 12, color: "var(--theme-error-500)" }}>{error}</p>}
    {draft && <DraftResult draft={draft} />}
    {review && <SEOResult review={review} />}
  </section>;
}

function DraftResult({ draft }: { draft: ArticleDraft }) {
  return <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--theme-elevation-150)" }}>
    <strong>Proposed draft — review before copying into the editor</strong>
    <h3 style={{ margin: "12px 0 4px" }}>{draft.title}</h3><p>{draft.summary}</p>
    {draft.keyPoints.length > 0 && <><strong>Key points</strong><ul>{draft.keyPoints.map((x) => <li key={x}>{x}</li>)}</ul></>}
    {draft.sections.map((section, i) => <div key={`${section.heading}-${i}`}><h4>{section.heading}</h4>{section.paragraphs.map((p) => <p key={p}>{p}</p>)}{(section.bullets?.length ?? 0) > 0 && <ul>{section.bullets?.map((b) => <li key={b}>{b}</li>)}</ul>}</div>)}
    <p><strong>SEO title:</strong> {draft.seoTitle}<br/><strong>Meta:</strong> {draft.metaDescription}</p>
    {draft.referenceRequirements.length > 0 && <><strong>References to verify before publishing</strong><ul>{draft.referenceRequirements.map((x) => <li key={x}>{x}</li>)}</ul></>}
    {draft.suggestedInternalLinks.length > 0 && <><strong>Internal-link suggestions</strong><ul>{draft.suggestedInternalLinks.map((x) => <li key={`${x.href}-${x.anchor}`}><code>{x.anchor}</code> → {x.href} — {x.reason}</li>)}</ul></>}
    <p style={{ fontSize: ".78rem", color: "var(--theme-elevation-600)" }}>Phase 1 safety: AI output is deliberately presented for human review and is not applied or published automatically.</p>
  </div>;
}

function SEOResult({ review }: { review: SEOReview }) {
  return <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--theme-elevation-150)" }}>
    <strong>SEO & Content Review — {review.score}/100 · {review.readiness}</strong>
    <ul>{review.checks.map((c) => <li key={c.label}><strong>{c.label}:</strong> {c.status} — {c.note}</li>)}</ul>
    <strong>Recommendations</strong><ul>{review.recommendations.map((x) => <li key={x}>{x}</li>)}</ul>
    <p><strong>Suggested SEO title:</strong> {review.suggestedSeoTitle}<br/><strong>Suggested meta description:</strong> {review.suggestedMetaDescription}<br/><strong>Suggested slug:</strong> {review.suggestedSlug}</p>
    {review.referenceRequirements.length > 0 && <><strong>Claims needing verified references</strong><ul>{review.referenceRequirements.map((x) => <li key={x}>{x}</li>)}</ul></>}
  </div>;
}
