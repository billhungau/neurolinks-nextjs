import { getClinicianSession } from "@/lib/clinical/auth";
import { clinicalSupabaseRequest } from "@/lib/clinical/supabase";
import { maxNativeScore, type NativeQuestionnaireSchema } from "@/lib/clinical/questionnaires/native-builder";
import { ensurePssSymptomMatrix } from "@/lib/clinical/questionnaires/pss-native-repair";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

type Row = {
  id: string;
  code: string;
  version: number;
  name: string;
  max_score: number | null;
  active: boolean;
  metadata?: Record<string, unknown> | null;
};

async function rowFor(id: string) {
  const rows = await clinicalSupabaseRequest<Row[]>(
    `questionnaires?select=id,code,version,name,max_score,active,metadata&id=eq.${encodeURIComponent(id)}&limit=1`,
    { method: "GET" },
  );
  return rows[0] ?? null;
}

function nativeSchema(row: Row) {
  const raw = row.metadata?.native_schema;
  return raw && typeof raw === "object" ? raw as NativeQuestionnaireSchema : null;
}

export async function GET(_request: Request, { params }: Props) {
  const clinician = await getClinicianSession();
  if (!clinician) return Response.json({ ok: false, error: "Authentication required." }, { status: 401 });
  const { id } = await params;
  let row = await rowFor(id);
  if (!row) return Response.json({ ok: false, error: "Form not found." }, { status: 404 });

  // Older PSS drafts could have been created before the Jotform matrix rows were
  // available to the native converter. Repair the editable draft when it is opened,
  // so the clinician does not need to revisit the Forms list to trigger migration.
  if (row.code === "pss" && String(row.metadata?.builder_status ?? "") === "draft") {
    const currentSchema = nativeSchema(row);
    if (currentSchema) {
      const repairedSchema = ensurePssSymptomMatrix(currentSchema);
      const hadMatrix = currentSchema.fields.some((field) => field.kind === "matrix" && field.rows.length >= 17);
      if (!hadMatrix) {
        const metadata = {
          ...(row.metadata ?? {}),
          native_schema: repairedSchema,
          conversion_schema_revision: 4,
          repaired_at: new Date().toISOString(),
          repaired_by: clinician.id,
        };
        await clinicalSupabaseRequest<unknown>(`questionnaires?id=eq.${encodeURIComponent(id)}`, {
          method: "PATCH",
          prefer: "return=minimal",
          body: JSON.stringify({ max_score: maxNativeScore(repairedSchema), metadata }),
        });
        row = { ...row, max_score: maxNativeScore(repairedSchema), metadata };
      }
    }
  }

  return Response.json({ ok: true, form: row }, { headers: { "Cache-Control": "no-store, private" } });
}

export async function PATCH(request: Request, { params }: Props) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return Response.json({ ok: false, error: "Forbidden." }, { status: 403 });
  const clinician = await getClinicianSession();
  if (!clinician) return Response.json({ ok: false, error: "Authentication required." }, { status: 401 });
  const { id } = await params;
  const current = await rowFor(id);
  if (!current) return Response.json({ ok: false, error: "Form not found." }, { status: 404 });
  const status = String(current.metadata?.builder_status ?? "");
  if (status !== "draft") return Response.json({ ok: false, error: "Published forms are protected. Use Edit to create an editable copy." }, { status: 409 });

  let body: { name?: string; schema?: NativeQuestionnaireSchema };
  try { body = await request.json(); } catch { return Response.json({ ok: false, error: "Invalid request." }, { status: 400 }); }
  const schema = body.schema;
  const name = String(body.name ?? schema?.title ?? current.name).trim();
  if (!schema || schema.source !== "native" || !name) return Response.json({ ok: false, error: "Invalid native form schema." }, { status: 400 });

  const metadata = {
    ...(current.metadata ?? {}),
    builder_status: "draft",
    native_schema: schema,
    updated_by: clinician.id,
    updated_at: new Date().toISOString(),
  };

  await clinicalSupabaseRequest<unknown>(`questionnaires?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    prefer: "return=minimal",
    body: JSON.stringify({ name, max_score: maxNativeScore(schema), metadata }),
  });

  return Response.json({ ok: true });
}

export async function DELETE(request: Request, { params }: Props) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return Response.json({ ok: false, error: "Forbidden." }, { status: 403 });
  const clinician = await getClinicianSession();
  if (!clinician) return Response.json({ ok: false, error: "Authentication required." }, { status: 401 });

  const { id } = await params;
  const current = await rowFor(id);
  if (!current) return Response.json({ ok: false, error: "Form not found." }, { status: 404 });
  if (!current.metadata?.native_schema) {
    return Response.json({ ok: false, error: "Only native NeuroLinks forms can be deleted here." }, { status: 400 });
  }

  const family = await clinicalSupabaseRequest<Row[]>(
    `questionnaires?select=id,code,version,name,max_score,active,metadata&code=eq.${encodeURIComponent(current.code)}&order=version.desc`,
    { method: "GET" },
  );
  const nativeRows = family.filter((row) => Boolean(row.metadata?.native_schema));
  const deletedAt = new Date().toISOString();

  for (const row of nativeRows) {
    await clinicalSupabaseRequest<unknown>(`questionnaires?id=eq.${encodeURIComponent(row.id)}`, {
      method: "PATCH",
      prefer: "return=minimal",
      body: JSON.stringify({
        active: false,
        metadata: {
          ...(row.metadata ?? {}),
          builder_deleted: true,
          deleted_at: deletedAt,
          deleted_by: clinician.id,
        },
      }),
    });
  }

  return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store, private" } });
}
