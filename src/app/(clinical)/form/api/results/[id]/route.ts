import { getClinicianSession } from "@/lib/clinical/auth";
import { subjectKeyFromVcitaUuid } from "@/lib/clinical/pseudonym";
import { clinicalSupabaseRequest } from "@/lib/clinical/supabase";
import { BDI2_ITEMS, bdi2OptionId, getBdi2OptionById } from "@/lib/clinical/questionnaires/bdii-definition";
import type { ImportedField, ImportedQuestionnaireSchema } from "@/lib/clinical/questionnaires/jotform-import";
import type { NativeQuestionnaireSchema } from "@/lib/clinical/questionnaires/native-builder";

export const runtime = "nodejs";

type QuestionnaireMeta = {
  schema?: ImportedQuestionnaireSchema;
  native_schema?: NativeQuestionnaireSchema;
};

type QuestionnaireRelation =
  | { code: string; name: string; max_score: number | null; metadata?: QuestionnaireMeta | null }
  | Array<{ code: string; name: string; max_score: number | null; metadata?: QuestionnaireMeta | null }>
  | null;

type AssessmentRow = {
  id: string;
  submitted_at: string;
  total_score: number;
  severity: string | null;
  answers: Record<string, unknown>;
  clinical_flags: Record<string, unknown> | null;
  questionnaires: QuestionnaireRelation;
};

type StoredBdiAnswer = {
  optionId?: string;
  score?: number;
  text?: string;
  legacyText?: string;
};

