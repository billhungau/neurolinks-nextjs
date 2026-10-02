"use client";

import { useEffect, useState } from "react";

type SetupForm = { code: string; formId: string; configured: boolean; changed?: boolean };
type SetupResponse =
  | { ok: true; forms: SetupForm[] }
  | { ok: false; error: string };

type QueueItem = {
  id: string;
  occurredAt: string;
  submissionId: string;
  formId: string;
  code: "bdii" | "bai" | "ybocs" | "pss";
  reason: string;
  jotformName: string;
};

type QueueResponse =
  | { ok: true; queue: QueueItem[] }
  | { ok: false; error: string };

type Client = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
};

type ClientResponse =
  | { ok: true; clients: Client[] }
  | { ok: false; error: string };

const LABELS: Record<string, string> = {
  bdii: "BDI-II",
  bai: "BAI",
  ybocs: "Y-BOCS",
  pss: "PSS",
};

function ReconcileRow({
  item,
  onResolved,
}: {
  item: QueueItem;
  onResolved: () => Promise<void>;
}) {
  const [query, setQuery] = useState(item.jotformName);
  const [clients, setClients] = useState<Client[]>([]);
  const [searching, setSearching] = useState(false);
  const [resolving, setResolving] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function search() {
    if (query.trim().length < 2) return;
    setSearching(true);
    setMessage(null);
    try {
      const response = await fetch("/form/api/vcita/clients/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: query.trim() }),
        cache: "no-store",
      });
      const data = (await response.json()) as ClientResponse;
      if (data.ok) setClients(data.clients);
      else setMessage(data.error);
    } catch {
      setMessage("vcita search failed.");
    } finally {
      setSearching(false);
    }
  }

  async function resolve(client: Client) {
    const name = [client.firstName, client.lastName].filter(Boolean).join(" ");
    if (!window.confirm(`Link this ${LABELS[item.code]} submission to ${name} and sync it?`)) return;

    setResolving(client.id);
    setMessage(null);
    try {
      const response = await fetch("/form/api/jotform/reconciliation/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formId: item.formId,
          submissionId: item.submissionId,
          vcitaUuid: client.id,
        }),
      });
      const data = await response.json() as { ok?: boolean; error?: string };
      if (data.ok) {
        setMessage("Synced.");
        await onResolved();
      } else {
        setMessage(data.error ?? "Sync failed.");
      }
    } catch {
      setMessage("Sync failed.");
    } finally {
      setResolving(null);
    }
  }

  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: "10px", padding: "14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
        <div>
          <strong>{LABELS[item.code]} · {item.jotformName || "Unnamed submission"}</strong>
          <div style={{ color: "#6b7280", fontSize: "12px", marginTop: "3px" }}>
            Submission {item.submissionId} · {new Date(item.occurredAt).toLocaleString()}
          </div>
        </div>
        <div style={{ color: "#92400e", fontSize: "13px", fontWeight: 700 }}>{item.reason}</div>
      </div>

      <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search vcita patient"
          style={{ flex: 1, minWidth: "220px", padding: "9px 10px", border: "1px solid #d1d5db", borderRadius: "8px" }}
        />
        <button type="button" onClick={search} disabled={searching}
          style={{ padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: "8px", background: "#fff", cursor: "pointer" }}>
          {searching ? "Searching…" : "Search"}
        </button>
      </div>

      {clients.length > 0 ? (
        <div style={{ display: "grid", gap: "6px", marginTop: "10px" }}>
          {clients.slice(0, 8).map((client) => (
            <button
              key={client.id}
              type="button"
              onClick={() => resolve(client)}
              disabled={Boolean(resolving)}
              style={{ textAlign: "left", padding: "9px 10px", border: "1px solid #d1d5db", borderRadius: "8px", background: "#fff", cursor: "pointer" }}
            >
              <strong>{[client.firstName, client.lastName].filter(Boolean).join(" ")}</strong>
              <span style={{ display: "block", color: "#6b7280", fontSize: "12px" }}>
                {[client.email, client.phone].filter(Boolean).join(" · ")}
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {message ? <div style={{ marginTop: "8px", fontSize: "13px" }}>{message}</div> : null}
    </div>
  );
}

export function JotformSyncPortal() {
  const [setup, setSetup] = useState<SetupResponse | null>(null);
  const [queue, setQueue] = useState<QueueResponse | null>(null);
  const [loadingSetup, setLoadingSetup] = useState(false);
  const [loadingQueue, setLoadingQueue] = useState(false);

  async function loadSetup() {
    setLoadingSetup(true);
    try {
      const response = await fetch("/form/api/jotform/setup/", { cache: "no-store" });
      setSetup(await response.json() as SetupResponse);
    } finally {
      setLoadingSetup(false);
    }
  }

  async function configure() {
    setLoadingSetup(true);
    try {
      const response = await fetch("/form/api/jotform/setup/", { method: "POST" });
      setSetup(await response.json() as SetupResponse);
    } finally {
      setLoadingSetup(false);
    }
  }

  async function loadQueue() {
    setLoadingQueue(true);
    try {
      const response = await fetch("/form/api/jotform/reconciliation/", { cache: "no-store" });
      setQueue(await response.json() as QueueResponse);
    } finally {
      setLoadingQueue(false);
    }
  }

  useEffect(() => {
    void loadSetup();
    void loadQueue();
  }, []);

  const allConfigured = setup?.ok && setup.forms.every((form) => form.configured);

  return (
    <div>
      <section style={{ marginBottom: "26px" }}>
        <h2 style={{ marginTop: 0 }}>Webhook connection</h2>
        <p style={{ color: "#4b5563", lineHeight: 1.55 }}>
          New submissions from the four questionnaire Jotforms can be sent automatically into the clinical database.
        </p>

        {setup?.ok ? (
          <div style={{ display: "grid", gap: "7px", marginBottom: "12px" }}>
            {setup.forms.map((form) => (
              <div key={form.formId} style={{ display: "flex", justifyContent: "space-between", gap: "12px", padding: "9px 11px", border: "1px solid #e5e7eb", borderRadius: "8px" }}>
                <strong>{LABELS[form.code] ?? form.code}</strong>
                <span style={{ fontWeight: 700 }}>{form.configured ? "Connected" : "Not connected"}</span>
              </div>
            ))}
          </div>
        ) : setup ? (
          <p role="alert" style={{ padding: "12px", background: "#fef2f2", borderRadius: "8px" }}>{setup.error}</p>
        ) : null}

        <button
          type="button"
          onClick={configure}
          disabled={loadingSetup}
          style={{ padding: "10px 14px", border: 0, borderRadius: "8px", background: "#111827", color: "#fff", fontWeight: 700, cursor: "pointer" }}
        >
          {loadingSetup ? "Checking…" : allConfigured ? "Recheck / repair webhook connections" : "Configure Jotform webhooks"}
        </button>
      </section>

      <section>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center" }}>
          <div>
            <h2 style={{ margin: 0 }}>Needs patient reconciliation</h2>
            <p style={{ color: "#4b5563", margin: "6px 0 0" }}>
              Only submissions that could not be matched confidently appear here.
            </p>
          </div>
          <button type="button" onClick={loadQueue} disabled={loadingQueue}
            style={{ padding: "8px 11px", border: "1px solid #d1d5db", borderRadius: "8px", background: "#fff", cursor: "pointer" }}>
            {loadingQueue ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {queue?.ok && queue.queue.length === 0 ? (
          <p style={{ marginTop: "16px", padding: "13px", background: "#f0fdf4", borderRadius: "8px" }}>
            No unresolved Jotform submissions.
          </p>
        ) : null}

        {queue && !queue.ok ? (
          <p role="alert" style={{ marginTop: "16px", padding: "12px", background: "#fef2f2", borderRadius: "8px" }}>{queue.error}</p>
        ) : null}

        {queue?.ok && queue.queue.length > 0 ? (
          <div style={{ display: "grid", gap: "10px", marginTop: "16px" }}>
            {queue.queue.map((item) => (
              <ReconcileRow key={item.submissionId} item={item} onResolved={loadQueue} />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
