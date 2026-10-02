import { createHash } from "node:crypto";
import { BDI2_ITEMS, bdi2OptionId } from "../questionnaires/bdii-definition";
import { ensureBdi2Registry } from "../questionnaires/bdii";
import { subjectKeyFromVcitaUuid } from "../pseudonym";
import { getVcitaClient, listAllVcitaClients, type VcitaClientSummary } from "../vcita";
import { clinicalSupabaseRequest } from "../supabase";

const BDI2_JOTFORM_ID = "221126900055242";
const IMPORT_TOKEN_PREFIX = "historical-jotform-bdii:";

type JotformAnswer = {
  name?: string;
  text?: string;
  type?: string;
  answer?: unknown;
  prettyFormat?: string;
};

export type JotformSubmission = {
  id?: string;
  form_id?: string;
  created_at?: string;
  answers?: Record<string, JotformAnswer>;
};

type JotformEnvelope = {
  responseCode?: number;
  content?: JotformSubmission[];
};

export type HistoricalBdiPreviewRow = {
  submissionId: string;
  submittedAt: string | null;
  jotformName: string;
  normalizedName: string;
  totalScore: number | null;
  alreadyImported: boolean;
  status: "unique_exact" | "ambiguous" | "no_match";
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
  if (!key) throw new Error("[historical-bdii] JOTFORM_API_KEY is not configured.");
  return key;
}

export function answerText(answer: JotformAnswer | undefined): string {
  if (!answer) return "";
  const raw = answer.answer;
  if (typeof raw === "string") return raw.trim();
  if (typeof raw === "number") return String(raw);
  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    const first = String(obj.first ?? "").trim();
    const last = String(obj.last ?? "").trim();
    const full = [first, last].filter(Boolean).join(" ").trim();
    if (full) return full;
  }
  return String(answer.prettyFormat ?? "").trim();
}

function normalizeFieldLabel(value: string): string {
  return value
    .normalize("NFKC")
    .replace(/[\u200B-\u200D\u2060\uFEFF]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase();
}

export function findAnswer(
  answers: Record<string, JotformAnswer>,
  labels: string[],
): JotformAnswer | undefined {
  const targets = labels.map(normalizeFieldLabel);
  return Object.values(answers).find((answer) => {
    const text = normalizeFieldLabel(String(answer.text ?? ""));
    const name = normalizeFieldLabel(String(answer.name ?? ""));
    return targets.includes(text) || targets.includes(name);
  });
}

export function normalizePatientName(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function normalizeAnswer(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase();
}

function numericPrefix(value: string): number | null {
  const match = value.match(/^\s*([0-3])(?:[.\s:-]|$)/);
  return match ? Number(match[1]) : null;
}

function vcitaFullName(client: VcitaClientSummary) {
  return [client.firstName, client.lastName].filter(Boolean).join(" ").trim();
}

export function historicalImportTokenHash(submissionId: string) {
  return createHash("sha256")
    .update(`${IMPORT_TOKEN_PREFIX}${submissionId}`, "utf8")
    .digest("hex");
}

export async function fetchBdiSubmissionById(submissionId: string): Promise<JotformSubmission | null> {
  const id = submissionId.trim();
  if (!/^\d+$/.test(id)) return null;

  const url = new URL(`https://api.jotform.com/submission/${id}`);
  url.searchParams.set("apiKey", jotformApiKey());

  const response = await fetch(url, { cache: "no-store" });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`[historical-bdii] Jotform HTTP ${response.status}`);

  const payload = (await response.json()) as {
    responseCode?: number;
    content?: JotformSubmission;
  };
  if (payload.responseCode !== 200 || !payload.content) {
    throw new Error("[historical-bdii] Invalid Jotform submission response.");
  }
  return payload.content;
}

export async function fetchAllBdiSubmissions(): Promise<JotformSubmission[]> {
  const limit = 100;
  const all: JotformSubmission[] = [];

  for (let offset = 0; offset < 5000; offset += limit) {
    const url = new URL(`https://api.jotform.com/form/${BDI2_JOTFORM_ID}/submissions`);
    url.searchParams.set("apiKey", jotformApiKey());
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("offset", String(offset));
    url.searchParams.set("orderby", "created_at");

    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`[historical-bdii] Jotform HTTP ${response.status}`);
    }

    const payload = (await response.json()) as JotformEnvelope;
    if (payload.responseCode !== 200 || !Array.isArray(payload.content)) {
      throw new Error("[historical-bdii] Invalid Jotform submissions response.");
    }

    all.push(...payload.content);
    if (payload.content.length < limit) break;
  }

  return all;
}

