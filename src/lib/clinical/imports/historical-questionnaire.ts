import { createHash } from "node:crypto";
import {
  ensureImportedQuestionnaire,
  IMPORTED_QUESTIONNAIRES,
  scoreImportedQuestionnaire,
  type ImportedField,
  type ImportedQuestionnaireCode,
  type ImportedQuestionnaireSchema,
} from "../questionnaires/jotform-import";
import { subjectKeyFromVcitaUuid } from "../pseudonym";
import { clinicalSupabaseRequest } from "../supabase";
import { listAllVcitaClients, type VcitaClientSummary } from "../vcita";
import {
  answerText,
  fetchAllBdiSubmissions,
  findAnswer,
  historicalImportTokenHash,
  normalizePatientName,
} from "./historical-bdii";

type JotformAnswer = {
  name?: string;
  text?: string;
  type?: string;
  answer?: unknown;
  prettyFormat?: string;
};

export type HistoricalSubmission = {
  id?: string;
  form_id?: string;
  created_at?: string;
  answers?: Record<string, JotformAnswer>;
};

type JotformEnvelope<T> = {
  responseCode?: number;
  content?: T;
};

export type HistoricalImportedCode = ImportedQuestionnaireCode;

export type HistoricalPreviewRow = {
  submissionId: string;
  submittedAt: string | null;
  jotformName: string;
  normalizedName: string;
  totalScore: number | null;
  alreadyImported: boolean;
  status: "unique_exact" | "ambiguous" | "no_match";
  matchBasis: "bdii_mapping" | "exact_name" | null;
  matches: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
  }>;
};

function jotformApiKey() {
  const key = process.env.JOTFORM_API_KEY?.trim();
  if (!key) throw new Error("[historical-import] JOTFORM_API_KEY is not configured.");
  return key;
}

function vcitaFullName(client: VcitaClientSummary) {
  return [client.firstName, client.lastName].filter(Boolean).join(" ").trim();
}

export function historicalQuestionnaireTokenHash(code: HistoricalImportedCode, submissionId: string) {
  return createHash("sha256")
    .update(`historical-jotform-${code}:${submissionId}`, "utf8")
    .digest("hex");
}

export async function fetchAllHistoricalQuestionnaireSubmissions(code: HistoricalImportedCode) {
  const formId = IMPORTED_QUESTIONNAIRES[code].jotformId;
  const all: HistoricalSubmission[] = [];
  const limit = 100;

  for (let offset = 0; offset < 5000; offset += limit) {
    const url = new URL(`https://api.jotform.com/form/${formId}/submissions`);
    url.searchParams.set("apiKey", jotformApiKey());
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("offset", String(offset));
    url.searchParams.set("orderby", "created_at");

    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`[historical-import] Jotform HTTP ${response.status}`);

    const payload = (await response.json()) as JotformEnvelope<HistoricalSubmission[]>;
    if (payload.responseCode !== 200 || !Array.isArray(payload.content)) {
      throw new Error("[historical-import] Invalid Jotform submissions response.");
    }

    all.push(...payload.content);
    if (payload.content.length < limit) break;
  }

  return all;
}

export async function fetchHistoricalSubmission(
  code: HistoricalImportedCode,
  submissionId: string,
): Promise<HistoricalSubmission | null> {
  const id = submissionId.trim();
  if (!/^\d+$/.test(id)) return null;

  const url = new URL(`https://api.jotform.com/submission/${id}`);
  url.searchParams.set("apiKey", jotformApiKey());

  const response = await fetch(url, { cache: "no-store" });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`[historical-import] Jotform HTTP ${response.status}`);

  const payload = (await response.json()) as JotformEnvelope<HistoricalSubmission>;
  if (payload.responseCode !== 200 || !payload.content) {
    throw new Error("[historical-import] Invalid Jotform submission response.");
  }

  const formId = String(
    Object.values(payload.content.answers ?? {}).find((answer) => answer.name === "formID")?.answer ?? "",
  );
  void formId;
  return payload.content;
}

function rawAnswerValue(answer: JotformAnswer | undefined): unknown {
  if (!answer) return "";
  if (answer.answer !== undefined && answer.answer !== null) return answer.answer;
  return answer.prettyFormat ?? "";
}

function findRawByQid(
  answers: Record<string, JotformAnswer>,
  qid: string,
): JotformAnswer | undefined {
  return answers[qid] ?? Object.entries(answers).find(([key]) => key === qid)?.[1];
}

