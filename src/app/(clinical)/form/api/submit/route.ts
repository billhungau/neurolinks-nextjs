import { resolveQuestionnaireInvitation } from "@/lib/clinical/invitation";
import { touchPatientLastSubmission } from "@/lib/clinical/patient-identity-index";
import { scoreBdi2Selections } from "@/lib/clinical/questionnaires/bdii";
import { BDI2_CODE, BDI2_ITEMS, bdi2OptionId } from "@/lib/clinical/questionnaires/bdii-definition";
import {
  isImportedCode,
  scoreImportedQuestionnaire,
} from "@/lib/clinical/questionnaires/jotform-import";
import { scoreNativeQuestionnaire } from "@/lib/clinical/questionnaires/native-builder";
import { PATIENT_INTAKE_CODE } from "@/lib/clinical/questionnaires/patient-intake";
import { clinicalSupabaseRequest } from "@/lib/clinical/supabase";

export const runtime = "nodejs";

type Body = { token?: string; answers?: Record<string, unknown> };

function compatibleNativeBdiAnswers(
  answers: Record<string, unknown>,
  schema: NonNullable<Awaited<ReturnType<typeof resolveQuestionnaireInvitation>>["questionnaire"]>["nativeSchema"],
) {
  const stored: Record<string, unknown> = {};
  const singleFields = (schema?.fields ?? []).filter((field) => field.kind === "single");

  singleFields.forEach((field, itemIndex) => {
    const canonicalItem = BDI2_ITEMS[itemIndex];
    if (!canonicalItem) return;

    const selected = String(answers[field.id] ?? "");
    const nativeOption = field.options.find((candidate) => candidate.id === selected);
    if (!nativeOption) return;

    let canonicalOptionIndex = canonicalItem.options.findIndex(
      (candidate) => candidate.value === nativeOption.score && candidate.label === nativeOption.label,
    );
    if (canonicalOptionIndex < 0) {
      const sameScore = canonicalItem.options
        .map((candidate, index) => ({ candidate, index }))
        .filter(({ candidate }) => candidate.value === nativeOption.score);
      if (sameScore.length === 1) canonicalOptionIndex = sameScore[0].index;
    }
    if (canonicalOptionIndex < 0) {
      const nativeIndex = field.options.findIndex((candidate) => candidate.id === selected);
      if (nativeIndex >= 0 && nativeIndex < canonicalItem.options.length) canonicalOptionIndex = nativeIndex;
    }

    const canonicalKey = canonicalItem.key;
    stored[canonicalKey] = {
      optionId: canonicalOptionIndex >= 0 ? bdi2OptionId(canonicalKey, canonicalOptionIndex) : undefined,
      score: nativeOption.score,
      text: nativeOption.label,
      legacyText: `${nativeOption.score}. ${nativeOption.label}`,
    };
  });

  return stored;
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return Response.json({ ok: false, error: "Forbidden." }, { status: 403 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const token = String(body.token ?? "");
  const invitation = await resolveQuestionnaireInvitation(token, { markOpened: false });
  if (invitation.status !== "valid" || !invitation.questionnaire || !invitation.invitationId || !invitation.subjectKey || !invitation.questionnaireId) {
    return Response.json({ ok: false, error: "This questionnaire link is no longer valid." }, { status: 400 });
  }

  if (invitation.questionnaire.code === PATIENT_INTAKE_CODE) {
    return Response.json(
      { ok: false, error: "Patient Intake must use the secure intake submission pathway." },
      { status: 409, headers: { "Cache-Control": "no-store" } },
    );
  }

  let scored: { total: number; severity: string | null; clinicalFlags: Record<string, unknown> };
  let storedAnswers: Record<string, unknown>;

  try {
    if (invitation.questionnaire.nativeSchema) {
      const native = scoreNativeQuestionnaire(invitation.questionnaire.nativeSchema, body.answers ?? {});
      scored = native;
      storedAnswers = invitation.questionnaire.code === BDI2_CODE
        ? compatibleNativeBdiAnswers(body.answers ?? {}, invitation.questionnaire.nativeSchema)
        : native.storedAnswers;
    } else if (invitation.questionnaire.code === BDI2_CODE) {
      const selections = Object.fromEntries(
        Object.entries(body.answers ?? {}).map(([key, value]) => [key, String(value ?? "")]),
      );
      const bdii = scoreBdi2Selections(selections);
      scored = bdii;
      storedAnswers = bdii.storedAnswers;
    } else if (
      isImportedCode(invitation.questionnaire.code) &&
      invitation.questionnaire.schema
    ) {
      scored = scoreImportedQuestionnaire(
        invitation.questionnaire.code,
        invitation.questionnaire.schema,
        body.answers ?? {},
      );
      storedAnswers = body.answers ?? {};
    } else {
      throw new Error("Unsupported questionnaire.");
    }
  } catch {
    return Response.json({ ok: false, error: "Please answer every required question." }, { status: 400 });
  }

  const submittedAt = new Date().toISOString();

  try {
    const results = await clinicalSupabaseRequest<Array<{ id: string }>>(
      "assessment_results?select=id",
      {
        method: "POST",
        prefer: "return=representation",
        body: JSON.stringify({
          subject_key: invitation.subjectKey,
          questionnaire_id: invitation.questionnaireId,
          invitation_id: invitation.invitationId,
          submitted_at: submittedAt,
          answers: storedAnswers,
          total_score: scored.total,
          severity: scored.severity,
          clinical_flags: scored.clinicalFlags,
          scoring_version: invitation.questionnaire.version,
        }),
      },
    );

    const assessmentId = results[0]?.id;
    if (!assessmentId) throw new Error("No assessment id.");

    try {
      await clinicalSupabaseRequest<unknown>(
        `questionnaire_invitations?id=eq.${invitation.invitationId}&completed_at=is.null&revoked_at=is.null`,
        {
          method: "PATCH",
          prefer: "return=minimal",
          body: JSON.stringify({ completed_at: submittedAt, token_ciphertext: null }),
        },
      );
    } catch {
      // Compatibility before token_ciphertext migration exists.
      await clinicalSupabaseRequest<unknown>(
        `questionnaire_invitations?id=eq.${invitation.invitationId}&completed_at=is.null&revoked_at=is.null`,
        {
          method: "PATCH",
          prefer: "return=minimal",
          body: JSON.stringify({ completed_at: submittedAt }),
        },
      );
    }

    await clinicalSupabaseRequest<unknown>("audit_events", {
      method: "POST",
      prefer: "return=minimal",
      body: JSON.stringify({
        event_type: "QUESTIONNAIRE_SUBMITTED",
        subject_key: invitation.subjectKey,
        invitation_id: invitation.invitationId,
        assessment_id: assessmentId,
        metadata: {
          questionnaire_code: invitation.questionnaire.code,
          questionnaire_version: invitation.questionnaire.version,
          source: invitation.questionnaire.nativeSchema ? "native" : "legacy",
        },
      }),
    });

    try {
      await touchPatientLastSubmission(invitation.subjectKey, submittedAt);
    } catch {}

    return Response.json(
      { ok: true, totalScore: scored.total, severity: scored.severity },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { ok: false, error: "This questionnaire could not be submitted. Please contact NeuroLinks." },
      { status: 409, headers: { "Cache-Control": "no-store" } },
    );
  }
}
