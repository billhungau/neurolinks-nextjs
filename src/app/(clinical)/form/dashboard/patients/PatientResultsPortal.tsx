"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PatientResultsPanel } from "../PatientResultsPanel";
import { PatientQuestionnaireSender } from "./PatientQuestionnaireSender";

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

type PatientMode = "results" | "send";

const PATIENTS_PER_PAGE = 25;
const SEARCH_MIN_CHARS = 3;
const SEARCH_DEBOUNCE_MS = 600;
const PREFETCH_DELAY_MS = 1500;

function clientName(client: Client) {
  return [client.firstName, client.lastName].filter(Boolean).join(" ") || "Unnamed vcita client";
}

function normalizeSearch(value: string) {
  return value.trim().toLocaleLowerCase();
}

function clientMatchesLoadedSearch(client: Client, normalizedQuery: string) {
  if (!normalizedQuery) return false;
  const fullName = normalizeSearch(`${client.firstName} ${client.lastName}`);
  const reverseName = normalizeSearch(`${client.lastName} ${client.firstName}`);
  const email = normalizeSearch(client.email ?? "");
  return fullName.includes(normalizedQuery) || reverseName.includes(normalizedQuery) || email.includes(normalizedQuery);
}

function mergeClients(primary: Client[], secondary: Client[]) {
  const byId = new Map<string, Client>();
  for (const client of [...primary, ...secondary]) byId.set(client.id, client);
  return [...byId.values()];
}

