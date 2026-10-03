import { getClinicianSession } from "@/lib/clinical/auth";
import { clinicalSupabaseRequest } from "@/lib/clinical/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Row = {
  id: string;
  code: string;
  name: string;
  active: boolean;
  metadata?: Record<string, unknown> | null;
};

function isPhq9(row: Row) {
  const code = row.code.toLowerCase().replace(/[^a-z0-9]/g, "");
  const name = row.name.toLowerCase();
  return code === "phq9" || name.includes("phq-9") || name.includes("phq 9") || name.includes("patient health questionnaire-9") || name.includes("patient health questionnaire 9");
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return Response.json({ ok: false, error: "Forbidden." }, { status: 403 });
  }

  const clinician = await getClinicianSession();
  if (!clinician) return Response.json({ ok: false, error: "Authentication required." }, { status: 401 });

  const rows = await clinicalSupabaseRequest<Row[]>(
    "questionnaires?select=id,code,name,active,metadata",
    { method: "GET" },
  );
  const matches = rows.filter(isPhq9);
  if (!matches.length) return Response.json({ ok: true, removed: 0 });

  const retiredAt = new Date().toISOString();
  for (const row of matches) {
    await clinicalSupabaseRequest<unknown>(`questionnaires?id=eq.${encodeURIComponent(row.id)}`, {
      method: "PATCH",
      prefer: "return=minimal",
      body: JSON.stringify({
        active: false,
        metadata: {
          ...(row.metadata ?? {}),
          builder_deleted: true,
          retired_at: retiredAt,
          retired_by: clinician.id,
          retired_reason: "PHQ-9 removed from NeuroLinks questionnaire platform",
        },
      }),
    });
  }

  return Response.json({ ok: true, removed: matches.length });
}
