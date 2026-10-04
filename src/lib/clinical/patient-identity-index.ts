import { subjectKeyFromVcitaUuid } from "./pseudonym";
import { clinicalSupabaseRequest } from "./supabase";

export type PatientIdentityIndexRow = {
  subject_key: string;
  vcita_client_id: string;
  last_submission_at: string | null;
  updated_at: string;
};

export async function upsertPatientIdentity(
  vcitaUuid: string,
  subjectKey?: string,
  lastSubmissionAt?: string | null,
) {
  const id = vcitaUuid.trim();
  if (!id) return;
  const key = subjectKey ?? subjectKeyFromVcitaUuid(id);
  await clinicalSupabaseRequest<unknown>("patient_identity_index?on_conflict=subject_key", {
    method: "POST",
    prefer: "resolution=merge-duplicates,return=minimal",
    body: JSON.stringify({
      subject_key: key,
      vcita_client_id: id,
      ...(lastSubmissionAt ? { last_submission_at: lastSubmissionAt } : {}),
      updated_at: new Date().toISOString(),
    }),
  });
}

export async function upsertPatientIdentities(
  rows: Array<{ subjectKey: string; vcitaUuid: string; lastSubmissionAt?: string | null }>,
) {
  const deduped = new Map<string, { vcitaUuid: string; lastSubmissionAt?: string | null }>();
  for (const row of rows) {
    const subjectKey = row.subjectKey.trim();
    const vcitaUuid = row.vcitaUuid.trim();
    if (!subjectKey || !vcitaUuid) continue;

    const existing = deduped.get(subjectKey);
    if (!existing) {
      deduped.set(subjectKey, { vcitaUuid, lastSubmissionAt: row.lastSubmissionAt });
      continue;
    }

    const existingTime = existing.lastSubmissionAt ? Date.parse(existing.lastSubmissionAt) : Number.NEGATIVE_INFINITY;
    const incomingTime = row.lastSubmissionAt ? Date.parse(row.lastSubmissionAt) : Number.NEGATIVE_INFINITY;
    if (incomingTime > existingTime) {
      deduped.set(subjectKey, { vcitaUuid, lastSubmissionAt: row.lastSubmissionAt });
    }
  }
  if (!deduped.size) return;

  const updatedAt = new Date().toISOString();
  await clinicalSupabaseRequest<unknown>("patient_identity_index?on_conflict=subject_key", {
    method: "POST",
    prefer: "resolution=merge-duplicates,return=minimal",
    body: JSON.stringify(
      [...deduped.entries()].map(([subject_key, value]) => ({
        subject_key,
        vcita_client_id: value.vcitaUuid,
        ...(value.lastSubmissionAt ? { last_submission_at: value.lastSubmissionAt } : {}),
        updated_at: updatedAt,
      })),
    ),
  });
}

export async function touchPatientLastSubmission(subjectKey: string, submittedAt: string) {
  const key = subjectKey.trim();
  if (!key || !submittedAt) return;
  await clinicalSupabaseRequest<unknown>(
    `patient_identity_index?subject_key=eq.${encodeURIComponent(key)}`,
    {
      method: "PATCH",
      prefer: "return=minimal",
      body: JSON.stringify({
        last_submission_at: submittedAt,
        updated_at: new Date().toISOString(),
      }),
    },
  );
}

export async function patientIdentityRows(subjectKeys: string[]) {
  const keys = [...new Set(subjectKeys.map((value) => value.trim()).filter(Boolean))];
  if (!keys.length) return [] as PatientIdentityIndexRow[];
  const encoded = keys.map(encodeURIComponent).join(",");
  return clinicalSupabaseRequest<PatientIdentityIndexRow[]>(
    `patient_identity_index?select=subject_key,vcita_client_id,last_submission_at,updated_at&subject_key=in.(${encoded})`,
    { method: "GET" },
  );
}
