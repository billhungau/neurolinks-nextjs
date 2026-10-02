import { getClinicianSession } from "@/lib/clinical/auth";
import { subjectKeyFromVcitaUuid } from "@/lib/clinical/pseudonym";
import { clinicalSupabaseRequest } from "@/lib/clinical/supabase";

export const runtime = "nodejs";

type Body = { vcitaUuid?: string };

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return Response.json({ ok: false, error: "Forbidden." }, { status: 403 });
  }

  const clinician = await getClinicianSession();
  if (!clinician) {
    return Response.json({ ok: false, error: "Authentication required." }, { status: 401 });
  }

  const { id } = await context.params;
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const vcitaUuid = String(body.vcitaUuid ?? "").trim();
  if (!id || !vcitaUuid) {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  try {
    const subjectKey = subjectKeyFromVcitaUuid(vcitaUuid);
    const rows = await clinicalSupabaseRequest<Array<{ id: string }>>(
      `questionnaire_invitations?select=id&id=eq.${encodeURIComponent(id)}&subject_key=eq.${subjectKey}&completed_at=is.null&revoked_at=is.null&limit=1`,
      { method: "GET" },
    );

    if (!rows[0]) {
      return Response.json(
        { ok: false, error: "This invitation can no longer be revoked." },
        { status: 409 },
      );
    }

    const revokedAt = new Date().toISOString();
    await clinicalSupabaseRequest<unknown>(
      `questionnaire_invitations?id=eq.${encodeURIComponent(id)}&subject_key=eq.${subjectKey}&completed_at=is.null&revoked_at=is.null`,
      {
        method: "PATCH",
        prefer: "return=minimal",
        body: JSON.stringify({ revoked_at: revokedAt }),
      },
    );

    await clinicalSupabaseRequest<unknown>("audit_events", {
      method: "POST",
      prefer: "return=minimal",
      body: JSON.stringify({
        event_type: "INVITATION_REVOKED",
        subject_key: subjectKey,
        invitation_id: id,
        metadata: { clinician_user_id: clinician.id },
      }),
    });

    return Response.json(
      { ok: true, revokedAt },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { ok: false, error: "Could not revoke invitation." },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
