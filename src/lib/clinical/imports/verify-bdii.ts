import { BDI2_ITEMS } from "../questionnaires/bdii-definition";
import { subjectKeyFromVcitaUuid } from "../pseudonym";
import { clinicalSupabaseRequest } from "../supabase";
import { listAllVcitaClients, type VcitaClientSummary } from "../vcita";
import {
  answerText,
  fetchAllBdiSubmissions,
  findAnswer,
  historicalImportTokenHash,
  parseHistoricalBdiSubmission,
  type JotformSubmission,
} from "./historical-bdii";

type InvitationRow = {
  id: string;
  token_hash: string;
  subject_key: string;
  created_at: string;
  completed_at: string | null;
};

type ResultRow = {
  id: string;
  invitation_id: string;
  submitted_at: string;
  total_score: number;
  answers: Record<string, unknown>;
};

export type BdiVerificationRow = {
  submissionId: string;
  jotformName: string;
  vcitaPatient: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
  } | null;
  jotformDate: string | null;
  supabaseDate: string | null;
  jotformTotal: number | null;
  supabaseTotal: number | null;
  dateMatch: boolean;
  totalMatch: boolean;
  itemMismatchCount: number;
  itemMatchCount: number;
  status: "match" | "mismatch" | "not_imported";
};

export type BdiVerificationDetail = BdiVerificationRow & {
  items: Array<{
    key: string;
    title: string;
    jotformText: string;
    jotformScore: number | null;
    supabaseText: string;
    supabaseScore: number | null;
    textMatch: boolean;
    scoreMatch: boolean;
    match: boolean;
  }>;
};

function isoSecond(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return Math.floor(date.getTime() / 1000);
}

function normalizeText(value: string) {
  return value
    .normalize("NFKC")
    .replace(/[\u200B-\u200D\u2060\uFEFF]/g, "")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase();
}

function supabaseAnswer(raw: unknown) {
  if (typeof raw === "number") {
    return { text: "", score: raw };
  }
  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    return {
      text: typeof obj.legacyText === "string" ? obj.legacyText : "",
      score: typeof obj.score === "number" ? obj.score : null,
    };
  }
  return { text: "", score: null };
}

function sourceName(submission: JotformSubmission) {
  return answerText(findAnswer(submission.answers ?? {}, ["Full Name", "Name"]));
}

async function importedRecords(submissions: JotformSubmission[]) {
  const ids = submissions.map((s) => String(s.id ?? "")).filter(Boolean);
  const invitationRows: InvitationRow[] = [];

  for (let i = 0; i < ids.length; i += 40) {
    const chunk = ids.slice(i, i + 40);
    const hashes = chunk.map(historicalImportTokenHash);
    const quoted = hashes.map((hash) => `"${hash}"`).join(",");
    const rows = await clinicalSupabaseRequest<InvitationRow[]>(
      `questionnaire_invitations?select=id,token_hash,subject_key,created_at,completed_at&token_hash=in.(${encodeURIComponent(quoted)})`,
      { method: "GET" },
    );
    invitationRows.push(...rows);
  }

  const resultRows: ResultRow[] = [];
  const invitationIds = invitationRows.map((row) => row.id);
  for (let i = 0; i < invitationIds.length; i += 40) {
    const chunk = invitationIds.slice(i, i + 40);
    const quoted = chunk.map((id) => `"${id}"`).join(",");
    const rows = await clinicalSupabaseRequest<ResultRow[]>(
      `assessment_results?select=id,invitation_id,submitted_at,total_score,answers&invitation_id=in.(${encodeURIComponent(quoted)})`,
      { method: "GET" },
    );
    resultRows.push(...rows);
  }

  return {
    invitationsByHash: new Map(invitationRows.map((row) => [row.token_hash, row])),
    resultsByInvitation: new Map(resultRows.map((row) => [row.invitation_id, row])),
  };
}

async function subjectToClientMap(clients: VcitaClientSummary[]) {
  return new Map(clients.map((client) => [subjectKeyFromVcitaUuid(client.id), client]));
}

