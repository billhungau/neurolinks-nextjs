import type { ImportedField, ImportedQuestionnaireSchema } from "./jotform-import";
import { fetchImportedSchema } from "./jotform-import";
import {
  fetchHistoricalSubmission,
  mapHistoricalSubmissionToSchema,
} from "../imports/historical-questionnaire";
import { clinicalSupabaseRequest } from "../supabase";

type OriginalImportAudit = {
  metadata?: { source_submission_id?: string } | null;
};

function symptomMatrix(schema: ImportedQuestionnaireSchema | null) {
  return schema?.fields.find(
    (field): field is Extract<ImportedField, { kind: "matrix_radio" }> =>
      field.kind === "matrix_radio" && field.rows.length >= 17,
  );
}

function hasResponses(
  schema: ImportedQuestionnaireSchema | null,
  answers: Record<string, unknown>,
) {
  const matrix = symptomMatrix(schema);
  return Boolean(
    matrix &&
      matrix.rows.every((_, index) => {
        const value = answers[`${matrix.qid}:${index}`];
        return value !== undefined && value !== null && String(value).trim() !== "";
      }),
  );
}

/**
 * Read-only recovery of PSS symptom responses dropped by historical imports
 * made while Jotform's unlabeled matrix was excluded from the schema.
 *
 * The submission ID comes exclusively from an audited import associated with
 * the exact assessment ID. Never match patients by name or message text.
 */
export async function recoverPssPageTwo(
  assessmentId: string,
  answers: Record<string, unknown>,
  schema: ImportedQuestionnaireSchema | null,
): Promise<{ answers: Record<string, unknown>; schema: ImportedQuestionnaireSchema | null }> {
  if (hasResponses(schema, answers)) return { answers, schema };

  try {
    const audits = await clinicalSupabaseRequest<OriginalImportAudit[]>(
      `audit_events?select=metadata&assessment_id=eq.${encodeURIComponent(assessmentId)}&event_type=in.(HISTORICAL_RESULT_IMPORTED,JOTFORM_RESULT_SYNCED)&order=created_at.desc&limit=10`,
      { method: "GET" },
    );
    const submissionId = audits
      .map((audit) => audit.metadata?.source_submission_id)
      .find((id): id is string => typeof id === "string" && /^\d+$/.test(id));
    if (!submissionId) return { answers, schema };

    const [original, fullSchema] = await Promise.all([
      fetchHistoricalSubmission("pss", submissionId),
      fetchImportedSchema("pss"),
    ]);
    if (!original || (original.form_id && String(original.form_id) !== "223175090048048")) {
      return { answers, schema };
    }
    const matrix = symptomMatrix(fullSchema);
    if (!matrix) return { answers, schema };
    const recovered = mapHistoricalSubmissionToSchema(original, fullSchema);
    if (!hasResponses(fullSchema, recovered)) return { answers, schema };

    // This view never modifies the recorded total score or database answers.
    return { answers: { ...answers, ...recovered }, schema: fullSchema };
  } catch {
    // Fail closed to the original stored result if Jotform is unavailable.
    return { answers, schema };
  }
}
