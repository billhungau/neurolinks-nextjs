const VCITA_BASE_URL =
  process.env.VCITA_BASE_URL?.trim().replace(/\/+$/, "") ||
  "https://api.vcita.biz/platform/v1";

const NAME_DIRECTORY_TTL_MS = 2 * 60 * 1000;
const NAME_DIRECTORY_BATCH_PAGES = 5;
const NAME_DIRECTORY_MAX_PAGES = 10;

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

type CachedNameDirectory = {
  clients: VcitaClientSummary[];
  expiresAt: number;
};

let cachedNameDirectory: CachedNameDirectory | null = null;
let nameDirectoryPromise: Promise<VcitaClientSummary[]> | null = null;

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

function normalizeSearchText(value: string) {
  return value.trim().toLocaleLowerCase();
}

function nameMatches(client: VcitaClientSummary, normalized: string) {
  const first = normalizeSearchText(client.firstName);
  const last = normalizeSearchText(client.lastName);
  const full = `${first} ${last}`.trim();
  const reverse = `${last} ${first}`.trim();
  return first.includes(normalized) || last.includes(normalized) || full.includes(normalized) || reverse.includes(normalized);
}

async function fetchDirectoryPage(page: number) {
  const perPage = 100;
  const data = await vcitaRequest<unknown>(`clients?per_page=${perPage}&page=${page}`);
  const rows = extractClients(data);
  return {
    rows,
    clients: rows
      .map(normalizeClient)
      .filter((client): client is VcitaClientSummary => Boolean(client)),
  };
}

async function loadNameDirectory(): Promise<VcitaClientSummary[]> {
  if (cachedNameDirectory && cachedNameDirectory.expiresAt > Date.now()) {
    return cachedNameDirectory.clients;
  }
  if (nameDirectoryPromise) return nameDirectoryPromise;

  nameDirectoryPromise = (async () => {
    const byId = new Map<string, VcitaClientSummary>();

    for (let startPage = 1; startPage <= NAME_DIRECTORY_MAX_PAGES; startPage += NAME_DIRECTORY_BATCH_PAGES) {
      const pages = Array.from(
        { length: Math.min(NAME_DIRECTORY_BATCH_PAGES, NAME_DIRECTORY_MAX_PAGES - startPage + 1) },
        (_, index) => startPage + index,
      );

      const batch = await Promise.all(pages.map((page) => fetchDirectoryPage(page)));
      let reachedEnd = false;
      for (const page of batch) {
        for (const client of page.clients) byId.set(client.id, client);
        if (page.rows.length < 100) reachedEnd = true;
      }
      if (reachedEnd) break;
    }

    const clients = [...byId.values()];
    cachedNameDirectory = {
      clients,
      expiresAt: Date.now() + NAME_DIRECTORY_TTL_MS,
    };
    return clients;
  })();

  try {
    return await nameDirectoryPromise;
  } finally {
    nameDirectoryPromise = null;
  }
}

async function nameSearch(term: string) {
  const normalized = normalizeSearchText(term);

  // Try vcita's generic server-side search first because it is cheapest when it
  // works for the connected account.
  try {
    const direct = await vcitaRequest<unknown>(
      `clients?search_term=${encodeURIComponent(term)}&per_page=25&page=1`,
    );
    const directMatches = extractClients(direct)
      .map(normalizeClient)
      .filter((client): client is VcitaClientSummary => Boolean(client))
      .filter((client) => nameMatches(client, normalized))
      .slice(0, 20);
    if (directMatches.length > 0) return directMatches;
  } catch {
    // Fall through to the cached directory search.
  }

  // vcita name filtering is not reliable on this account. Load directory pages
  // in parallel, cache the normalized client list briefly in server memory, and
  // search locally. This preserves reliable name lookup without the previous
  // sequential 5-second page walk on every keystroke.
  const directory = await loadNameDirectory();
  return directory.filter((client) => nameMatches(client, normalized)).slice(0, 20);
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
