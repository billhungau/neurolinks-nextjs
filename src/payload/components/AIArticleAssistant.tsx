"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useAllFormFields, useDocumentInfo, useField } from "@payloadcms/ui";
import {
  ARTICLE_LENGTHS,
  ARTICLE_TONES,
  ARTICLE_TYPES,
  type ArticleDraft,
  type ArticleLength,
  type ArticleTone,
  type SEOReview,
  type SectionRewrite,
} from "@/ai/schemas";
import {
  QUICK_IMPROVE_ACTIONS,
  SECTION_IMPROVE_ACTIONS,
  extractEditableSections,
  replaceEditableSection,
} from "@/ai/editorial-ux";
import {
  AI_SOURCE_ACCEPT,
  MAX_AI_SOURCE_FILES,
  normalizedSourceMimeType,
  nextEstimatedGenerationProgress,
  sourceUploadFailureMessage,
  uploadProgressPercent,
  validateSourceSelection,
} from "@/ai/source-files";
import {
  relationshipIds,
  type RelationshipID,
} from "@/payload/relationship-values";
import styles from "./AIArticleAssistant.module.css";

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
  return { children: text ? [textNode(text)] : [], direction: "ltr", format: "", indent: 0, type: "paragraph", version: 1, textFormat: 0, textStyle: "" };
}
function headingNode(text: string, level: 2 | 3 = 2) {
  return { children: [textNode(text)], direction: "ltr", format: "", indent: 0, tag: level === 3 ? "h3" : "h2", type: "heading", version: 1 };
}
function bulletListNode(items: string[]) {
  return {
    children: items.map((text, index) => ({ children: [textNode(text)], direction: "ltr", format: "", indent: 0, type: "listitem", version: 1, value: index + 1 })),
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
export function draftToLexical(draft: ArticleDraft) {
  const children: unknown[] = [];
  for (const section of draft.sections) {
    if (section.heading?.trim()) children.push(headingNode(section.heading.trim(), section.level === 3 ? 3 : 2));
    for (const paragraph of section.paragraphs) if (paragraph.trim()) children.push(paragraphNode(paragraph.trim()));
    const bullets = (section.bullets || []).map((bullet) => bullet.trim()).filter(Boolean);
    if (bullets.length) children.push(bulletListNode(bullets));
  }
  return { root: { children, direction: "ltr", format: "", indent: 0, type: "root", version: 1 } };
}
function estimateWordCount(draft: ArticleDraft) {
  const text = [draft.title, draft.summary, ...draft.keyPoints, ...draft.sections.flatMap((section) => [section.heading || "", ...section.paragraphs, ...(section.bullets || [])])].join(" ");
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

type SourceDocument = { id: string | number; filename?: string; mimeType?: string; filesize?: number };
type SourceListResponse = { docs?: SourceDocument[] };
type SourceUploadResponse = { doc?: SourceDocument };

const DEFAULT_AUDIENCE = "Adults considering specialist treatment";
const DEFAULT_LOCATION = "Vancouver Island, British Columbia";

export function AIArticleAssistant() {
  const pathname = usePathname();
  const { id: documentId, collectionSlug } = useDocumentInfo();
  const [fields, dispatchFields] = useAllFormFields();
  const {
    value: referenceValue,
    setValue: setReferenceValue,
  } = useField<RelationshipID[]>({ path: "references" });
  const [expanded, setExpanded] = useState(documentId == null);
  const [topic, setTopic] = useState("");
  const [keyword, setKeyword] = useState("");
  const [audience, setAudience] = useState(DEFAULT_AUDIENCE);
  const [goal, setGoal] = useState("");
  const [location, setLocation] = useState(DEFAULT_LOCATION);
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
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [sectionDirection, setSectionDirection] = useState<string>(SECTION_IMPROVE_ACTIONS[0][1]);
  const [sectionCustomDirection, setSectionCustomDirection] = useState("");
  const [sectionResult, setSectionResult] = useState<SectionRewrite | null>(null);
  const [sectionResultId, setSectionResultId] = useState("");
  const [sectionResultFingerprint, setSectionResultFingerprint] = useState("");
  const [sectionGeneratedForPath, setSectionGeneratedForPath] = useState("");

  const sourceSession = fieldValue(fields, "aiSourceSession");
  const currentDocumentKey = `${collectionSlug || "insights"}:${documentId ?? "new"}:${pathname}:${sourceSession || "unassigned"}`;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setExpanded(documentId == null);
      setTopic("");
      setKeyword("");
      setAudience(DEFAULT_AUDIENCE);
      setGoal("");
      setLocation(DEFAULT_LOCATION);
      setArticleType("Treatment guide");
      setArticleLength("Concise");
      setTone("Expert & confident");
      setImprovementDirection("");
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
      setSelectedSectionId("");
      setSectionDirection(SECTION_IMPROVE_ACTIONS[0][1]);
      setSectionCustomDirection("");
      setSectionResult(null);
      setSectionResultId("");
      setSectionResultFingerprint("");
      setSectionGeneratedForPath("");
    }, 0);
    return () => window.clearTimeout(timer);
  }, [pathname, documentId, collectionSlug]);

  useEffect(() => {
    if (!generatedForPath || generatedForPath === currentDocumentKey) return;
    const timer = window.setTimeout(() => {
      setDraft(null);
      setReview(null);
      setGeneratedForPath("");
      setError("");
      setNotice("");
      setProgress(0);
      setProgressLabel("");
    }, 0);
    return () => window.clearTimeout(timer);
  }, [currentDocumentKey, generatedForPath]);

  useEffect(() => {
    if (!sectionGeneratedForPath || sectionGeneratedForPath === currentDocumentKey) return;
    const timer = window.setTimeout(() => {
      setSectionResult(null);
      setSectionResultId("");
      setSectionResultFingerprint("");
      setSectionGeneratedForPath("");
    }, 0);
    return () => window.clearTimeout(timer);
  }, [currentDocumentKey, sectionGeneratedForPath]);

  useEffect(() => {
    let cancelled = false;
    if (!sourceSession) {
      const timer = window.setTimeout(() => { if (!cancelled) setSourceDocuments([]); }, 0);
      return () => { cancelled = true; window.clearTimeout(timer); };
    }
    const query = encodeURIComponent(sourceSession);
    fetch(`/payload-api/ai-source-documents?where[sessionId][equals]=${query}&limit=${MAX_AI_SOURCE_FILES}&sort=createdAt`)
      .then(async (response) => response.ok ? response.json() as Promise<SourceListResponse> : { docs: [] } as SourceListResponse)
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
  const sections = useMemo(() => extractEditableSections(fields.body?.value), [fields.body?.value]);
  const editableSections = sections.filter((section) => section.editable);
  const activeSectionId = editableSections.some((section) => section.id === selectedSectionId) ? selectedSectionId : editableSections[0]?.id || "";
  const activeSection = editableSections.find((section) => section.id === activeSectionId);

  function updateField(path: string, value: unknown, remount = false) {
    dispatchFields({ type: "UPDATE", path, value, ...(remount ? { initialValue: value } : {}) });
  }
  function applied(message: string) {
    setNotice(`${message} Review the populated fields, then save as Draft when ready.`);
    setTimeout(() => setNotice(""), 6500);
  }
  function ensureCurrentDocument() {
    if (generatedForPath && generatedForPath !== currentDocumentKey) {
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
    const currentLabel = current.title.trim() ? `“${current.title}”` : "this Insight";
    if (!window.confirm(`Replace ${currentLabel} with the proposed AI draft “${draft.title}”? This changes the title, slug, summary, body and SEO fields.`)) return;
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
      const mimeType = normalizedSourceMimeType(file.name, file.type);
      if (!mimeType) { reject(new Error(`${file.name} is not a supported source file.`)); return; }
      const normalizedFile = file.type === mimeType ? file : new File([file], file.name, { type: mimeType, lastModified: file.lastModified });
      const form = new FormData();
      form.append("file", normalizedFile);
      form.append("_payload", JSON.stringify({ sessionId }));
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/payload-api/ai-source-documents");
      xhr.withCredentials = true;
      xhr.timeout = 45_000;
      xhr.setRequestHeader("Accept", "application/json");
      xhr.upload.onprogress = (event) => {
        const fraction = event.lengthComputable && event.total > 0 ? event.loaded / event.total : 0;
        setProgress(uploadProgressPercent(index, fraction, total));
        setProgressLabel(`Uploading source ${index + 1} of ${total}: ${file.name}`);
      };
      xhr.onerror = () => reject(new Error(sourceUploadFailureMessage(file.name, 0, xhr.responseText)));
      xhr.ontimeout = () => reject(new Error(`Could not upload ${file.name} (upload timed out after 45 seconds).`));
      xhr.onabort = () => reject(new Error(`Could not upload ${file.name} (upload was cancelled).`));
      xhr.onload = () => {
        let json: SourceUploadResponse = {};
        try { json = JSON.parse(xhr.responseText) as SourceUploadResponse; } catch { /* diagnostics use raw response below */ }
        if (xhr.status < 200 || xhr.status >= 300 || !json.doc) {
          reject(new Error(sourceUploadFailureMessage(file.name, xhr.status, xhr.responseText)));
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
    if (!response.ok) { setError(`Could not remove ${doc.filename || "source file"}.`); return; }
    setSourceDocuments((items) => items.filter((item) => String(item.id) !== String(doc.id)));
  }

  async function run(action: "generate" | "improve" | "seo", directionOverride?: string) {
    const effectiveDirection = directionOverride ?? improvementDirection;
    if (directionOverride !== undefined) setImprovementDirection(directionOverride);
    setBusy(true); setError(""); setNotice(""); setDraft(null); setReview(null); setProgress(3); setProgressLabel("Preparing request…");
    let ticker: ReturnType<typeof setInterval> | undefined;
    try {
      if (sourceDocuments.length + sourceFiles.length > MAX_AI_SOURCE_FILES) throw new Error(`Use up to ${MAX_AI_SOURCE_FILES} source files for one article.`);
      const existingBytes = sourceDocuments.reduce((sum, doc) => sum + (doc.filesize || 0), 0);
      const selectionError = validateSourceSelection(existingBytes, sourceFiles);
      if (selectionError) throw new Error(selectionError);
      const activeSession = ensureSourceSession();
      let uploaded = [...sourceDocuments];
      if (sourceFiles.length) {
        for (let index = 0; index < sourceFiles.length; index += 1) {
          const doc = await uploadSourceFile(sourceFiles[index], activeSession, index, sourceFiles.length);
          uploaded = [...uploaded, doc];
          setSourceDocuments(uploaded);
        }
        setSourceFiles([]);
      }
      setProgress(35); setProgressLabel("Preparing article request…");
      await new Promise((resolve) => setTimeout(resolve, 120));
      setProgress(40); setProgressLabel(uploaded.length ? `Reading ${uploaded.length} source file${uploaded.length === 1 ? "" : "s"} and generating article…` : "Generating article…");
      ticker = setInterval(() => setProgress(nextEstimatedGenerationProgress), 900);
      const requestBody = { action, topic, keyword, audience, goal, location, articleType, articleLength, tone, improvementDirection: effectiveDirection, current, sourceSession: activeSession || undefined };
      const response = await fetch("/api/admin/ai-article-assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(requestBody) });
      setProgress(95); setProgressLabel("Validating and formatting response…");
      const json = await response.json() as { error?: string; result?: ArticleDraft | SEOReview };
      if (!response.ok || !json.result) throw new Error(json.error || "AI request failed.");
      if (ticker) clearInterval(ticker);
      setProgress(100); setProgressLabel("Complete");
      setGeneratedForPath(`${collectionSlug || "insights"}:${documentId ?? "new"}:${pathname}:${activeSession}`);
      if (action === "seo") setReview(json.result as SEOReview); else setDraft(json.result as ArticleDraft);
    } catch (caught) {
      if (ticker) clearInterval(ticker);
      setProgressLabel("Stopped");
      setError(caught instanceof Error ? caught.message : "AI request failed.");
    } finally { setBusy(false); }
  }

  async function runSection() {
    if (!activeSection) return;
    const direction = sectionCustomDirection.trim() || sectionDirection;
    setBusy(true); setError(""); setNotice(""); setSectionResult(null); setProgress(40); setProgressLabel(`Improving “${activeSection.heading}”…`);
    let ticker: ReturnType<typeof setInterval> | undefined;
    try {
      ticker = setInterval(() => setProgress(nextEstimatedGenerationProgress), 900);
      const response = await fetch("/api/admin/ai-article-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "section",
          tone,
          improvementDirection: direction,
          current: { title: current.title, summary: current.summary },
          section: { heading: activeSection.heading, level: activeSection.level, text: activeSection.text },
        }),
      });
      setProgress(95); setProgressLabel("Validating section suggestion…");
      const json = await response.json() as { error?: string; result?: SectionRewrite };
      if (!response.ok || !json.result) throw new Error(json.error || "Section improvement failed.");
      if (ticker) clearInterval(ticker);
      setSectionResult(json.result);
      setSectionResultId(activeSection.id);
      setSectionResultFingerprint(activeSection.fingerprint);
      setSectionGeneratedForPath(currentDocumentKey);
      setProgress(100); setProgressLabel("Complete");
    } catch (caught) {
      if (ticker) clearInterval(ticker);
      setProgressLabel("Stopped");
      setError(caught instanceof Error ? caught.message : "Section improvement failed.");
    } finally { setBusy(false); }
  }

  function applySectionResult() {
    if (!sectionResult) return;
    if (sectionGeneratedForPath !== currentDocumentKey) {
      setError("This section suggestion belongs to a different Insight. Generate it again on the current article before applying.");
      return;
    }
    const outcome = replaceEditableSection(fields.body?.value, sectionResultId, sectionResult, sectionResultFingerprint);
    if (outcome.error || !outcome.value) { setError(outcome.error || "The section could not be applied safely."); return; }
    updateField("body", outcome.value, true);
    setSectionResult(null);
    setSectionResultId("");
    setSectionResultFingerprint("");
    setSectionGeneratedForPath("");
    applied("Section replacement applied. The rest of the article body was left unchanged.");
  }

  async function addReference() {
    if (!doi.trim()) return;
    setReferenceBusy(true); setError("");
    try {
      const response = await fetch("/api/admin/reference-by-doi", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ doi }) });
      const json = await response.json() as { error?: string; reference?: ReferenceRecord; created?: boolean };
      if (!response.ok || !json.reference) throw new Error(json.error || "Reference lookup failed.");
      const existingReferences = relationshipIds(referenceValue);
      if (!existingReferences.some((id) => String(id) === String(json.reference!.id))) {
        setReferenceValue([
          ...existingReferences,
          json.reference.id,
        ]);
      }
      setAddedReferences((items) => items.some((item) => String(item.id) === String(json.reference!.id)) ? items : [...items, json.reference!]);
      setDoi("");
      setNotice(`${json.created ? "Reference created" : "Existing reference found"} and attached to this Insight. Publish the Insight to make the reference public.`);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Reference lookup failed."); }
    finally { setReferenceBusy(false); }
  }

  return (
    <section className={styles.shell}>
      <div className={styles.header}>
        <div className={styles.headerCopy}>
          <strong className={styles.title}>AI Writing Assistant</strong>
          <div className={styles.subtitle}>Create or refine patient-facing content. AI never publishes automatically.</div>
        </div>
        <button type="button" className={styles.toggle} aria-expanded={expanded} onClick={() => setExpanded((value) => !value)}>{expanded ? "Collapse" : "Open assistant"}</button>
      </div>
      {expanded ? (
        <div className={styles.body}>
          <div className={styles.warning}>Public editorial material only. Do not upload or enter patient-identifying or confidential clinical information. Source files are temporary and are deleted automatically after publishing or expiry.</div>

          <div className={styles.step}>
            <div className={styles.stepHeader}><span className={styles.stepNumber}>Step 1</span><span className={styles.stepTitle}>Brief</span></div>
            <div className={styles.grid}>
              <label className={styles.label}>Topic *<input className={styles.input} value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="e.g. TMS for OCD" /></label>
              <label className={styles.label}>Primary search query<input className={styles.input} value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="e.g. TMS for OCD BC" /></label>
              <label className={styles.label}>Audience<input className={styles.input} value={audience} onChange={(event) => setAudience(event.target.value)} /></label>
              <label className={styles.label}>Location focus<input className={styles.input} value={location} onChange={(event) => setLocation(event.target.value)} /></label>
              <label className={styles.label}>Article type<select className={styles.select} value={articleType} onChange={(event) => setArticleType(event.target.value as typeof articleType)}>{ARTICLE_TYPES.map((type) => <option key={type}>{type}</option>)}</select></label>
              <label className={styles.label}>Length<select className={styles.select} value={articleLength} onChange={(event) => setArticleLength(event.target.value as ArticleLength)}>{ARTICLE_LENGTHS.map((length) => <option key={length}>{length}</option>)}</select><span className={styles.hint}>{lengthHint(articleLength)}</span></label>
              <label className={styles.label}>Tone<select className={styles.select} value={tone} onChange={(event) => setTone(event.target.value as ArticleTone)}>{ARTICLE_TONES.map((value) => <option key={value}>{value}</option>)}</select></label>
            </div>
            <label className={`${styles.label} ${styles.fieldGap}`}>Article goal / detailed instructions<textarea className={styles.textarea} value={goal} onChange={(event) => setGoal(event.target.value)} placeholder="Describe what the reader should understand, what to emphasize, what to leave out, and any specific clinical framing." /></label>
          </div>

          <div className={styles.step}>
            <div className={styles.stepHeader}><span className={styles.stepNumber}>Step 2</span><span className={styles.stepTitle}>Evidence</span></div>
            <div className={styles.evidenceGrid}>
              <div className={styles.evidenceCard}>
                <strong className={styles.evidenceTitle}>Source files</strong>
                <input type="file" multiple accept={AI_SOURCE_ACCEPT} disabled={busy} onChange={(event) => {
                  const incoming = Array.from(event.target.files || []);
                  setSourceFiles((currentFiles) => [...currentFiles, ...incoming].slice(0, Math.max(0, MAX_AI_SOURCE_FILES - sourceDocuments.length)));
                  event.currentTarget.value = "";
                }} />
                <span className={styles.hint}>Up to {MAX_AI_SOURCE_FILES} PDF/TXT/MD/DOC/DOCX files. Files upload sequentially when AI runs. Limit: 4 MB each and 20 MB combined.</span>
                {sourceFiles.length > 0 ? <div><strong className={styles.hint}>Waiting to upload</strong><ul className={styles.fileList}>{sourceFiles.map((file, index) => <li key={`${file.name}-${file.size}-${index}`}>{file.name} · {readableBytes(file.size)} <button type="button" disabled={busy} onClick={() => setSourceFiles((items) => items.filter((_, itemIndex) => itemIndex !== index))} className={styles.linkButton}>remove</button></li>)}</ul></div> : null}
                {sourceDocuments.length > 0 ? <div><strong className={styles.hint}>Uploaded for this draft</strong><ul className={styles.fileList}>{sourceDocuments.map((doc) => <li key={String(doc.id)}>{doc.filename || "Source document"}{doc.filesize ? ` · ${readableBytes(doc.filesize)}` : ""} <button type="button" disabled={busy} onClick={() => removeSourceDocument(doc)} className={styles.linkButton}>delete</button></li>)}</ul></div> : null}
              </div>
              <div className={styles.evidenceCard}>
                <strong className={styles.evidenceTitle}>Add reference by DOI</strong>
                <span className={styles.hint}>Citation fields come from Crossref. An existing DOI is reused; otherwise a Reference record is created and linked only after you explicitly add it.</span>
                <div className={styles.actions} style={{ marginTop: ".55rem" }}><input className={styles.input} style={{ flex: "1 1 300px", marginTop: 0 }} value={doi} onChange={(event) => setDoi(event.target.value)} placeholder="https://doi.org/10.xxxx/xxxxx" /><button type="button" className={styles.button} disabled={referenceBusy || !doi.trim()} onClick={addReference}>{referenceBusy ? "Looking up…" : "Add reference"}</button></div>
                {addedReferences.length > 0 ? <ul className={styles.fileList}>{addedReferences.map((reference) => <li key={String(reference.id)}><strong>{reference.title}</strong>{reference.authors ? ` — ${reference.authors}` : ""}{reference.publisher ? `, ${reference.publisher}` : ""}{reference.year ? ` (${reference.year})` : ""}{reference.doi ? ` · ${reference.doi}` : ""}</li>)}</ul> : null}
              </div>
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepHeader}><span className={styles.stepNumber}>Step 3</span><span className={styles.stepTitle}>Generate / Improve</span></div>
            <label className={styles.label}>Direction for “Improve article”<textarea className={styles.textarea} value={improvementDirection} onChange={(event) => setImprovementDirection(event.target.value)} placeholder="e.g. Make the opening more decisive, focus on OCD evidence, shorten contraindication discussion, and remove repetitive caveats." /></label>
            <div className={`${styles.actions} ${styles.fieldGap}`}>
              <button type="button" className={`${styles.button} ${styles.primary}`} disabled={busy || !topic.trim()} onClick={() => run("generate")}>{busy ? "Working…" : "Generate article draft"}</button>
              <button type="button" className={styles.button} disabled={busy || (!current.title && !current.bodyText)} onClick={() => run("improve")}>Improve article</button>
              <button type="button" className={styles.button} disabled={busy || (!current.title && !current.bodyText)} onClick={() => run("seo")}>Improve SEO</button>
            </div>
            <div className={styles.quickWrap}>
              <p className={styles.quickLabel}>Quick improve</p>
              <div className={styles.quickActions}>{QUICK_IMPROVE_ACTIONS.map(([label, instruction]) => <button key={label} type="button" className={styles.quickButton} disabled={busy || (!current.title && !current.bodyText)} onClick={() => run("improve", instruction)}>{label}</button>)}</div>
            </div>

            <div className={styles.sectionEdit}>
              <strong className={styles.evidenceTitle}>Improve one article section</strong>
              <p className={styles.sectionNote}>Safer section mode operates only on simple H2/H3 sections made of plain paragraphs or lists. Sections containing links, rich formatting, callouts, media, or structured citation nodes are deliberately excluded instead of being flattened.</p>
              {editableSections.length ? (
                <>
                  <div className={`${styles.sectionGrid} ${styles.fieldGap}`}>
                    <label className={styles.label}>Section<select className={styles.select} value={activeSectionId} onChange={(event) => { setSelectedSectionId(event.target.value); setSectionResult(null); }}>
                      {editableSections.map((section) => <option value={section.id} key={section.id}>{section.level === 3 ? "H3" : "H2"} · {section.heading}</option>)}
                    </select></label>
                    <label className={styles.label}>Action<select className={styles.select} value={sectionDirection} onChange={(event) => setSectionDirection(event.target.value)}>{SECTION_IMPROVE_ACTIONS.map(([label, instruction]) => <option key={label} value={instruction}>{label}</option>)}</select></label>
                  </div>
                  <label className={`${styles.label} ${styles.fieldGap}`}>Custom section instruction (optional)<textarea className={styles.textarea} value={sectionCustomDirection} onChange={(event) => setSectionCustomDirection(event.target.value)} placeholder="Overrides the selected section action. Keep this specific to the selected section." /></label>
                  <div className={`${styles.actions} ${styles.fieldGap}`}><button type="button" className={styles.button} disabled={busy || !current.title || !activeSection} onClick={runSection}>Generate section suggestion</button></div>
                  {activeSection ? <div className={styles.sectionPreview}><strong>Current section · {activeSection.heading}</strong><p>{activeSection.text}</p></div> : null}
                </>
              ) : <p className={styles.sectionNote}>No safely editable plain-text H2/H3 section is available. Edit structured sections manually in the article body.</p>}
            </div>
          </div>

          {(busy || progress > 0) ? <div className={styles.progress} role="status" aria-live="polite"><div className={styles.progressMeta}><span>{progressLabel || "Working…"}</span><strong>{Math.round(progress)}%</strong></div><div className={styles.progressTrack}><div className={styles.progressFill} style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} /></div>{busy && progress >= 40 ? <div className={styles.progressHint}>Upload progress is measured. Model-generation progress is estimated until the response completes.</div> : null}</div> : null}
          {error ? <p className={styles.error}>{error}</p> : null}
          {notice ? <p className={styles.notice}>{notice}</p> : null}
          {draft ? <DraftResult draft={draft} onApplyFull={applyFullDraft} onApplyTitle={applyTitle} onApplySummary={applySummary} onApplyBody={applyBody} onApplySeo={applySeo} /> : null}
          {review ? <SEOResult review={review} onApply={applySeoReview} /> : null}
          {sectionResult ? <SectionResult rewrite={sectionResult} onApply={applySectionResult} /> : null}
        </div>
      ) : null}
    </section>
  );
}

