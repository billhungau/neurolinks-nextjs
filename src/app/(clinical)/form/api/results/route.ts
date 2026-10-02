import { getClinicianSession } from "@/lib/clinical/auth";
import { subjectKeyFromVcitaUuid } from "@/lib/clinical/pseudonym";
import { clinicalSupabaseRequest } from "@/lib/clinical/supabase";

export const runtime = "nodejs";

type QuestionnaireRow = {
  id: string;
};

type AssessmentRow = {
  id: string;
  submitted_at: string;
  total_score: number;
  severity: string | null;
  clinical_flags: {
    bdii_item9_positive?: boolean;
    bdii_item9_score?: number;
  } | null;
};

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
    const questionnaires = await clinicalSupabaseRequest<QuestionnaireRow[]>(
      "questionnaires?select=id&code=eq.bdii&order=version.desc&limit=1",
      { method: "GET" },
    );

    const questionnaire = questionnaires[0];
    if (!questionnaire) {
      return Response.json(
        { ok: true, results: [] },
        { headers: { "Cache-Control": "no-store, private" } },
      );
    }

    const subjectKey = subjectKeyFromVcitaUuid(vcitaUuid);
    const rows = await clinicalSupabaseRequest<AssessmentRow[]>(
      `assessment_results?select=id,submitted_at,total_score,severity,clinical_flags&subject_key=eq.${subjectKey}&questionnaire_id=eq.${questionnaire.id}&order=submitted_at.asc`,
      { method: "GET" },
    );

    if (rows.length > 0) {
      await clinicalSupabaseRequest<unknown>("audit_events", {
        method: "POST",
        prefer: "return=minimal",
        body: JSON.stringify({
          event_type: "RESULT_VIEWED",
          subject_key: subjectKey,
          metadata: {
            questionnaire_code: "bdii",
            clinician_user_id: clinician.id,
            result_count: rows.length,
          },
        }),
      });
    }

    return Response.json(
      {
        ok: true,
        results: rows.map((row) => ({
          id: row.id,
          submittedAt: row.submitted_at,
          totalScore: row.total_score,
          severity: row.severity,
          item9Positive: Boolean(row.clinical_flags?.bdii_item9_positive),
          item9Score: Number(row.clinical_flags?.bdii_item9_score ?? 0),
        })),
      },
      { headers: { "Cache-Control": "no-store, private" } },
    );
  } catch {
    return Response.json(
      { ok: false, error: "Could not load BDI-II history." },
      { status: 500, headers: { "Cache-Control": "no-store, private" } },
    );
  }
}
