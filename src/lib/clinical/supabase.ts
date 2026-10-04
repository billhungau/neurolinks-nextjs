import { clinicalConfig } from "./config";

type ClinicalSupabaseRequestInit = Omit<RequestInit, "cache"> & {
  prefer?: string;
};

function clinicalHeaders(
  serviceKey: string,
  initHeaders?: HeadersInit,
  prefer?: string,
): Headers {
  const headers = new Headers(initHeaders);
  headers.set("apikey", serviceKey);

  // New sb_secret_* keys are API keys rather than JWTs and must not be sent as
  // Bearer tokens. Legacy service_role keys are JWTs and continue to support
  // Authorization: Bearer for compatibility.
  if (!serviceKey.startsWith("sb_secret_")) {
    headers.set("Authorization", `Bearer ${serviceKey}`);
  }

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (prefer) headers.set("Prefer", prefer);
  return headers;
}

async function clinicalSupabaseFetch(
  path: string,
  init: ClinicalSupabaseRequestInit = {},
) {
  const { supabaseUrl, supabaseServiceKey } = clinicalConfig();
  const normalizedPath = path.replace(/^\/+/, "");
  const { prefer, headers: initHeaders, ...requestInit } = init;

  const response = await fetch(`${supabaseUrl}/rest/v1/${normalizedPath}`, {
    ...requestInit,
    headers: clinicalHeaders(supabaseServiceKey, initHeaders, prefer),
    cache: "no-store",
  });

  if (!response.ok) {
    // Deliberately do not include the response body: it can contain schema or
    // record details that should not be copied into application logs.
    throw new Error(
      `[clinical-supabase] Request failed with HTTP ${response.status}.`,
    );
  }

  return response;
}

/**
 * Server-only Data API helper for the clinical Supabase project.
 *
 * Never call this from a Client Component or pass the service key to browser
 * code. The key bypasses Row Level Security.
 */
export async function clinicalSupabaseRequest<T>(
  path: string,
  init: ClinicalSupabaseRequestInit = {},
): Promise<T> {
  const response = await clinicalSupabaseFetch(path, init);
  if (response.status === 204) return undefined as T;

  const text = await response.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

/**
 * GET helper for PostgREST queries that need an exact row count without
 * retrieving the entire result set. Use with Prefer: count=exact.
 */
export async function clinicalSupabaseRequestWithCount<T>(
  path: string,
  init: ClinicalSupabaseRequestInit = {},
): Promise<{ data: T; count: number | null }> {
  const prefer = init.prefer
    ? `${init.prefer},count=exact`
    : "count=exact";
  const response = await clinicalSupabaseFetch(path, { ...init, prefer });
  const contentRange = response.headers.get("content-range");
  const countPart = contentRange?.split("/")[1] ?? "";
  const parsedCount = countPart && countPart !== "*" ? Number(countPart) : NaN;

  if (response.status === 204) {
    return { data: undefined as T, count: Number.isFinite(parsedCount) ? parsedCount : null };
  }

  const text = await response.text();
  return {
    data: text ? JSON.parse(text) as T : undefined as T,
    count: Number.isFinite(parsedCount) ? parsedCount : null,
  };
}
