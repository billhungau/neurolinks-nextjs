import { getClinicianSession } from "@/lib/clinical/auth";
import { createQuestionnaireInvitation } from "@/lib/clinical/invitation";
import { upsertPatientIdentity } from "@/lib/clinical/patient-identity-index";
import { clinicalSupabaseRequest } from "@/lib/clinical/supabase";
import { getVcitaClient } from "@/lib/clinical/vcita";

export const runtime = "nodejs";

type RequestBody = {
  vcitaUuid?: string;
  questionnaireCode?: string;
  expiresInHours?: number;
  noExpiry?: boolean;
  allowDuplicateActive?: boolean;
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
  const noExpiry = Boolean(body.noExpiry);

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
      noExpiry,
      allowDuplicateActive: Boolean(body.allowDuplicateActive),
    });

    // The identity index is an optimization only. Never invalidate a clinical
    // invitation if this convenience index is unavailable or temporarily fails.
    try {
      await upsertPatientIdentity(vcitaUuid, invitation.subjectKey);
    } catch {}

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
            no_expiry: invitation.noExpiry,
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
      {
        ok: true,
        invitationId: invitation.invitationId,
        url,
        expiresAt: invitation.expiresAt,
        noExpiry: invitation.noExpiry,
      },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("Active invitation already exists")
    ) {
      return Response.json(
        {
          ok: false,
          error: "An active invitation for this questionnaire already exists for this patient. Revoke it before creating a replacement.",
          code: "ACTIVE_INVITATION_EXISTS",
        },
        { status: 409, headers: { "Cache-Control": "no-store" } },
      );
    }

    return Response.json(
      { ok: false, error: "Could not create questionnaire link." },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