function DraftResult({ draft, onApplyFull, onApplyTitle, onApplySummary, onApplyBody, onApplySeo }: { draft: ArticleDraft; onApplyFull: () => void; onApplyTitle: () => void; onApplySummary: () => void; onApplyBody: () => void; onApplySeo: () => void }) {
  const wordCount = useMemo(() => estimateWordCount(draft), [draft]);
  return <div className={styles.result}>
    <div className={styles.resultHeader}><div><strong>Proposed draft</strong><div className={styles.resultMeta}>About {wordCount.toLocaleString()} words · review before applying</div></div><div className={styles.resultActions}><button type="button" className={`${styles.button} ${styles.primary}`} onClick={onApplyFull}>Apply full draft</button><button type="button" className={styles.button} onClick={onApplyTitle}>Apply title</button><button type="button" className={styles.button} onClick={onApplySummary}>Apply summary</button><button type="button" className={styles.button} onClick={onApplyBody}>Apply body</button><button type="button" className={styles.button} onClick={onApplySeo}>Apply SEO</button></div></div>
    <details open className={styles.details}><summary>Article preview</summary><div className={styles.preview}><h3>{draft.title}</h3><p>{draft.summary}</p>{draft.keyPoints.length ? <><strong>Key points</strong><ul>{draft.keyPoints.map((point) => <li key={point}>{point}</li>)}</ul></> : null}{draft.sections.map((section, index) => <div key={`${section.heading}-${index}`}><h4>{section.heading}</h4>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{section.bullets?.length ? <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul> : null}</div>)}</div></details>
    <details className={styles.details}><summary>SEO & social metadata</summary><div className={styles.preview}><p><strong>Slug:</strong> {draft.slug}<br/><strong>SEO title:</strong> {draft.seoTitle}<br/><strong>Meta:</strong> {draft.metaDescription}<br/><strong>Social title:</strong> {draft.socialTitle}<br/><strong>Social description:</strong> {draft.socialDescription}</p><p><strong>Image concept:</strong> {draft.imageConcept}<br/><strong>Suggested image alt:</strong> {draft.imageAlt}</p></div></details>
    <details className={styles.details}><summary>References to verify ({draft.referenceRequirements.length})</summary><div className={styles.preview}>{draft.referenceRequirements.length ? <ul>{draft.referenceRequirements.map((item) => <li key={item}>{item}</li>)}</ul> : <p>No reference requirements were returned.</p>}</div></details>
    <details className={styles.details}><summary>Internal-link suggestions ({draft.suggestedInternalLinks.length})</summary><div className={styles.preview}>{draft.suggestedInternalLinks.length ? <ul>{draft.suggestedInternalLinks.map((item) => <li key={`${item.href}-${item.anchor}`}><code>{item.anchor}</code> → {item.href} — {item.reason}</li>)}</ul> : <p>No internal-link suggestions were returned.</p>}</div></details>
    <p className={styles.resultMeta}>Applying changes populates the current edit form only. It does not save or publish the Insight.</p>
  </div>;
}

