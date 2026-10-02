import { getClinicianSession } from "@/lib/clinical/auth";
import {
  buildHistoricalQuestionnairePreview,
  type HistoricalImportedCode,
} from "@/lib/clinical/imports/historical-questionnaire";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SUPPORTED = new Set<HistoricalImportedCode>(["bai", "ybocs", "pss"]);

export async function GET(request: Request) {
  const clinician = await getClinicianSession();
  if (!clinician) {
    return Response.json(
      { ok: false, error: "Authentication required." },
      { status: 401, headers: { "Cache-Control": "no-store, private" } },
    );
  }

  const { searchParams } = new URL(request.url);
  const code = String(searchParams.get("code") ?? "").trim().toLowerCase() as HistoricalImportedCode;
  if (!SUPPORTED.has(code)) {
    return Response.json(
      { ok: false, error: "Unsupported questionnaire." },
      { status: 400, headers: { "Cache-Control": "no-store, private" } },
    );
  }

  try {
    const preview = await buildHistoricalQuestionnairePreview(code);
    return Response.json(
      { ok: true, ...preview },
      { headers: { "Cache-Control": "no-store, private" } },
    );
  } catch {
    return Response.json(
      { ok: false, error: "Could not build the historical questionnaire preview." },
      { status: 500, headers: { "Cache-Control": "no-store, private" } },
    );
  }
}
