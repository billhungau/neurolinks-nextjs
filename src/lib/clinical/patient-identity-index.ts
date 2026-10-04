import { subjectKeyFromVcitaUuid } from "./pseudonym";
import { clinicalSupabaseRequest } from "./supabase";

export type PatientIdentityIndexRow = {
  subject_key: string;
  vcita_client_id: string;
  updated_at: string;
};

export async function upsertPatientIdentity(vcitaUuid: string, subjectKey?: string) {
  const id = vcitaUuid.trim();
  if (!id) return;
  const key = subjectKey ?? subjectKeyFromVcitaUuid(id);
  await clinicalSupabaseRequest<unknown>("patient_identity_index?on_conflict=subject_key", {
    method: "POST",
    prefer: "resolution=merge-duplicates,return=minimal",
    body: JSON.stringify({
      subject_key: key,
      vcita_client_id: id,
      updated_at: new Date().toISOString(),
    }),
  });
}

export async function upsertPatientIdentities(rows: Array<{ subjectKey: string; vcitaUuid: string }>) {
  const deduped = new Map<string, string>();
  for (const row of rows) {
    const subjectKey = row.subjectKey.trim();
    const vcitaUuid = row.vcitaUuid.trim();
    if (subjectKey && vcitaUuid) deduped.set(subjectKey, vcitaUuid);
  }
  if (!deduped.size) return;

  const updatedAt = new Date().toISOString();
  await clinicalSupabaseRequest<unknown>("patient_identity_index?on_conflict=subject_key", {
    method: "POST",
    prefer: "resolution=merge-duplicates,return=minimal",
    body: JSON.stringify(
      [...deduped.entries()].map(([subject_key, vcita_client_id]) => ({
        subject_key,
        vcita_client_id,
        updated_at: updatedAt,
      })),
    ),
  });
}

export async function patientIdentityRows(subjectKeys: string[]) {
  const keys = [...new Set(subjectKeys.map((value) => value.trim()).filter(Boolean))];
  if (!keys.length) return [] as PatientIdentityIndexRow[];
  const encoded = keys.map(encodeURIComponent).join(",");
  return clinicalSupabaseRequest<PatientIdentityIndexRow[]>(
    `patient_identity_index?select=subject_key,vcita_client_id,updated_at&subject_key=in.(${encoded})`,
    { method: "GET" },
  );
}
