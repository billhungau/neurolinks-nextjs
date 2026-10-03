import { getClinicianSession } from "@/lib/clinical/auth";
import { clinicalSupabaseRequest } from "@/lib/clinical/supabase";
import { bdi2NativeSchema, maxNativeScore } from "@/lib/clinical/questionnaires/native-builder";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return Response.json({ ok: false, error: "Forbidden." }, { status: 403 });
  const clinician = await getClinicianSession();
  if (!clinician) return Response.json({ ok: false, error: "Authentication required." }, { status: 401 });

  const existing = await clinicalSupabaseRequest<Array<{ version: number }>>(
    "questionnaires?select=version&code=eq.bdii&order=version.desc&limit=1",
    { method: "GET" },
  );
  const version = (existing[0]?.version ?? 0) + 1;
  const schema = bdi2NativeSchema();

  const rows = await clinicalSupabaseRequest<Array<{ id: string; version: number }>>(
    "questionnaires?select=id,version",
    {
      method: "POST",
      prefer: "return=representation",
      body: JSON.stringify({
        code: "bdii",
        version,
        name: schema.title,
        max_score: maxNativeScore(schema),
        active: false,
        metadata: {
          builder_status: "draft",
          native_schema: schema,
          created_by: clinician.id,
          converted_from: "bdii_definition_v1",
        },
      }),
    },
  );

  return Response.json({ ok: true, id: rows[0]?.id, version: rows[0]?.version }, { status: 201 });
}