async function importedSubmissionIds(submissions: JotformSubmission[]) {
  const result = new Set<string>();
  const ids = submissions.map((submission) => String(submission.id ?? "")).filter(Boolean);

  for (let i = 0; i < ids.length; i += 40) {
    const chunk = ids.slice(i, i + 40);
    const hashes = chunk.map(historicalImportTokenHash);
    const quoted = hashes.map((hash) => `"${hash}"`).join(",");
    const rows = await clinicalSupabaseRequest<Array<{ token_hash: string }>>(
      `questionnaire_invitations?select=token_hash&token_hash=in.(${encodeURIComponent(quoted)})`,
      { method: "GET" },
    );
    const found = new Set(rows.map((row) => row.token_hash));
    chunk.forEach((id) => {
      if (found.has(historicalImportTokenHash(id))) result.add(id);
    });
  }

  return result;
}

export function parseHistoricalBdiSubmission(submission: JotformSubmission) {
  const answers = submission.answers ?? {};
  const storedAnswers: Record<string, { legacyText: string; score: number; optionId?: string }> = {};
  const scores: number[] = [];

  for (const item of BDI2_ITEMS) {
    const raw = answerText(
      findAnswer(answers, [
        item.title,
        item.title.replace(/^\d+\.\s*/, ""),
      ]),
    );
    if (!raw) throw new Error("[historical-bdii] Missing BDI-II item.");

    let score = numericPrefix(raw);
    let matchedIndex = -1;

    if (score === null) {
      const normalizedRaw = normalizeAnswer(raw.replace(/^\s*[0-3][.\s:-]+/, ""));
      matchedIndex = item.options.findIndex(
        (option) => normalizeAnswer(option.label) === normalizedRaw,
      );
      if (matchedIndex >= 0) score = item.options[matchedIndex].value;
    } else {
      const normalizedRaw = normalizeAnswer(raw.replace(/^\s*[0-3][.\s:-]+/, ""));
      matchedIndex = item.options.findIndex(
        (option) =>
          option.value === score &&
          normalizeAnswer(option.label) === normalizedRaw,
      );
    }

    if (score === null || score < 0 || score > 3) {
      throw new Error("[historical-bdii] Could not determine item score.");
    }

    storedAnswers[item.key] = {
      legacyText: raw,
      score,
      ...(matchedIndex >= 0 ? { optionId: bdi2OptionId(item.key, matchedIndex) } : {}),
    };
    scores.push(score);
  }

  const calculatedTotal = scores.reduce((sum, score) => sum + score, 0);
  const totalRaw = answerText(findAnswer(answers, ["Total Score"]));
  const totalParsed = Number(totalRaw);
  const totalScore =
    Number.isInteger(totalParsed) && totalParsed >= 0 && totalParsed <= 63
      ? totalParsed
      : calculatedTotal;

  const item9Score = storedAnswers.q9.score;
  const severity =
    totalScore <= 13 ? "minimal" :
    totalScore <= 19 ? "mild" :
    totalScore <= 28 ? "moderate" : "severe";

  return {
    submissionId: String(submission.id ?? ""),
    submittedAt: submission.created_at ? String(submission.created_at) : null,
    storedAnswers,
    calculatedTotal,
    totalScore,
    severity,
    clinicalFlags: {
      bdii_item9_positive: item9Score > 0,
      bdii_item9_score: item9Score,
      historical_import: true,
      source: "jotform",
    },
  };
}

