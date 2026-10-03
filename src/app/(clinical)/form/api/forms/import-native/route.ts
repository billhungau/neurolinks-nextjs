import { getClinicianSession } from "@/lib/clinical/auth";
import { clinicalSupabaseRequest } from "@/lib/clinical/supabase";
import {
  fetchImportedSchema,
  IMPORTED_QUESTIONNAIRES,
  isImportedCode,
  type ImportedQuestionnaireCode,
} from "@/lib/clinical/questionnaires/jotform-import";
import {
  maxNativeScore,
  nativeSchemaFromImported,
} from "@/lib/clinical/questionnaires/native-builder";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED = new Set<ImportedQuestionnaireCode>(["bai", "ybocs", "pss"]);

type Row = {
  id: string;
  version: number;
  metadata?: Record<string, unknown> | null;
};

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return Response.json({ ok: false, error: "Forbidden." }, { status: 403 });
  }

  const clinician = await getClinicianSession();
  if (!clinician) return Response.json({ ok: false, error: "Authentication required." }, { status: 401 });

  let body: { code?: string };
  try { body = await request.json(); } catch { return Response.json({ ok: false, error: "Invalid request." }, { status: 400 }); }

  const code = String(body.code ?? "").toLowerCase();
  if (!isImportedCode(code) || !ALLOWED.has(code)) {
    return Response.json({ ok: false, error: "Only BAI, Y-BOCS and PSS can be converted here." }, { status: 400 });
  }

  const existing = await clinicalSupabaseRequest<Row[]>(
    `questionnaires?select=id,version,metadata&code=eq.${encodeURIComponent(code)}&order=version.desc`,
    { method: "GET" },
  );

  const existingNative = existing.find((row) => Boolean(row.metadata?.native_schema) && row.metadata?.builder_deleted !== true);
  if (existingNative) {
    return Response.json({ ok: true, id: existingNative.id, existing: true });
  }

  const imported = await fetchImportedSchema(code);
  const config = IMPORTED_QUESTIONNAIRES[code];
  const schema = nativeSchemaFromImported(code, imported, config.name);
  const version = (existing[0]?.version ?? 0) + 1;

  const rows = await clinicalSupabaseRequest<Array<{ id: string }>>(
    "questionnaires?select=id",
    {
      method: "POST",
      prefer: "return=representation",
      body: JSON.stringify({
        code,
        version,
        name: config.name,
        max_score: maxNativeScore(schema),
        active: false,
        metadata: {
          short_name: code === "ybocs" ? "Y-BOCS" : code.toUpperCase(),
          builder_status: "draft",
          native_schema: schema,
          created_by: clinician.id,
          converted_from_jotform: true,
          source_jotform_form_id: config.jotformId,
          source_jotform_imported_at: imported.importedAt,
        },
      }),
    },
  );

  const id = rows[0]?.id;
  if (!id) return Response.json({ ok: false, error: "Could not create native draft." }, { status: 500 });
  return Response.json({ ok: true, id }, { status: 201 });
}
