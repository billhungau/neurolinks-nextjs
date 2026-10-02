import { getClinicianSession } from "@/lib/clinical/auth";
import { subjectKeyFromVcitaUuid } from "@/lib/clinical/pseudonym";
import { clinicalSupabaseRequest } from "@/lib/clinical/supabase";
import type { ImportedQuestionnaireSchema } from "@/lib/clinical/questionnaires/jotform-import";

export const runtime = "nodejs";

type QuestionnaireRelation =
  | {
      code: string;
      name: string;
      max_score: number | null;
      metadata?: { schema?: ImportedQuestionnaireSchema } | null;
    }
  | Array<{
      code: string;
      name: string;
      max_score: number | null;
      metadata?: { schema?: ImportedQuestionnaireSchema } | null;
    }>
  | null;

type AssessmentRow = {
  id: string;
  submitted_at: string;
  total_score: number;
  severity: string | null;
  clinical_flags: Record<string, unknown> | null;
  questionnaires: QuestionnaireRelation;
};

function relation(value: QuestionnaireRelation) {
  return Array.isArray(value) ? value[0] ?? null : value;
}

export async function GET(request: Request) {
  const clinician = await getClinicianSession();
  if (!clinician) {
    return Response.json({ ok: false, error: "Authentication required." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const vcitaUuid = String(searchParams.get("vcitaUuid") ?? "").trim();
  if (!vcitaUuid || vcitaUuid.length > 200) {
    return Response.json({ ok: false, error: "Invalid patient." }, { status: 400 });
  }

  try {
    const subjectKey = subjectKeyFromVcitaUuid(vcitaUuid);
    const rows = await clinicalSupabaseRequest<AssessmentRow[]>(
      `assessment_results?select=id,submitted_at,total_score,severity,clinical_flags,questionnaires(code,name,max_score,metadata)&subject_key=eq.${subjectKey}&order=submitted_at.asc`,
      { method: "GET" },
    );

    const supported = rows
      .map((row) => ({ row, questionnaire: relation(row.questionnaires) }))
      .filter(({ questionnaire }) =>
        questionnaire && ["bdii", "bai", "ybocs", "pss"].includes(questionnaire.code),
      );

    if (supported.length > 0) {
      await clinicalSupabaseRequest<unknown>("audit_events", {
        method: "POST",
        prefer: "return=minimal",
        body: JSON.stringify({
          event_type: "RESULT_VIEWED",
          subject_key: subjectKey,
          metadata: {
            questionnaire_code: "multiple",
            clinician_user_id: clinician.id,
            result_count: supported.length,
          },
        }),
      });
    }

    return Response.json(
      {
        ok: true,
        results: supported.map(({ row, questionnaire }) => ({
          id: row.id,
          submittedAt: row.submitted_at,
          totalScore: row.total_score,
          severity: row.severity,
          questionnaireCode: questionnaire!.code,
          questionnaireName: questionnaire!.name,
          maxScore: questionnaire!.max_score,
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
        })),
      },
      { headers: { "Cache-Control": "no-store, private" } },
    );
  } catch {
    return Response.json(
      { ok: false, error: "Could not load questionnaire history." },
      { status: 500, headers: { "Cache-Control": "no-store, private" } },
    );
  }
}
