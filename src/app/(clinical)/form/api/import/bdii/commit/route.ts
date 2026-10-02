import { getClinicianSession } from "@/lib/clinical/auth";
import {
  answerText,
  fetchBdiSubmissionById,
  findAnswer,
  historicalImportTokenHash,
  normalizePatientName,
  parseHistoricalBdiSubmission,
} from "@/lib/clinical/imports/historical-bdii";
import { subjectKeyFromVcitaUuid } from "@/lib/clinical/pseudonym";
import { ensureBdi2Registry } from "@/lib/clinical/questionnaires/bdii";
import { clinicalSupabaseRequest } from "@/lib/clinical/supabase";
import { getVcitaClient } from "@/lib/clinical/vcita";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ImportRecord = {
  submissionId?: string;
  vcitaUuid?: string;
  matchMode?: "exact_name" | "manual";
};

type Body = {
  records?: ImportRecord[];
};

type QuestionnaireRow = { id: string };

async function getBdiQuestionnaireId() {
  await ensureBdi2Registry();
  const rows = await clinicalSupabaseRequest<QuestionnaireRow[]>(
    "questionnaires?select=id&code=eq.bdii&order=version.desc&limit=1",
    { method: "GET" },
  );
  if (!rows[0]) throw new Error("BDI-II questionnaire registry missing.");
  return rows[0].id;
}

async function importOne(
  record: Required<ImportRecord>,
  questionnaireId: string,
  clinicianId: string,
) {
  const submission = await fetchBdiSubmissionById(record.submissionId);
  if (!submission) {
    return { submissionId: record.submissionId, status: "error", error: "Jotform submission not found." };
  }

  const client = await getVcitaClient(record.vcitaUuid);
  if (!client) {
    return { submissionId: record.submissionId, status: "error", error: "vcita patient not found." };
  }

  if (record.matchMode === "exact_name") {
    const sourceName = answerText(findAnswer(submission.answers ?? {}, ["Full Name", "Name"]));
    const targetName = [client.firstName, client.lastName].filter(Boolean).join(" ");
    if (
      !sourceName ||
      normalizePatientName(sourceName) !== normalizePatientName(targetName)
    ) {
      return {
        submissionId: record.submissionId,
        status: "error",
        error: "Exact-name validation failed.",
      };
    }
  }

  const parsed = parseHistoricalBdiSubmission(submission);
  if (!parsed.submittedAt) {
    return { submissionId: record.submissionId, status: "error", error: "Historical submission date missing." };
  }

  const subjectKey = subjectKeyFromVcitaUuid(record.vcitaUuid);
  const tokenHash = historicalImportTokenHash(record.submissionId);

  const existingInvites = await clinicalSupabaseRequest<Array<{ id: string }>>(
    `questionnaire_invitations?select=id&token_hash=eq.${tokenHash}&limit=1`,
    { method: "GET" },
  );

  let invitationId = existingInvites[0]?.id;

  if (!invitationId) {
    const submittedAt = new Date(parsed.submittedAt);
    const expiresAt = new Date(submittedAt.getTime() + 24 * 60 * 60 * 1000).toISOString();

    const invites = await clinicalSupabaseRequest<Array<{ id: string }>>(
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
    invitationId = invites[0]?.id;
    if (!invitationId) throw new Error("Historical invitation creation failed.");
  }

  const existingResults = await clinicalSupabaseRequest<Array<{ id: string }>>(
    `assessment_results?select=id&invitation_id=eq.${invitationId}&limit=1`,
    { method: "GET" },
  );

  if (existingResults[0]?.id) {
    return { submissionId: record.submissionId, status: "already_imported" };
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
        clinical_flags: parsed.clinicalFlags,
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
      event_type: "HISTORICAL_RESULT_IMPORTED",
      subject_key: subjectKey,
      invitation_id: invitationId,
      assessment_id: assessmentId,
      metadata: {
        questionnaire_code: "bdii",
        source: "jotform",
        source_submission_id: record.submissionId,
        matched_by: record.matchMode,
        clinician_user_id: clinicianId,
      },
    }),
  });

  return {
    submissionId: record.submissionId,
    status: "imported",
    assessmentId,
  };
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return Response.json({ ok: false, error: "Forbidden." }, { status: 403 });
  }

  const clinician = await getClinicianSession();
  if (!clinician) {
    return Response.json({ ok: false, error: "Authentication required." }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const records = Array.isArray(body.records) ? body.records : [];
  if (records.length < 1 || records.length > 20) {
    return Response.json(
      { ok: false, error: "Import batches must contain 1 to 20 records." },
      { status: 400 },
    );
  }

  const normalized: Required<ImportRecord>[] = [];
  for (const record of records) {
    const submissionId = String(record.submissionId ?? "").trim();
    const vcitaUuid = String(record.vcitaUuid ?? "").trim();
    const matchMode = record.matchMode === "manual" ? "manual" : "exact_name";

    if (!/^\d+$/.test(submissionId) || !vcitaUuid || vcitaUuid.length > 200) {
      return Response.json({ ok: false, error: "Invalid import record." }, { status: 400 });
    }

    normalized.push({ submissionId, vcitaUuid, matchMode });
  }

  try {
    const questionnaireId = await getBdiQuestionnaireId();
    const results = [];
    for (const record of normalized) {
      try {
        results.push(await importOne(record, questionnaireId, clinician.id));
      } catch {
        results.push({
          submissionId: record.submissionId,
          status: "error",
          error: "Import failed.",
        });
      }
    }

    return Response.json(
      { ok: true, results },
      { headers: { "Cache-Control": "no-store, private" } },
    );
  } catch {
    return Response.json(
      { ok: false, error: "Historical BDI-II import could not start." },
      { status: 500, headers: { "Cache-Control": "no-store, private" } },
    );
  }
}
