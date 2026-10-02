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

  return {
    id: user.id,
    email: user.email ?? null,
  };
}
