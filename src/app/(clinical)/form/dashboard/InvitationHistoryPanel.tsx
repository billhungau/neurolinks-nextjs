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

export function InvitationHistoryPanel({
  vcitaUuid,
  refreshKey,
}: {
  vcitaUuid: string;
  refreshKey: number;
}) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);

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
      if (!data.ok) {
        setError(data.error ?? "Could not revoke invitation.");
      } else {
        await load();
      }
    } catch {
      setError("Could not revoke invitation.");
    } finally {
      setRevoking(null);
    }
  }

  return (
    <section style={{ marginBottom: "24px", padding: "18px", border: "1px solid #e5e7eb", borderRadius: "12px", background: "#fff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center" }}>
        <h3 style={{ margin: 0, fontSize: "20px" }}>Invitation history</h3>
        <button type="button" onClick={load} disabled={loading} style={{ padding: "7px 10px", border: "1px solid #d1d5db", borderRadius: "8px", background: "#fff", cursor: "pointer" }}>
          Refresh
        </button>
      </div>

      {loading ? <p style={{ color: "#6b7280" }}>Loading invitations…</p> : null}
      {error ? <p role="alert" style={{ color: "#991b1b" }}>{error}</p> : null}
      {!loading && !error && invitations.length === 0 ? (
        <p style={{ marginBottom: 0, color: "#6b7280" }}>No questionnaire invitations yet.</p>
      ) : null}

      {!loading && invitations.length > 0 ? (
        <div style={{ display: "grid", gap: "10px", marginTop: "14px" }}>
          {invitations.map((invitation) => {
            const canRevoke = invitation.status === "pending" || invitation.status === "opened";
            return (
              <div key={invitation.id} style={{ padding: "12px", border: "1px solid #e5e7eb", borderRadius: "9px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "flex-start" }}>
                  <div>
                    <strong>{invitation.questionnaireName ?? "Questionnaire"}</strong>
                    <div style={{ marginTop: "4px", color: "#6b7280", fontSize: "14px" }}>
                      Created {new Date(invitation.createdAt).toLocaleString()}
                    </div>
                    <div style={{ marginTop: "2px", fontSize: "14px", textTransform: "capitalize" }}>
                      Status: <strong>{invitation.status}</strong>
                    </div>
                  </div>
                  {canRevoke ? (
                    <button
                      type="button"
                      onClick={() => revoke(invitation.id)}
                      disabled={revoking === invitation.id}
                      style={{ padding: "7px 10px", border: "1px solid #fecaca", borderRadius: "8px", background: "#fff", cursor: "pointer" }}
                    >
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
