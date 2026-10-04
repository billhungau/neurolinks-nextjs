import { getClinicianSession } from "@/lib/clinical/auth";
import { subjectKeyFromVcitaUuid } from "@/lib/clinical/pseudonym";
import { clinicalSupabaseRequest } from "@/lib/clinical/supabase";
import { listAllVcitaClients } from "@/lib/clinical/vcita";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type QuestionnaireRelation = { code: string } | Array<{ code: string }> | null;
type AssessmentRow = {
  subject_key: string;
  submitted_at: string;
  questionnaires: QuestionnaireRelation;
};

function relation(value: QuestionnaireRelation) {
  return Array.isArray(value) ? value[0] ?? null : value;
}

export async function GET() {
  const clinician = await getClinicianSession();
  if (!clinician) {
    return Response.json({ ok: false, error: "Authentication required." }, { status: 401 });
  }

  try {
    // Pull enough recent results to reliably obtain 50 unique BDI patients after deduplication.
    const rows = await clinicalSupabaseRequest<AssessmentRow[]>(
      "assessment_results?select=subject_key,submitted_at,questionnaires(code)&order=submitted_at.desc&limit=500",
      { method: "GET" },
    );

    const subjectKeys: string[] = [];
    const seen = new Set<string>();
    for (const row of rows) {
      const questionnaire = relation(row.questionnaires);
      if (questionnaire?.code !== "bdii" || seen.has(row.subject_key)) continue;
      seen.add(row.subject_key);
      subjectKeys.push(row.subject_key);
      if (subjectKeys.length >= 50) break;
    }

    if (subjectKeys.length === 0) {
      return Response.json(
        { ok: true, clients: [] },
        { headers: { "Cache-Control": "no-store, private" } },
      );
    }

    const clients = await listAllVcitaClients({ maxPages: 50 });
    const bySubjectKey = new Map(
      clients.map((client) => [subjectKeyFromVcitaUuid(client.id), client] as const),
    );

    const ordered = subjectKeys
      .map((subjectKey) => bySubjectKey.get(subjectKey))
      .filter((client): client is NonNullable<typeof client> => Boolean(client))
      .map((client) => ({
        id: client.id,
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
        phone: null,
      }));

    return Response.json(
      { ok: true, clients: ordered },
      { headers: { "Cache-Control": "no-store, private" } },
    );
  } catch {
    return Response.json(
      { ok: false, error: "Could not load patient list." },
      { status: 500, headers: { "Cache-Control": "no-store, private" } },
    );
  }
}
