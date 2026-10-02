import { getClinicianSession } from "@/lib/clinical/auth";
import {
  importHistoricalQuestionnaireRecord,
  type HistoricalImportedCode,
} from "@/lib/clinical/imports/historical-questionnaire";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ImportRecord = {
  submissionId?: string;
  vcitaUuid?: string;
  matchMode?: "exact_name" | "bdii_mapping" | "manual";
};

type Body = {
  code?: string;
  records?: ImportRecord[];
};

const SUPPORTED = new Set<HistoricalImportedCode>(["bai", "ybocs", "pss"]);

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

  const code = String(body.code ?? "").trim().toLowerCase() as HistoricalImportedCode;
  if (!SUPPORTED.has(code)) {
    return Response.json({ ok: false, error: "Unsupported questionnaire." }, { status: 400 });
  }

  const records = Array.isArray(body.records) ? body.records : [];
  if (records.length < 1 || records.length > 20) {
    return Response.json(
      { ok: false, error: "Import batches must contain 1 to 20 records." },
      { status: 400 },
    );
  }

  const results = [];
  for (const raw of records) {
    const submissionId = String(raw.submissionId ?? "").trim();
    const vcitaUuid = String(raw.vcitaUuid ?? "").trim();
    const matchMode =
      raw.matchMode === "manual"
        ? "manual"
        : raw.matchMode === "bdii_mapping"
          ? "bdii_mapping"
          : "exact_name";

    if (!/^\d+$/.test(submissionId) || !vcitaUuid || vcitaUuid.length > 200) {
      results.push({ submissionId, status: "error", error: "Invalid import record." });
      continue;
    }

    try {
      const result = await importHistoricalQuestionnaireRecord({
        code,
        submissionId,
        vcitaUuid,
        matchMode,
        clinicianId: clinician.id,
      });
      results.push({ submissionId, ...result });
    } catch {
      results.push({ submissionId, status: "error", error: "Import failed." });
    }
  }

  return Response.json(
    { ok: true, results },
    { headers: { "Cache-Control": "no-store, private" } },
  );
}
