import { IMPORTED_QUESTIONNAIRES, type ImportedQuestionnaireCode } from "./questionnaires/jotform-import";
import { clinicalSupabaseRequest } from "./supabase";
import { getVcitaClient, listAllVcitaClients, type VcitaClientSummary } from "./vcita";
import { upsertPatientIdentity } from "./patient-identity-index";
import {
  answerText,
  fetchBdiSubmissionById,
  findAnswer,
  importHistoricalBdiRecord,
  normalizePatientName,
} from "./imports/historical-bdii";
import {
  buildBdiMappingByHistoricalName,
  fetchHistoricalSubmission,
  importHistoricalQuestionnaireRecord,
  type HistoricalImportedCode,
} from "./imports/historical-questionnaire";

export type SyncQuestionnaireCode = "bdii" | ImportedQuestionnaireCode;

const BDI_FORM_ID = "221126900055242";
const FORM_TO_CODE: Record<string, SyncQuestionnaireCode> = {
  [BDI_FORM_ID]: "bdii",
  [IMPORTED_QUESTIONNAIRES.bai.jotformId]: "bai",
  [IMPORTED_QUESTIONNAIRES.ybocs.jotformId]: "ybocs",
  [IMPORTED_QUESTIONNAIRES.pss.jotformId]: "pss",
};

function fullName(client: VcitaClientSummary) {
  return [client.firstName, client.lastName].filter(Boolean).join(" ").trim();
}

async function fetchSubmission(code: SyncQuestionnaireCode, submissionId: string) {
  return code === "bdii"
    ? fetchBdiSubmissionById(submissionId)
    : fetchHistoricalSubmission(code as HistoricalImportedCode, submissionId);
}

function sourceName(submission: { answers?: Record<string, any> }) {
  return answerText(findAnswer(submission.answers ?? {}, ["Full Name", "Name"]));
}

function patientLinkToken(submission: { answers?: Record<string, any> }) {
  return answerText(findAnswer(submission.answers ?? {}, ["Patient Link Token"]));
}

async function exactNameMatch(name: string, clients: VcitaClientSummary[]): Promise<VcitaClientSummary | null> {
  const normalized = normalizePatientName(name);
  if (!normalized) return null;
  const matches = clients.filter((client) => normalizePatientName(fullName(client)) === normalized);
  return matches.length === 1 ? matches[0] : null;
}

async function resolvePatient(submission: { answers?: Record<string, any> }): Promise<{
  client: VcitaClientSummary | null;
  matchMode: "patient_link_token" | "historical_mapping" | "exact_name" | null;
  reason: string | null;
}> {
  const token = patientLinkToken(submission);
  if (token) {
    try {
      const direct = await getVcitaClient(token);
      if (direct) return { client: direct, matchMode: "patient_link_token", reason: null };
    } catch {}
  }

  const clients = await listAllVcitaClients({ maxPages: 50 });
  const name = sourceName(submission);
  const normalized = normalizePatientName(name);

  if (normalized) {
    const exact = await exactNameMatch(name, clients);
    if (exact) return { client: exact, matchMode: "exact_name", reason: null };

    const historicalMap = await buildBdiMappingByHistoricalName(clients);
    const inherited = historicalMap.get(normalized);
    if (inherited) return { client: inherited, matchMode: "historical_mapping", reason: null };
  }

  return { client: null, matchMode: null, reason: !name ? "missing_name" : "patient_not_resolved" };
}

async function alreadyResolved(submissionId: string) {
  const rows = await clinicalSupabaseRequest<Array<{ id: string; event_type: string }>>(
    `audit_events?select=id,event_type&metadata->>source_submission_id=eq.${encodeURIComponent(submissionId)}&event_type=in.(JOTFORM_RESULT_SYNCED,JOTFORM_SYNC_RESOLVED)&limit=1`,
    { method: "GET" },
  );
  return rows.length > 0;
}

export async function recordUnresolvedJotformSync(input: {
  code: SyncQuestionnaireCode;
  formId: string;
  submissionId: string;
  reason: string;
}) {
  if (await alreadyResolved(input.submissionId)) return;
  await clinicalSupabaseRequest<unknown>("audit_events", {
    method: "POST",
    prefer: "return=minimal",
    body: JSON.stringify({
      event_type: "JOTFORM_SYNC_UNRESOLVED",
      metadata: {
        questionnaire_code: input.code,
        source: "jotform",
        source_form_id: input.formId,
        source_submission_id: input.submissionId,
        reason: input.reason,
      },
    }),
  });
}

export function codeForJotformForm(formId: string): SyncQuestionnaireCode | null {
  return FORM_TO_CODE[formId] ?? null;
}

