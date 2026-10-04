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
  | { ok: true; clients: Client[]; page?: number; pageSize?: number; total?: number; totalPages?: number }
  | { ok: false; error: string };

const PATIENTS_PER_PAGE = 25;
const SEARCH_MIN_CHARS = 3;
const SEARCH_DEBOUNCE_MS = 600;
const PREFETCH_DELAY_MS = 1500;

function clientName(client: Client) {
  return [client.firstName, client.lastName].filter(Boolean).join(" ") || "Unnamed vcita client";
}

export function PatientResultsPortal() {
  const [query, setQuery] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [patientPages, setPatientPages] = useState<Record<number, Client[]>>({});
  const [selected, setSelected] = useState<Client | null>(null);
  const [searching, setSearching] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [patientError, setPatientError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [patientPage, setPatientPage] = useState(1);
  const [patientTotal, setPatientTotal] = useState(0);
  const [patientTotalPages, setPatientTotalPages] = useState(1);
  const requestIdRef = useRef(0);
  const patientPagesRef = useRef<Record<number, Client[]>>({});
  const loadingPagesRef = useRef(new Set<number>());

  function storePatientPage(page: number, pageClients: Client[]) {
    patientPagesRef.current = { ...patientPagesRef.current, [page]: pageClients };
    setPatientPages(patientPagesRef.current);
  }

  async function loadPatientPage(page: number, options: { foreground?: boolean } = {}) {
    if (page < 1 || patientPagesRef.current[page] || loadingPagesRef.current.has(page)) return;
    loadingPagesRef.current.add(page);
    if (options.foreground) {
      setLoadingPatients(true);
      setPatientError(null);
    }

    try {
      const response = await fetch(`/form/api/results/patient-list/?page=${page}`, { cache: "no-store" });
      const data = (await response.json()) as SearchResponse;
      if (!data.ok) {
        if (options.foreground) setPatientError(data.error);
        return;
      }
      const actualPage = data.page ?? page;
      storePatientPage(actualPage, data.clients);
      setPatientTotal(data.total ?? data.clients.length);
      setPatientTotalPages(Math.max(1, data.totalPages ?? 1));
    } catch {
      if (options.foreground) setPatientError("Patient list is unavailable.");
    } finally {
      loadingPagesRef.current.delete(page);
      if (options.foreground) setLoadingPatients(false);
    }
  }

  useEffect(() => {
    void loadPatientPage(1, { foreground: true });
  }, []);

  useEffect(() => {
    if (!patientPages[patientPage]) void loadPatientPage(patientPage, { foreground: true });
  }, [patientPage, patientPages]);

  // Prefetch exactly one page ahead, but only after the current page has been
  // visible for a moment so background vcita traffic does not compete with the
  // foreground page load.
  useEffect(() => {
    if (!patientPages[patientPage]) return;
    const nextPage = patientPage + 1;
    if (nextPage <= patientTotalPages && !patientPages[nextPage]) {
      const timer = window.setTimeout(
        () => void loadPatientPage(nextPage),
        PREFETCH_DELAY_MS,
      );
      return () => window.clearTimeout(timer);
    }
  }, [patientPage, patientPages, patientTotalPages]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < SEARCH_MIN_CHARS) {
      setClients([]);
      setHasSearched(false);
      setSearchError(null);
      setSearching(false);
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
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const searchingMode = query.trim().length >= SEARCH_MIN_CHARS;
  const currentPatientClients = patientPages[patientPage] ?? [];
  const listClients = searchingMode ? clients : currentPatientClients;

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
        <section style={{ marginBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "10px", flexWrap: "wrap" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "16px" }}>Patient list</h3>
              {!loadingPatients && !patientError && patientTotal > 0 ? (
                <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: "13px" }}>
                  {patientTotal} patients · {PATIENTS_PER_PAGE} per page
                </p>
              ) : null}
            </div>
            {!loadingPatients && patientTotal > PATIENTS_PER_PAGE ? (
              <div style={{ color: "#6b7280", fontSize: "13px" }}>Page {patientPage} of {patientTotalPages}</div>
            ) : null}
          </div>

          {loadingPatients && currentPatientClients.length === 0 ? <p style={{ color: "#6b7280" }}>Loading patient list…</p> : null}
          {patientError ? <p role="alert" style={{ padding: "12px", background: "#fef2f2", borderRadius: "8px" }}>{patientError}</p> : null}
        </section>
      ) : null}

      {!selected && listClients.length > 0 ? (
        <div style={{ display: "grid", gap: "8px", marginBottom: "16px" }}>
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
                  {client.email || "No email listed"}
                </span>
              </span>
              <span style={{ flex: "0 0 auto", color: "#2563eb", fontWeight: 700, fontSize: "13px" }}>View →</span>
            </button>
          ))}
        </div>
      ) : null}

      {!selected && !searchingMode && patientTotal > PATIENTS_PER_PAGE ? (
        <nav aria-label="Patient list pagination" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "22px" }}>
          <button
            type="button"
            disabled={patientPage <= 1}
            onClick={() => setPatientPage((page) => Math.max(1, page - 1))}
            style={{ padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: "8px", background: "#fff", fontWeight: 700, cursor: patientPage <= 1 ? "not-allowed" : "pointer", opacity: patientPage <= 1 ? 0.45 : 1 }}
          >
            ← Previous
          </button>
          <span style={{ color: "#6b7280", fontSize: "13px" }}>Page {patientPage} of {patientTotalPages}</span>
          <button
            type="button"
            disabled={patientPage >= patientTotalPages}
            onClick={() => setPatientPage((page) => Math.min(patientTotalPages, page + 1))}
            style={{ padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: "8px", background: "#fff", fontWeight: 700, cursor: patientPage >= patientTotalPages ? "not-allowed" : "pointer", opacity: patientPage >= patientTotalPages ? 0.45 : 1 }}
          >
            Next →
          </button>
        </nav>
      ) : null}

      {!selected && hasSearched && !searching && clients.length === 0 && !searchError ? (
        <p style={{ color: "#6b7280" }}>No matching vcita patients found.</p>
      ) : null}

      {!selected && !searchingMode && !loadingPatients && !patientError && patientTotal === 0 ? (
        <p style={{ color: "#6b7280" }}>No patients available yet.</p>
      ) : null}

      {selected ? (
        <>
          <div
            style={{
              marginBottom: "18px",
              padding: "14px 16px",
              border: "1px solid #bfdbfe",
              borderRadius: "10px",
              background: "#eff6ff",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "14px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: "18px", fontWeight: 800 }}>{clientName(selected)}</div>
              <div style={{ marginTop: "3px", color: "#4b5563", overflowWrap: "anywhere" }}>
                {selected.email || "No email listed"}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelected(null);
                setQuery("");
                setClients([]);
              }}
              style={{
                flex: "0 0 auto",
                border: "1px solid #2563eb",
                borderRadius: "8px",
                padding: "9px 12px",
                background: "#fff",
                color: "#1d4ed8",
                fontWeight: 750,
                fontSize: "14px",
                cursor: "pointer",
                boxShadow: "0 1px 2px rgba(15,23,42,.06)",
              }}
            >
              ← Choose another patient
            </button>
          </div>

          <PatientResultsPanel vcitaUuid={selected.id} refreshKey={0} />
        </>
      ) : null}
    </div>
  );
}
