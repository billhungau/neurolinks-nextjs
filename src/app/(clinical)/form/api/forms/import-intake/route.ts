import { getClinicianSession } from "@/lib/clinical/auth";
import { maxNativeScore } from "@/lib/clinical/questionnaires/native-builder";
import {
  PATIENT_INTAKE_CODE,
  PATIENT_INTAKE_NAME,
  patientIntakeNativeSchema,
} from "@/lib/clinical/questionnaires/patient-intake";
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
    `questionnaires?select=id,version,metadata&code=eq.${PATIENT_INTAKE_CODE}&order=version.desc`,
    { method: "GET" },
  );
  const existingNative = existing.find(
    (row) => Boolean(row.metadata?.native_schema) && row.metadata?.builder_deleted !== true,
  );
  if (existingNative) {
    return Response.json({ ok: true, id: existingNative.id, existing: true });
  }

  const schema = patientIntakeNativeSchema();
  const version = (existing[0]?.version ?? 0) + 1;
  const rows = await clinicalSupabaseRequest<Array<{ id: string }>>(
    "questionnaires?select=id",
    {
      method: "POST",
      prefer: "return=representation",
      body: JSON.stringify({
        code: PATIENT_INTAKE_CODE,
        version,
        name: PATIENT_INTAKE_NAME,
        max_score: maxNativeScore(schema),
        active: false,
        metadata: {
          short_name: "Intake",
          builder_status: "draft",
          native_schema: schema,
          form_kind: "patient_intake",
          contains_phi: true,
          sensitive_fields: ["date_of_birth", "phn"],
          created_by: clinician.id,
          source_jotform_form_id: "222285731953258",
          imported_from_jotform_structure: true,
          generic_assessment_storage_allowed: false,
        },
      }),
    },
  );

  const id = rows[0]?.id;
  if (!id) return Response.json({ ok: false, error: "Could not create Patient Intake draft." }, { status: 500 });
  return Response.json({ ok: true, id }, { status: 201 });
}
