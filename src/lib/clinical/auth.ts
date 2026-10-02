import { cookies } from "next/headers";
import { clinicalConfig } from "./config";

export const CLINICIAN_ACCESS_COOKIE = "nl_clinician_access";

export type ClinicianSession = {
  id: string;
  email: string | null;
};

type SupabaseUser = {
  id: string;
  email?: string | null;
};

export async function getClinicianSession(): Promise<ClinicianSession | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(CLINICIAN_ACCESS_COOKIE)?.value;
  if (!accessToken) return null;

  const { supabaseUrl, supabaseServiceKey } = clinicalConfig();

  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    method: "GET",
    headers: {
      apikey: supabaseServiceKey,
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) return null;

  const user = (await response.json()) as SupabaseUser;
  if (!user.id) return null;

  const email = user.email?.trim().toLowerCase() ?? null;
  const allowlist = process.env.CLINICIAN_EMAIL_ALLOWLIST
    ?.split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  // Once configured, only explicitly approved clinician emails may access
  // the clinical dashboard and APIs. Leaving it unset preserves access during
  // setup so an environment-variable mistake does not immediately lock out
  // the existing clinician account.
  if (allowlist && allowlist.length > 0) {
    if (!email || !allowlist.includes(email)) return null;
  }

  return {
    id: user.id,
    email,
  };
}
