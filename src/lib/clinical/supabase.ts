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

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}
