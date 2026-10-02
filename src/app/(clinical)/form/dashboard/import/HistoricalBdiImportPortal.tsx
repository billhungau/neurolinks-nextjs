"use client";

import { useMemo, useState } from "react";

type Match = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
};

type Row = {
  submissionId: string;
  submittedAt: string | null;
  jotformName: string;
  normalizedName: string;
  totalScore: number | null;
  alreadyImported: boolean;
  status: "unique_exact" | "ambiguous" | "no_match";
  matches: Match[];
};

type PreviewResponse =
  | {
      ok: true;
      generatedAt: string;
      submissionCount: number;
      vcitaClientCount: number;
      summary: {
        uniqueExact: number;
        ambiguous: number;
        noMatch: number;
        alreadyImported: number;
      };
      rows: Row[];
    }
  | { ok: false; error: string };

type SearchResponse =
  | { ok: true; clients: Match[] }
  | { ok: false; error: string };

type ImportResult = {
  submissionId: string;
  status: "imported" | "already_imported" | "error";
  error?: string;
};

type ImportResponse =
  | { ok: true; results: ImportResult[] }
  | { ok: false; error: string };

const statusLabel: Record<Row["status"], string> = {
  unique_exact: "Unique exact match",
  ambiguous: "Ambiguous",
  no_match: "No match",
};

async function importRecords(
  records: Array<{ submissionId: string; vcitaUuid: string; matchMode: "exact_name" | "manual" }>,
) {
  const response = await fetch("/form/api/import/bdii/commit/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ records }),
  });
  return (await response.json()) as ImportResponse;
}

