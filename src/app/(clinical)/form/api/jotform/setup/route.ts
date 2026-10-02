import { getClinicianSession } from "@/lib/clinical/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FORMS = [
  { code: "bdii", formId: "221126900055242" },
  { code: "bai", formId: "230814782284258" },
  { code: "ybocs", formId: "221134747183050" },
  { code: "pss", formId: "223175090048048" },
] as const;

function apiKey() {
  const value = process.env.JOTFORM_API_KEY?.trim();
  if (!value) throw new Error("JOTFORM_API_KEY is not configured.");
  return value;
}

function webhookSecret() {
  const value = process.env.JOTFORM_WEBHOOK_SECRET?.trim();
  if (!value) throw new Error("JOTFORM_WEBHOOK_SECRET is not configured.");
  return value;
}

async function getWebhooks(formId: string): Promise<string[]> {
  const response = await fetch(`https://api.jotform.com/form/${formId}/webhooks`, {
    headers: { APIKEY: apiKey() },
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Could not read Jotform webhooks.");
  const payload = (await response.json()) as { content?: unknown };
  if (Array.isArray(payload.content)) return payload.content.map(String);
  if (payload.content && typeof payload.content === "object") {
    return Object.values(payload.content as Record<string, unknown>).map(String);
  }
  return [];
}

async function addWebhook(formId: string, webhookURL: string) {
  const body = new URLSearchParams({ webhookURL });
  const url = new URL(`https://api.jotform.com/form/${formId}/webhooks`);
  url.searchParams.set("apiKey", apiKey());

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = (await response.text()).slice(0, 500);
    throw new Error(`Jotform webhook creation failed for form ${formId}: HTTP ${response.status} ${detail}`);
  }

  const payload = (await response.json()) as { responseCode?: number; message?: string };
  if (payload.responseCode !== 200) {
    throw new Error(
      `Jotform webhook creation failed for form ${formId}: ${payload.message ?? "unknown Jotform error"}`,
    );
  }
}

export async function GET(request: Request) {
  const clinician = await getClinicianSession();
  if (!clinician) return Response.json({ ok: false, error: "Authentication required." }, { status: 401 });

  try {
    const origin = new URL(request.url).origin;
    const targetBase = `${origin}/form/api/jotform/webhook/`;
    const rows = [];
    for (const form of FORMS) {
      const hooks = await getWebhooks(form.formId);
      rows.push({
        ...form,
        configured: hooks.some((url) => url.startsWith(targetBase)),
      });
    }
    return Response.json({ ok: true, forms: rows }, { headers: { "Cache-Control": "no-store, private" } });
  } catch {
    return Response.json({ ok: false, error: "Could not read Jotform webhook status." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const originHeader = request.headers.get("origin");
  if (originHeader && originHeader !== new URL(request.url).origin) {
    return Response.json({ ok: false, error: "Forbidden." }, { status: 403 });
  }

  const clinician = await getClinicianSession();
  if (!clinician) return Response.json({ ok: false, error: "Authentication required." }, { status: 401 });

  try {
    const origin = new URL(request.url).origin;
    const webhookURL = `${origin}/form/api/jotform/webhook/?secret=${encodeURIComponent(webhookSecret())}`;
    const results = [];

    for (const form of FORMS) {
      const hooks = await getWebhooks(form.formId);
      const exists = hooks.includes(webhookURL);
      if (!exists) await addWebhook(form.formId, webhookURL);
      results.push({ ...form, configured: true, changed: !exists });
    }

    return Response.json(
      { ok: true, forms: results },
      { headers: { "Cache-Control": "no-store, private" } },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not configure Jotform webhooks.";

    console.error("[jotform-setup]", message);

    const publicError =
      message.includes("JOTFORM_WEBHOOK_SECRET")
        ? "JOTFORM_WEBHOOK_SECRET is not configured in this deployment."
        : message.includes("JOTFORM_API_KEY")
          ? "JOTFORM_API_KEY is not configured in this deployment."
          : message.includes("form ")
            ? message
            : "Could not configure Jotform webhooks.";

    return Response.json(
      { ok: false, error: publicError },
      { status: 500, headers: { "Cache-Control": "no-store, private" } },
    );
  }
}
