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
  active: boolean;
  metadata?: Record<string, unknown> | null;
};

export async function POST(request: Request, { params }: Props) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return Response.json({ ok: false, error: "Forbidden." }, { status: 403 });
  }

  const clinician = await getClinicianSession();
  if (!clinician) {
    return Response.json({ ok: false, error: "Authentication required." }, { status: 401 });
  }

  const { id } = await params;
  const rows = await clinicalSupabaseRequest<Row[]>(
    `questionnaires?select=id,code,version,name,active,metadata&id=eq.${encodeURIComponent(id)}&limit=1`,
    { method: "GET" },
  );
  const row = rows[0];
  if (!row) return Response.json({ ok: false, error: "Form not found." }, { status: 404 });

  if (String(row.metadata?.builder_status ?? "") !== "draft") {
    return Response.json({ ok: false, error: "Only drafts can be published." }, { status: 409 });
  }

  const schema = row.metadata?.native_schema as NativeQuestionnaireSchema | undefined;
  if (!schema || schema.source !== "native" || schema.fields.length === 0) {
    return Response.json({ ok: false, error: "Add at least one field before publishing." }, { status: 400 });
  }

  const metadata = {
    ...(row.metadata ?? {}),
    builder_status: "published",
    published_at: new Date().toISOString(),
    published_by: clinician.id,
  };

  try {
    // Activate the new version first so a failed request never leaves this
    // questionnaire family with no live form. Once that succeeds, retire every
    // other active version with the same questionnaire code.
    await clinicalSupabaseRequest<unknown>(`questionnaires?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      prefer: "return=minimal",
      body: JSON.stringify({ active: true, metadata }),
    });

    try {
      await clinicalSupabaseRequest<unknown>(
        `questionnaires?code=eq.${encodeURIComponent(row.code)}&id=neq.${encodeURIComponent(id)}&active=eq.true`,
        {
          method: "PATCH",
          prefer: "return=minimal",
          body: JSON.stringify({ active: false }),
        },
      );
    } catch (error) {
      // Compensate if retiring the previous live version fails. Restore this row
      // to its original draft state so the previously published form remains the
      // unambiguous live version.
      try {
        await clinicalSupabaseRequest<unknown>(`questionnaires?id=eq.${encodeURIComponent(id)}`, {
          method: "PATCH",
          prefer: "return=minimal",
          body: JSON.stringify({ active: row.active, metadata: row.metadata ?? {} }),
        });
      } catch {
        // The original error is more useful to the caller than a rollback error.
      }
      throw error;
    }
  } catch {
    return Response.json(
      { ok: false, error: "Could not publish this form. The previous published version was left unchanged." },
      { status: 500 },
    );
  }

  return Response.json({ ok: true, code: row.code, version: row.version });
}