function ManualMatchControl({
  row,
  onImported,
}: {
  row: Row;
  onImported: () => Promise<void>;
}) {
  const [query, setQuery] = useState(row.jotformName);
  const [clients, setClients] = useState<Match[]>(row.matches);
  const [searching, setSearching] = useState(false);
  const [importingId, setImportingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function search() {
    const q = query.trim();
    if (q.length < 2) return;

    setSearching(true);
    setMessage(null);
    try {
      const response = await fetch("/form/api/vcita/clients/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q }),
        cache: "no-store",
      });
      const data = (await response.json()) as SearchResponse;
      if (data.ok) setClients(data.clients);
      else setMessage(data.error);
    } catch {
      setMessage("vcita search failed.");
    } finally {
      setSearching(false);
    }
  }

  async function importTo(client: Match) {
    const name = [client.firstName, client.lastName].filter(Boolean).join(" ");
    if (!window.confirm(`Import this historical BDI-II result to ${name}?`)) return;

    setImportingId(client.id);
    setMessage(null);
    try {
      const data = await importRecords([
        {
          submissionId: row.submissionId,
          vcitaUuid: client.id,
          matchMode: "manual",
        },
      ]);

      if (!data.ok) {
        setMessage(data.error);
      } else {
        const result = data.results[0];
        if (result?.status === "imported" || result?.status === "already_imported") {
          setMessage(result.status === "imported" ? "Imported." : "Already imported.");
          await onImported();
        } else {
          setMessage(result?.error ?? "Import failed.");
        }
      }
    } catch {
      setMessage("Import failed.");
    } finally {
      setImportingId(null);
    }
  }

  if (row.alreadyImported) {
    return <strong style={{ color: "#166534" }}>Imported</strong>;
  }

  return (
    <div style={{ minWidth: "260px" }}>
      <div style={{ display: "flex", gap: "6px", marginBottom: "8px" }}>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search vcita"
          style={{ minWidth: 0, flex: 1, padding: "7px 8px", border: "1px solid #d1d5db", borderRadius: "7px" }}
        />
        <button
          type="button"
          onClick={search}
          disabled={searching}
          style={{ padding: "7px 9px", border: "1px solid #d1d5db", borderRadius: "7px", background: "#fff", cursor: "pointer" }}
        >
          {searching ? "…" : "Search"}
        </button>
      </div>

      <div style={{ display: "grid", gap: "6px" }}>
        {clients.slice(0, 8).map((client) => {
          const name = [client.firstName, client.lastName].filter(Boolean).join(" ");
          return (
            <button
              key={client.id}
              type="button"
              onClick={() => importTo(client)}
              disabled={Boolean(importingId)}
              style={{
                textAlign: "left",
                padding: "8px",
                border: "1px solid #d1d5db",
                borderRadius: "7px",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              <strong>{name || "Unnamed vcita client"}</strong>
              <span style={{ display: "block", color: "#6b7280", fontSize: "12px", marginTop: "2px" }}>
                {[client.email, client.phone].filter(Boolean).join(" · ")}
              </span>
            </button>
          );
        })}
      </div>

      {message ? <div style={{ marginTop: "6px", fontSize: "12px", color: "#4b5563" }}>{message}</div> : null}
    </div>
  );
}

export function HistoricalBdiImportPortal() {
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | Row["status"]>("all");
  const [query, setQuery] = useState("");
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<{ done: number; total: number } | null>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);

  async function runPreview() {
    setLoading(true);
    try {
      const response = await fetch("/form/api/import/bdii/preview/", {
        method: "GET",
        cache: "no-store",
      });
      const data = (await response.json()) as PreviewResponse;
      setPreview(data);
    } catch {
      setPreview({ ok: false, error: "Could not load the import preview." });
    } finally {
      setLoading(false);
    }
  }

  async function importExactMatches() {
    if (!preview?.ok) return;

    const records = preview.rows
      .filter((row) => row.status === "unique_exact" && !row.alreadyImported && row.matches.length === 1)
      .map((row) => ({
        submissionId: row.submissionId,
        vcitaUuid: row.matches[0].id,
        matchMode: "exact_name" as const,
      }));

    if (records.length === 0) {
      setImportMessage("All uniquely matched records are already imported.");
      return;
    }

    if (!window.confirm(`Import ${records.length} uniquely matched historical BDI-II results into the clinical database?`)) {
      return;
    }

    setImporting(true);
    setImportProgress({ done: 0, total: records.length });
    setImportMessage(null);

    let imported = 0;
    let already = 0;
    let failed = 0;

    try {
      for (let index = 0; index < records.length; index += 20) {
        const batch = records.slice(index, index + 20);
        const data = await importRecords(batch);

        if (!data.ok) {
          failed += batch.length;
        } else {
          for (const result of data.results) {
            if (result.status === "imported") imported += 1;
            else if (result.status === "already_imported") already += 1;
            else failed += 1;
          }
        }

        setImportProgress({
          done: Math.min(index + batch.length, records.length),
          total: records.length,
        });
      }

      setImportMessage(
        `Import finished: ${imported} imported, ${already} already present, ${failed} failed.`,
      );
      await runPreview();
    } catch {
      setImportMessage("The batch import stopped unexpectedly. It is safe to run it again; completed records will not be duplicated.");
    } finally {
      setImporting(false);
    }
  }

  const filteredRows = useMemo(() => {
    if (!preview?.ok) return [];
    const q = query.trim().toLocaleLowerCase();

    return preview.rows.filter((row) => {
      if (filter !== "all" && row.status !== filter) return false;
      if (!q) return true;

      const matchText = row.matches
        .map((match) => [match.firstName, match.lastName, match.email, match.phone].filter(Boolean).join(" "))
        .join(" ");

      return [row.jotformName, row.submissionId, matchText]
        .join(" ")
        .toLocaleLowerCase()
        .includes(q);
    });
  }, [preview, filter, query]);

  const pendingUnique =
    preview?.ok
      ? preview.rows.filter((row) => row.status === "unique_exact" && !row.alreadyImported).length
      : 0;

  return (
    <div>
      <div style={{ padding: "16px", border: "1px solid #bfdbfe", background: "#eff6ff", borderRadius: "10px", marginBottom: "20px" }}>
        <strong>Review before import</strong>
        <p style={{ margin: "6px 0 0", lineHeight: 1.5 }}>
          Exact-name matches can be imported in batches. Ambiguous and unmatched records require an explicit vcita patient selection. Re-running an import is safe: each Jotform submission has a deterministic import identifier and cannot be duplicated.
        </p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        <button
          type="button"
          onClick={runPreview}
          disabled={loading || importing}
          style={{ padding: "11px 16px", border: 0, borderRadius: "8px", background: "#111827", color: "#fff", fontWeight: 700, cursor: "pointer" }}
        >
          {loading ? "Building preview…" : "Refresh matching preview"}
        </button>

        {preview?.ok ? (
          <button
            type="button"
            onClick={importExactMatches}
            disabled={importing || pendingUnique === 0}
            style={{ padding: "11px 16px", border: "1px solid #166534", borderRadius: "8px", background: "#f0fdf4", color: "#166534", fontWeight: 700, cursor: "pointer" }}
          >
            {importing ? "Importing…" : `Import ${pendingUnique} verified exact matches`}
          </button>
        ) : null}
      </div>

      {importProgress ? (
        <div style={{ marginTop: "14px" }}>
          <div style={{ fontSize: "14px", marginBottom: "5px" }}>
            Imported/checked {importProgress.done} of {importProgress.total}
          </div>
          <progress value={importProgress.done} max={importProgress.total} style={{ width: "100%" }} />
        </div>
      ) : null}

      {importMessage ? (
        <p style={{ marginTop: "14px", padding: "12px", background: "#f9fafb", borderRadius: "8px" }}>
          {importMessage}
        </p>
      ) : null}

      {preview && !preview.ok ? (
        <p role="alert" style={{ marginTop: "18px", padding: "12px", background: "#fef2f2", borderRadius: "8px" }}>
          {preview.error}
        </p>
      ) : null}

      {preview?.ok ? (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px", margin: "22px 0" }}>
            {[
              ["Jotform submissions", preview.submissionCount],
              ["Unique exact", preview.summary.uniqueExact],
              ["Ambiguous", preview.summary.ambiguous],
              ["No match", preview.summary.noMatch],
              ["Already imported", preview.summary.alreadyImported],
            ].map(([label, value]) => (
              <div key={String(label)} style={{ padding: "14px", border: "1px solid #e5e7eb", borderRadius: "10px", background: "#fff" }}>
                <div style={{ color: "#6b7280", fontSize: "13px" }}>{label}</div>
                <div style={{ fontSize: "26px", fontWeight: 800, marginTop: "4px" }}>{value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "16px" }}>
            <select value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)}
              style={{ padding: "9px 10px", border: "1px solid #d1d5db", borderRadius: "8px" }}>
              <option value="all">All statuses</option>
              <option value="unique_exact">Unique exact</option>
              <option value="ambiguous">Ambiguous</option>
              <option value="no_match">No match</option>
            </select>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filter by patient name or submission ID"
              style={{ flex: 1, minWidth: "240px", padding: "9px 10px", border: "1px solid #d1d5db", borderRadius: "8px" }}
            />
          </div>

          <div style={{ overflowX: "auto", border: "1px solid #e5e7eb", borderRadius: "10px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "10px", borderBottom: "1px solid #e5e7eb" }}>Jotform patient</th>
                  <th style={{ textAlign: "left", padding: "10px", borderBottom: "1px solid #e5e7eb" }}>Date</th>
                  <th style={{ textAlign: "right", padding: "10px", borderBottom: "1px solid #e5e7eb" }}>Score</th>
                  <th style={{ textAlign: "left", padding: "10px", borderBottom: "1px solid #e5e7eb" }}>vcita match / review</th>
                  <th style={{ textAlign: "left", padding: "10px", borderBottom: "1px solid #e5e7eb" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.submissionId}>
                    <td style={{ padding: "10px", borderBottom: "1px solid #f3f4f6" }}>
                      <strong>{row.jotformName || "Unnamed"}</strong>
                      <div style={{ color: "#9ca3af", fontSize: "12px", marginTop: "2px" }}>{row.submissionId}</div>
                    </td>
                    <td style={{ padding: "10px", borderBottom: "1px solid #f3f4f6" }}>
                      {row.submittedAt ? new Date(row.submittedAt).toLocaleDateString() : "—"}
                    </td>
                    <td style={{ textAlign: "right", padding: "10px", borderBottom: "1px solid #f3f4f6" }}>
                      {row.totalScore ?? "—"}
                    </td>
                    <td style={{ padding: "10px", borderBottom: "1px solid #f3f4f6" }}>
                      {row.status === "unique_exact" ? (
                        row.alreadyImported ? (
                          <strong style={{ color: "#166534" }}>Imported</strong>
                        ) : row.matches[0] ? (
                          <div>
                            <strong>{[row.matches[0].firstName, row.matches[0].lastName].filter(Boolean).join(" ")}</strong>
                            <div style={{ color: "#6b7280", fontSize: "12px" }}>
                              {[row.matches[0].email, row.matches[0].phone].filter(Boolean).join(" · ")}
                            </div>
                          </div>
                        ) : "—"
                      ) : (
                        <ManualMatchControl row={row} onImported={runPreview} />
                      )}
                    </td>
                    <td style={{ padding: "10px", borderBottom: "1px solid #f3f4f6", fontWeight: 700 }}>
                      {row.alreadyImported ? "Imported" : statusLabel[row.status]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p style={{ color: "#6b7280", fontSize: "13px", marginTop: "12px" }}>
            Showing {filteredRows.length} of {preview.rows.length} historical submissions. Preview generated {new Date(preview.generatedAt).toLocaleString()}.
          </p>
        </>
      ) : null}
    </div>
  );
}
