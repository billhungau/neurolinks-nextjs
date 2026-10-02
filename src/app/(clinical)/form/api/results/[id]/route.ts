import { getClinicianSession } from "@/lib/clinical/auth";
import { subjectKeyFromVcitaUuid } from "@/lib/clinical/pseudonym";
import { clinicalSupabaseRequest } from "@/lib/clinical/supabase";

export const runtime = "nodejs";

type AssessmentRow = {
  id: string;
  submitted_at: string;
  total_score: number;
  severity: string | null;
  answers: Record<string, number | { optionId?: string; score?: number }>;
  clinical_flags: {
    bdii_item9_positive?: boolean;
    bdii_item9_score?: number;
  } | null;
};

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const clinician = await getClinicianSession();
  if (!clinician) {
    return Response.json({ ok: false, error: "Authentication required." }, { status: 401 });
  }

  const { id } = await context.params;
  const { searchParams } = new URL(request.url);
  const vcitaUuid = String(searchParams.get("vcitaUuid") ?? "").trim();
  if (!id || !vcitaUuid) {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  try {
    const subjectKey = subjectKeyFromVcitaUuid(vcitaUuid);
    const rows = await clinicalSupabaseRequest<AssessmentRow[]>(
      `assessment_results?select=id,submitted_at,total_score,severity,answers,clinical_flags&id=eq.${encodeURIComponent(id)}&subject_key=eq.${subjectKey}&limit=1`,
      { method: "GET" },
    );

    const row = rows[0];
    if (!row) {
      return Response.json({ ok: false, error: "Result not found." }, { status: 404 });
    }

    await clinicalSupabaseRequest<unknown>("audit_events", {
      method: "POST",
      prefer: "return=minimal",
      body: JSON.stringify({
        event_type: "RESULT_VIEWED",
        subject_key: subjectKey,
        assessment_id: row.id,
        metadata: {
          questionnaire_code: "bdii",
          clinician_user_id: clinician.id,
          view: "detail",
        },
      }),
    });

    return Response.json(
      {
        ok: true,
        result: {
          id: row.id,
          submittedAt: row.submitted_at,
          totalScore: row.total_score,
          severity: row.severity,
          answers: row.answers,
          item9Positive: Boolean(row.clinical_flags?.bdii_item9_positive),
          item9Score: Number(row.clinical_flags?.bdii_item9_score ?? 0),
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
