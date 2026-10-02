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
      };
      rows: Row[];
    }
  | { ok: false; error: string };

const statusLabel: Record<Row["status"], string> = {
  unique_exact: "Unique exact match",
  ambiguous: "Ambiguous",
  no_match: "No match",
};

export function HistoricalBdiImportPortal() {
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | Row["status"]>("all");
  const [query, setQuery] = useState("");

  async function runPreview() {
    setLoading(true);
    setPreview(null);
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

  const filteredRows = useMemo(() => {
    if (!preview?.ok) return [];
    const q = query.trim().toLocaleLowerCase();

    return preview.rows.filter((row) => {
      if (filter !== "all" && row.status !== filter) return false;
      if (!q) return true;

      const matchText = row.matches
        .map((match) => [match.firstName, match.lastName, match.email, match.phone].filter(Boolean).join(" "))
        .join(" ");

      return [
        row.jotformName,
        row.submissionId,
        matchText,
      ]
        .join(" ")
        .toLocaleLowerCase()
        .includes(q);
    });
  }, [preview, filter, query]);

  return (
    <div>
      <div style={{ padding: "16px", border: "1px solid #fde68a", background: "#fffbeb", borderRadius: "10px", marginBottom: "20px" }}>
        <strong>Dry run only</strong>
        <p style={{ margin: "6px 0 0", lineHeight: 1.5 }}>
          This screen reads historical Jotform submissions and vcita clients to propose matches. It does not write assessment results, invitations, or audit records.
        </p>
      </div>

      <button
        type="button"
        onClick={runPreview}
        disabled={loading}
        style={{ padding: "11px 16px", border: 0, borderRadius: "8px", background: "#111827", color: "#fff", fontWeight: 700, cursor: "pointer" }}
      >
        {loading ? "Building preview…" : "Run BDI-II matching preview"}
      </button>

      {preview && !preview.ok ? (
        <p role="alert" style={{ marginTop: "18px", padding: "12px", background: "#fef2f2", borderRadius: "8px" }}>
          {preview.error}
        </p>
      ) : null}

      {preview?.ok ? (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px", margin: "22px 0" }}>
            {[
              ["Jotform submissions", preview.submissionCount],
              ["Unique exact", preview.summary.uniqueExact],
              ["Ambiguous", preview.summary.ambiguous],
              ["No match", preview.summary.noMatch],
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
                  <th style={{ textAlign: "left", padding: "10px", borderBottom: "1px solid #e5e7eb" }}>Proposed vcita match</th>
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
                      {row.matches.length === 0
                        ? "—"
                        : row.matches.map((match) => (
                            <div key={match.id} style={{ marginBottom: "5px" }}>
                              <strong>{[match.firstName, match.lastName].filter(Boolean).join(" ")}</strong>
                              <div style={{ color: "#6b7280", fontSize: "12px" }}>
                                {[match.email, match.phone].filter(Boolean).join(" · ")}
                              </div>
                            </div>
                          ))}
                    </td>
                    <td style={{ padding: "10px", borderBottom: "1px solid #f3f4f6", fontWeight: 700 }}>
                      {statusLabel[row.status]}
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
