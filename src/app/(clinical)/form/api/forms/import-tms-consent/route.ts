import { getClinicianSession } from "@/lib/clinical/auth";
import { maxNativeScore } from "@/lib/clinical/questionnaires/native-builder";
import {
  TMS_CONSENT_CODE,
  TMS_CONSENT_NAME,
  TMS_CONSENT_SCHEMA_REVISION,
  tmsConsentNativeSchema,
} from "@/lib/clinical/questionnaires/tms-consent";
import { clinicalSupabaseRequest } from "@/lib/clinical/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

  const existing = await clinicalSupabaseRequest<Row[]>(
    `questionnaires?select=id,version,metadata&code=eq.${TMS_CONSENT_CODE}&order=version.desc`,
    { method: "GET" },
  );

  const currentRevision = existing.find(
    (row) =>
      Boolean(row.metadata?.native_schema) &&
      row.metadata?.builder_deleted !== true &&
      Number(row.metadata?.tms_consent_schema_revision ?? 0) >= TMS_CONSENT_SCHEMA_REVISION,
  );
  if (currentRevision) {
    return Response.json({ ok: true, id: currentRevision.id, existing: true });
  }

  const schema = tmsConsentNativeSchema();
  const version = (existing[0]?.version ?? 0) + 1;
  const rows = await clinicalSupabaseRequest<Array<{ id: string }>>(
    "questionnaires?select=id",
    {
      method: "POST",
      prefer: "return=representation",
      body: JSON.stringify({
        code: TMS_CONSENT_CODE,
        version,
        name: TMS_CONSENT_NAME,
        max_score: maxNativeScore(schema),
        active: false,
        metadata: {
          short_name: "TMS Consent",
          builder_status: "draft",
          native_schema: schema,
          form_kind: "tms_consent",
          tms_consent_schema_revision: TMS_CONSENT_SCHEMA_REVISION,
          contains_phi: true,
          sensitive_fields: [
            "consent_date",
            "patient_first_name",
            "patient_last_name",
            "physician_name",
            "patient_signature",
          ],
          created_by: clinician.id,
          source_jotform_form_id: "221136926141045",
          imported_from_jotform_structure: true,
          generic_assessment_storage_allowed: true,
        },
      }),
    },
  );

  const id = rows[0]?.id;
  if (!id) return Response.json({ ok: false, error: "Could not create TMS Consent draft." }, { status: 500 });
  return Response.json({ ok: true, id, upgraded: existing.length > 0 }, { status: 201 });
}
