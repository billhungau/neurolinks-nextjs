"use client";

import { useEffect, useRef, useState } from "react";
import { PatientResultsPanel } from "../PatientResultsPanel";

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

export function PatientResultsPortal() {
  const [query, setQuery] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [selected, setSelected] = useState<Client | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setClients([]);
      setHasSearched(false);
      setSearchError(null);
      return;
    }

    const id = ++requestIdRef.current;
    const controller = new AbortController();
    setSearching(true);
    setHasSearched(false);
    setSearchError(null);

    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch("/form/api/vcita/clients/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ q }),
          cache: "no-store",
          signal: controller.signal,
        });
        const data = (await response.json()) as SearchResponse;
        if (id !== requestIdRef.current) return;
        if (data.ok) setClients(data.clients);
        else {
          setClients([]);
          setSearchError(data.error);
        }
        setHasSearched(true);
      } catch {
        if (!controller.signal.aborted && id === requestIdRef.current) {
          setClients([]);
          setSearchError("vcita patient search is unavailable.");
          setHasSearched(true);
        }
      } finally {
        if (id === requestIdRef.current) setSearching(false);
      }
    }, 300);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return (
    <div>
      <label style={{ display: "block", marginBottom: "18px" }}>
        <span style={{ display: "block", marginBottom: "6px", fontWeight: 700 }}>Find patient</span>
        <span style={{ display: "block", marginBottom: "8px", color: "#6b7280", fontSize: "14px" }}>
          Search vcita by patient name, email, or phone number.
        </span>
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setSelected(null);
          }}
          autoComplete="off"
          placeholder="Start typing a patient name"
          style={{ width: "100%", boxSizing: "border-box", padding: "11px 12px", border: "1px solid #d1d5db", borderRadius: "8px" }}
        />
      </label>

      {searching ? <p style={{ color: "#6b7280" }}>Searching vcita…</p> : null}
      {searchError ? <p role="alert" style={{ padding: "12px", background: "#fef2f2", borderRadius: "8px" }}>{searchError}</p> : null}

      {!selected && clients.length > 0 ? (
        <div style={{ display: "grid", gap: "8px", marginBottom: "22px" }}>
          {clients.map((client) => (
            <button
              key={client.id}
              type="button"
              onClick={() => setSelected(client)}
              style={{ textAlign: "left", padding: "12px", border: "1px solid #d1d5db", borderRadius: "9px", background: "#fff", cursor: "pointer" }}
            >
              <strong>{[client.firstName, client.lastName].filter(Boolean).join(" ") || "Unnamed vcita client"}</strong>
              <span style={{ display: "block", marginTop: "3px", color: "#6b7280" }}>
                {[client.email, client.phone].filter(Boolean).join(" · ")}
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {!selected && hasSearched && !searching && clients.length === 0 && !searchError ? (
        <p style={{ color: "#6b7280" }}>No matching vcita patients found.</p>
      ) : null}

      {selected ? (
        <>
          <div style={{ marginBottom: "18px", padding: "14px 16px", border: "1px solid #bfdbfe", borderRadius: "10px", background: "#eff6ff" }}>
            <div style={{ fontSize: "18px", fontWeight: 800 }}>
              {[selected.firstName, selected.lastName].filter(Boolean).join(" ") || "Selected patient"}
            </div>
            <div style={{ marginTop: "3px", color: "#4b5563" }}>
              {[selected.email, selected.phone].filter(Boolean).join(" · ")}
            </div>
            <button
              type="button"
              onClick={() => {
                setSelected(null);
                setQuery("");
                setClients([]);
              }}
              style={{ marginTop: "8px", border: 0, padding: 0, background: "transparent", textDecoration: "underline", cursor: "pointer" }}
            >
              Choose another patient
            </button>
          </div>

          <PatientResultsPanel vcitaUuid={selected.id} refreshKey={0} />
        </>
      ) : null}
    </div>
  );
}
