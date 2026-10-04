import { getClinicianSession } from "@/lib/clinical/auth";
import { patientIdentityRows, upsertPatientIdentities } from "@/lib/clinical/patient-identity-index";
import { subjectKeyFromVcitaUuid } from "@/lib/clinical/pseudonym";
import { clinicalSupabaseRequest, clinicalSupabaseRequestWithCount } from "@/lib/clinical/supabase";
import { getVcitaClient, listAllVcitaClients } from "@/lib/clinical/vcita";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;
const VCITA_CONCURRENCY = 6;

type AssessmentRow = {
  subject_key: string;
  submitted_at: string;
};

type IdentityActivityRow = {
  subject_key: string;
  vcita_client_id: string;
  last_submission_at: string;
};

type ResolvedEntry = {
  subjectKey: string;
  client: Awaited<ReturnType<typeof getVcitaClient>>;
};

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  async function runWorker() {
    while (true) {
      const index = nextIndex;
      nextIndex += 1;
      if (index >= items.length) return;
      results[index] = await worker(items[index]);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => runWorker()),
  );
  return results;
}

async function resolveIndexedClients(rows: IdentityActivityRow[]) {
  return mapWithConcurrency<IdentityActivityRow, ResolvedEntry | null>(
    rows,
    VCITA_CONCURRENCY,
    async (row) => {
      try {
        const client = await getVcitaClient(row.vcita_client_id);
        return client ? { subjectKey: row.subject_key, client } : null;
      } catch {
        return null;
      }
    },
  );
}

async function fastIndexedPage(requestedPage: number) {
  async function loadPage(page: number) {
    const offset = (page - 1) * PAGE_SIZE;
    return clinicalSupabaseRequestWithCount<IdentityActivityRow[]>(
      `patient_identity_index?select=subject_key,vcita_client_id,last_submission_at&last_submission_at=not.is.null&order=last_submission_at.desc&limit=${PAGE_SIZE}&offset=${offset}`,
      { method: "GET" },
    );
  }

  const supabaseStarted = Date.now();
  let page = requestedPage;
  let result = await loadPage(page);
  const total = result.count ?? 0;
  if (total === 0) return null;

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (page > totalPages) {
    page = totalPages;
    result = await loadPage(page);
  }
  const supabaseMs = Date.now() - supabaseStarted;

  const vcitaStarted = Date.now();
  const rows = result.data ?? [];
  const resolved = await resolveIndexedClients(rows);
  const vcitaMs = Date.now() - vcitaStarted;
  const failedLookups = resolved.filter((entry) => !entry?.client).length;

  const clients = resolved
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry?.client))
    .map((entry) => ({
      id: entry.client.id,
      firstName: entry.client.firstName,
      lastName: entry.client.lastName,
      email: entry.client.email,
      phone: null,
    }));

  // PHI-free operational telemetry. Do not log IDs, names, emails, or subject keys.
  console.info("[patient-list]", {
    path: "fast-index",
    page,
    lookupCount: rows.length,
    failedLookups,
    supabaseMs,
    vcitaMs,
  });

  // Do not abandon the fast path because one vcita record is stale or one
  // upstream lookup times out. Returning the successfully resolved patients is
  // much safer than triggering an assessment scan plus a full vcita-directory
  // walk for a single transient failure.
  return { clients, page, total, totalPages };
}

async function orderedAssessmentSubjects() {
  const pageSize = 1000;
  const subjectKeys: string[] = [];
  const latestBySubject = new Map<string, string>();
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
      latestBySubject.set(row.subject_key, row.submitted_at);
    }
    if (batch.length < pageSize) break;
  }

  return { subjectKeys, latestBySubject };
}

async function indexedPage(subjectKeys: string[]) {
  const mappings = await patientIdentityRows(subjectKeys);
  const bySubject = new Map(mappings.map((row) => [row.subject_key, row.vcita_client_id] as const));
  const items = subjectKeys.map((subjectKey) => ({ subjectKey, vcitaId: bySubject.get(subjectKey) ?? null }));

  return mapWithConcurrency<typeof items[number], ResolvedEntry | null>(
    items,
    VCITA_CONCURRENCY,
    async ({ subjectKey, vcitaId }) => {
      if (!vcitaId) return null;
      try {
        const client = await getVcitaClient(vcitaId);
        return client ? { subjectKey, client } : null;
      } catch {
        return null;
      }
    },
  );
}

async function repairFromVcita(allSubjectKeys: string[], latestBySubject: Map<string, string>) {
  const clients = await listAllVcitaClients({ maxPages: 100 });
  const wanted = new Set(allSubjectKeys);
  const pairs = clients
    .map((client) => ({ client, subjectKey: subjectKeyFromVcitaUuid(client.id) }))
    .filter(({ subjectKey }) => wanted.has(subjectKey));

  try {
    await upsertPatientIdentities(
      pairs.map(({ subjectKey, client }) => ({
        subjectKey,
        vcitaUuid: client.id,
        lastSubmissionAt: latestBySubject.get(subjectKey) ?? null,
      })),
    );
  } catch {
    // The index is an optimization. The response can still use this in-memory map.
  }

  return new Map(pairs.map(({ subjectKey, client }) => [subjectKey, client] as const));
}

async function compatibilityPage(requestedPage: number) {
  const started = Date.now();
  const { subjectKeys: allSubjectKeys, latestBySubject } = await orderedAssessmentSubjects();
  const total = allSubjectKeys.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);
  const start = (page - 1) * PAGE_SIZE;
  const pageKeys = allSubjectKeys.slice(start, start + PAGE_SIZE);

  if (!pageKeys.length) {
    console.info("[patient-list]", {
      path: "compatibility",
      page,
      lookupCount: 0,
      failedLookups: 0,
      totalMs: Date.now() - started,
    });
    return { clients: [], page, total, totalPages };
  }

  let resolved: Array<ResolvedEntry | null> = [];
  try {
    resolved = await indexedPage(pageKeys);
  } catch {
    // Table/column may not yet exist during deployment of the migration.
  }

  const resolvedBySubject = new Map(
    resolved
      .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry?.client))
      .map((entry) => [entry.subjectKey, entry.client!] as const),
  );

  if (resolvedBySubject.size < pageKeys.length) {
    const repaired = await repairFromVcita(allSubjectKeys, latestBySubject);
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

  console.info("[patient-list]", {
    path: "compatibility",
    page,
    lookupCount: pageKeys.length,
    failedLookups: Math.max(0, pageKeys.length - clients.length),
    totalMs: Date.now() - started,
  });

  return { clients, page, total, totalPages };
}

export async function GET(request: Request) {
  const clinician = await getClinicianSession();
  if (!clinician) {
    return Response.json({ ok: false, error: "Authentication required." }, { status: 401 });
  }

  const requestedPage = Number(new URL(request.url).searchParams.get("page") ?? "1");
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  try {
    let result: Awaited<ReturnType<typeof fastIndexedPage>> = null;
    try {
      result = await fastIndexedPage(page);
    } catch {
      console.warn("[patient-list] fast index unavailable; using compatibility path");
    }

    const finalResult = result ?? await compatibilityPage(page);

    return Response.json(
      {
        ok: true,
        clients: finalResult.clients,
        page: finalResult.page,
        pageSize: PAGE_SIZE,
        total: finalResult.total,
        totalPages: finalResult.totalPages,
      },
      { headers: { "Cache-Control": "no-store, private" } },
    );
  } catch {
    console.error("[patient-list] request failed");
    return Response.json(
      { ok: false, error: "Could not load patient list." },
      { status: 500, headers: { "Cache-Control": "no-store, private" } },
    );
  }
}
