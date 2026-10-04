import { getClinicianSession } from "@/lib/clinical/auth";
import { subjectKeyFromVcitaUuid } from "@/lib/clinical/pseudonym";
import { BDI2_ITEMS, getBdi2OptionById } from "@/lib/clinical/questionnaires/bdii-definition";
import type { ImportedQuestionnaireSchema } from "@/lib/clinical/questionnaires/jotform-import";
import type { NativeQuestionnaireSchema } from "@/lib/clinical/questionnaires/native-builder";
import { buildQuestionnairePdf } from "@/lib/clinical/simple-pdf";
import { clinicalSupabaseRequest } from "@/lib/clinical/supabase";
import { listAllVcitaClients } from "@/lib/clinical/vcita";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type QuestionnaireMeta = { schema?: ImportedQuestionnaireSchema; native_schema?: NativeQuestionnaireSchema };
type QuestionnaireRelation =
  | { code: string; name: string; max_score: number | null; metadata?: QuestionnaireMeta | null }
  | Array<{ code: string; name: string; max_score: number | null; metadata?: QuestionnaireMeta | null }>
  | null;

type AssessmentRow = {
  id: string;
  subject_key: string;
  submitted_at: string;
  total_score: number;
  severity: string | null;
  answers: Record<string, unknown>;
  clinical_flags: Record<string, unknown> | null;
  questionnaires: QuestionnaireRelation;
};

type Item = { label: string; answer: string; score: number | null };

function relation(value: QuestionnaireRelation) {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function numericPrefix(value: string) {
  const match = value.trim().match(/^([0-9]+)(?:[.\s]|$)/);
  return match ? Number(match[1]) : null;
}

function bdiItems(answers: Record<string, unknown>): Item[] {
  return BDI2_ITEMS.map((item) => {
    const raw = answers[item.key] as number | { optionId?: string; score?: number; legacyText?: string; text?: string } | undefined;
    const score = typeof raw === "number" ? raw : typeof raw?.score === "number" ? raw.score : null;
    const exact = typeof raw === "object" && raw?.optionId ? getBdi2OptionById(item.key, raw.optionId) : null;
    const option = exact?.option ?? (score === null ? null : item.options.find((candidate) => candidate.value === score) ?? null);
    const answer =
      typeof raw === "object" && raw?.text
        ? raw.text
        : typeof raw === "object" && raw?.legacyText
          ? raw.legacyText
          : score === null
            ? "-"
            : `${score}. ${option?.label ?? "Recorded response"}`;
    return { label: item.title, answer, score };
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
        items.push({
          label: row,
          answer: value || "-",
          score: value ? numericPrefix(value) ?? (columnIndex >= 0 ? columnIndex : null) : null,
        });
      });
      continue;
    }
    const raw = answers[field.qid];
    const answer = Array.isArray(raw) ? raw.join(", ") : String(raw ?? "");
    let score: number | null = null;
    if ((field.kind === "radio" || field.kind === "select") && answer) {
      const optionIndex = field.options.indexOf(answer);
      score = code === "ybocs" ? (optionIndex >= 0 ? optionIndex : null) : numericPrefix(answer);
    }
    items.push({ label: field.text, answer: answer || "-", score });
  }
  return items;
}