function SEOResult({ review, onApply }: { review: SEOReview; onApply: () => void }) {
  return <div className={styles.result}>
    <div className={styles.resultHeader}><strong>SEO & Content Review — {review.score}/100 · {review.readiness}</strong><button type="button" className={`${styles.button} ${styles.primary}`} onClick={onApply}>Apply SEO suggestions</button></div>
    <details open className={styles.details}><summary>Review checks</summary><ul className={styles.preview}>{review.checks.map((check) => <li key={check.label}><strong>{check.label}:</strong> {check.status} — {check.note}</li>)}</ul></details>
    <details className={styles.details}><summary>Recommendations</summary><ul className={styles.preview}>{review.recommendations.map((item) => <li key={item}>{item}</li>)}</ul></details>
    <details className={styles.details}><summary>Suggested metadata</summary><p className={styles.preview}><strong>Suggested SEO title:</strong> {review.suggestedSeoTitle}<br/><strong>Suggested meta description:</strong> {review.suggestedMetaDescription}<br/><strong>Suggested slug:</strong> {review.suggestedSlug}</p></details>
    {review.referenceRequirements.length ? <details className={styles.details}><summary>Claims needing verified references ({review.referenceRequirements.length})</summary><ul className={styles.preview}>{review.referenceRequirements.map((item) => <li key={item}>{item}</li>)}</ul></details> : null}
  </div>;
}

function SectionResult({ rewrite, onApply }: { rewrite: SectionRewrite; onApply: () => void }) {
  return <div className={styles.result}>
    <div className={styles.resultHeader}><div><strong>Proposed section replacement</strong><div className={styles.resultMeta}>Only the selected H2/H3 section will change.</div></div><button type="button" className={`${styles.button} ${styles.primary}`} onClick={onApply}>Apply section</button></div>
    <div className={styles.preview}><h3>{rewrite.heading}</h3>{rewrite.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{rewrite.bullets.length ? <ul>{rewrite.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul> : null}</div>
    <p className={styles.resultMeta}>Citation markers are checked again before apply. If the section changed after generation, the replacement is refused.</p>
  </div>;
}
