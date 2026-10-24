import { redirect } from "next/navigation";
import { getClinicianSession } from "@/lib/clinical/auth";
import { clinicalSupabaseRequest } from "@/lib/clinical/supabase";
import { getVcitaClient } from "@/lib/clinical/vcita";
import { patientIdentityRows } from "@/lib/clinical/patient-identity-index";
import { BDI2_ITEMS, getBdi2OptionById } from "@/lib/clinical/questionnaires/bdii-definition";
import type { ImportedQuestionnaireSchema } from "@/lib/clinical/questionnaires/jotform-import";
import type { NativeField, NativeQuestionnaireSchema } from "@/lib/clinical/questionnaires/native-builder";
import { isSignatureStrokeData, signatureSvgPolylines, type SignatureStrokeData } from "@/lib/clinical/signature-strokes";
import { BackToSubmissions } from "./BackToSubmissions";

export const dynamic = "force-dynamic";

const LABELS: Record<string, string> = { bdii: "BDI-II", bai: "BAI", ybocs: "Y-BOCS", pss: "PSS", "tms-consent": "TMS Consent Form" };

type QuestionnaireMeta = { schema?: ImportedQuestionnaireSchema; native_schema?: NativeQuestionnaireSchema };
type QuestionnaireRelation = { code: string; name: string; max_score: number | null; metadata?: QuestionnaireMeta | null } | Array<{ code: string; name: string; max_score: number | null; metadata?: QuestionnaireMeta | null }> | null;
type AssessmentRow = {
  id: string;
  subject_key: string;
  submitted_at: string;
  total_score: number;
  severity: string | null;
  answers: Record<string, unknown>;
  questionnaires: QuestionnaireRelation;
};
type Item = { key: string; label: string; answer: string; score: number | null; signature?: SignatureStrokeData | null; legacySignature?: string | null };

function relation(value: QuestionnaireRelation) { return Array.isArray(value) ? value[0] ?? null : value; }
function numericPrefix(value: string) { const match = value.trim().match(/^([0-9]+)(?:[.\s]|$)/); return match ? Number(match[1]) : null; }
function formatSubmittedAt(value: string) {
  return new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/Vancouver" }).format(new Date(value));
}
function plainRichText(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h[1-6]|li)>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function bdiItems(answers: Record<string, unknown>): Item[] {
  return BDI2_ITEMS.map((item) => {
    const raw = answers[item.key] as number | { optionId?: string; score?: number; legacyText?: string } | undefined;
    const score = typeof raw === "number" ? raw : typeof raw?.score === "number" ? raw.score : null;
    const exact = typeof raw === "object" && raw?.optionId ? getBdi2OptionById(item.key, raw.optionId) : null;
    const option = exact?.option ?? (score === null ? null : item.options.find((candidate) => candidate.value === score) ?? null);
    const answer = typeof raw === "object" && raw?.legacyText ? raw.legacyText : score === null ? "—" : `${score}. ${option?.label ?? "Recorded response"}`;
    return { key: item.key, label: item.title, answer, score };
  });
}

function importedItems(schema: ImportedQuestionnaireSchema, answers: Record<string, unknown>, code: string): Item[] {
  const items: Item[] = [];
  for (const field of schema.fields) {
    if (field.kind === "display" || field.kind === "pagebreak") continue;
    if (field.kind === "matrix_radio") {
      field.rows.forEach((row, rowIndex) => {
        const value = String(answers[`${field.qid}:${rowIndex}`] ?? "");
        const columnIndex = field.columns.indexOf(value);
        items.push({ key: `${field.qid}:${rowIndex}`, label: row, answer: value || "—", score: value ? numericPrefix(value) ?? (columnIndex >= 0 ? columnIndex : null) : null });
      });
      continue;
    }
    const raw = answers[field.qid];
    const answer = Array.isArray(raw) ? raw.join(", ") : String(raw ?? "");
    let score: number | null = null;
    if (field.kind === "radio" && answer) {
      const optionIndex = field.options.indexOf(answer);
      score = code === "ybocs" ? (optionIndex >= 0 ? optionIndex : null) : numericPrefix(answer);
    }
    items.push({ key: field.qid, label: field.text, answer: answer || "—", score });
  }
  return items;
}