function compareOne(
  submission: JotformSubmission,
  invitation: InvitationRow | undefined,
  result: ResultRow | undefined,
  subjectToClient: Map<string, VcitaClientSummary>,
): BdiVerificationDetail {
  const submissionId = String(submission.id ?? "");
  let parsed: ReturnType<typeof parseHistoricalBdiSubmission> | null = null;
  try {
    parsed = parseHistoricalBdiSubmission(submission);
  } catch {
    parsed = null;
  }

  const items = BDI2_ITEMS.map((item) => {
    const source = parsed?.storedAnswers[item.key];
    const imported = supabaseAnswer(result?.answers?.[item.key]);
    const jotformText = source?.legacyText ?? "";
    const jotformScore = typeof source?.score === "number" ? source.score : null;
    const supabaseText = imported.text;
    const supabaseScore = imported.score;
    const textMatch =
      Boolean(jotformText) &&
      Boolean(supabaseText) &&
      normalizeText(jotformText) === normalizeText(supabaseText);
    const scoreMatch =
      jotformScore !== null &&
      supabaseScore !== null &&
      jotformScore === supabaseScore;

    return {
      key: item.key,
      title: item.title,
      jotformText,
      jotformScore,
      supabaseText,
      supabaseScore,
      textMatch,
      scoreMatch,
      match: textMatch && scoreMatch,
    };
  });

  const itemMatchCount = items.filter((item) => item.match).length;
  const itemMismatchCount = items.length - itemMatchCount;
  const jotformTotal = parsed?.totalScore ?? null;
  const supabaseTotal = typeof result?.total_score === "number" ? result.total_score : null;
  const jotformDate = submission.created_at ? String(submission.created_at) : null;
  const supabaseDate = result?.submitted_at ?? null;
  const dateMatch =
    isoSecond(jotformDate) !== null &&
    isoSecond(jotformDate) === isoSecond(supabaseDate);
  const totalMatch =
    jotformTotal !== null &&
    supabaseTotal !== null &&
    jotformTotal === supabaseTotal;

  const client = invitation ? subjectToClient.get(invitation.subject_key) ?? null : null;
  const status: BdiVerificationRow["status"] =
    !invitation || !result
      ? "not_imported"
      : dateMatch && totalMatch && itemMismatchCount === 0 && client
        ? "match"
        : "mismatch";

  return {
    submissionId,
    jotformName: sourceName(submission),
    vcitaPatient: client
      ? {
          id: client.id,
          firstName: client.firstName,
          lastName: client.lastName,
          email: client.email,
          phone: client.phone,
        }
      : null,
    jotformDate,
    supabaseDate,
    jotformTotal,
    supabaseTotal,
    dateMatch,
    totalMatch,
    itemMismatchCount,
    itemMatchCount,
    status,
    items,
  };
}

export async function buildBdiVerificationReport() {
  const [submissions, clients] = await Promise.all([
    fetchAllBdiSubmissions(),
    listAllVcitaClients({ maxPages: 50 }),
  ]);
  const [{ invitationsByHash, resultsByInvitation }, subjectToClient] = await Promise.all([
    importedRecords(submissions),
    subjectToClientMap(clients),
  ]);

  const details = submissions.map((submission) => {
    const id = String(submission.id ?? "");
    const invitation = invitationsByHash.get(historicalImportTokenHash(id));
    const result = invitation ? resultsByInvitation.get(invitation.id) : undefined;
    return compareOne(submission, invitation, result, subjectToClient);
  });

  const imported = details.filter((row) => row.status !== "not_imported");

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      totalJotform: details.length,
      imported: imported.length,
      fullMatches: imported.filter((row) => row.status === "match").length,
      mismatches: imported.filter((row) => row.status === "mismatch").length,
      notImported: details.filter((row) => row.status === "not_imported").length,
    },
    rows: details.map(({ items: _items, ...row }) => row),
    detailsBySubmission: new Map(details.map((row) => [row.submissionId, row])),
  };
}