export async function syncJotformSubmission(input: {
  formId: string;
  submissionId: string;
  actorId?: string | null;
  manualVcitaUuid?: string | null;
}) {
  const code = codeForJotformForm(input.formId);
  if (!code) return { status: "ignored" as const, reason: "unsupported_form" };

  const submission = await fetchSubmission(code, input.submissionId);
  if (!submission) return { status: "error" as const, reason: "submission_not_found" };
  if (submission.form_id && String(submission.form_id) !== input.formId) {
    return { status: "error" as const, reason: "form_submission_mismatch" };
  }

  let client: VcitaClientSummary | null = null;
  let matchMode: "patient_link_token" | "historical_mapping" | "exact_name" | "manual" | null = null;

  if (input.manualVcitaUuid) {
    client = await getVcitaClient(input.manualVcitaUuid);
    matchMode = client ? "manual" : null;
  } else {
    const resolved = await resolvePatient(submission);
    client = resolved.client;
    matchMode = resolved.matchMode;
    if (!client || !matchMode) {
      await recordUnresolvedJotformSync({ code, formId: input.formId, submissionId: input.submissionId, reason: resolved.reason ?? "patient_not_resolved" });
      return { status: "unresolved" as const, reason: resolved.reason ?? "patient_not_resolved" };
    }
  }

  if (!client || !matchMode) {
    await recordUnresolvedJotformSync({ code, formId: input.formId, submissionId: input.submissionId, reason: "manual_patient_not_found" });
    return { status: "unresolved" as const, reason: "manual_patient_not_found" };
  }

  const result = code === "bdii"
    ? await importHistoricalBdiRecord({
        submissionId: input.submissionId,
        vcitaUuid: client.id,
        matchMode,
        actorId: input.actorId ?? null,
        eventType: "JOTFORM_RESULT_SYNCED",
      })
    : await importHistoricalQuestionnaireRecord({
        code,
        submissionId: input.submissionId,
        vcitaUuid: client.id,
        matchMode,
        clinicianId: input.actorId ?? null,
        eventType: "JOTFORM_RESULT_SYNCED",
      });

  // The identity index is only a performance optimization. Never allow an index
  // write failure to make an otherwise valid Jotform questionnaire sync fail.
  if (result.status === "imported" || result.status === "already_imported") {
    try {
      await upsertPatientIdentity(client.id);
    } catch {}
  }

  if (result.status === "imported" && input.manualVcitaUuid) {
    await clinicalSupabaseRequest<unknown>("audit_events", {
      method: "POST",
      prefer: "return=minimal",
      body: JSON.stringify({
        event_type: "JOTFORM_SYNC_RESOLVED",
        metadata: {
          questionnaire_code: code,
          source: "jotform",
          source_form_id: input.formId,
          source_submission_id: input.submissionId,
        },
      }),
    });
  }

  return {
    status: result.status === "already_imported" ? "already_synced" as const : "synced" as const,
    code,
    vcitaUuid: client.id,
    assessmentId: result.assessmentId,
  };
}

export async function listUnresolvedJotformSyncs() {
  const pending = await clinicalSupabaseRequest<Array<{
    id: string;
    event_type: string;
    occurred_at: string;
    metadata: Record<string, unknown> | null;
  }>>(
    "audit_events?select=id,event_type,occurred_at,metadata&event_type=in.(JOTFORM_SYNC_UNRESOLVED,JOTFORM_SYNC_ERROR)&order=occurred_at.desc&limit=500",
    { method: "GET" },
  );

  const resolved = await clinicalSupabaseRequest<Array<{ metadata: Record<string, unknown> | null }>>(
    "audit_events?select=metadata&event_type=in.(JOTFORM_RESULT_SYNCED,JOTFORM_SYNC_RESOLVED)&order=occurred_at.desc&limit=1000",
    { method: "GET" },
  );

  const resolvedIds = new Set(resolved.map((row) => String(row.metadata?.source_submission_id ?? "")).filter(Boolean));
  const seen = new Set<string>();
  const queue = [];

  for (const row of pending) {
    const submissionId = String(row.metadata?.source_submission_id ?? "");
    const formId = String(row.metadata?.source_form_id ?? "");
    const code = (String(row.metadata?.questionnaire_code ?? "") || codeForJotformForm(formId) || "") as SyncQuestionnaireCode;
    if (!submissionId || !formId || !code || resolvedIds.has(submissionId) || seen.has(submissionId)) continue;
    seen.add(submissionId);

    const submission = await fetchSubmission(code, submissionId);
    queue.push({
      id: row.id,
      occurredAt: row.occurred_at,
      submissionId,
      formId,
      code,
      reason: row.event_type === "JOTFORM_SYNC_ERROR" ? "sync_error" : String(row.metadata?.reason ?? "patient_not_resolved"),
      jotformName: submission ? sourceName(submission) : "",
    });
  }

  return queue;
}