function nativeItems(schema: NativeQuestionnaireSchema, answers: Record<string, unknown>): Item[] {
  const items: Item[] = [];
  for (const field of schema.fields) {
    if (field.kind === "paragraph" || field.kind === "pagebreak") continue;
    if (field.kind === "single") {
      const selected = String(answers[field.id] ?? "");
      const option = field.options.find((candidate) => candidate.id === selected);
      items.push({ key: field.id, label: field.label, answer: option?.label ?? (selected || "—"), score: option?.score ?? null });
      continue;
    }
    if (field.kind === "multiple") {
      const raw = Array.isArray(answers[field.id]) ? (answers[field.id] as unknown[]).map(String) : [];
      const selected = raw.map((id) => field.options.find((candidate) => candidate.id === id)).filter(Boolean);
      items.push({ key: field.id, label: field.label, answer: selected.map((option) => option!.label).join(", ") || "—", score: selected.reduce((sum, option) => sum + (option?.score ?? 0), 0) });
      continue;
    }
    if (field.kind === "matrix") {
      field.rows.forEach((row) => {
        const selectedId = String(answers[`${field.id}:${row.id}`] ?? "");
        const option = field.columns.find((candidate) => candidate.id === selectedId);
        items.push({ key: `${field.id}:${row.id}`, label: row.label, answer: option?.label ?? (selectedId || "—"), score: option?.score ?? null });
      });
      continue;
    }
    if (field.id === "patient_signature") {
      const value = answers[field.id];
      const signature = isSignatureStrokeData(value) ? value : null;
      const legacySignature = typeof value === "string" && value.startsWith("data:image/png;base64,") ? value : null;
      items.push({ key: field.id, label: field.label, answer: signature || legacySignature ? "Handwritten signature" : "—", score: null, signature, legacySignature });
      continue;
    }
    const answer = String(answers[field.id] ?? "").trim();
    items.push({ key: field.id, label: field.label, answer: answer || "—", score: null });
  }
  return items;
}

function SignatureView({ signature }: { signature: SignatureStrokeData }) {
  const lines = signatureSvgPolylines(signature, 800, 180);
  return (
    <div style={{ marginTop: 8, border: "1px solid #d7e0ea", borderRadius: 10, background: "#fff", padding: "6px 8px", maxWidth: 620 }}>
      <svg viewBox="0 0 800 180" role="img" aria-label="Patient handwritten signature" style={{ display: "block", width: "100%", height: "auto", maxHeight: 160 }}>
        {lines.map((points, index) => <polyline key={index} points={points} fill="none" stroke="#0f172a" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />)}
      </svg>
    </div>
  );
}

function consentAnswer(field: Exclude<NativeField, { kind: "paragraph" | "pagebreak" }>, answers: Record<string, unknown>) {
  if (field.kind === "single") {
    const selected = String(answers[field.id] ?? "");
    return field.options.find((option) => option.id === selected)?.label ?? selected;
  }
  if (field.kind === "multiple") {
    const selected = Array.isArray(answers[field.id]) ? (answers[field.id] as unknown[]).map(String) : [];
    return selected.map((id) => field.options.find((option) => option.id === id)?.label ?? id).join(", ");
  }
  if (field.kind === "matrix") {
    return field.rows.map((row) => {
      const selected = String(answers[`${field.id}:${row.id}`] ?? "");
      return `${row.label}: ${field.columns.find((option) => option.id === selected)?.label ?? (selected || "—")}`;
    }).join("\n");
  }
  return String(answers[field.id] ?? "").trim();
}

