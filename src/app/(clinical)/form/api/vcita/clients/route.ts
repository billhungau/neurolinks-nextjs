import { getClinicianSession } from "@/lib/clinical/auth";
import { searchVcitaClients } from "@/lib/clinical/vcita";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const clinician = await getClinicianSession();
  if (!clinician) {
    return Response.json({ ok: false, error: "Authentication required." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = String(searchParams.get("q") ?? "").trim();
  if (query.length < 2 || query.length > 120) {
    return Response.json({ ok: true, clients: [] }, { headers: { "Cache-Control": "no-store" } });
  }

  try {
    const clients = await searchVcitaClients(query);
    return Response.json(
      { ok: true, clients },
      { headers: { "Cache-Control": "no-store, private" } },
    );
  } catch {
    return Response.json(
      { ok: false, error: "vcita patient search is unavailable." },
      { status: 502, headers: { "Cache-Control": "no-store, private" } },
    );
  }
}