export function PatientResultsPortal() {
  const [query, setQuery] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [patientPages, setPatientPages] = useState<Record<number, Client[]>>({});
  const [selected, setSelected] = useState<Client | null>(null);
  const [mode, setMode] = useState<PatientMode>("results");
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

  function choosePatient(client: Client, nextMode: PatientMode) {
    setSelected(client);
    setMode(nextMode);
  }

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

  useEffect(() => {
    if (!patientPages[patientPage]) return;
    const nextPage = patientPage + 1;
    if (nextPage <= patientTotalPages && !patientPages[nextPage]) {
      const timer = window.setTimeout(() => void loadPatientPage(nextPage), PREFETCH_DELAY_MS);
      return () => window.clearTimeout(timer);
    }
  }, [patientPage, patientPages, patientTotalPages]);

  const loadedPatients = useMemo(() => {
    const byId = new Map<string, Client>();
    for (const pageClients of Object.values(patientPages)) {
      for (const client of pageClients) byId.set(client.id, client);
    }
    return [...byId.values()];
  }, [patientPages]);

  const normalizedQuery = normalizeSearch(query);
  const localMatches = useMemo(() => {
    if (normalizedQuery.length < SEARCH_MIN_CHARS) return [];
    return loadedPatients.filter((client) => clientMatchesLoadedSearch(client, normalizedQuery));
  }, [loadedPatients, normalizedQuery]);

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
    setSearching(localMatches.length === 0);
    setHasSearched(localMatches.length > 0);
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
  }, [query, localMatches.length]);

  const searchingMode = query.trim().length >= SEARCH_MIN_CHARS;
  const currentPatientClients = patientPages[patientPage] ?? [];
  const searchClients = useMemo(() => mergeClients(localMatches, clients), [localMatches, clients]);
  const listClients = searchingMode ? searchClients : currentPatientClients;

  return (
    <div>
      {!selected ? (
        <label style={{ display: "block", marginBottom: "18px" }}>
          <span style={{ display: "block", marginBottom: "6px", fontWeight: 700 }}>Find patient</span>
          <span style={{ display: "block", marginBottom: "8px", color: "#6b7280", fontSize: "14px" }}>Search vcita by patient name, email, or phone number.</span>
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
      ) : null}

      {searching && localMatches.length === 0 ? <p style={{ color: "#6b7280" }}>Searching vcita…</p> : null}
      {searchError ? <p role="alert" style={{ padding: "12px", background: "#fef2f2", borderRadius: "8px" }}>{searchError}</p> : null}

      {!selected && !searchingMode ? (
        <section style={{ marginBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "10px", flexWrap: "wrap" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "16px" }}>Patient list</h3>
              {!loadingPatients && !patientError && patientTotal > 0 ? <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: "13px" }}>{patientTotal} patients · {PATIENTS_PER_PAGE} per page</p> : null}
            </div>
            {!loadingPatients && patientTotal > PATIENTS_PER_PAGE ? <div style={{ color: "#6b7280", fontSize: "13px" }}>Page {patientPage} of {patientTotalPages}</div> : null}
          </div>
          {loadingPatients && currentPatientClients.length === 0 ? <p style={{ color: "#6b7280" }}>Loading patient list…</p> : null}
          {patientError ? <p role="alert" style={{ padding: "12px", background: "#fef2f2", borderRadius: "8px" }}>{patientError}</p> : null}
        </section>
      ) : null}

      {!selected && listClients.length > 0 ? (
        <div style={{ display: "grid", gap: "8px", marginBottom: "16px" }}>
          {listClients.map((client) => (
            <div key={client.id} style={{ padding: "12px 14px", border: "1px solid #dbe2ea", borderRadius: "10px", background: "#fff", display: "flex", justifyContent: "space-between", gap: "14px", alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ minWidth: 0, flex: "1 1 220px" }}>
                <strong style={{ display: "block", color: "#111827" }}>{clientName(client)}</strong>
                <span style={{ display: "block", marginTop: "3px", color: "#6b7280", fontSize: "14px", overflowWrap: "anywhere" }}>{client.email || "No email listed"}</span>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button type="button" onClick={() => choosePatient(client, "results")} style={{ border: "1px solid #cbd5e1", borderRadius: 8, padding: "8px 11px", background: "#fff", color: "#0f172a", fontWeight: 700, cursor: "pointer" }}>View</button>
                <button type="button" onClick={() => choosePatient(client, "send")} style={{ border: 0, borderRadius: 8, padding: "8px 11px", background: "#2563eb", color: "#fff", fontWeight: 700, cursor: "pointer" }}>Send questionnaires</button>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {!selected && !searchingMode && patientTotal > PATIENTS_PER_PAGE ? (
        <nav aria-label="Patient list pagination" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "22px" }}>
          <button type="button" disabled={patientPage <= 1} onClick={() => setPatientPage((page) => Math.max(1, page - 1))} style={{ padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: "8px", background: "#fff", fontWeight: 700, cursor: patientPage <= 1 ? "not-allowed" : "pointer", opacity: patientPage <= 1 ? 0.45 : 1 }}>← Previous</button>
          <span style={{ color: "#6b7280", fontSize: "13px" }}>Page {patientPage} of {patientTotalPages}</span>
          <button type="button" disabled={patientPage >= patientTotalPages} onClick={() => setPatientPage((page) => Math.min(patientTotalPages, page + 1))} style={{ padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: "8px", background: "#fff", fontWeight: 700, cursor: patientPage >= patientTotalPages ? "not-allowed" : "pointer", opacity: patientPage >= patientTotalPages ? 0.45 : 1 }}>Next →</button>
        </nav>
      ) : null}

      {!selected && hasSearched && !searching && searchClients.length === 0 && !searchError ? <p style={{ color: "#6b7280" }}>No matching vcita patients found.</p> : null}
      {!selected && !searchingMode && !loadingPatients && !patientError && patientTotal === 0 ? <p style={{ color: "#6b7280" }}>No patients available yet.</p> : null}

      {selected ? (
        <>
          <div style={{ marginBottom: 14, padding: "14px 16px", border: "1px solid #bfdbfe", borderRadius: 10, background: "#eff6ff", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 18, fontWeight: 800 }}>{clientName(selected)}</div>
              <div style={{ marginTop: 3, color: "#4b5563", overflowWrap: "anywhere" }}>{selected.email || "No email listed"}</div>
            </div>
            <button type="button" onClick={() => { setSelected(null); setQuery(""); setClients([]); }} style={{ flex: "0 0 auto", border: "1px solid #2563eb", borderRadius: 8, padding: "9px 12px", background: "#fff", color: "#1d4ed8", fontWeight: 750, fontSize: 14, cursor: "pointer", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>← Choose another patient</button>
          </div>

          <div role="tablist" aria-label="Patient actions" style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
            <button type="button" role="tab" aria-selected={mode === "results"} onClick={() => setMode("results")} style={{ padding: "9px 13px", borderRadius: 8, border: mode === "results" ? "1px solid #2563eb" : "1px solid #cbd5e1", background: mode === "results" ? "#eff6ff" : "#fff", color: mode === "results" ? "#1d4ed8" : "#334155", fontWeight: 750, cursor: "pointer" }}>Results</button>
            <button type="button" role="tab" aria-selected={mode === "send"} onClick={() => setMode("send")} style={{ padding: "9px 13px", borderRadius: 8, border: mode === "send" ? "1px solid #2563eb" : "1px solid #cbd5e1", background: mode === "send" ? "#2563eb" : "#fff", color: mode === "send" ? "#fff" : "#334155", fontWeight: 750, cursor: "pointer" }}>Send questionnaires</button>
          </div>

          {mode === "results" ? <PatientResultsPanel vcitaUuid={selected.id} refreshKey={0} /> : <PatientQuestionnaireSender patient={selected} />}
        </>
      ) : null}
    </div>
  );
}
