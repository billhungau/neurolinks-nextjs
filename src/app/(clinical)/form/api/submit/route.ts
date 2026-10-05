import { resolveQuestionnaireInvitation } from "@/lib/clinical/invitation";
import { patientIdentityRows, touchPatientLastSubmission } from "@/lib/clinical/patient-identity-index";
import { scoreBdi2Selections } from "@/lib/clinical/questionnaires/bdii";
import { BDI2_CODE, BDI2_ITEMS, bdi2OptionId } from "@/lib/clinical/questionnaires/bdii-definition";
import {
  isImportedCode,
  scoreImportedQuestionnaire,
} from "@/lib/clinical/questionnaires/jotform-import";
import { scoreNativeQuestionnaire } from "@/lib/clinical/questionnaires/native-builder";
import { PATIENT_INTAKE_CODE } from "@/lib/clinical/questionnaires/patient-intake";
import { clinicalSupabaseRequest } from "@/lib/clinical/supabase";
import { updateVcitaMatterPhnAndDob } from "@/lib/clinical/vcita";

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

function validDateOfBirth(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return false;
  return date.toISOString().slice(0, 10) === value && date.getTime() < Date.now();
}

function normalizePhn(value: string) {
  return value.replace(/\D/g, "");
}

async function completeInvitation(invitationId: string, completedAt: string) {
  try {
    await clinicalSupabaseRequest<unknown>(
      `questionnaire_invitations?id=eq.${invitationId}&completed_at=is.null&revoked_at=is.null`,
      {
        method: "PATCH",
        prefer: "return=minimal",
        body: JSON.stringify({ completed_at: completedAt, token_ciphertext: null }),
      },
    );
  } catch {
    await clinicalSupabaseRequest<unknown>(
      `questionnaire_invitations?id=eq.${invitationId}&completed_at=is.null&revoked_at=is.null`,
      {
        method: "PATCH",
        prefer: "return=minimal",
        body: JSON.stringify({ completed_at: completedAt }),
      },
    );
  }
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
    const answers = body.answers ?? {};
    const schema = invitation.questionnaire.nativeSchema;
    if (!schema) {
      return Response.json({ ok: false, error: "This intake form is not configured correctly." }, { status: 409 });
    }

    try {
      // Use the native validator so all fields marked required in the builder are
      // enforced, but do not persist these PHI-bearing answers in assessment_results.
      scoreNativeQuestionnaire(schema, answers);
    } catch {
      return Response.json({ ok: false, error: "Please answer every required question." }, { status: 400 });
    }

    const dateOfBirth = String(answers.date_of_birth ?? "").trim();
    const phn = normalizePhn(String(answers.phn ?? ""));
    if (!validDateOfBirth(dateOfBirth)) {
      return Response.json({ ok: false, error: "Please enter the date of birth as YYYY-MM-DD." }, { status: 400 });
    }
    if (phn.length !== 10) {
      return Response.json({ ok: false, error: "Please enter a valid 10-digit BC Personal Health Number." }, { status: 400 });
    }

    try {
      const identities = await patientIdentityRows([invitation.subjectKey]);
      const vcitaClientId = identities[0]?.vcita_client_id?.trim();
      if (!vcitaClientId) {
        return Response.json(
          { ok: false, error: "This intake link could not be matched to the patient record. Please contact NeuroLinks." },
          { status: 409, headers: { "Cache-Control": "no-store" } },
        );
      }

      // PHN and DOB are sent directly to the patient's vcita Matter. They are not
      // written to Supabase questionnaire results, logs, audit metadata, or browser storage.
      await updateVcitaMatterPhnAndDob(vcitaClientId, { phn, dateOfBirth });

      const submittedAt = new Date().toISOString();
      await completeInvitation(invitation.invitationId, submittedAt);
      await clinicalSupabaseRequest<unknown>("audit_events", {
        method: "POST",
        prefer: "return=minimal",
        body: JSON.stringify({
          event_type: "PATIENT_INTAKE_SUBMITTED",
          subject_key: invitation.subjectKey,
          invitation_id: invitation.invitationId,
          metadata: {
            questionnaire_code: PATIENT_INTAKE_CODE,
            questionnaire_version: invitation.questionnaire.version,
            destination: "vcita_matter",
            phi_persisted_in_assessment_results: false,
          },
        }),
      });
      try {
        await touchPatientLastSubmission(invitation.subjectKey, submittedAt);
      } catch {}

      return Response.json(
        { ok: true, totalScore: 0, severity: null },
        { status: 201, headers: { "Cache-Control": "no-store" } },
      );
    } catch {
      return Response.json(
        { ok: false, error: "Your intake could not be saved to the clinical record. Please contact NeuroLinks." },
        { status: 502, headers: { "Cache-Control": "no-store" } },
      );
    }
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

    await completeInvitation(invitation.invitationId, submittedAt);

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
