import { getClinicianSession } from "@/lib/clinical/auth";
import { patientIdentityRows, upsertPatientIdentities } from "@/lib/clinical/patient-identity-index";
import { subjectKeyFromVcitaUuid } from "@/lib/clinical/pseudonym";
import { clinicalSupabaseRequest } from "@/lib/clinical/supabase";
import { getVcitaClient, listAllVcitaClients } from "@/lib/clinical/vcita";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

type AssessmentRow = {
  subject_key: string;
  submitted_at: string;
};

async function orderedAssessmentSubjects() {
  const pageSize = 1000;
  const subjectKeys: string[] = [];
  const seen = new Set<string>();

  for (let offset = 0; ; offset += pageSize) {
    const batch = await clinicalSupabaseRequest<AssessmentRow[]>(
      `assessment_results?select=subject_key,submitted_at&order=submitted_at.desc&limit=${pageSize}&offset=${offset}`,
      { method: "GET" },
    );
    for (const row of batch) {
      if (!row.subject_key || seen.has(row.subject_key)) continue;
      seen.add(row.subject_key);
      subjectKeys.push(row.subject_key);
    }
    if (batch.length < pageSize) break;
  }

  return subjectKeys;
}

async function indexedPage(subjectKeys: string[]) {
  const mappings = await patientIdentityRows(subjectKeys);
  const bySubject = new Map(mappings.map((row) => [row.subject_key, row.vcita_client_id] as const));
  const resolved = await Promise.all(
    subjectKeys.map(async (subjectKey) => {
      const vcitaId = bySubject.get(subjectKey);
      if (!vcitaId) return null;
      try {
        const client = await getVcitaClient(vcitaId);
        return client ? { subjectKey, client } : null;
      } catch {
        return null;
      }
    }),
  );
  return resolved;
}

async function repairFromVcita(allSubjectKeys: string[]) {
  const clients = await listAllVcitaClients({ maxPages: 100 });
  const wanted = new Set(allSubjectKeys);
  const pairs = clients
    .map((client) => ({ client, subjectKey: subjectKeyFromVcitaUuid(client.id) }))
    .filter(({ subjectKey }) => wanted.has(subjectKey));

  try {
    await upsertPatientIdentities(
      pairs.map(({ subjectKey, client }) => ({ subjectKey, vcitaUuid: client.id })),
    );
  } catch {
    // The index is an optimization. The response can still use this in-memory map.
  }

  return new Map(pairs.map(({ subjectKey, client }) => [subjectKey, client] as const));
}

export async function GET(request: Request) {
  const clinician = await getClinicianSession();
  if (!clinician) {
    return Response.json({ ok: false, error: "Authentication required." }, { status: 401 });
  }

  const requestedPage = Number(new URL(request.url).searchParams.get("page") ?? "1");
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  try {
    const allSubjectKeys = await orderedAssessmentSubjects();
    const total = allSubjectKeys.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * PAGE_SIZE;
    const pageKeys = allSubjectKeys.slice(start, start + PAGE_SIZE);

    if (!pageKeys.length) {
      return Response.json(
        { ok: true, clients: [], page: safePage, pageSize: PAGE_SIZE, total, totalPages },
        { headers: { "Cache-Control": "no-store, private" } },
      );
    }

    let resolved: Array<{ subjectKey: string; client: Awaited<ReturnType<typeof getVcitaClient>> } | null> = [];
    try {
      resolved = await indexedPage(pageKeys);
    } catch {
      // Table may not yet exist during deployment of the migration. Fall back safely.
    }

    const resolvedBySubject = new Map(
      resolved
        .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry?.client))
        .map((entry) => [entry.subjectKey, entry.client!] as const),
    );

    if (resolvedBySubject.size < pageKeys.length) {
      const repaired = await repairFromVcita(allSubjectKeys);
      for (const key of pageKeys) {
        if (!resolvedBySubject.has(key) && repaired.has(key)) {
          resolvedBySubject.set(key, repaired.get(key)!);
        }
      }
    }

    const clients = pageKeys
      .map((subjectKey) => resolvedBySubject.get(subjectKey))
      .filter((client): client is NonNullable<typeof client> => Boolean(client))
      .map((client) => ({
        id: client.id,
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
        phone: null,
      }));

    return Response.json(
      { ok: true, clients, page: safePage, pageSize: PAGE_SIZE, total, totalPages },
      { headers: { "Cache-Control": "no-store, private" } },
    );
  } catch {
    return Response.json(
      { ok: false, error: "Could not load patient list." },
      { status: 500, headers: { "Cache-Control": "no-store, private" } },
    );
  }
}
