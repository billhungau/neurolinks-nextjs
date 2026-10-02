import { getClinicianSession } from "@/lib/clinical/auth";
import { buildHistoricalBdiPreview } from "@/lib/clinical/imports/historical-bdii";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const clinician = await getClinicianSession();
  if (!clinician) {
    return Response.json(
      { ok: false, error: "Authentication required." },
      { status: 401, headers: { "Cache-Control": "no-store, private" } },
    );
  }

  try {
    const preview = await buildHistoricalBdiPreview();
    return Response.json(
      { ok: true, ...preview },
      { headers: { "Cache-Control": "no-store, private" } },
    );
  } catch (error) {
    const message =
      error instanceof Error && error.message.includes("JOTFORM_API_KEY")
        ? "Jotform API access is not configured on the server."
        : "Could not build the historical BDI-II preview.";

    return Response.json(
      { ok: false, error: message },
      { status: 500, headers: { "Cache-Control": "no-store, private" } },
    );
  }
}