export async function buildHistoricalBdiPreview() {
  const [submissions, clients] = await Promise.all([
    fetchAllBdiSubmissions(),
    listAllVcitaClients({ maxPages: 50 }),
  ]);
  const imported = await importedSubmissionIds(submissions);

  const byName = new Map<string, VcitaClientSummary[]>();
  for (const client of clients) {
    const normalized = normalizePatientName(vcitaFullName(client));
    if (!normalized) continue;
    const existing = byName.get(normalized) ?? [];
    existing.push(client);
    byName.set(normalized, existing);
  }

  const rows: HistoricalBdiPreviewRow[] = submissions.map((submission) => {
    const answers = submission.answers ?? {};
    const name = answerText(findAnswer(answers, ["Full Name", "Name"]));
    const normalizedName = normalizePatientName(name);
    const matches = normalizedName ? byName.get(normalizedName) ?? [] : [];

    const totalRaw = answerText(findAnswer(answers, ["Total Score"]));
    const parsedTotal = Number(totalRaw);
    const totalScore = Number.isFinite(parsedTotal) ? parsedTotal : null;
    const submissionId = String(submission.id ?? "");

    return {
      submissionId,
      submittedAt: submission.created_at ? String(submission.created_at) : null,
      jotformName: name,
      normalizedName,
      totalScore,
      alreadyImported: imported.has(submissionId),
      status:
        matches.length === 1
          ? "unique_exact"
          : matches.length > 1
            ? "ambiguous"
            : "no_match",
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


export async function importHistoricalBdiRecord(input: {
  submissionId: string;
  vcitaUuid: string;
  matchMode: "exact_name" | "historical_mapping" | "patient_link_token" | "manual";
  actorId?: string | null;
  eventType?: "HISTORICAL_RESULT_IMPORTED" | "JOTFORM_RESULT_SYNCED";
}) {
  const submission = await fetchBdiSubmissionById(input.submissionId);
  if (!submission) throw new Error("Jotform submission not found.");

  const client = await getVcitaClient(input.vcitaUuid);
  if (!client) throw new Error("vcita patient not found.");

  if (input.matchMode === "exact_name") {
    const sourceName = answerText(findAnswer(submission.answers ?? {}, ["Full Name", "Name"]));
    const targetName = [client.firstName, client.lastName].filter(Boolean).join(" ");
    if (!sourceName || normalizePatientName(sourceName) !== normalizePatientName(targetName)) {
      throw new Error("Exact-name validation failed.");
    }
  }

  const parsed = parseHistoricalBdiSubmission(submission);
  if (!parsed.submittedAt) throw new Error("Submission date missing.");

  await ensureBdi2Registry();
  const questionnaires = await clinicalSupabaseRequest<Array<{ id: string }>>(
    "questionnaires?select=id&code=eq.bdii&order=version.desc&limit=1",
    { method: "GET" },
  );
  const questionnaireId = questionnaires[0]?.id;
  if (!questionnaireId) throw new Error("BDI-II questionnaire registry missing.");

  const subjectKey = subjectKeyFromVcitaUuid(input.vcitaUuid);
  const tokenHash = historicalImportTokenHash(input.submissionId);
  const existingInvites = await clinicalSupabaseRequest<Array<{ id: string }>>(
    `questionnaire_invitations?select=id&token_hash=eq.${tokenHash}&limit=1`,
    { method: "GET" },
  );

  let invitationId = existingInvites[0]?.id;
  if (!invitationId) {
    const submittedAt = new Date(parsed.submittedAt);
    const expiresAt = new Date(submittedAt.getTime() + 86400000).toISOString();
    const rows = await clinicalSupabaseRequest<Array<{ id: string }>>(
      "questionnaire_invitations?select=id",
      {
        method: "POST",
        prefer: "return=representation",
        body: JSON.stringify({
          subject_key: subjectKey,
          questionnaire_id: questionnaireId,
          token_hash: tokenHash,
          created_at: parsed.submittedAt,
          expires_at: expiresAt,
          opened_at: parsed.submittedAt,
          completed_at: parsed.submittedAt,
        }),
      },
    );
    invitationId = rows[0]?.id;
    if (!invitationId) throw new Error("Historical invitation creation failed.");
  }

  const existingResults = await clinicalSupabaseRequest<Array<{ id: string }>>(
    `assessment_results?select=id&invitation_id=eq.${invitationId}&limit=1`,
    { method: "GET" },
  );
  if (existingResults[0]?.id) {
    return { status: "already_imported" as const, assessmentId: existingResults[0].id };
  }

  const results = await clinicalSupabaseRequest<Array<{ id: string }>>(
    "assessment_results?select=id",
    {
      method: "POST",
      prefer: "return=representation",
      body: JSON.stringify({
        subject_key: subjectKey,
        questionnaire_id: questionnaireId,
        invitation_id: invitationId,
        submitted_at: parsed.submittedAt,
        answers: parsed.storedAnswers,
        total_score: parsed.totalScore,
        severity: parsed.severity,
        clinical_flags: {
          ...parsed.clinicalFlags,
          historical_import: input.eventType !== "JOTFORM_RESULT_SYNCED",
          live_jotform_sync: input.eventType === "JOTFORM_RESULT_SYNCED",
        },
        scoring_version: 1,
      }),
    },
  );
  const assessmentId = results[0]?.id;
  if (!assessmentId) throw new Error("Assessment creation failed.");

  await clinicalSupabaseRequest<unknown>("audit_events", {
    method: "POST",
    prefer: "return=minimal",
    body: JSON.stringify({
      event_type: input.eventType ?? "HISTORICAL_RESULT_IMPORTED",
      subject_key: subjectKey,
      invitation_id: invitationId,
      assessment_id: assessmentId,
      metadata: {
        questionnaire_code: "bdii",
        source: "jotform",
        source_submission_id: input.submissionId,
        matched_by: input.matchMode,
        ...(input.actorId ? { actor_id: input.actorId } : {}),
      },
    }),
  });

  return { status: "imported" as const, assessmentId };
}
