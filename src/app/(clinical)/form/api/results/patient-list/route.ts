import { getClinicianSession } from "@/lib/clinical/auth";
import { subjectKeyFromVcitaUuid } from "@/lib/clinical/pseudonym";
import { clinicalSupabaseRequest } from "@/lib/clinical/supabase";
import { listAllVcitaClients } from "@/lib/clinical/vcita";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AssessmentRow = {
  subject_key: string;
  submitted_at: string;
};

async function listAllAssessmentSubjects() {
  const pageSize = 1000;
  const rows: AssessmentRow[] = [];

  for (let offset = 0; ; offset += pageSize) {
    const batch = await clinicalSupabaseRequest<AssessmentRow[]>(
      `assessment_results?select=subject_key,submitted_at&order=submitted_at.desc&limit=${pageSize}&offset=${offset}`,
      { method: "GET" },
    );
    rows.push(...batch);
    if (batch.length < pageSize) break;
  }

  return rows;
}

export async function GET() {
  const clinician = await getClinicianSession();
  if (!clinician) {
    return Response.json({ ok: false, error: "Authentication required." }, { status: 401 });
  }

  try {
    // These data sources are independent, so load them concurrently to reduce first-load latency.
    const [rows, clients] = await Promise.all([
      listAllAssessmentSubjects(),
      listAllVcitaClients({ maxPages: 100 }),
    ]);

    // assessment_results is newest-first. Keep only the most recent row for each patient.
    const subjectKeys: string[] = [];
    const seen = new Set<string>();
    for (const row of rows) {
      if (!row.subject_key || seen.has(row.subject_key)) continue;
      seen.add(row.subject_key);
      subjectKeys.push(row.subject_key);
    }

    if (subjectKeys.length === 0) {
      return Response.json(
        { ok: true, clients: [] },
        { headers: { "Cache-Control": "no-store, private" } },
      );
    }

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
