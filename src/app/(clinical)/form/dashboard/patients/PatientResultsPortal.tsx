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

const INITIAL_VISIBLE_RECENT = 20;

function clientName(client: Client) {
  return [client.firstName, client.lastName].filter(Boolean).join(" ") || "Unnamed vcita client";
}

export function PatientResultsPortal() {
  const [query, setQuery] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [recentClients, setRecentClients] = useState<Client[]>([]);
  const [selected, setSelected] = useState<Client | null>(null);
  const [searching, setSearching] = useState(false);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [recentError, setRecentError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [showAllRecent, setShowAllRecent] = useState(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadRecent() {
      setLoadingRecent(true);
      setRecentError(null);
      try {
        const response = await fetch("/form/api/vcita/clients/?recent=1", {
          cache: "no-store",
          signal: controller.signal,
        });
        const data = (await response.json()) as SearchResponse;
        if (controller.signal.aborted) return;
        if (data.ok) setRecentClients(data.clients);
        else setRecentError(data.error);
      } catch {
        if (!controller.signal.aborted) setRecentError("Recent vcita patients are unavailable.");
      } finally {
        if (!controller.signal.aborted) setLoadingRecent(false);
      }
    }

    loadRecent();
    return () => controller.abort();
  }, []);

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

  const searchingMode = query.trim().length >= 2;
  const recentVisible = showAllRecent ? recentClients : recentClients.slice(0, INITIAL_VISIBLE_RECENT);
  const listClients = searchingMode ? clients : recentVisible;

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

      {!selected && !searchingMode ? (
        <section style={{ marginBottom: "22px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "10px" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "16px" }}>Recent patients</h3>
              <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: "13px" }}>
                Quick access to the first 50 patients returned by vcita.
              </p>
            </div>
            {!loadingRecent && recentClients.length > INITIAL_VISIBLE_RECENT ? (
              <button
                type="button"
                onClick={() => setShowAllRecent((current) => !current)}
                style={{ border: "1px solid #d1d5db", background: "#fff", borderRadius: "8px", padding: "7px 10px", cursor: "pointer", fontWeight: 700 }}
              >
                {showAllRecent ? "Show fewer" : `Show all ${recentClients.length}`}
              </button>
            ) : null}
          </div>

          {loadingRecent ? <p style={{ color: "#6b7280" }}>Loading recent patients…</p> : null}
          {recentError ? <p role="alert" style={{ padding: "12px", background: "#fef2f2", borderRadius: "8px" }}>{recentError}</p> : null}
        </section>
      ) : null}

      {!selected && listClients.length > 0 ? (
        <div style={{ display: "grid", gap: "8px", marginBottom: "22px" }}>
          {listClients.map((client) => (
            <button
              key={client.id}
              type="button"
              onClick={() => setSelected(client)}
              style={{
                textAlign: "left",
                padding: "12px 14px",
                border: "1px solid #dbe2ea",
                borderRadius: "10px",
                background: "#fff",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                gap: "14px",
                alignItems: "center",
              }}
            >
              <span style={{ minWidth: 0 }}>
                <strong style={{ display: "block", color: "#111827" }}>{clientName(client)}</strong>
                <span style={{ display: "block", marginTop: "3px", color: "#6b7280", fontSize: "14px", overflowWrap: "anywhere" }}>
                  {[client.email, client.phone].filter(Boolean).join(" · ") || "No email or phone listed"}
                </span>
              </span>
              <span style={{ flex: "0 0 auto", color: "#2563eb", fontWeight: 700, fontSize: "13px" }}>View →</span>
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
            <div style={{ fontSize: "18px", fontWeight: 800 }}>{clientName(selected)}</div>
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
