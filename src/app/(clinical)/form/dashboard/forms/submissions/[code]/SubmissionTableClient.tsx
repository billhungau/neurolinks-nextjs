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

export function SubmissionTableClient({ code, rows }: { code: string; rows: SubmissionRow[] }) {
  const [query, setQuery] = useState("");
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
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Type patient name or email"
            autoComplete="off"
            style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: 9, fontSize: 14 }}
          />
        </label>
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: 28, color: "#64748b" }}>No matching submissions on this page.</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
            <thead><tr style={{ background: "#f8fafc", color: "#64748b", textAlign: "left", fontSize: 12, textTransform: "uppercase", letterSpacing: ".05em" }}>
              <th style={{ padding: "12px 16px" }}>Patient</th><th style={{ padding: "12px 16px" }}>Submitted</th><th style={{ padding: "12px 16px" }}>Score</th><th style={{ padding: "12px 16px" }}>Severity</th><th style={{ padding: "12px 16px" }}></th>
            </tr></thead>
            <tbody>{filtered.map((row) => (
              <tr key={row.id} style={{ borderTop: "1px solid #eef2f7" }}>
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ fontWeight: 750, color: "#0f172a" }}>{row.patientName}</div>
                  {row.patientEmail ? <div style={{ marginTop: 3, color: "#64748b", fontSize: 13 }}>{row.patientEmail}</div> : null}
                </td>
                <td style={{ padding: "14px 16px", color: "#334155", whiteSpace: "nowrap" }}>{row.submittedLabel}</td>
                <td style={{ padding: "14px 16px", fontWeight: 800, fontSize: 16 }}>{row.totalScore}</td>
                <td style={{ padding: "14px 16px", color: "#475569" }}>{row.severity || "—"}</td>
                <td style={{ padding: "14px 16px", textAlign: "right" }}>
                  <Link href={`/form/dashboard/forms/submissions/${encodeURIComponent(code)}/${row.id}/`} style={{ color: "#2563eb", fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>View details →</Link>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </>
  );
}
