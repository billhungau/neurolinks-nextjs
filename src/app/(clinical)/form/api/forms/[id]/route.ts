import { getClinicianSession } from "@/lib/clinical/auth";
import { clinicalSupabaseRequest } from "@/lib/clinical/supabase";
import { maxNativeScore, type NativeQuestionnaireSchema } from "@/lib/clinical/questionnaires/native-builder";

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

export async function GET(_request: Request, { params }: Props) {
  const clinician = await getClinicianSession();
  if (!clinician) return Response.json({ ok: false, error: "Authentication required." }, { status: 401 });
  const { id } = await params;
  const row = await rowFor(id);
  if (!row) return Response.json({ ok: false, error: "Form not found." }, { status: 404 });
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
  if (status !== "draft") return Response.json({ ok: false, error: "Published versions are immutable. Create a new draft version to edit." }, { status: 409 });

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
