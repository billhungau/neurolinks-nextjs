import { timingSafeEqual } from "node:crypto";
import { after } from "next/server";
import { syncJotformSubmission } from "@/lib/clinical/jotform-sync";
import { clinicalSupabaseRequest } from "@/lib/clinical/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function secretMatches(provided: string, expected: string) {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function parseWebhook(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  let formId = "";
  let submissionId = "";

  if (contentType.includes("application/json")) {
    const body = (await request.json()) as Record<string, unknown>;
    formId = String(body.formID ?? body.formId ?? body.form_id ?? "");
    submissionId = String(body.submissionID ?? body.submissionId ?? body.submission_id ?? body.id ?? "");
  } else {
    const form = await request.formData();
    formId = String(form.get("formID") ?? form.get("formId") ?? form.get("form_id") ?? "");
    submissionId = String(form.get("submissionID") ?? form.get("submissionId") ?? form.get("submission_id") ?? form.get("id") ?? "");

    const raw = String(form.get("rawRequest") ?? "");
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        formId ||= String(parsed.formID ?? parsed.formId ?? parsed.form_id ?? "");
        submissionId ||= String(parsed.submissionID ?? parsed.submissionId ?? parsed.submission_id ?? parsed.id ?? "");
      } catch {}
    }
  }

  return { formId: formId.trim(), submissionId: submissionId.trim() };
}

export async function POST(request: Request) {
  const expected = process.env.JOTFORM_WEBHOOK_SECRET?.trim();
  if (!expected) {
    return Response.json({ ok: false, error: "Webhook is not configured." }, { status: 503 });
  }

  const provided =
    request.headers.get("x-jotform-webhook-secret")?.trim() ||
    new URL(request.url).searchParams.get("secret")?.trim() ||
    "";

  if (!provided || !secretMatches(provided, expected)) {
    return Response.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  let payload: { formId: string; submissionId: string };
  try {
    payload = await parseWebhook(request);
  } catch {
    return Response.json({ ok: false, error: "Invalid webhook payload." }, { status: 400 });
  }

  if (!/^\d+$/.test(payload.formId) || !/^\d+$/.test(payload.submissionId)) {
    return Response.json({ ok: false, error: "Missing form or submission ID." }, { status: 400 });
  }

  after(async () => {
    try {
      await syncJotformSubmission(payload);
    } catch {
      try {
        await clinicalSupabaseRequest<unknown>("audit_events", {
          method: "POST",
          prefer: "return=minimal",
          body: JSON.stringify({
            event_type: "JOTFORM_SYNC_ERROR",
            metadata: {
              source: "jotform",
              source_form_id: payload.formId,
              source_submission_id: payload.submissionId,
            },
          }),
        });
      } catch {}
    }
  });

  return Response.json(
    { ok: true, accepted: true },
    { status: 202, headers: { "Cache-Control": "no-store" } },
  );
}