function matrixAnswers(field: Extract<ImportedField, { kind: "matrix_radio" }>, raw: unknown) {
  const output: Record<string, string> = {};

  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const object = raw as Record<string, unknown>;
    field.rows.forEach((row, rowIndex) => {
      const direct = object[row];
      const numeric = object[String(rowIndex)];
      const oneBased = object[String(rowIndex + 1)];
      const value = direct ?? numeric ?? oneBased;
      output[`${field.qid}:${rowIndex}`] =
        typeof value === "string" || typeof value === "number"
          ? String(value)
          : "";
    });
    return output;
  }

  if (Array.isArray(raw)) {
    field.rows.forEach((_, rowIndex) => {
      output[`${field.qid}:${rowIndex}`] = String(raw[rowIndex] ?? "");
    });
    return output;
  }

  field.rows.forEach((_, rowIndex) => {
    output[`${field.qid}:${rowIndex}`] = "";
  });
  return output;
}

export function mapHistoricalSubmissionToSchema(
  submission: HistoricalSubmission,
  schema: ImportedQuestionnaireSchema,
) {
  const rawAnswers = submission.answers ?? {};
  const answers: Record<string, unknown> = {};

  for (const field of schema.fields) {
    if (field.kind === "display") continue;
    const raw = rawAnswerValue(findRawByQid(rawAnswers, field.qid));

    if (field.kind === "matrix_radio") {
      Object.assign(answers, matrixAnswers(field, raw));
    } else if (field.kind === "checkbox") {
      if (Array.isArray(raw)) answers[field.qid] = raw.map(String);
      else if (raw && typeof raw === "object") {
        answers[field.qid] = Object.values(raw as Record<string, unknown>)
          .filter((value) => Boolean(value))
          .map(String);
      } else {
        answers[field.qid] = raw ? [String(raw)] : [];
      }
    } else {
      answers[field.qid] =
        typeof raw === "string" || typeof raw === "number"
          ? String(raw)
          : answerText(findRawByQid(rawAnswers, field.qid));
    }
  }

  return answers;
}

export function historicalQuestionnaireTotal(code: HistoricalImportedCode, submission: HistoricalSubmission) {
  const answers = submission.answers ?? {};
  const labels =
    code === "ybocs"
      ? ["Total score", "Total Score"]
      : code === "pss"
        ? ["PSS total score", "Total Score"]
        : ["Total Score"];

  const value = Number(answerText(findAnswer(answers, labels)));
  return Number.isFinite(value) ? value : null;
}

export async function buildBdiMappingByHistoricalName(
  clients: VcitaClientSummary[],
): Promise<Map<string, VcitaClientSummary>> {
  const bdiSubmissions = await fetchAllBdiSubmissions();
  const ids = bdiSubmissions
    .map((submission) => String(submission.id ?? ""))
    .filter(Boolean);

  const inviteRows: Array<{ token_hash: string; subject_key: string }> = [];
  for (let i = 0; i < ids.length; i += 40) {
    const chunk = ids.slice(i, i + 40);
    const hashes = chunk.map(historicalImportTokenHash);
    const quoted = hashes.map((hash) => `"${hash}"`).join(",");
    const rows = await clinicalSupabaseRequest<
      Array<{ token_hash: string; subject_key: string }>
    >(
      `questionnaire_invitations?select=token_hash,subject_key&token_hash=in.(${encodeURIComponent(quoted)})`,
      { method: "GET" },
    );
    inviteRows.push(...rows);
  }

  const subjectToClient = new Map<string, VcitaClientSummary>();
  for (const client of clients) {
    subjectToClient.set(subjectKeyFromVcitaUuid(client.id), client);
  }

  const hashToSubject = new Map(
    inviteRows.map((row) => [row.token_hash, row.subject_key]),
  );

  const candidates = new Map<string, Set<string>>();
  for (const submission of bdiSubmissions) {
    const submissionId = String(submission.id ?? "");
    if (!submissionId) continue;

    const subjectKey = hashToSubject.get(historicalImportTokenHash(submissionId));
    if (!subjectKey) continue;

    const client = subjectToClient.get(subjectKey);
    if (!client) continue;

    const historicalName = answerText(
      findAnswer(submission.answers ?? {}, ["Full Name", "Name"]),
    );
    const normalized = normalizePatientName(historicalName);
    if (!normalized) continue;

    const existing = candidates.get(normalized) ?? new Set<string>();
    existing.add(client.id);
    candidates.set(normalized, existing);
  }

  const result = new Map<string, VcitaClientSummary>();
  for (const [name, idsForName] of candidates) {
    if (idsForName.size !== 1) continue;
    const clientId = [...idsForName][0];
    const client = clients.find((candidate) => candidate.id === clientId);
    if (client) result.set(name, client);
  }

  return result;
}

