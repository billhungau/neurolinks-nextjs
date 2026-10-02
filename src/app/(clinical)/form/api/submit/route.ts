import { resolveQuestionnaireInvitation } from "@/lib/clinical/invitation";
import { scoreBdi2Selections } from "@/lib/clinical/questionnaires/bdii";
import { BDI2_CODE } from "@/lib/clinical/questionnaires/bdii-definition";
import {
  isImportedCode,
  scoreImportedQuestionnaire,
} from "@/lib/clinical/questionnaires/jotform-import";
import { clinicalSupabaseRequest } from "@/lib/clinical/supabase";

export const runtime = "nodejs";

type Body = { token?: string; answers?: Record<string, unknown> };

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

  let scored;
  let storedAnswers: Record<string, unknown>;

  try {
    if (invitation.questionnaire.code === BDI2_CODE) {
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
          scoring_version: 1,
        }),
      },
    );

    const assessmentId = results[0]?.id;
    if (!assessmentId) throw new Error("No assessment id.");

    await clinicalSupabaseRequest<unknown>(
      `questionnaire_invitations?id=eq.${invitation.invitationId}&completed_at=is.null&revoked_at=is.null`,
      {
        method: "PATCH",
        prefer: "return=minimal",
        body: JSON.stringify({ completed_at: submittedAt }),
      },
    );

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
          item9_positive:
            invitation.questionnaire.code === BDI2_CODE
              ? Boolean(scored.clinicalFlags.bdii_item9_positive)
              : false,
        },
      }),
    });

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
