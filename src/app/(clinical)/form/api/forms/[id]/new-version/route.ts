import { getClinicianSession } from "@/lib/clinical/auth";
import { clinicalSupabaseRequest } from "@/lib/clinical/supabase";
import type { NativeQuestionnaireSchema } from "@/lib/clinical/questionnaires/native-builder";

export const runtime = "nodejs";

type Props = { params: Promise<{ id: string }> };
type Row = {
  id: string;
  code: string;
  version: number;
  name: string;
  max_score: number | null;
  metadata?: Record<string, unknown> | null;
};

export async function POST(request: Request, { params }: Props) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return Response.json({ ok: false, error: "Forbidden." }, { status: 403 });
  const clinician = await getClinicianSession();
  if (!clinician) return Response.json({ ok: false, error: "Authentication required." }, { status: 401 });

  const { id } = await params;
  const rows = await clinicalSupabaseRequest<Row[]>(
    `questionnaires?select=id,code,version,name,max_score,metadata&id=eq.${encodeURIComponent(id)}&limit=1`,
    { method: "GET" },
  );
  const source = rows[0];
  if (!source) return Response.json({ ok: false, error: "Form not found." }, { status: 404 });
  const schema = source.metadata?.native_schema as NativeQuestionnaireSchema | undefined;
  if (!schema || schema.source !== "native") return Response.json({ ok: false, error: "Only native forms can be versioned here." }, { status: 400 });

  const latest = await clinicalSupabaseRequest<Array<{ version: number }>>(
    `questionnaires?select=version&code=eq.${encodeURIComponent(source.code)}&order=version.desc&limit=1`,
    { method: "GET" },
  );
  const version = (latest[0]?.version ?? source.version) + 1;
  const metadata = {
    builder_status: "draft",
    native_schema: schema,
    created_by: clinician.id,
    cloned_from_questionnaire_id: source.id,
    cloned_from_version: source.version,
  };

  const created = await clinicalSupabaseRequest<Array<{ id: string; version: number }>>(
    "questionnaires?select=id,version",
    {
      method: "POST",
      prefer: "return=representation",
      body: JSON.stringify({
        code: source.code,
        version,
        name: source.name,
        max_score: source.max_score,
        active: false,
        metadata,
      }),
    },
  );

  return Response.json({ ok: true, id: created[0]?.id, version: created[0]?.version }, { status: 201 });
}