async function importedIds(code: HistoricalImportedCode, submissions: HistoricalSubmission[]) {
  const result = new Set<string>();
  const ids = submissions.map((submission) => String(submission.id ?? "")).filter(Boolean);

  for (let i = 0; i < ids.length; i += 40) {
    const chunk = ids.slice(i, i + 40);
    const hashes = chunk.map((id) => historicalQuestionnaireTokenHash(code, id));
    const quoted = hashes.map((hash) => `"${hash}"`).join(",");
    const rows = await clinicalSupabaseRequest<Array<{ token_hash: string }>>(
      `questionnaire_invitations?select=token_hash&token_hash=in.(${encodeURIComponent(quoted)})`,
      { method: "GET" },
    );
    const found = new Set(rows.map((row) => row.token_hash));
    chunk.forEach((id) => {
      if (found.has(historicalQuestionnaireTokenHash(code, id))) result.add(id);
    });
  }

  return result;
}

export async function buildHistoricalQuestionnairePreview(code: HistoricalImportedCode) {
  const [submissions, clients] = await Promise.all([
    fetchAllHistoricalQuestionnaireSubmissions(code),
    listAllVcitaClients({ maxPages: 50 }),
  ]);
  const [imported, bdiMapping] = await Promise.all([
    importedIds(code, submissions),
    buildBdiMappingByHistoricalName(clients),
  ]);

  const byName = new Map<string, VcitaClientSummary[]>();
  for (const client of clients) {
    const normalized = normalizePatientName(vcitaFullName(client));
    if (!normalized) continue;
    const rows = byName.get(normalized) ?? [];
    rows.push(client);
    byName.set(normalized, rows);
  }

  const rows: HistoricalPreviewRow[] = submissions.map((submission) => {
    const sourceName = answerText(findAnswer(submission.answers ?? {}, ["Full Name", "Name"]));
    const normalizedName = normalizePatientName(sourceName);
    const inherited = normalizedName ? bdiMapping.get(normalizedName) ?? null : null;
    const exactMatches = normalizedName ? byName.get(normalizedName) ?? [] : [];
    const matches = inherited ? [inherited] : exactMatches;
    const submissionId = String(submission.id ?? "");

    return {
      submissionId,
      submittedAt: submission.created_at ? String(submission.created_at) : null,
      jotformName: sourceName,
      normalizedName,
      totalScore: historicalQuestionnaireTotal(code, submission),
      alreadyImported: imported.has(submissionId),
      status:
        matches.length === 1
          ? "unique_exact"
          : matches.length > 1
            ? "ambiguous"
            : "no_match",
      matchBasis: inherited ? "bdii_mapping" : matches.length === 1 ? "exact_name" : null,
      matches: matches.map((client) => ({
        id: client.id,
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
        phone: client.phone,
      })),
    };
  });

  return {
    code,
    name: IMPORTED_QUESTIONNAIRES[code].name,
    generatedAt: new Date().toISOString(),
    submissionCount: submissions.length,
    vcitaClientCount: clients.length,
    summary: {
      uniqueExact: rows.filter((row) => row.status === "unique_exact").length,
      ambiguous: rows.filter((row) => row.status === "ambiguous").length,
      noMatch: rows.filter((row) => row.status === "no_match").length,
      alreadyImported: rows.filter((row) => row.alreadyImported).length,
    },
    rows,
  };
}

type QuestionnaireRow = {
  id: string;
  metadata?: { schema?: ImportedQuestionnaireSchema } | null;
};

async function questionnaireRegistry(code: HistoricalImportedCode) {
  await ensureImportedQuestionnaire(code);
  const rows = await clinicalSupabaseRequest<QuestionnaireRow[]>(
    `questionnaires?select=id,metadata&code=eq.${encodeURIComponent(code)}&order=version.desc&limit=1`,
    { method: "GET" },
  );
  const row = rows[0];
  const schema = row?.metadata?.schema;
  if (!row || !schema) throw new Error("[historical-import] Questionnaire registry missing.");
  return { id: row.id, schema };
}

