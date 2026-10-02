import { createHash, randomBytes } from "node:crypto";
import { clinicalSupabaseRequest } from "./supabase";
import { subjectKeyFromVcitaUuid } from "./pseudonym";

const TOKEN_BYTES = 32;
const DEFAULT_EXPIRY_HOURS = 72;
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43,128}$/;

type QuestionnaireRow = {
  id: string;
  code: string;
  version: number;
  name: string;
  max_score: number | null;
  active: boolean;
};

type InvitationRow = {
  id: string;
  subject_key: string;
  questionnaire_id: string;
  token_hash: string;
  created_at: string;
  expires_at: string;
  opened_at: string | null;
  completed_at: string | null;
  revoked_at: string | null;
  questionnaires: QuestionnaireRow | QuestionnaireRow[] | null;
};

export type InvitationStatus =
  | "valid"
  | "not_found"
  | "expired"
  | "completed"
  | "revoked"
  | "inactive";

export type ResolvedInvitation = {
  status: InvitationStatus;
  invitationId?: string;
  questionnaire?: {
    code: string;
    version: number;
    name: string;
    maxScore: number | null;
  };
  expiresAt?: string;
};

function hashInvitationToken(rawToken: string): string {
  return createHash("sha256").update(rawToken, "utf8").digest("hex");
}

function questionnaireFromRelation(
  value: QuestionnaireRow | QuestionnaireRow[] | null,
): QuestionnaireRow | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

export async function createQuestionnaireInvitation(input: {
  vcitaUuid: string;
  questionnaireCode: string;
  expiresInHours?: number;
}): Promise<{
  invitationId: string;
  token: string;
  path: string;
  expiresAt: string;
}> {
  const code = input.questionnaireCode.trim().toLowerCase();
  const expiresInHours = input.expiresInHours ?? DEFAULT_EXPIRY_HOURS;

  if (!/^[a-z0-9][a-z0-9_-]{1,49}$/.test(code)) {
    throw new Error("[clinical-invitation] Invalid questionnaire code.");
  }
  if (!Number.isFinite(expiresInHours) || expiresInHours <= 0 || expiresInHours > 24 * 30) {
    throw new Error("[clinical-invitation] Invalid invitation expiry.");
  }

  const questionnaires = await clinicalSupabaseRequest<QuestionnaireRow[]>(
    `questionnaires?select=id,code,version,name,max_score,active&code=eq.${encodeURIComponent(code)}&active=eq.true&order=version.desc&limit=1`,
    { method: "GET" },
  );

  const questionnaire = questionnaires[0];
  if (!questionnaire) {
    throw new Error("[clinical-invitation] Active questionnaire not found.");
  }

  const subjectKey = subjectKeyFromVcitaUuid(input.vcitaUuid);
  const token = randomBytes(TOKEN_BYTES).toString("base64url");
  const tokenHash = hashInvitationToken(token);
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000).toISOString();

  const rows = await clinicalSupabaseRequest<Array<{ id: string; expires_at: string }>>(
    "questionnaire_invitations?select=id,expires_at",
    {
      method: "POST",
      prefer: "return=representation",
      body: JSON.stringify({
        subject_key: subjectKey,
        questionnaire_id: questionnaire.id,
        token_hash: tokenHash,
        expires_at: expiresAt,
      }),
    },
  );

  const created = rows[0];
  if (!created) {
    throw new Error("[clinical-invitation] Invitation creation failed.");
  }

  return {
    invitationId: created.id,
    token,
    path: `/form/q/${token}`,
    expiresAt: created.expires_at,
  };
}

export async function resolveQuestionnaireInvitation(
  rawToken: string,
  options: { markOpened?: boolean } = {},
): Promise<ResolvedInvitation> {
  if (!TOKEN_PATTERN.test(rawToken)) {
    return { status: "not_found" };
  }

  const tokenHash = hashInvitationToken(rawToken);

  const rows = await clinicalSupabaseRequest<InvitationRow[]>(
    `questionnaire_invitations?select=id,subject_key,questionnaire_id,token_hash,created_at,expires_at,opened_at,completed_at,revoked_at,questionnaires(id,code,version,name,max_score,active)&token_hash=eq.${tokenHash}&limit=1`,
    { method: "GET" },
  );

  const invitation = rows[0];
  if (!invitation) return { status: "not_found" };

  const questionnaire = questionnaireFromRelation(invitation.questionnaires);
  if (!questionnaire || !questionnaire.active) {
    return { status: "inactive", invitationId: invitation.id, expiresAt: invitation.expires_at };
  }

  if (invitation.revoked_at) {
    return { status: "revoked", invitationId: invitation.id, expiresAt: invitation.expires_at };
  }

  if (invitation.completed_at) {
    return { status: "completed", invitationId: invitation.id, expiresAt: invitation.expires_at };
  }

  if (new Date(invitation.expires_at).getTime() <= Date.now()) {
    return { status: "expired", invitationId: invitation.id, expiresAt: invitation.expires_at };
  }

  if (options.markOpened !== false && invitation.opened_at === null) {
    await clinicalSupabaseRequest<unknown>(
      `questionnaire_invitations?id=eq.${invitation.id}&opened_at=is.null`,
      {
        method: "PATCH",
        prefer: "return=minimal",
        body: JSON.stringify({ opened_at: new Date().toISOString() }),
      },
    );
  }

  return {
    status: "valid",
    invitationId: invitation.id,
    expiresAt: invitation.expires_at,
    questionnaire: {
      code: questionnaire.code,
      version: questionnaire.version,
      name: questionnaire.name,
      maxScore: questionnaire.max_score,
    },
  };
}
