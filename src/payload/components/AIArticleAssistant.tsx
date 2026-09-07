"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useAllFormFields } from "@payloadcms/ui";
import {
  ARTICLE_LENGTHS,
  ARTICLE_TONES,
  ARTICLE_TYPES,
  type ArticleDraft,
  type ArticleLength,
  type ArticleTone,
  type SEOReview,
} from "@/ai/schemas";

const MAX_SOURCE_FILES = 10;
const MAX_SOURCE_FILE_BYTES = 4 * 1024 * 1024;

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

function relationshipIds(value: unknown): Array<string | number> {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (typeof entry === "string" || typeof entry === "number") return [entry];
    if (entry && typeof entry === "object") {
      const item = entry as { id?: unknown; value?: unknown };
      if (typeof item.id === "string" || typeof item.id === "number") return [item.id];
      if (typeof item.value === "string" || typeof item.value === "number") return [item.value];
      if (item.value && typeof item.value === "object") {
        const nested = item.value as { id?: unknown };
        if (typeof nested.id === "string" || typeof nested.id === "number") return [nested.id];
      }
    }
    return [];
  });
}

function textNode(text: string) {
  return { detail: 0, format: 0, mode: "normal", style: "", text, type: "text", version: 1 };
}
function paragraphNode(text: string) {
  return { children: text ? [textNode(text)] : [], direction: "ltr", format: "", indent: 0, type: "paragraph", version: 1, textFormat: 0, textStyle: "" };
}
function headingNode(text: string, level: 2 | 3 = 2) {
  return { children: [textNode(text)], direction: "ltr", format: "", indent: 0, tag: level === 3 ? "h3" : "h2", type: "heading", version: 1 };
}
function draftToLexical(draft: ArticleDraft) {
  const children: unknown[] = [];
  for (const section of draft.sections) {
    if (section.heading?.trim()) children.push(headingNode(section.heading.trim(), section.level === 3 ? 3 : 2));
    for (const paragraph of section.paragraphs) if (paragraph.trim()) children.push(paragraphNode(paragraph.trim()));
    for (const bullet of section.bullets || []) if (bullet.trim()) children.push(paragraphNode(`• ${bullet.trim()}`));
  }
  return { root: { children, direction: "ltr", format: "", indent: 0, type: "root", version: 1 } };
}
function estimateWordCount(draft: ArticleDraft) {
  const text = [draft.title, draft.summary, ...draft.keyPoints, ...draft.sections.flatMap((s) => [s.heading || "", ...s.paragraphs, ...(s.bullets || [])])].join(" ");
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}
function lengthHint(articleLength: ArticleLength) {
  if (articleLength === "Concise") return "Recommended for most patient-facing articles · usually 650–900 words";
  if (articleLength === "Standard") return "More context while staying scannable · usually 850–1,150 words";
  return "Use for complex topics or evidence reviews · usually 1,100+ words";
}
function readableBytes(value?: number) {
  if (!value || value < 1024) return `${value || 0} B`;
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

type ReferenceRecord = {
  id: string | number;
  title?: string;
  authors?: string;
  publisher?: string;
  year?: number;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
};

type SourceDocument = {
  id: string | number;
  filename?: string;
  mimeType?: string;
  filesize?: number;
};

type SourceListResponse = { docs?: SourceDocument[] };
type SourceUploadResponse = { doc?: SourceDocument; error?: string; message?: string };

export function AIArticleAssistant() {
  const pathname = usePathname();
  const [fields, dispatchFields] = useAllFormFields();
  const [topic, setTopic] = useState("");
  const [keyword, setKeyword] = useState("");
  const [audience, setAudience] = useState("Adults considering specialist treatment");
  const [goal, setGoal] = useState("");
  const [location, setLocation] = useState("Vancouver Island, British Columbia");
  const [articleType, setArticleType] = useState<(typeof ARTICLE_TYPES)[number]>("Treatment guide");
  const [articleLength, setArticleLength] = useState<ArticleLength>("Concise");
  const [tone, setTone] = useState<ArticleTone>("Expert & confident");
  const [improvementDirection, setImprovementDirection] = useState("");
  const [sourceFiles, setSourceFiles] = useState<File[]>([]);
  const [sourceDocuments, setSourceDocuments] = useState<SourceDocument[]>([]);
  const [doi, setDoi] = useState("");
  const [referenceBusy, setReferenceBusy] = useState(false);
  const [addedReferences, setAddedReferences] = useState<ReferenceRecord[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [draft, setDraft] = useState<ArticleDraft | null>(null);
  const [review, setReview] = useState<SEOReview | null>(null);
  const [generatedForPath, setGeneratedForPath] = useState("");

  const sourceSession = fieldValue(fields, "aiSourceSession");

  useEffect(() => {
    setDraft(null);
    setReview(null);
    setGeneratedForPath("");
    setError("");
    setNotice("");
    setSourceFiles([]);
    setSourceDocuments([]);
    setProgress(0);
    setProgressLabel("");
    setDoi("");
    setAddedReferences([]);
  }, [pathname]);

  useEffect(() => {
    let cancelled = false;
    if (!sourceSession) {
      setSourceDocuments([]);
      return;
    }
    const query = encodeURIComponent(sourceSession);
    fetch(`/payload-api/ai-source-documents?where[sessionId][equals]=${query}&limit=${MAX_SOURCE_FILES}&sort=createdAt`)
      .then(async (response) => {
        if (!response.ok) return { docs: [] } as SourceListResponse;
        return response.json() as Promise<SourceListResponse>;
      })
      .then((json) => { if (!cancelled) setSourceDocuments(Array.isArray(json.docs) ? json.docs : []); })
      .catch(() => { if (!cancelled) setSourceDocuments([]); });
    return () => { cancelled = true; };
  }, [pathname, sourceSession]);

  const current = {
    title: fieldValue(fields, "title"),
    summary: fieldValue(fields, "summary"),
    bodyText: lexicalText(fields.body?.value),
    seoTitle: fieldValue(fields, "seoTitle"),
    metaDescription: fieldValue(fields, "metaDescription"),
    slug: fieldValue(fields, "slug"),
  };

  const inputStyle = { width: "100%", padding: "0.55rem 0.65rem", border: "1px solid var(--theme-elevation-200)", borderRadius: 4, background: "var(--theme-input-bg)" } as const;
  const textAreaStyle = { ...inputStyle, minHeight: 88, resize: "vertical" as const };
  const buttonStyle = { padding: "0.6rem 0.8rem", borderRadius: 4, border: "1px solid var(--theme-elevation-300)", cursor: busy ? "wait" : "pointer" } as const;
  const primaryButtonStyle = { ...buttonStyle, background: "var(--theme-elevation-900)", color: "var(--theme-elevation-0)", borderColor: "var(--theme-elevation-900)" } as const;

  function updateField(path: string, value: unknown, remount = false) {
    dispatchFields({ type: "UPDATE", path, value, ...(remount ? { initialValue: value } : {}) });
  }
  function applied(message: string) {
    setNotice(`${message} Review the populated fields, then save as Draft when ready.`);
    setTimeout(() => setNotice(""), 6500);
  }
  function ensureCurrentDocument() {
    if (generatedForPath && generatedForPath !== pathname) {
      setError("This AI result belongs to a different Insight. Generate it again on the current article before applying.");
      return false;
    }
    return true;
  }
  function ensureSourceSession() {
    const existing = fieldValue(fields, "aiSourceSession");
    if (existing) return existing;
    const created = crypto.randomUUID();
    updateField("aiSourceSession", created);
    return created;
  }
  function applyTitle() {
    if (!draft || !ensureCurrentDocument()) return;
    updateField("title", draft.title); updateField("slug", draft.slug); applied("Title and slug applied.");
  }
  function applySummary() {
    if (!draft || !ensureCurrentDocument()) return;
    updateField("summary", draft.summary); updateField("keyPoints", draft.keyPoints.map((text) => ({ text }))); applied("Summary and key points applied.");
  }
  function applyBody() {
    if (!draft || !ensureCurrentDocument()) return;
    updateField("body", draftToLexical(draft), true); applied("Article body applied.");
  }
  function applySeo() {
    if (!draft || !ensureCurrentDocument()) return;
    updateField("seoTitle", draft.seoTitle); updateField("metaDescription", draft.metaDescription); updateField("socialTitle", draft.socialTitle); updateField("socialDescription", draft.socialDescription);
    if (draft.imageAlt?.trim()) updateField("featuredImageAlt", draft.imageAlt.trim());
    applied("SEO and social metadata applied.");
  }
  function applyFullDraft() {
    if (!draft || !ensureCurrentDocument()) return;
    const replacingDifferentArticle = current.title.trim() && current.title.trim() !== draft.title.trim();
    if (replacingDifferentArticle && !window.confirm(`Replace the current article “${current.title}” with the proposed AI draft “${draft.title}”? This changes the title, slug, summary, body and SEO fields.`)) return;
    updateField("title", draft.title); updateField("slug", draft.slug); updateField("summary", draft.summary); updateField("keyPoints", draft.keyPoints.map((text) => ({ text }))); updateField("body", draftToLexical(draft), true); updateField("seoTitle", draft.seoTitle); updateField("metaDescription", draft.metaDescription); updateField("socialTitle", draft.socialTitle); updateField("socialDescription", draft.socialDescription);
    if (draft.imageAlt?.trim()) updateField("featuredImageAlt", draft.imageAlt.trim());
    applied("Full AI draft applied. References, categories, topics and publishing status were intentionally left for human review.");
  }
  function applySeoReview() {
    if (!review || !ensureCurrentDocument()) return;
    updateField("seoTitle", review.suggestedSeoTitle); updateField("metaDescription", review.suggestedMetaDescription); updateField("slug", review.suggestedSlug); applied("SEO review suggestions applied.");
  }

  function uploadSourceFile(file: File, sessionId: string, index: number, total: number): Promise<SourceDocument> {
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append("file", file);
      form.append("_payload", JSON.stringify({ sessionId }));
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/payload-api/ai-source-documents");
      xhr.withCredentials = true;
      xhr.upload.onprogress = (event) => {
        const fraction = event.lengthComputable && event.total > 0 ? event.loaded / event.total : 0;
        const percent = 5 + ((index + fraction) / Math.max(total, 1)) * 45;
        setProgress(Math.min(50, Math.round(percent)));
        setProgressLabel(`Uploading source ${index + 1} of ${total}: ${file.name}`);
      };
      xhr.onerror = () => reject(new Error(`Could not upload ${file.name}.`));
      xhr.onload = () => {
        let json: SourceUploadResponse = {};
        try { json = JSON.parse(xhr.responseText) as SourceUploadResponse; } catch { /* use generic error below */ }
        if (xhr.status < 200 || xhr.status >= 300 || !json.doc) {
          reject(new Error(json.error || json.message || `Could not upload ${file.name}.`));
          return;
        }
        resolve(json.doc);
      };
      xhr.send(form);
    });
  }

  async function removeSourceDocument(doc: SourceDocument) {
    if (busy) return;
    setError("");
    const response = await fetch(`/payload-api/ai-source-documents/${encodeURIComponent(String(doc.id))}`, { method: "DELETE" });
    if (!response.ok) {
      setError(`Could not remove ${doc.filename || "source file"}.`);
      return;
    }
    setSourceDocuments((items) => items.filter((item) => String(item.id) !== String(doc.id)));
  }

  async function run(action: "generate" | "improve" | "seo") {
    setBusy(true); setError(""); setNotice(""); setDraft(null); setReview(null); setProgress(3); setProgressLabel("Preparing request…");
    let ticker: ReturnType<typeof setInterval> | undefined;
    try {
      if (sourceDocuments.length + sourceFiles.length > MAX_SOURCE_FILES) throw new Error(`Use up to ${MAX_SOURCE_FILES} source files for one article.`);
      const oversized = sourceFiles.find((file) => file.size > MAX_SOURCE_FILE_BYTES);
      if (oversized) throw new Error(`${oversized.name} is larger than 4 MB. Split or compress that source file before uploading.`);

      let activeSession = sourceSession;
      let uploaded = [...sourceDocuments];
      if (sourceFiles.length) {
        activeSession = ensureSourceSession();
        for (let i = 0; i < sourceFiles.length; i += 1) {
          const doc = await uploadSourceFile(sourceFiles[i], activeSession, i, sourceFiles.length);
          uploaded = [...uploaded, doc];
          setSourceDocuments(uploaded);
        }
        setSourceFiles([]);
      }

      setProgress(55);
      setProgressLabel(uploaded.length ? `Reading ${uploaded.length} source file${uploaded.length === 1 ? "" : "s"} and generating article…` : "Generating article…");
      ticker = setInterval(() => setProgress((value) => (value < 94 ? Math.min(94, value + (value < 75 ? 2 : 1)) : value)), 900);

      const requestBody = { action, topic, keyword, audience, goal, location, articleType, articleLength, tone, improvementDirection, current, sourceSession: activeSession || undefined };
      const response = await fetch("/api/admin/ai-article-assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(requestBody) });
      const json = await response.json() as { error?: string; result?: ArticleDraft | SEOReview };
      if (!response.ok || !json.result) throw new Error(json.error || "AI request failed.");
      if (ticker) clearInterval(ticker);
      setProgress(100);
      setProgressLabel("Complete");
      setGeneratedForPath(pathname);
      if (action === "seo") setReview(json.result as SEOReview); else setDraft(json.result as ArticleDraft);
    } catch (e) {
      if (ticker) clearInterval(ticker);
      setProgressLabel("Stopped");
      setError(e instanceof Error ? e.message : "AI request failed.");
    } finally { setBusy(false); }
  }

  async function addReference() {
    if (!doi.trim()) return;
    setReferenceBusy(true); setError("");
    try {
      const response = await fetch("/api/admin/reference-by-doi", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ doi }) });
      const json = await response.json() as { error?: string; reference?: ReferenceRecord; created?: boolean };
      if (!response.ok || !json.reference) throw new Error(json.error || "Reference lookup failed.");
      const existingIds = relationshipIds(fields.references?.value);
      if (!existingIds.some((id) => String(id) === String(json.reference!.id))) updateField("references", [...existingIds, json.reference.id]);
      setAddedReferences((items) => items.some((item) => String(item.id) === String(json.reference!.id)) ? items : [...items, json.reference!]);
      setDoi("");
      setNotice(`${json.created ? "Reference created" : "Existing reference found"} and added to this article. Save the Insight to keep the relationship.`);
    } catch (e) { setError(e instanceof Error ? e.message : "Reference lookup failed."); }
    finally { setReferenceBusy(false); }
  }

  return <section style={{ margin: "1rem 0 1.5rem", padding: "1rem", border: "1px solid var(--theme-elevation-150)", borderRadius: 6, background: "var(--theme-elevation-50)" }}>
    <div style={{ marginBottom: 12 }}><strong style={{ fontSize: "1rem" }}>AI Article Assistant</strong><div style={{ color: "var(--theme-elevation-600)", fontSize: ".8rem", marginTop: 3 }}>Generate, improve and review the current Insight. Results are reset when you move to another article and AI never publishes automatically.</div></div>
    <div style={{ padding: ".65rem .75rem", marginBottom: 12, borderLeft: "3px solid #e8b923", background: "var(--theme-elevation-100)", fontSize: ".78rem" }}>Public editorial material only. Do not upload or enter patient-identifying or confidential clinical information. Source files are stored temporarily for this draft and are deleted automatically after the article is published.</div>

    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 10 }}>
      <label>Topic *<input style={inputStyle} value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. TMS for OCD" /></label>
      <label>Primary search query<input style={inputStyle} value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="e.g. TMS for OCD BC" /></label>
      <label>Audience<input style={inputStyle} value={audience} onChange={(e) => setAudience(e.target.value)} /></label>
      <label>Location focus<input style={inputStyle} value={location} onChange={(e) => setLocation(e.target.value)} /></label>
      <label>Article type<select style={inputStyle} value={articleType} onChange={(e) => setArticleType(e.target.value as typeof articleType)}>{ARTICLE_TYPES.map((type) => <option key={type}>{type}</option>)}</select></label>
      <label>Length<select style={inputStyle} value={articleLength} onChange={(e) => setArticleLength(e.target.value as ArticleLength)}>{ARTICLE_LENGTHS.map((length) => <option key={length}>{length}</option>)}</select><span style={{ display: "block", marginTop: 4, color: "var(--theme-elevation-600)", fontSize: ".72rem" }}>{lengthHint(articleLength)}</span></label>
      <label>Tone<select style={inputStyle} value={tone} onChange={(e) => setTone(e.target.value as ArticleTone)}>{ARTICLE_TONES.map((value) => <option key={value}>{value}</option>)}</select></label>
    </div>

    <label style={{ display: "block", marginTop: 10 }}>Article goal<textarea style={textAreaStyle} value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Describe what the reader should understand, what to emphasize, what to leave out, and any specific clinical framing." /></label>
    <label style={{ display: "block", marginTop: 10 }}>Direction for “Improve article”<textarea style={textAreaStyle} value={improvementDirection} onChange={(e) => setImprovementDirection(e.target.value)} placeholder="e.g. Make the opening more decisive, focus on OCD evidence, shorten contraindication discussion, and remove repetitive caveats." /></label>

    <div style={{ marginTop: 12, padding: ".75rem", border: "1px solid var(--theme-elevation-150)", borderRadius: 4 }}>
      <strong style={{ display: "block", marginBottom: 5 }}>Source files</strong>
      <input type="file" multiple accept=".pdf,.txt,.md,.doc,.docx,application/pdf,text/plain,text/markdown,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" disabled={busy} onChange={(e) => {
        const incoming = Array.from(e.target.files || []);
        setSourceFiles((currentFiles) => [...currentFiles, ...incoming].slice(0, Math.max(0, MAX_SOURCE_FILES - sourceDocuments.length)));
        e.currentTarget.value = "";
      }} />
      <div style={{ fontSize: ".75rem", color: "var(--theme-elevation-600)", marginTop: 5 }}>Select up to {MAX_SOURCE_FILES} PDF/TXT/MD/DOC/DOCX files. Files are uploaded one at a time when you run the AI, avoiding the combined-request size limit. Current per-file limit: 4 MB.</div>
      {sourceFiles.length > 0 && <div style={{ marginTop: 7, fontSize: ".76rem" }}><strong>Waiting to upload:</strong><ul style={{ margin: "4px 0 0", paddingLeft: "1.2rem" }}>{sourceFiles.map((file, index) => <li key={`${file.name}-${file.size}-${index}`}>{file.name} · {readableBytes(file.size)} <button type="button" disabled={busy} onClick={() => setSourceFiles((items) => items.filter((_, itemIndex) => itemIndex !== index))} style={{ marginLeft: 5, border: 0, background: "transparent", textDecoration: "underline", cursor: "pointer" }}>remove</button></li>)}</ul></div>}
      {sourceDocuments.length > 0 && <div style={{ marginTop: 7, fontSize: ".76rem" }}><strong>Uploaded for this draft:</strong><ul style={{ margin: "4px 0 0", paddingLeft: "1.2rem" }}>{sourceDocuments.map((doc) => <li key={String(doc.id)}>{doc.filename || "Source document"}{doc.filesize ? ` · ${readableBytes(doc.filesize)}` : ""} <button type="button" disabled={busy} onClick={() => removeSourceDocument(doc)} style={{ marginLeft: 5, border: 0, background: "transparent", textDecoration: "underline", cursor: "pointer" }}>delete</button></li>)}</ul></div>}
    </div>

    <div style={{ marginTop: 12, padding: ".75rem", border: "1px solid var(--theme-elevation-150)", borderRadius: 4 }}>
      <strong style={{ display: "block" }}>Add reference by DOI</strong>
      <div style={{ color: "var(--theme-elevation-600)", fontSize: ".75rem", margin: "3px 0 7px" }}>Paste a DOI or doi.org link. Citation fields are fetched from Crossref, a Reference record is created or reused, and it is added to this Insight.</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}><input style={{ ...inputStyle, flex: "1 1 320px" }} value={doi} onChange={(e) => setDoi(e.target.value)} placeholder="https://doi.org/10.xxxx/xxxxx" /><button type="button" style={buttonStyle} disabled={referenceBusy || !doi.trim()} onClick={addReference}>{referenceBusy ? "Looking up…" : "Add reference"}</button></div>
      {addedReferences.length > 0 && <ul style={{ margin: "8px 0 0", paddingLeft: "1.2rem", fontSize: ".78rem" }}>{addedReferences.map((ref) => <li key={String(ref.id)}><strong>{ref.title}</strong>{ref.authors ? ` — ${ref.authors}` : ""}{ref.publisher ? `, ${ref.publisher}` : ""}{ref.year ? ` (${ref.year})` : ""}{ref.doi ? ` · ${ref.doi}` : ""}</li>)}</ul>}
    </div>

    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
      <button type="button" style={buttonStyle} disabled={busy || !topic.trim()} onClick={() => run("generate")}>{busy ? "Working…" : "Generate draft"}</button>
      <button type="button" style={buttonStyle} disabled={busy || (!current.title && !current.bodyText)} onClick={() => run("improve")}>Improve article</button>
      <button type="button" style={buttonStyle} disabled={busy || (!current.title && !current.bodyText)} onClick={() => run("seo")}>Improve SEO</button>
    </div>
    {(busy || progress > 0) && <div style={{ marginTop: 12 }} role="status" aria-live="polite">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: ".76rem", marginBottom: 5 }}><span>{progressLabel || "Working…"}</span><strong>{Math.round(progress)}%</strong></div>
      <div style={{ height: 9, borderRadius: 999, overflow: "hidden", background: "var(--theme-elevation-150)" }}><div style={{ width: `${Math.max(0, Math.min(100, progress))}%`, height: "100%", transition: "width 350ms ease", background: "var(--theme-elevation-800)" }} /></div>
      {busy && progress >= 55 && <div style={{ marginTop: 4, fontSize: ".7rem", color: "var(--theme-elevation-600)" }}>The upload percentage is measured; the model-generation portion is an estimate until the response completes.</div>}
    </div>}
    {error && <p style={{ marginTop: 12, color: "var(--theme-error-500)" }}>{error}</p>}
    {notice && <p style={{ marginTop: 12, padding: ".6rem .7rem", background: "var(--theme-success-100)", borderRadius: 4 }}>{notice}</p>}
    {draft && <DraftResult draft={draft} onApplyFull={applyFullDraft} onApplyTitle={applyTitle} onApplySummary={applySummary} onApplyBody={applyBody} onApplySeo={applySeo} primaryButtonStyle={primaryButtonStyle} buttonStyle={buttonStyle} />}
    {review && <SEOResult review={review} onApply={applySeoReview} primaryButtonStyle={primaryButtonStyle} />}
  </section>;
}

