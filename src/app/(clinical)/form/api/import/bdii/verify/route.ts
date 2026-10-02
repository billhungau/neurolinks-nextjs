import { getClinicianSession } from "@/lib/clinical/auth";
import { buildBdiVerificationReport } from "@/lib/clinical/imports/verify-bdii";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const clinician = await getClinicianSession();
  if (!clinician) {
    return Response.json(
      { ok: false, error: "Authentication required." },
      { status: 401, headers: { "Cache-Control": "no-store, private" } },
    );
  }

  const { searchParams } = new URL(request.url);
  const submissionId = String(searchParams.get("submissionId") ?? "").trim();

  try {
    const report = await buildBdiVerificationReport();

    if (submissionId) {
      const detail = report.detailsBySubmission.get(submissionId);
      if (!detail) {
        return Response.json(
          { ok: false, error: "Verification record not found." },
          { status: 404, headers: { "Cache-Control": "no-store, private" } },
        );
      }

      return Response.json(
        { ok: true, detail },
        { headers: { "Cache-Control": "no-store, private" } },
      );
    }

    return Response.json(
      {
        ok: true,
        generatedAt: report.generatedAt,
        summary: report.summary,
        rows: report.rows,
      },
      { headers: { "Cache-Control": "no-store, private" } },
    );
  } catch {
    return Response.json(
      { ok: false, error: "Could not verify the historical BDI-II migration." },
      { status: 500, headers: { "Cache-Control": "no-store, private" } },
    );
  }
}
