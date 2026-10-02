"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { PatientResultsPanel } from "./PatientResultsPanel";

type ApiResponse =
  | { ok: true; url: string; expiresAt: string }
  | { ok: false; error: string };

type Client = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
};

type SearchResponse =
  | { ok: true; clients: Client[] }
  | { ok: false; error: string };

export function SendQuestionnaireForm() {
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [query, setQuery] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [selected, setSelected] = useState<Client | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < 2) {
      setClients([]);
      setSelected(null);
      setSearchError(null);
      setSearching(false);
      setHasSearched(false);
      return;
    }

    const requestId = ++requestIdRef.current;
    const controller = new AbortController();

    setSearching(true);
    setSearchError(null);
    setHasSearched(false);

    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/form/api/vcita/clients/?q=${encodeURIComponent(trimmed)}`,
          { cache: "no-store", signal: controller.signal },
        );
        const data = (await response.json()) as SearchResponse;

        if (requestId !== requestIdRef.current) return;

        if (data.ok) {
          setClients(data.clients);
          setSearchError(null);
        } else {
          setClients([]);
          setSearchError(data.error);
        }
        setHasSearched(true);
      } catch (error) {
        if (controller.signal.aborted || requestId !== requestIdRef.current) return;
        setClients([]);
        setSearchError("vcita patient search is unavailable.");
        setHasSearched(true);
      } finally {
        if (requestId === requestIdRef.current) setSearching(false);
      }
    }, 350);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) {
      setResult({ ok: false, error: "Select a patient first." });
      return;
    }

    setSubmitting(true);
    setResult(null);

    const form = new FormData(event.currentTarget);
    const response = await fetch("/form/api/invitations/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vcitaUuid: selected.id,
        questionnaireCode: String(form.get("questionnaireCode") ?? "bdii"),
        expiresInHours: Number(form.get("expiresInHours") ?? 72),
      }),
    });

    const data = (await response.json()) as ApiResponse;
    setResult(data);
    setSubmitting(false);
  }

  return (
    <div>
      <div style={{ marginBottom: "22px" }}>
        <label style={{ display: "block", marginBottom: "8px" }}>
          <span style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}>Find patient in vcita</span>
          <span style={{ display: "block", marginBottom: "8px", color: "#6b7280", fontSize: "14px" }}>
            Start typing a patient name, email, or phone number. Results update automatically.
          </span>
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSelected(null);
              setResult(null);
            }}
            minLength={2}
            autoComplete="off"
            aria-label="Search vcita patients by name, email, or phone"
            style={{ width: "100%", boxSizing: "border-box", padding: "11px 12px", border: "1px solid #d1d5db", borderRadius: "8px" }}
          />
        </label>
        {searching ? (
          <p aria-live="polite" style={{ margin: "8px 0 0", color: "#6b7280", fontSize: "14px" }}>
            Searching vcita…
          </p>
        ) : null}
      </div>

      {searchError ? <p role="alert" style={{ padding: "12px", background: "#fef2f2", borderRadius: "8px" }}>{searchError}</p> : null}

      {clients.length > 0 && !selected ? (
        <div style={{ marginBottom: "24px", display: "grid", gap: "8px" }}>
          {clients.map((client) => {
            const name = [client.firstName, client.lastName].filter(Boolean).join(" ") || "Unnamed vcita client";
            const details = [client.email, client.phone].filter(Boolean).join(" · ");
            return (
              <button
                key={client.id}
                type="button"
                onClick={() => setSelected(client)}
                style={{ textAlign: "left", padding: "12px", border: "1px solid #d1d5db", borderRadius: "9px", background: "#fff", cursor: "pointer" }}
              >
                <strong>{name}</strong>
                {details ? <span style={{ display: "block", marginTop: "3px", color: "#6b7280" }}>{details}</span> : null}
              </button>
            );
          })}
        </div>
      ) : null}

      {clients.length === 0 && hasSearched && !searching && query.trim().length >= 2 && !selected && !searchError ? (
        <p aria-live="polite" style={{ color: "#6b7280", marginBottom: "20px" }}>
          No matching vcita patients found.
        </p>
      ) : null}

      {selected ? (
        <>
        <div style={{ marginBottom: "16px", padding: "14px", border: "1px solid #bfdbfe", borderRadius: "10px", background: "#eff6ff" }}>
          <strong>{[selected.firstName, selected.lastName].filter(Boolean).join(" ") || "Selected vcita client"}</strong>
          <div style={{ marginTop: "3px", color: "#4b5563" }}>{[selected.email, selected.phone].filter(Boolean).join(" · ")}</div>
          <button type="button" onClick={() => setSelected(null)} style={{ marginTop: "9px", border: 0, padding: 0, background: "transparent", textDecoration: "underline", cursor: "pointer" }}>
            Choose another patient
          </button>
        </div>
        <PatientResultsPanel vcitaUuid={selected.id} />
        </>
      ) : null}

      <form onSubmit={submit}>
        <label style={{ display: "block", marginBottom: "16px" }}>
          <span style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}>Questionnaire</span>
          <select name="questionnaireCode" defaultValue="bdii" style={{ width: "100%", padding: "11px 12px", border: "1px solid #d1d5db", borderRadius: "8px" }}>
            <option value="bdii">BDI-II</option>
          </select>
        </label>

        <label style={{ display: "block", marginBottom: "20px" }}>
          <span style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}>Link expiry</span>
          <select name="expiresInHours" defaultValue="72" style={{ width: "100%", padding: "11px 12px", border: "1px solid #d1d5db", borderRadius: "8px" }}>
            <option value="24">24 hours</option>
            <option value="72">72 hours</option>
            <option value="168">7 days</option>
          </select>
        </label>

        <button disabled={submitting || !selected} type="submit" style={{ padding: "12px 18px", border: 0, borderRadius: "8px", fontWeight: 700, cursor: selected ? "pointer" : "not-allowed", background: "#111827", color: "#fff", opacity: selected ? 1 : 0.5 }}>
          {submitting ? "Creating…" : "Send questionnaire"}
        </button>
      </form>

      {result?.ok ? (
        <div style={{ marginTop: "24px", padding: "16px", border: "1px solid #d1fae5", borderRadius: "10px", background: "#ecfdf5" }}>
          <strong>Secure link created</strong>
          <p style={{ overflowWrap: "anywhere" }}><a href={result.url}>{result.url}</a></p>
          <p style={{ marginBottom: 0 }}>Expires: {new Date(result.expiresAt).toLocaleString()}</p>
        </div>
      ) : null}

      {result && !result.ok ? (
        <p role="alert" style={{ marginTop: "20px", padding: "12px", borderRadius: "8px", background: "#fef2f2" }}>{result.error}</p>
      ) : null}
    </div>
  );
}
