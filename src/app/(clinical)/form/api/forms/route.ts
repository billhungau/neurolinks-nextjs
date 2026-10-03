import { getClinicianSession } from "@/lib/clinical/auth";
import { clinicalSupabaseRequest } from "@/lib/clinical/supabase";
import {
  blankNativeSchema,
  maxNativeScore,
  sanitizeQuestionnaireCode,
  type NativeQuestionnaireSchema,
} from "@/lib/clinical/questionnaires/native-builder";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type QuestionnaireRow = {
  id: string;
  code: string;
  version: number;
  name: string;
  max_score: number | null;
  active: boolean;
  created_at: string;
  metadata?: Record<string, unknown> | null;
};

async function requireClinician() {
  return getClinicianSession();
}

export async function GET() {
  const clinician = await requireClinician();
  if (!clinician) return Response.json({ ok: false, error: "Authentication required." }, { status: 401 });

  const rows = await clinicalSupabaseRequest<QuestionnaireRow[]>(
    "questionnaires?select=id,code,version,name,max_score,active,created_at,metadata&order=code.asc,version.desc",
    { method: "GET" },
  );

  return Response.json({ ok: true, forms: rows }, { headers: { "Cache-Control": "no-store, private" } });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return Response.json({ ok: false, error: "Forbidden." }, { status: 403 });

  const clinician = await requireClinician();
  if (!clinician) return Response.json({ ok: false, error: "Authentication required." }, { status: 401 });

  let body: { name?: string; code?: string };
  try { body = await request.json(); } catch { return Response.json({ ok: false, error: "Invalid request." }, { status: 400 }); }

  const name = String(body.name ?? "").trim();
  const code = sanitizeQuestionnaireCode(String(body.code ?? name));
  if (!name || !/^[a-z0-9][a-z0-9_-]{1,49}$/.test(code)) {
    return Response.json({ ok: false, error: "Enter a form name and valid code." }, { status: 400 });
  }

  const existing = await clinicalSupabaseRequest<Array<{ version: number }>>(
    `questionnaires?select=version&code=eq.${encodeURIComponent(code)}&order=version.desc&limit=1`,
    { method: "GET" },
  );
  const version = (existing[0]?.version ?? 0) + 1;
  const schema = blankNativeSchema(name);

  const rows = await clinicalSupabaseRequest<QuestionnaireRow[]>("questionnaires?select=id,code,version,name,max_score,active,created_at,metadata", {
    method: "POST",
    prefer: "return=representation",
    body: JSON.stringify({
      code,
      version,
      name,
      max_score: maxNativeScore(schema),
      active: false,
      metadata: {
        builder_status: "draft",
        native_schema: schema,
        created_by: clinician.id,
      },
    }),
  });

  return Response.json({ ok: true, form: rows[0] }, { status: 201, headers: { "Cache-Control": "no-store, private" } });
}
