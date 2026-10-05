import { createHash } from "node:crypto";
import { decryptInvitationToken } from "@/lib/clinical/invitation-token";
import { clinicalSupabaseRequest } from "@/lib/clinical/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = { token?: string };

type CurrentInvitation = {
  id: string;
  subject_key: string;
};

type PendingInvitation = {
  id: string;
  questionnaire_id: string;
  token_ciphertext: string | null;
  expires_at: string;
};

type Questionnaire = {
  id: string;
  name: string;
  code: string;
  active: boolean;
};

function hashInvitationToken(rawToken: string) {
  return createHash("sha256").update(rawToken, "utf8").digest("hex");
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return Response.json({ ok: false, error: "Forbidden." }, { status: 403 });
  }

  let body: Body;
  try {
    body = await request.json() as Body;
  } catch {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const token = String(body.token ?? "");
  if (!/^[A-Za-z0-9_-]{43,128}$/.test(token)) {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  try {
    const tokenHash = hashInvitationToken(token);
    const currentRows = await clinicalSupabaseRequest<CurrentInvitation[]>(
      `questionnaire_invitations?select=id,subject_key&token_hash=eq.${tokenHash}&limit=1`,
      { method: "GET" },
    );
    const current = currentRows[0];
    if (!current) {
      return Response.json({ ok: false, error: "Invitation not found." }, { status: 404 });
    }

    const now = new Date().toISOString();
    const pendingRows = await clinicalSupabaseRequest<PendingInvitation[]>(
      `questionnaire_invitations?select=id,questionnaire_id,token_ciphertext,expires_at&subject_key=eq.${current.subject_key}&completed_at=is.null&revoked_at=is.null&expires_at=gt.${encodeURIComponent(now)}&token_ciphertext=not.is.null&order=created_at.asc`,
      { method: "GET" },
    );

    const pendingInvitations = pendingRows.filter((row) => row.id !== current.id && row.token_ciphertext);
    if (pendingInvitations.length === 0) {
      return Response.json({ ok: true, questionnaires: [] }, { headers: { "Cache-Control": "no-store" } });
    }

    const questionnaireIds = [...new Set(pendingInvitations.map((row) => row.questionnaire_id))];
    const idFilter = questionnaireIds.map((id) => `"${id.replace(/"/g, "")}"`).join(",");
    const questionnaires = await clinicalSupabaseRequest<Questionnaire[]>(
      `questionnaires?select=id,name,code,active&id=in.(${encodeURIComponent(idFilter)})`,
      { method: "GET" },
    );
    const byId = new Map(questionnaires.filter((row) => row.active).map((row) => [row.id, row]));

    const result = pendingInvitations.flatMap((invitation) => {
      const questionnaire = byId.get(invitation.questionnaire_id);
      const rawToken = invitation.token_ciphertext ? decryptInvitationToken(invitation.token_ciphertext) : null;
      if (!questionnaire || !rawToken) return [];
      return [{
        name: questionnaire.name,
        href: `/form/q/${encodeURIComponent(rawToken)}/`,
      }];
    });

    return Response.json({ ok: true, questionnaires: result }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json(
      { ok: false, error: "Could not load remaining questionnaires." },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
