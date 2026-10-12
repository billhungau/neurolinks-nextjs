"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type SubmissionRow = {
  id: string;
  patientName: string;
  patientEmail: string | null;
  submittedLabel: string;
  totalScore: number;
  severity: string | null;
};

type SubmissionMode = "questionnaire" | "consent";

export function SubmissionTableClient({ code, rows, mode = "questionnaire" }: { code: string; rows: SubmissionRow[]; mode?: SubmissionMode }) {
  const [query, setQuery] = useState("");
  const isConsent = mode === "consent";
  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      `${row.patientName} ${row.patientEmail ?? ""}`.toLocaleLowerCase().includes(q),
    );
  }, [query, rows]);

  return (
    <>
      <div style={{ padding: "14px 16px", borderBottom: "1px solid #e2e8f0", background: "#fff" }}>
        <label style={{ display: "block" }}>
          <span style={{ display: "block", fontSize: 12, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 6 }}>Filter by patient</span>
          <input
            type="search"
            name="patient-submission-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Type patient name or email"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            enterKeyHint="search"
            data-form-type="other"
            data-lpignore="true"
            style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: 9, fontSize: 14 }}
          />
        </label>
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: 28, color: "#64748b" }}>No matching submissions on this page.</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: isConsent ? 700 : 760 }}>
            <thead><tr style={{ background: "#f8fafc", color: "#64748b", textAlign: "left", fontSize: 12, textTransform: "uppercase", letterSpacing: ".05em" }}>
              <th style={{ padding: "12px 16px" }}>Patient</th>
              <th style={{ padding: "12px 16px" }}>Submitted</th>
              {!isConsent ? <><th style={{ padding: "12px 16px" }}>Score</th><th style={{ padding: "12px 16px" }}>Severity</th></> : null}
              <th style={{ padding: "12px 16px", textAlign: "right" }}>{isConsent ? "Actions" : ""}</th>
            </tr></thead>
            <tbody>{filtered.map((row) => {
              const detailHref = `/form/dashboard/forms/submissions/${encodeURIComponent(code)}/${row.id}/`;
              const pdfHref = `/form/api/results/${encodeURIComponent(row.id)}/pdf/`;
              return (
                <tr key={row.id} style={{ borderTop: "1px solid #eef2f7" }}>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ fontWeight: 750, color: "#0f172a" }}>{row.patientName}</div>
                    {row.patientEmail ? <div style={{ marginTop: 3, color: "#64748b", fontSize: 13 }}>{row.patientEmail}</div> : null}
                  </td>
                  <td style={{ padding: "14px 16px", color: "#334155", whiteSpace: "nowrap" }}>{row.submittedLabel}</td>
                  {!isConsent ? <>
                    <td style={{ padding: "14px 16px", fontWeight: 800, fontSize: 16 }}>{row.totalScore}</td>
                    <td style={{ padding: "14px 16px", color: "#475569" }}>{row.severity || "—"}</td>
                  </> : null}
                  <td style={{ padding: "14px 16px", textAlign: "right" }}>
                    {isConsent ? (
                      <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "flex-end", gap: 8, whiteSpace: "nowrap" }}>
                        <Link href={detailHref} style={{ display: "inline-flex", alignItems: "center", padding: "8px 11px", border: "1px solid #cbd5e1", borderRadius: 8, color: "#0f172a", background: "#fff", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>View data</Link>
                        <a href={pdfHref} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", padding: "8px 11px", borderRadius: 8, color: "#fff", background: "#111827", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>Preview PDF</a>
                      </div>
                    ) : (
                      <Link href={detailHref} style={{ color: "#2563eb", fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>View details →</Link>
                    )}
                  </td>
                </tr>
              );
            })}</tbody>
          </table>
        </div>
      )}
    </>
  );
}
