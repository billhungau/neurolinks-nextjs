"use client";

import { useCallback, useEffect, useState } from "react";

type Invitation = {
  id: string;
  createdAt: string;
  expiresAt: string;
  openedAt: string | null;
  completedAt: string | null;
  revokedAt: string | null;
  status: "pending" | "opened" | "completed" | "expired" | "revoked";
  questionnaireCode: string | null;
  questionnaireName: string | null;
};

type ApiResponse =
  | { ok: true; invitations: Invitation[] }
  | { ok: false; error: string };

export type RecentInvitationLink = {
  invitationId: string;
  questionnaireCode?: string;
  url: string;
};

const QUESTIONNAIRE_LABELS: Record<string, string> = {
  bdii: "Beck Depression Inventory-II",
  bai: "Beck Anxiety Inventory (BAI)",
  ybocs: "Yale-Brown Obsessive Compulsive Scale (Y-BOCS)",
  pss: "PTSD Symptom Scale (PSS)",
};

export function InvitationHistoryPanel({
  vcitaUuid,
  refreshKey,
  recentLinks = [],
}: {
  vcitaUuid: string;
  refreshKey: number;
  recentLinks?: RecentInvitationLink[];
}) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/form/api/invitations/history/?vcitaUuid=${encodeURIComponent(vcitaUuid)}`,
        { cache: "no-store" },
      );
      const data = (await response.json()) as ApiResponse;
      if (data.ok) setInvitations(data.invitations);
      else setError(data.error);
    } catch {
      setError("Could not load invitation history.");
    } finally {
      setLoading(false);
    }
  }, [vcitaUuid]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  async function revoke(id: string) {
    if (!window.confirm("Revoke this unused questionnaire link?")) return;
    setRevoking(id);
    try {
      const response = await fetch(`/form/api/invitations/${encodeURIComponent(id)}/revoke/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vcitaUuid }),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string };
      if (!data.ok) setError(data.error ?? "Could not revoke invitation.");
      else await load();
    } catch {
      setError("Could not revoke invitation.");
    } finally {
      setRevoking(null);
    }
  }

  async function copyLink(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopyMessage("Questionnaire link copied.");
      window.setTimeout(() => setCopyMessage(null), 1800);
    } catch {
      setCopyMessage("Could not copy automatically.");
    }
  }

  const recentLinkByInvitation = new Map(recentLinks.map((link) => [link.invitationId, link.url] as const));
  const recentLinkByCode = new Map(
    recentLinks
      .filter((link) => link.questionnaireCode)
      .map((link) => [link.questionnaireCode!.toLowerCase(), link.url] as const),
  );

  const matchedRecentIds = new Set<string>();
  for (const invitation of invitations) {
    if (recentLinkByInvitation.has(invitation.id)) {
      matchedRecentIds.add(invitation.id);
      continue;
    }
    if ((invitation.status === "pending" || invitation.status === "opened") && invitation.questionnaireCode) {
      const recent = recentLinks.find((link) => link.questionnaireCode?.toLowerCase() === invitation.questionnaireCode?.toLowerCase());
      if (recent) matchedRecentIds.add(recent.invitationId);
    }
  }
  const unmatchedRecentLinks = recentLinks.filter((link) => !matchedRecentIds.has(link.invitationId));

  return (
    <section style={{ marginBottom: "24px", padding: "18px", border: "1px solid #e5e7eb", borderRadius: "12px", background: "#fff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center" }}>
        <h3 style={{ margin: 0, fontSize: "20px" }}>Invitation history</h3>
        <button type="button" onClick={load} disabled={loading} style={{ padding: "7px 10px", border: "1px solid #d1d5db", borderRadius: "8px", background: "#fff", cursor: "pointer" }}>
          Refresh
        </button>
      </div>

      {copyMessage ? <p aria-live="polite" style={{ color: "#166534", fontWeight: 700, fontSize: 14 }}>{copyMessage}</p> : null}

      {unmatchedRecentLinks.length > 0 ? (
        <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
          {unmatchedRecentLinks.map((link) => {
            const code = link.questionnaireCode?.toLowerCase() ?? "";
            return (
              <div key={`recent-${link.invitationId}`} style={{ padding: 12, border: "1px solid #86efac", borderRadius: 9, background: "#f0fdf4" }}>
                <strong>{QUESTIONNAIRE_LABELS[code] ?? "Questionnaire"}</strong>
                <div style={{ marginTop: 4, color: "#166534", fontSize: 13, fontWeight: 700 }}>New link created</div>
                <div style={{ overflowWrap: "anywhere", marginTop: 8, fontSize: 13 }}><a href={link.url}>{link.url}</a></div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 7 }}>
                  <button type="button" onClick={() => copyLink(link.url)} style={{ padding: "6px 9px", border: "1px solid #bbf7d0", borderRadius: 7, background: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 12 }}>Copy link</button>
                  <a href={link.url} target="_blank" rel="noreferrer" style={{ padding: "6px 9px", border: "1px solid #bbf7d0", borderRadius: 7, background: "#fff", color: "#1d4ed8", textDecoration: "none", fontWeight: 700, fontSize: 12 }}>Open link</a>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {loading ? <p style={{ color: "#6b7280" }}>Loading invitations…</p> : null}
      {error ? <p role="alert" style={{ color: "#991b1b" }}>{error}</p> : null}
      {!loading && !error && invitations.length === 0 && recentLinks.length === 0 ? (
        <p style={{ marginBottom: 0, color: "#6b7280" }}>No questionnaire invitations yet.</p>
      ) : null}

      {!loading && invitations.length > 0 ? (
        <div style={{ display: "grid", gap: "10px", marginTop: "14px" }}>
          {invitations.map((invitation) => {
            const canRevoke = invitation.status === "pending" || invitation.status === "opened";
            const exactUrl = recentLinkByInvitation.get(invitation.id) ?? null;
            const fallbackUrl = canRevoke && invitation.questionnaireCode
              ? recentLinkByCode.get(invitation.questionnaireCode.toLowerCase()) ?? null
              : null;
            const currentUrl = exactUrl ?? fallbackUrl;
            return (
              <div key={invitation.id} style={{ padding: "12px", border: "1px solid #e5e7eb", borderRadius: "9px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "flex-start", flexWrap: "wrap" }}>
                  <div style={{ minWidth: 0 }}>
                    <strong>{invitation.questionnaireName ?? "Questionnaire"}</strong>
                    <div style={{ marginTop: "4px", color: "#6b7280", fontSize: "14px" }}>Created {new Date(invitation.createdAt).toLocaleString()}</div>
                    <div style={{ marginTop: "2px", fontSize: "14px", textTransform: "capitalize" }}>Status: <strong>{invitation.status}</strong></div>
                    {currentUrl ? (
                      <div style={{ marginTop: 9 }}>
                        <div style={{ overflowWrap: "anywhere", fontSize: 13 }}><a href={currentUrl}>{currentUrl}</a></div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 7 }}>
                          <button type="button" onClick={() => copyLink(currentUrl)} style={{ padding: "6px 9px", border: "1px solid #d1d5db", borderRadius: 7, background: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 12 }}>Copy link</button>
                          <a href={currentUrl} target="_blank" rel="noreferrer" style={{ padding: "6px 9px", border: "1px solid #d1d5db", borderRadius: 7, background: "#fff", color: "#1d4ed8", textDecoration: "none", fontWeight: 700, fontSize: 12 }}>Open link</a>
                        </div>
                      </div>
                    ) : canRevoke ? (
                      <div style={{ marginTop: 7, color: "#94a3b8", fontSize: 12 }}>Link is not recoverable after the creation view is lost.</div>
                    ) : null}
                  </div>
                  {canRevoke ? (
                    <button type="button" onClick={() => revoke(invitation.id)} disabled={revoking === invitation.id} style={{ padding: "7px 10px", border: "1px solid #fecaca", borderRadius: "8px", background: "#fff", cursor: "pointer" }}>
                      {revoking === invitation.id ? "Revoking…" : "Revoke"}
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