function DraftResult({ draft, onApplyFull, onApplyTitle, onApplySummary, onApplyBody, onApplySeo, primaryButtonStyle, buttonStyle }: { draft: ArticleDraft; onApplyFull: () => void; onApplyTitle: () => void; onApplySummary: () => void; onApplyBody: () => void; onApplySeo: () => void; primaryButtonStyle: React.CSSProperties; buttonStyle: React.CSSProperties; }) {
  const wordCount = useMemo(() => estimateWordCount(draft), [draft]);
  return <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--theme-elevation-150)" }}>
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 10, alignItems: "center" }}><div><strong>Proposed draft</strong><div style={{ fontSize: ".78rem", color: "var(--theme-elevation-600)", marginTop: 2 }}>About {wordCount.toLocaleString()} words · review before applying</div></div><div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}><button type="button" style={primaryButtonStyle} onClick={onApplyFull}>Apply full draft</button><button type="button" style={buttonStyle} onClick={onApplyTitle}>Apply title</button><button type="button" style={buttonStyle} onClick={onApplySummary}>Apply summary</button><button type="button" style={buttonStyle} onClick={onApplyBody}>Apply body</button><button type="button" style={buttonStyle} onClick={onApplySeo}>Apply SEO</button></div></div>
    <details open style={{ marginTop: 12 }}><summary style={{ cursor: "pointer", fontWeight: 600 }}>Article preview</summary><div style={{ paddingTop: 8 }}><h3 style={{ margin: "4px 0" }}>{draft.title}</h3><p>{draft.summary}</p>{draft.keyPoints.length > 0 && <><strong>Key points</strong><ul>{draft.keyPoints.map((x) => <li key={x}>{x}</li>)}</ul></>}{draft.sections.map((section, i) => <div key={`${section.heading}-${i}`}><h4>{section.heading}</h4>{section.paragraphs.map((p) => <p key={p}>{p}</p>)}{(section.bullets?.length ?? 0) > 0 && <ul>{section.bullets?.map((b) => <li key={b}>{b}</li>)}</ul>}</div>)}</div></details>
    <details style={{ marginTop: 10 }}><summary style={{ cursor: "pointer", fontWeight: 600 }}>SEO & social metadata</summary><div style={{ paddingTop: 8 }}><p><strong>Slug:</strong> {draft.slug}<br/><strong>SEO title:</strong> {draft.seoTitle}<br/><strong>Meta:</strong> {draft.metaDescription}<br/><strong>Social title:</strong> {draft.socialTitle}<br/><strong>Social description:</strong> {draft.socialDescription}</p><p><strong>Image concept:</strong> {draft.imageConcept}<br/><strong>Suggested image alt:</strong> {draft.imageAlt}</p></div></details>
    <details style={{ marginTop: 10 }}><summary style={{ cursor: "pointer", fontWeight: 600 }}>References to verify ({draft.referenceRequirements.length})</summary><div style={{ paddingTop: 8 }}>{draft.referenceRequirements.length > 0 ? <ul>{draft.referenceRequirements.map((x) => <li key={x}>{x}</li>)}</ul> : <p>No reference requirements were returned.</p>}</div></details>
    <details style={{ marginTop: 10 }}><summary style={{ cursor: "pointer", fontWeight: 600 }}>Internal-link suggestions ({draft.suggestedInternalLinks.length})</summary><div style={{ paddingTop: 8 }}>{draft.suggestedInternalLinks.length > 0 ? <ul>{draft.suggestedInternalLinks.map((x) => <li key={`${x.href}-${x.anchor}`}><code>{x.anchor}</code> → {x.href} — {x.reason}</li>)}</ul> : <p>No internal-link suggestions were returned.</p>}</div></details>
    <p style={{ fontSize: ".78rem", color: "var(--theme-elevation-600)", marginTop: 12 }}>Applying changes populates the current edit form only. It does not publish the Insight.</p>
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
