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
const CONVERSION_SCHEMA_REVISION = 2;

type Row = {
  id: string;
  version: number;
  active?: boolean;
  metadata?: Record<string, unknown> | null;
};

function conversionRevision(row: Row) {
  const value = Number(row.metadata?.conversion_schema_revision ?? 0);
  return Number.isFinite(value) ? value : 0;
}

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
    `questionnaires?select=id,version,active,metadata&code=eq.${encodeURIComponent(code)}&order=version.desc`,
    { method: "GET" },
  );

  const existingNative = existing.find((row) => Boolean(row.metadata?.native_schema) && row.metadata?.builder_deleted !== true);
  const needsPssRepair = code === "pss" && existingNative && conversionRevision(existingNative) < CONVERSION_SCHEMA_REVISION;

  if (existingNative && !needsPssRepair) {
    return Response.json({ ok: true, id: existingNative.id, existing: true });
  }

  const imported = await fetchImportedSchema(code);
  const config = IMPORTED_QUESTIONNAIRES[code];
  const schema = nativeSchemaFromImported(code, imported, config.name);
  const maxScore = maxNativeScore(schema);

  if (needsPssRepair && existingNative) {
    const builderStatus = String(existingNative.metadata?.builder_status ?? "");

    if (builderStatus === "draft") {
      await clinicalSupabaseRequest<unknown>(`questionnaires?id=eq.${encodeURIComponent(existingNative.id)}`, {
        method: "PATCH",
        prefer: "return=minimal",
        body: JSON.stringify({
          name: config.name,
          max_score: maxScore,
          metadata: {
            ...(existingNative.metadata ?? {}),
            native_schema: schema,
            conversion_schema_revision: CONVERSION_SCHEMA_REVISION,
            source_jotform_form_id: config.jotformId,
            source_jotform_imported_at: imported.importedAt,
            repaired_at: new Date().toISOString(),
            repaired_by: clinician.id,
          },
        }),
      });

      return Response.json({ ok: true, id: existingNative.id, existing: true, repaired: true });
    }

    const version = (existing[0]?.version ?? 0) + 1;
    const repairedRows = await clinicalSupabaseRequest<Array<{ id: string }>>(
      "questionnaires?select=id",
      {
        method: "POST",
        prefer: "return=representation",
        body: JSON.stringify({
          code,
          version,
          name: config.name,
          max_score: maxScore,
          active: false,
          metadata: {
            short_name: "PSS",
            builder_status: "draft",
            native_schema: schema,
            created_by: clinician.id,
            converted_from_jotform: true,
            conversion_schema_revision: CONVERSION_SCHEMA_REVISION,
            source_jotform_form_id: config.jotformId,
            source_jotform_imported_at: imported.importedAt,
            repaired_from_incomplete_conversion: true,
          },
        }),
      },
    );

    const repairedId = repairedRows[0]?.id;
    if (!repairedId) return Response.json({ ok: false, error: "Could not create corrected PSS draft." }, { status: 500 });
    return Response.json({ ok: true, id: repairedId, repaired: true }, { status: 201 });
  }

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
        max_score: maxScore,
        active: false,
        metadata: {
          short_name: code === "ybocs" ? "Y-BOCS" : code.toUpperCase(),
          builder_status: "draft",
          native_schema: schema,
          created_by: clinician.id,
          converted_from_jotform: true,
          conversion_schema_revision: CONVERSION_SCHEMA_REVISION,
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
