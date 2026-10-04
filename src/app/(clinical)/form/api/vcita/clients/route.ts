import { getClinicianSession } from "@/lib/clinical/auth";
import { listRecentVcitaClients, searchVcitaClients } from "@/lib/clinical/vcita";

export const runtime = "nodejs";

async function respond(query: string) {
  const q = query.trim();
  if (q.length < 2 || q.length > 120) {
    return Response.json({ ok: true, clients: [] }, { headers: { "Cache-Control": "no-store" } });
  }

  try {
    const clients = await searchVcitaClients(q);
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

async function respondRecent() {
  try {
    const clients = await listRecentVcitaClients(50);
    return Response.json(
      { ok: true, clients },
      { headers: { "Cache-Control": "no-store, private" } },
    );
  } catch {
    return Response.json(
      { ok: false, error: "Recent vcita patients are unavailable." },
      { status: 502, headers: { "Cache-Control": "no-store, private" } },
    );
  }
}

export async function GET(request: Request) {
  const clinician = await getClinicianSession();
  if (!clinician) {
    return Response.json({ ok: false, error: "Authentication required." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  if (searchParams.get("recent") === "1") return respondRecent();
  return respond(String(searchParams.get("q") ?? ""));
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

  let body: { q?: string; recent?: boolean };
  try {
    body = (await request.json()) as { q?: string; recent?: boolean };
  } catch {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  if (body.recent) return respondRecent();
  return respond(String(body.q ?? ""));
}
