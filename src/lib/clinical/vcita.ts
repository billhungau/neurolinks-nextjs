const VCITA_BASE_URL =
  process.env.VCITA_BASE_URL?.trim().replace(/\/+$/, "") ||
  "https://api.vcita.biz/platform/v1";

type VcitaApiEnvelope<T> = {
  status?: string;
  data?: T;
  error?: string;
};

type RawVcitaClient = {
  id?: string;
  uid?: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  mobile_phone?: string | null;
  updated_at?: string | null;
};

export type VcitaClientSummary = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
};

function vcitaToken(): string {
  const token = process.env.VCITA_API_TOKEN?.trim();
  if (!token) throw new Error("[vcita] VCITA_API_TOKEN is not configured.");
  return token;
}

async function vcitaRequest<T>(path: string): Promise<T> {
  const response = await fetch(`${VCITA_BASE_URL}/${path.replace(/^\/+/, "")}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${vcitaToken()}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`[vcita] Request failed with HTTP ${response.status}.`);
  }

  const json = (await response.json()) as VcitaApiEnvelope<T>;
  if (json.status && json.status.toLowerCase() === "error") {
    throw new Error("[vcita] API returned an error.");
  }
  return (json.data ?? json) as T;
}

function normalizeClient(raw: RawVcitaClient): VcitaClientSummary | null {
  const id = String(raw.id ?? raw.uid ?? "").trim();
  if (!id) return null;
  return {
    id,
    firstName: String(raw.first_name ?? "").trim(),
    lastName: String(raw.last_name ?? "").trim(),
    email: raw.email ? String(raw.email) : null,
    phone: raw.mobile_phone ? String(raw.mobile_phone) : raw.phone ? String(raw.phone) : null,
  };
}

function extractClients(data: unknown): RawVcitaClient[] {
  if (Array.isArray(data)) return data as RawVcitaClient[];
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.clients)) return obj.clients as RawVcitaClient[];
    if (Array.isArray(obj.items)) return obj.items as RawVcitaClient[];
  }
  return [];
}

export async function getVcitaClient(clientId: string): Promise<VcitaClientSummary | null> {
  const id = clientId.trim();
  if (!id || id.length > 200) return null;

  try {
    const data = await vcitaRequest<unknown>(`clients/${encodeURIComponent(id)}`);
    const raw =
      data && typeof data === "object" && "client" in (data as Record<string, unknown>)
        ? (data as Record<string, unknown>).client
        : data;
    return normalizeClient((raw ?? {}) as RawVcitaClient);
  } catch (error) {
    if (error instanceof Error && error.message.includes("HTTP 404")) return null;
    throw error;
  }
}

async function directSearch(searchBy: "email" | "phone", term: string) {
  const data = await vcitaRequest<unknown>(
    `clients?search_term=${encodeURIComponent(term)}&search_by=${searchBy}&per_page=25&page=1`,
  );
  return extractClients(data)
    .map(normalizeClient)
    .filter((client): client is VcitaClientSummary => Boolean(client));
}

function nameMatches(client: VcitaClientSummary, normalized: string) {
  const fullName = `${client.firstName} ${client.lastName}`.trim().toLocaleLowerCase();
  return fullName.includes(normalized);
}

async function nameSearch(term: string) {
  const normalized = term.toLocaleLowerCase();
  const encoded = encodeURIComponent(term);

  // Keep name lookup server-side. Directory walking made a single search fan out
  // to as many as five 100-client vcita requests and commonly took several
  // seconds. Try the generic search plus likely name-specific variants in
  // parallel, then merge/de-duplicate only genuine local name matches.
  const attempts = await Promise.allSettled([
    vcitaRequest<unknown>(`clients?search_term=${encoded}&per_page=25&page=1`),
    vcitaRequest<unknown>(`clients?search_term=${encoded}&search_by=name&per_page=25&page=1`),
    vcitaRequest<unknown>(`clients?search_term=${encoded}&search_by=first_name&per_page=25&page=1`),
    vcitaRequest<unknown>(`clients?search_term=${encoded}&search_by=last_name&per_page=25&page=1`),
  ]);

  const byId = new Map<string, VcitaClientSummary>();
  for (const attempt of attempts) {
    if (attempt.status !== "fulfilled") continue;
    for (const raw of extractClients(attempt.value)) {
      const client = normalizeClient(raw);
      if (!client || !nameMatches(client, normalized)) continue;
      byId.set(client.id, client);
      if (byId.size >= 20) break;
    }
    if (byId.size >= 20) break;
  }

  return [...byId.values()].slice(0, 20);
}

export async function searchVcitaClients(term: string): Promise<VcitaClientSummary[]> {
  const q = term.trim();
  if (q.length < 2 || q.length > 120) return [];

  if (q.includes("@")) return directSearch("email", q);

  const digits = q.replace(/\D/g, "");
  if (digits.length >= 7) return directSearch("phone", q);

  return nameSearch(q);
}

export async function listRecentVcitaClients(limit = 50): Promise<VcitaClientSummary[]> {
  const safeLimit = Math.max(1, Math.min(limit, 50));
  const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
  const data = await vcitaRequest<unknown>(
    `clients?updated_at%5Bgte%5D=${encodeURIComponent(since)}&per_page=${safeLimit}&page=1`,
  );

  return extractClients(data)
    .sort((a, b) => {
      const aTime = a.updated_at ? Date.parse(a.updated_at) : 0;
      const bTime = b.updated_at ? Date.parse(b.updated_at) : 0;
      return bTime - aTime;
    })
    .map(normalizeClient)
    .filter((client): client is VcitaClientSummary => Boolean(client))
    .slice(0, safeLimit);
}

export async function listAllVcitaClients(options: { maxPages?: number } = {}): Promise<VcitaClientSummary[]> {
  const maxPages = Math.max(1, Math.min(options.maxPages ?? 50, 100));
  const perPage = 100;
  const clients: VcitaClientSummary[] = [];
  const seen = new Set<string>();

  for (let page = 1; page <= maxPages; page += 1) {
    const data = await vcitaRequest<unknown>(`clients?per_page=${perPage}&page=${page}`);
    const rows = extractClients(data);

    for (const raw of rows) {
      const client = normalizeClient(raw);
      if (!client || seen.has(client.id)) continue;
      seen.add(client.id);
      clients.push(client);
    }

    if (rows.length < perPage) break;
  }

  return clients;
}
