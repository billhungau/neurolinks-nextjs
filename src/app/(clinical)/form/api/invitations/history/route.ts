import { getClinicianSession } from "@/lib/clinical/auth";
import { subjectKeyFromVcitaUuid } from "@/lib/clinical/pseudonym";
import { clinicalSupabaseRequest } from "@/lib/clinical/supabase";

export const runtime = "nodejs";

type InvitationRow = {
  id: string;
  created_at: string;
  expires_at: string;
  opened_at: string | null;
  completed_at: string | null;
  revoked_at: string | null;
  questionnaires:
    | { code?: string; name?: string }
    | Array<{ code?: string; name?: string }>
    | null;
};

function relation<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

function statusOf(row: InvitationRow) {
  if (row.revoked_at) return "revoked";
  if (row.completed_at) return "completed";
  if (new Date(row.expires_at).getTime() <= Date.now()) return "expired";
  if (row.opened_at) return "opened";
  return "pending";
}

export async function GET(request: Request) {
  const clinician = await getClinicianSession();
  if (!clinician) {
    return Response.json({ ok: false, error: "Authentication required." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const vcitaUuid = String(searchParams.get("vcitaUuid") ?? "").trim();
  if (!vcitaUuid) {
    return Response.json({ ok: false, error: "Invalid patient." }, { status: 400 });
  }

  try {
    const subjectKey = subjectKeyFromVcitaUuid(vcitaUuid);
    const rows = await clinicalSupabaseRequest<InvitationRow[]>(
      `questionnaire_invitations?select=id,created_at,expires_at,opened_at,completed_at,revoked_at,questionnaires(code,name)&subject_key=eq.${subjectKey}&order=created_at.desc&limit=50`,
      { method: "GET" },
    );

    return Response.json(
      {
        ok: true,
        invitations: rows.map((row) => {
          const questionnaire = relation(row.questionnaires);
          return {
            id: row.id,
            createdAt: row.created_at,
            expiresAt: row.expires_at,
            openedAt: row.opened_at,
            completedAt: row.completed_at,
            revokedAt: row.revoked_at,
            status: statusOf(row),
            questionnaireCode: questionnaire?.code ?? null,
            questionnaireName: questionnaire?.name ?? null,
          };
        }),
      },
      { headers: { "Cache-Control": "no-store, private" } },
    );
  } catch {
    return Response.json(
      { ok: false, error: "Could not load invitation history." },
      { status: 500, headers: { "Cache-Control": "no-store, private" } },
    );
  }
}