function relation(value: QuestionnaireRelation) {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function canonicalBdiAnswer(itemIndex: number, raw: unknown, nativeField?: Extract<NativeQuestionnaireSchema["fields"][number], { kind: "single" }>) {
  const item = BDI2_ITEMS[itemIndex];
  if (!item) return null;

  if (typeof raw === "number") {
    return { score: raw };
  }

  if (typeof raw === "string") {
    const canonical = getBdi2OptionById(item.key, raw);
    if (canonical) {
      return {
        optionId: raw,
        score: canonical.option.value,
        legacyText: `${canonical.option.value}. ${canonical.option.label}`,
      };
    }

    const nativeOptionIndex = nativeField?.options.findIndex((option) => option.id === raw) ?? -1;
    if (nativeField && nativeOptionIndex >= 0) {
      const nativeOption = nativeField.options[nativeOptionIndex];
      const matchingCanonical = item.options.findIndex(
        (option) => option.value === nativeOption.score && option.label === nativeOption.label,
      );
      return {
        optionId: matchingCanonical >= 0 ? bdi2OptionId(item.key, matchingCanonical) : undefined,
        score: nativeOption.score,
        legacyText: `${nativeOption.score}. ${nativeOption.label}`,
      };
    }

    return null;
  }

  if (!raw || typeof raw !== "object") return null;
  const answer = raw as StoredBdiAnswer;
  const score = typeof answer.score === "number" ? answer.score : null;

  if (answer.optionId) {
    const canonical = getBdi2OptionById(item.key, answer.optionId);
    if (canonical) {
      return {
        optionId: answer.optionId,
        score: canonical.option.value,
        legacyText: answer.legacyText ?? `${canonical.option.value}. ${canonical.option.label}`,
      };
    }

    const nativeOptionIndex = nativeField?.options.findIndex((option) => option.id === answer.optionId) ?? -1;
    if (nativeField && nativeOptionIndex >= 0) {
      const nativeOption = nativeField.options[nativeOptionIndex];
      const matchingCanonical = item.options.findIndex(
        (option) => option.value === nativeOption.score && option.label === nativeOption.label,
      );
      return {
        optionId: matchingCanonical >= 0 ? bdi2OptionId(item.key, matchingCanonical) : undefined,
        score: nativeOption.score,
        legacyText: answer.legacyText ?? `${nativeOption.score}. ${answer.text ?? nativeOption.label}`,
      };
    }
  }

  if (score !== null) {
    const text = answer.text || answer.legacyText?.replace(/^\s*\d+\.\s*/, "") || "";
    const matchingCanonical = item.options.findIndex(
      (option) => option.value === score && (!text || option.label === text),
    );
    return {
      optionId: matchingCanonical >= 0 ? bdi2OptionId(item.key, matchingCanonical) : undefined,
      score,
      legacyText: answer.legacyText ?? (text ? `${score}. ${text}` : undefined),
    };
  }

  return null;
}

function normalizeBdiAnswers(answers: Record<string, unknown>, nativeSchema?: NativeQuestionnaireSchema | null) {
  const normalized: Record<string, unknown> = {};
  const nativeSingles = (nativeSchema?.fields ?? []).filter(
    (field): field is Extract<NativeQuestionnaireSchema["fields"][number], { kind: "single" }> => field.kind === "single",
  );

  BDI2_ITEMS.forEach((item, itemIndex) => {
    const nativeField = nativeSingles[itemIndex];
    const raw = answers[item.key] ?? (nativeField ? answers[nativeField.id] : undefined);
    const canonical = canonicalBdiAnswer(itemIndex, raw, nativeField);
    if (canonical) normalized[item.key] = canonical;
  });

  return normalized;
}

function nativeProjection(schema: NativeQuestionnaireSchema, answers: Record<string, unknown>, questionnaireCode: string) {
  const projectedAnswers: Record<string, unknown> = {};
  const fields: ImportedField[] = [];
  let bdiSingleIndex = 0;

  schema.fields.forEach((field, order) => {
    if (field.kind === "paragraph") {
      fields.push({ kind: "display", qid: field.id, text: field.text, order });
      return;
    }
    if (field.kind === "pagebreak") {
      fields.push({ kind: "pagebreak", qid: field.id, text: "Page break", order });
      return;
    }
    if (field.kind === "text" || field.kind === "textarea") {
      fields.push({ kind: field.kind, qid: field.id, text: field.label, order, required: field.required });
      projectedAnswers[field.id] = answers[field.id] ?? "";
      return;
    }
    if (field.kind === "single") {
      const itemIndex = questionnaireCode === "bdii" ? bdiSingleIndex++ : -1;
      const canonicalId = questionnaireCode === "bdii" ? `q${itemIndex + 1}` : field.id;
      fields.push({ kind: "radio", qid: canonicalId, text: field.label, order, options: field.options.map((option) => option.label), required: field.required });

      if (questionnaireCode === "bdii") {
        const raw = answers[canonicalId] ?? answers[field.id];
        const canonical = canonicalBdiAnswer(itemIndex, raw, field);
        if (canonical) projectedAnswers[canonicalId] = canonical;
        return;
      }

      const selected = String(answers[field.id] ?? "");
      projectedAnswers[canonicalId] = field.options.find((option) => option.id === selected)?.label ?? selected;
      return;
    }
    if (field.kind === "multiple") {
      fields.push({ kind: "checkbox", qid: field.id, text: field.label, order, options: field.options.map((option) => option.label), required: field.required });
      const rawAnswer = answers[field.id];
      const raw: string[] = Array.isArray(rawAnswer)
        ? rawAnswer.map((value: unknown) => String(value))
        : [];
      projectedAnswers[field.id] = raw.map((selected: string) => field.options.find((option) => option.id === selected)?.label ?? selected);
      return;
    }
    fields.push({ kind: "matrix_radio", qid: field.id, text: field.label, order, rows: field.rows.map((row) => row.label), columns: field.columns.map((column) => column.label), required: field.required });
    field.rows.forEach((row, rowIndex) => {
      const selected = String(answers[`${field.id}:${row.id}`] ?? "");
      projectedAnswers[`${field.id}:${rowIndex}`] = field.columns.find((column) => column.id === selected)?.label ?? selected;
    });
  });

  const projectedSchema: ImportedQuestionnaireSchema = {
    source: "jotform",
    jotformId: "native",
    importedAt: new Date(0).toISOString(),
    fields,
  };
  return { schema: projectedSchema, answers: projectedAnswers };
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const clinician = await getClinicianSession();
  if (!clinician) return Response.json({ ok: false, error: "Authentication required." }, { status: 401 });

  const { id } = await context.params;
  const { searchParams } = new URL(request.url);
  const vcitaUuid = String(searchParams.get("vcitaUuid") ?? "").trim();
  if (!id || !vcitaUuid) return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });

  try {
    const subjectKey = subjectKeyFromVcitaUuid(vcitaUuid);
    const rows = await clinicalSupabaseRequest<AssessmentRow[]>(
      `assessment_results?select=id,submitted_at,total_score,severity,answers,clinical_flags,questionnaires(code,name,max_score,metadata)&id=eq.${encodeURIComponent(id)}&subject_key=eq.${subjectKey}&limit=1`,
      { method: "GET" },
    );

    const row = rows[0];
    const questionnaire = row ? relation(row.questionnaires) : null;
    if (!row || !questionnaire) return Response.json({ ok: false, error: "Result not found." }, { status: 404 });

    await clinicalSupabaseRequest<unknown>("audit_events", {
      method: "POST",
      prefer: "return=minimal",
      body: JSON.stringify({
        event_type: "RESULT_VIEWED",
        subject_key: subjectKey,
        assessment_id: row.id,
        metadata: {
          questionnaire_code: questionnaire.code,
          clinician_user_id: clinician.id,
          view: "detail",
        },
      }),
    });

    let resultAnswers = questionnaire.code === "bdii"
      ? normalizeBdiAnswers(row.answers, questionnaire.metadata?.native_schema)
      : row.answers;
    let resultSchema = questionnaire.metadata?.schema ?? null;

    if (questionnaire.metadata?.native_schema) {
      const projected = nativeProjection(questionnaire.metadata.native_schema, row.answers, questionnaire.code);
      resultAnswers = questionnaire.code === "bdii"
        ? normalizeBdiAnswers(projected.answers, questionnaire.metadata.native_schema)
        : projected.answers;
      resultSchema = projected.schema;
    }

    return Response.json(
      {
        ok: true,
        result: {
          id: row.id,
          submittedAt: row.submitted_at,
          totalScore: row.total_score,
          severity: row.severity,
          answers: resultAnswers,
          questionnaireCode: questionnaire.code,
          questionnaireName: questionnaire.name,
          maxScore: questionnaire.max_score,
          schema: resultSchema,
          nativeSchema: questionnaire.metadata?.native_schema ?? null,
          item9Positive: Boolean(row.clinical_flags?.bdii_item9_positive),
          item9Score: Number(row.clinical_flags?.bdii_item9_score ?? 0),
          obsessionScore:
            typeof row.clinical_flags?.obsession_score === "number"
              ? row.clinical_flags.obsession_score
              : null,
          compulsionScore:
            typeof row.clinical_flags?.compulsion_score === "number"
              ? row.clinical_flags.compulsion_score
              : null,
        },
      },
      { headers: { "Cache-Control": "no-store, private" } },
    );
  } catch {
    return Response.json(
      { ok: false, error: "Could not load result details." },
      { status: 500, headers: { "Cache-Control": "no-store, private" } },
    );
  }
}
