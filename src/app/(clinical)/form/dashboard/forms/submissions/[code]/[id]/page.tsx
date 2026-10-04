import Link from "next/link";
import { redirect } from "next/navigation";
import { getClinicianSession } from "@/lib/clinical/auth";
import { clinicalSupabaseRequest } from "@/lib/clinical/supabase";
import { listAllVcitaClients } from "@/lib/clinical/vcita";
import { subjectKeyFromVcitaUuid } from "@/lib/clinical/pseudonym";
import { BDI2_ITEMS, getBdi2OptionById } from "@/lib/clinical/questionnaires/bdii-definition";
import type { ImportedField, ImportedQuestionnaireSchema } from "@/lib/clinical/questionnaires/jotform-import";
import type { NativeQuestionnaireSchema } from "@/lib/clinical/questionnaires/native-builder";

export const dynamic = "force-dynamic";

const LABELS: Record<string, string> = { bdii: "BDI-II", bai: "BAI", ybocs: "Y-BOCS", pss: "PSS" };

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
type Item = { key: string; label: string; answer: string; score: number | null };

function relation(value: QuestionnaireRelation) { return Array.isArray(value) ? value[0] ?? null : value; }
function numericPrefix(value: string) { const match = value.trim().match(/^([0-9]+)(?:[.\s]|$)/); return match ? Number(match[1]) : null; }
function formatSubmittedAt(value: string) {
  return new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/Vancouver" }).format(new Date(value));
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
    const answer = String(answers[field.id] ?? "").trim();
    items.push({ key: field.id, label: field.label, answer: answer || "—", score: null });
  }
  return items;
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

  const clients = await listAllVcitaClients();
  const client = clients.find((candidate) => subjectKeyFromVcitaUuid(candidate.id) === assessment.subject_key) ?? null;
  const patientName = client ? [client.firstName, client.lastName].filter(Boolean).join(" ") || "Unnamed vcita client" : "Patient not matched in vcita";

  let items: Item[] = [];
  if (code === "bdii") items = bdiItems(assessment.answers);
  else if (questionnaire.metadata?.native_schema) items = nativeItems(questionnaire.metadata.native_schema, assessment.answers);
  else if (questionnaire.metadata?.schema) items = importedItems(questionnaire.metadata.schema, assessment.answers, code);

  return (
    <main style={{ minHeight: "100vh", padding: "28px 24px", background: "#f8fafc" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <Link href={`/form/dashboard/forms/submissions/${encodeURIComponent(code)}/`} style={{ color: "#334155", textDecoration: "none", fontSize: 14 }}>← Back to submissions</Link>
        <header style={{ margin: "16px 0 20px" }}>
          <p style={{ margin: "0 0 5px", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".08em", color: "#64748b" }}>NeuroLinks Admin</p>
          <h1 style={{ margin: 0, fontSize: 30 }}>{LABELS[code] ?? questionnaire.name} submission</h1>
          <p style={{ margin: "8px 0 0", color: "#64748b" }}>{patientName} · {formatSubmittedAt(assessment.submitted_at)}</p>
        </header>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 12, marginBottom: 18 }}>
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 15 }}><div style={{ color: "#64748b", fontSize: 12 }}>Total score</div><strong style={{ fontSize: 26 }}>{assessment.total_score}</strong></div>
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 15 }}><div style={{ color: "#64748b", fontSize: 12 }}>Severity</div><strong style={{ fontSize: 18 }}>{assessment.severity || "—"}</strong></div>
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 15 }}><div style={{ color: "#64748b", fontSize: 12 }}>Patient</div><strong style={{ fontSize: 16 }}>{patientName}</strong>{client?.email ? <div style={{ marginTop: 3, color: "#64748b", fontSize: 13 }}>{client.email}</div> : null}</div>
        </section>

        <section style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, boxShadow: "0 8px 26px rgba(15,23,42,.05)", overflow: "hidden" }}>
          <div style={{ padding: "16px 18px", borderBottom: "1px solid #e2e8f0" }}><h2 style={{ margin: 0, fontSize: 19 }}>Item responses and scores</h2></div>
          {items.length === 0 ? <div style={{ padding: 22, color: "#64748b" }}>Item-level questionnaire definition is unavailable for this submission.</div> : items.map((item, index) => (
            <div key={item.key} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 86px", gap: 16, padding: "14px 18px", borderTop: index ? "1px solid #eef2f7" : undefined, alignItems: "start" }}>
              <div><div style={{ fontWeight: 750, color: "#0f172a" }}>{item.label}</div><div style={{ marginTop: 5, color: "#475569", lineHeight: 1.45 }}>{item.answer}</div></div>
              <div style={{ textAlign: "center", borderRadius: 9, padding: "8px 6px", background: item.score === null ? "#f8fafc" : "#eff6ff", color: item.score === null ? "#94a3b8" : "#1d4ed8", fontWeight: 800 }}>{item.score === null ? "—" : item.score}<div style={{ marginTop: 2, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em" }}>Score</div></div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
