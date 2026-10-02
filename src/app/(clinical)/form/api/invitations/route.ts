import { getClinicianSession } from "@/lib/clinical/auth";
import { createQuestionnaireInvitation } from "@/lib/clinical/invitation";
import { clinicalSupabaseRequest } from "@/lib/clinical/supabase";
import { getVcitaClient } from "@/lib/clinical/vcita";

export const runtime = "nodejs";

type RequestBody = {
  vcitaUuid?: string;
  questionnaireCode?: string;
  expiresInHours?: number;
};

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return Response.json({ ok: false, error: "Forbidden." }, { status: 403 });
  }

  const clinician = await getClinicianSession();
  if (!clinician) {
    return Response.json({ ok: false, error: "Authentication required." }, { status: 401 });
  }

  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const vcitaUuid = String(body.vcitaUuid ?? "").trim();
  const questionnaireCode = String(body.questionnaireCode ?? "bdii").trim().toLowerCase();
  const expiresInHours = Number(body.expiresInHours ?? 72);

  if (!vcitaUuid || vcitaUuid.length > 200) {
    return Response.json({ ok: false, error: "A valid vcita client UUID is required." }, { status: 400 });
  }

  try {
    const vcitaClient = await getVcitaClient(vcitaUuid);
    if (!vcitaClient) {
      return Response.json({ ok: false, error: "The selected vcita patient could not be found." }, { status: 400 });
    }

    const invitation = await createQuestionnaireInvitation({
      vcitaUuid,
      questionnaireCode,
      expiresInHours,
    });

    try {
      await clinicalSupabaseRequest<unknown>("audit_events", {
        method: "POST",
        prefer: "return=minimal",
        body: JSON.stringify({
          event_type: "INVITATION_CREATED",
          subject_key: invitation.subjectKey,
          invitation_id: invitation.invitationId,
          metadata: {
            questionnaire_code: questionnaireCode,
            clinician_user_id: clinician.id,
          },
        }),
      });
    } catch {
      await clinicalSupabaseRequest<unknown>(
        `questionnaire_invitations?id=eq.${invitation.invitationId}&revoked_at=is.null&completed_at=is.null`,
        {
          method: "PATCH",
          prefer: "return=minimal",
          body: JSON.stringify({ revoked_at: new Date().toISOString() }),
        },
      );
      throw new Error("Audit write failed.");
    }

    const url = new URL(invitation.path, request.url).toString();

    return Response.json(
      { ok: true, url, expiresAt: invitation.expiresAt },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { ok: false, error: "Could not create questionnaire link." },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