export async function importHistoricalQuestionnaireRecord(input: {
  code: HistoricalImportedCode;
  submissionId: string;
  vcitaUuid: string;
  matchMode: "exact_name" | "bdii_mapping" | "historical_mapping" | "patient_link_token" | "manual";
  clinicianId?: string | null;
  eventType?: "HISTORICAL_RESULT_IMPORTED" | "JOTFORM_RESULT_SYNCED";
}) {
  const { code, submissionId, vcitaUuid, matchMode, clinicianId } = input;
  const [submission, registry] = await Promise.all([
    fetchHistoricalSubmission(code, submissionId),
    questionnaireRegistry(code),
  ]);

  if (!submission) throw new Error("Submission not found.");
  if (!submission.created_at) throw new Error("Submission date missing.");

  const mappedAnswers = mapHistoricalSubmissionToSchema(submission, registry.schema);
  const scored = scoreImportedQuestionnaire(code, registry.schema, mappedAnswers);
  const sourceTotal = historicalQuestionnaireTotal(code, submission);
  const totalScore = sourceTotal ?? scored.total;

  const subjectKeyModule = await import("../pseudonym");
  const { getVcitaClient } = await import("../vcita");
  const client = await getVcitaClient(vcitaUuid);
  if (!client) throw new Error("vcita patient not found.");

  if (matchMode === "exact_name") {
    const sourceName = answerText(findAnswer(submission.answers ?? {}, ["Full Name", "Name"]));
    const targetName = vcitaFullName(client);
    if (
      !sourceName ||
      normalizePatientName(sourceName) !== normalizePatientName(targetName)
    ) {
      throw new Error("Exact-name validation failed.");
    }
  }

  const subjectKey = subjectKeyModule.subjectKeyFromVcitaUuid(vcitaUuid);
  const hash = historicalQuestionnaireTokenHash(code, submissionId);

  const existingInvites = await clinicalSupabaseRequest<Array<{ id: string }>>(
    `questionnaire_invitations?select=id&token_hash=eq.${hash}&limit=1`,
    { method: "GET" },
  );

  let invitationId = existingInvites[0]?.id;
  if (!invitationId) {
    const submittedAt = new Date(submission.created_at);
    const expiresAt = new Date(submittedAt.getTime() + 24 * 60 * 60 * 1000).toISOString();

    const invites = await clinicalSupabaseRequest<Array<{ id: string }>>(
      "questionnaire_invitations?select=id",
      {
        method: "POST",
        prefer: "return=representation",
        body: JSON.stringify({
          subject_key: subjectKey,
          questionnaire_id: registry.id,
          token_hash: hash,
          created_at: submission.created_at,
          expires_at: expiresAt,
          opened_at: submission.created_at,
          completed_at: submission.created_at,
        }),
      },
    );
    invitationId = invites[0]?.id;
    if (!invitationId) throw new Error("Historical invitation creation failed.");
  }

  const existingResults = await clinicalSupabaseRequest<Array<{ id: string }>>(
    `assessment_results?select=id&invitation_id=eq.${invitationId}&limit=1`,
    { method: "GET" },
  );
  if (existingResults[0]) return { status: "already_imported" as const };

  const clinicalFlags = {
    ...scored.clinicalFlags,
    historical_import: input.eventType !== "JOTFORM_RESULT_SYNCED",
    live_jotform_sync: input.eventType === "JOTFORM_RESULT_SYNCED",
    source: "jotform",
  };

  const results = await clinicalSupabaseRequest<Array<{ id: string }>>(
    "assessment_results?select=id",
    {
      method: "POST",
      prefer: "return=representation",
      body: JSON.stringify({
        subject_key: subjectKey,
        questionnaire_id: registry.id,
        invitation_id: invitationId,
        submitted_at: submission.created_at,
        answers: mappedAnswers,
        total_score: totalScore,
        severity: null,
        clinical_flags: clinicalFlags,
        scoring_version: 1,
      }),
    },
  );

  const assessmentId = results[0]?.id;
  if (!assessmentId) throw new Error("Historical assessment creation failed.");

  await clinicalSupabaseRequest<unknown>("audit_events", {
    method: "POST",
    prefer: "return=minimal",
    body: JSON.stringify({
      event_type: input.eventType ?? "HISTORICAL_RESULT_IMPORTED",
      subject_key: subjectKey,
      invitation_id: invitationId,
      assessment_id: assessmentId,
      metadata: {
        questionnaire_code: code,
        source: "jotform",
        source_submission_id: submissionId,
        matched_by: matchMode,
        ...(clinicianId ? { clinician_user_id: clinicianId } : {}),
      },
    }),
  });

  return { status: "imported" as const, assessmentId };
}