function ConsentFormView({ schema, answers }: { schema: NativeQuestionnaireSchema; answers: Record<string, unknown> }) {
  return (
    <section style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, boxShadow: "0 8px 26px rgba(15,23,42,.05)", overflow: "hidden" }}>
      <div style={{ padding: "16px 18px", borderBottom: "1px solid #e2e8f0" }}><h2 style={{ margin: 0, fontSize: 19 }}>Signed consent form</h2></div>
      <div style={{ padding: "22px 22px 26px" }}>
        {schema.fields.map((field) => {
          if (field.kind === "pagebreak") return <hr key={field.id} style={{ border: 0, borderTop: "1px solid #e2e8f0", margin: "24px 0" }} />;
          if (field.kind === "paragraph") {
            const content = field.richText?.trim() ? plainRichText(field.richText) : field.text;
            return <div key={field.id} style={{ whiteSpace: "pre-wrap", color: "#334155", lineHeight: 1.65, margin: "0 0 18px" }}>{content}</div>;
          }
          if (field.id === "patient_signature") {
            const value = answers[field.id];
            return (
              <div key={field.id} style={{ margin: "18px 0 20px" }}>
                <div style={{ fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>{field.label}</div>
                {isSignatureStrokeData(value) ? <SignatureView signature={value} /> : typeof value === "string" && value.startsWith("data:image/png;base64,") ? <div style={{ border: "1px solid #d7e0ea", borderRadius: 10, padding: 8, maxWidth: 620 }}><img src={value} alt="Patient handwritten signature" style={{ display: "block", maxWidth: "100%", maxHeight: 160 }} /></div> : <div style={{ color: "#64748b" }}>Signature unavailable</div>}
              </div>
            );
          }
          const answer = consentAnswer(field, answers) || "—";
          return (
            <div key={field.id} style={{ display: "grid", gridTemplateColumns: field.width === "half" ? "minmax(0,1fr)" : "minmax(0,1fr)", gap: 5, padding: "12px 0", borderBottom: "1px solid #eef2f7" }}>
              <div style={{ fontWeight: 800, color: "#0f172a" }}>{field.label}</div>
              <div style={{ whiteSpace: "pre-wrap", color: "#475569", lineHeight: 1.5 }}>{answer}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default async function SubmissionDetailPage({ params }: { params: Promise<{ code: string; id: string }> }) {
  const session = await getClinicianSession();
  if (!session) redirect("/form/login/");

  const { code: rawCode, id } = await params;
  const code = rawCode.toLowerCase();
  const rows = await clinicalSupabaseRequest<AssessmentRow[]>(
    `assessment_results?select=id,subject_key,submitted_at,total_score,severity,answers,questionnaires(code,name,max_score,metadata)&id=eq.${encodeURIComponent(id)}&limit=1`,
    { method: "GET" },
  );
  const assessment = rows[0];
  const questionnaire = assessment ? relation(assessment.questionnaires) : null;
  if (!assessment || !questionnaire || questionnaire.code !== code) redirect(`/form/dashboard/forms/submissions/${encodeURIComponent(code)}/`);

  let client = null;
  try {
    const identityRows = await patientIdentityRows([assessment.subject_key]);
    const vcitaId = identityRows[0]?.vcita_client_id;
    if (vcitaId) client = await getVcitaClient(vcitaId);
  } catch {}
  const patientName = client ? [client.firstName, client.lastName].filter(Boolean).join(" ") || "Unnamed vcita client" : "Patient not matched in vcita";
  const isConsent = code === "tms-consent";

  let items: Item[] = [];
  if (!isConsent) {
    if (code === "bdii") items = bdiItems(assessment.answers);
    else if (questionnaire.metadata?.native_schema) items = nativeItems(questionnaire.metadata.native_schema, assessment.answers);
    else if (questionnaire.metadata?.schema) items = importedItems(questionnaire.metadata.schema, assessment.answers, code);
  }

  const submissionsHref = `/form/dashboard/forms/submissions/${encodeURIComponent(code)}/`;
  const pdfHref = `/form/api/results/${encodeURIComponent(assessment.id)}/pdf/`;

  return (
    <main style={{ minHeight: "100vh", padding: "28px 24px", background: "#f8fafc" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <BackToSubmissions fallbackHref={submissionsHref} />
        <header style={{ margin: "16px 0 20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
          <div>
            <p style={{ margin: "0 0 5px", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".08em", color: "#64748b" }}>NeuroLinks Admin</p>
            <h1 style={{ margin: 0, fontSize: 30 }}>{LABELS[code] ?? questionnaire.name} submission</h1>
            <p style={{ margin: "8px 0 0", color: "#64748b" }}>{patientName} · {formatSubmittedAt(assessment.submitted_at)}</p>
          </div>
          <a href={pdfHref} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 14px", borderRadius: 9, background: "#111827", color: "#fff", textDecoration: "none", fontWeight: 800, fontSize: 14 }}>View / Download PDF</a>
        </header>

        {isConsent ? (
          <section style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 12, marginBottom: 18 }}>
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 15 }}><div style={{ color: "#64748b", fontSize: 12 }}>Patient</div><strong style={{ fontSize: 16 }}>{patientName}</strong>{client?.email ? <div style={{ marginTop: 3, color: "#64748b", fontSize: 13 }}>{client.email}</div> : null}</div>
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 15 }}><div style={{ color: "#64748b", fontSize: 12 }}>Submitted</div><strong style={{ fontSize: 16 }}>{formatSubmittedAt(assessment.submitted_at)}</strong></div>
          </section>
        ) : (
          <section style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 12, marginBottom: 18 }}>
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 15 }}><div style={{ color: "#64748b", fontSize: 12 }}>Total score</div><strong style={{ fontSize: 26 }}>{assessment.total_score}</strong></div>
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 15 }}><div style={{ color: "#64748b", fontSize: 12 }}>Severity</div><strong style={{ fontSize: 18 }}>{assessment.severity || "—"}</strong></div>
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 15 }}><div style={{ color: "#64748b", fontSize: 12 }}>Patient</div><strong style={{ fontSize: 16 }}>{patientName}</strong>{client?.email ? <div style={{ marginTop: 3, color: "#64748b", fontSize: 13 }}>{client.email}</div> : null}</div>
          </section>
        )}

        {isConsent && questionnaire.metadata?.native_schema ? (
          <ConsentFormView schema={questionnaire.metadata.native_schema} answers={assessment.answers} />
        ) : (
          <section style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, boxShadow: "0 8px 26px rgba(15,23,42,.05)", overflow: "hidden" }}>
            <div style={{ padding: "16px 18px", borderBottom: "1px solid #e2e8f0" }}><h2 style={{ margin: 0, fontSize: 19 }}>Item responses and scores</h2></div>
            {items.length === 0 ? <div style={{ padding: 22, color: "#64748b" }}>Item-level questionnaire definition is unavailable for this submission.</div> : items.map((item, index) => (
              <div key={item.key} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 86px", gap: 16, padding: "14px 18px", borderTop: index ? "1px solid #eef2f7" : undefined, alignItems: "start" }}>
                <div>
                  <div style={{ fontWeight: 750, color: "#0f172a" }}>{item.label}</div>
                  {item.signature ? <SignatureView signature={item.signature} /> : item.legacySignature ? <div style={{ marginTop: 8, border: "1px solid #d7e0ea", borderRadius: 10, background: "#fff", padding: 8, maxWidth: 620 }}><img src={item.legacySignature} alt="Patient handwritten signature" style={{ display: "block", maxWidth: "100%", maxHeight: 160 }} /></div> : <div style={{ marginTop: 5, color: "#475569", lineHeight: 1.45 }}>{item.answer}</div>}
                </div>
                <div style={{ textAlign: "center", borderRadius: 9, padding: "8px 6px", background: item.score === null ? "#f8fafc" : "#eff6ff", color: item.score === null ? "#94a3b8" : "#1d4ed8", fontWeight: 800 }}>{item.score === null ? "—" : item.score}<div style={{ marginTop: 2, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em" }}>Score</div></div>
              </div>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