function nativeItems(schema: NativeQuestionnaireSchema, answers: Record<string, unknown>): Item[] {
  const items: Item[] = [];
  for (const field of schema.fields) {
    if (field.kind === "paragraph" || field.kind === "pagebreak") continue;
    if (field.kind === "single") {
      const raw = answers[field.id];
      const selectedId =
        typeof raw === "object" && raw !== null && "optionId" in raw
          ? String((raw as { optionId?: unknown }).optionId ?? "")
          : String(raw ?? "");
      const option = field.options.find((candidate) => candidate.id === selectedId);
      const objectScore = typeof raw === "object" && raw !== null && "score" in raw
        ? Number((raw as { score?: unknown }).score)
        : NaN;
      items.push({
        label: field.label,
        answer: option?.label ?? (selectedId || "-"),
        score: option?.score ?? (Number.isFinite(objectScore) ? objectScore : null),
      });
      continue;
    }
    if (field.kind === "multiple") {
      const raw = Array.isArray(answers[field.id]) ? (answers[field.id] as unknown[]).map(String) : [];
      const selected = raw.map((id) => field.options.find((candidate) => candidate.id === id)).filter(Boolean);
      items.push({
        label: field.label,
        answer: selected.map((option) => option!.label).join(", ") || "-",
        score: selected.length ? selected.reduce((sum, option) => sum + (option?.score ?? 0), 0) : null,
      });
      continue;
    }
    if (field.kind === "matrix") {
      field.rows.forEach((row) => {
        const selectedId = String(answers[`${field.id}:${row.id}`] ?? "");
        const option = field.columns.find((candidate) => candidate.id === selectedId);
        items.push({ label: row.label, answer: option?.label ?? (selectedId || "-"), score: option?.score ?? null });
      });
      continue;
    }
    const answer = String(answers[field.id] ?? "").trim();
    items.push({ label: field.label, answer: answer || "-", score: null });
  }
  return items;
}

function filePart(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "result";
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const clinician = await getClinicianSession();
  if (!clinician) return Response.json({ ok: false, error: "Authentication required." }, { status: 401 });

  const { id } = await context.params;
  if (!id) return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });

  try {
    const rows = await clinicalSupabaseRequest<AssessmentRow[]>(
      `assessment_results?select=id,subject_key,submitted_at,total_score,severity,answers,clinical_flags,questionnaires(code,name,max_score,metadata)&id=eq.${encodeURIComponent(id)}&limit=1`,
      { method: "GET" },
    );
    const assessment = rows[0];
    const questionnaire = assessment ? relation(assessment.questionnaires) : null;
    if (!assessment || !questionnaire) return Response.json({ ok: false, error: "Result not found." }, { status: 404 });

    const clients = await listAllVcitaClients();
    const client = clients.find((candidate) => subjectKeyFromVcitaUuid(candidate.id) === assessment.subject_key) ?? null;
    const patientName = client
      ? [client.firstName, client.lastName].filter(Boolean).join(" ") || "Unnamed vcita client"
      : "Patient not matched in vcita";

    let items: Item[] = [];
    if (questionnaire.code === "bdii") items = bdiItems(assessment.answers);
    else if (questionnaire.metadata?.native_schema) items = nativeItems(questionnaire.metadata.native_schema, assessment.answers);
    else if (questionnaire.metadata?.schema) items = importedItems(questionnaire.metadata.schema, assessment.answers, questionnaire.code);

    const submitted = new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone: "America/Vancouver",
    }).format(new Date(assessment.submitted_at));

    const bytes = buildQuestionnairePdf({
      patientName,
      patientEmail: client?.email ?? null,
      questionnaireName: questionnaire.name,
      questionnaireCode: questionnaire.code,
      submittedAt: submitted,
      totalScore: assessment.total_score,
      severity: assessment.severity,
      obsessionScore: typeof assessment.clinical_flags?.obsession_score === "number" ? assessment.clinical_flags.obsession_score : null,
      compulsionScore: typeof assessment.clinical_flags?.compulsion_score === "number" ? assessment.clinical_flags.compulsion_score : null,
      items,
    });

    await clinicalSupabaseRequest<unknown>("audit_events", {
      method: "POST",
      prefer: "return=minimal",
      body: JSON.stringify({
        event_type: "RESULT_PDF_DOWNLOADED",
        subject_key: assessment.subject_key,
        assessment_id: assessment.id,
        metadata: {
          questionnaire_code: questionnaire.code,
          clinician_user_id: clinician.id,
        },
      }),
    });

    const date = assessment.submitted_at.slice(0, 10);
    const filename = `${filePart(patientName)}-${filePart(questionnaire.code.toUpperCase())}-${date}.pdf`;
    return new Response(bytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, private",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return Response.json(
      { ok: false, error: "Could not generate this questionnaire PDF." },
      { status: 500, headers: { "Cache-Control": "no-store, private" } },
    );
  }
}
