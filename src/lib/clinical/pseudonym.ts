import { createHmac } from "node:crypto";
import { clinicalConfig } from "./config";

const VCITA_SUBJECT_NAMESPACE = "neurolinks:vcita:v1";

function normalizeVcitaUuid(value: string): string {
  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    throw new Error("[clinical-pseudonym] vcita UUID is required.");
  }
  return normalized;
}

/**
 * Derives the stable pseudonymous patient identifier stored in the clinical
 * database. The vcita UUID itself is never stored in Supabase.
 */
export function subjectKeyFromVcitaUuid(vcitaUuid: string): string {
  const { pseudonymizationKeyV1 } = clinicalConfig();
  const normalized = normalizeVcitaUuid(vcitaUuid);

  return createHmac("sha256", pseudonymizationKeyV1)
    .update(`${VCITA_SUBJECT_NAMESPACE}:${normalized}`, "utf8")
    .digest("hex");
}
