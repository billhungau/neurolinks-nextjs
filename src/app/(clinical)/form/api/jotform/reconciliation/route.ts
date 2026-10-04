import { getClinicianSession } from "@/lib/clinical/auth";
import { listUnresolvedJotformSyncs, syncJotformSubmission } from "@/lib/clinical/jotform-sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const clinician = await getClinicianSession();
  if (!clinician) {
    return Response.json({ ok: false, error: "Authentication required." }, { status: 401 });
  }

  try {
    const queue = await listUnresolvedJotformSyncs();
    return Response.json(
      { ok: true, queue },
      { headers: { "Cache-Control": "no-store, private" } },
    );
  } catch {
    return Response.json(
      { ok: false, error: "Could not load Jotform reconciliation queue." },
      { status: 500, headers: { "Cache-Control": "no-store, private" } },
    );
  }
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

  let body: { formId?: string; submissionId?: string; vcitaUuid?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const formId = String(body.formId ?? "").trim();
  const submissionId = String(body.submissionId ?? "").trim();
  const vcitaUuid = String(body.vcitaUuid ?? "").trim();

  if (!/^\d+$/.test(formId) || !/^\d+$/.test(submissionId)) {
    return Response.json({ ok: false, error: "Invalid reconciliation request." }, { status: 400 });
  }

  try {
    const result = await syncJotformSubmission({
      formId,
      submissionId,
      ...(vcitaUuid ? { manualVcitaUuid: vcitaUuid } : {}),
      actorId: clinician.id,
    });
    return Response.json(
      { ok: true, result },
      { headers: { "Cache-Control": "no-store, private" } },
    );
  } catch {
    return Response.json(
      { ok: false, error: "Could not reconcile this Jotform submission." },
      { status: 500, headers: { "Cache-Control": "no-store, private" } },
    );
  }
}
