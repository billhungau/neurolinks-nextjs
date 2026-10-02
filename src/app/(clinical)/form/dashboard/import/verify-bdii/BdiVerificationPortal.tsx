"use client";

import { useMemo, useState } from "react";

type SummaryRow = {
  submissionId: string;
  jotformName: string;
  vcitaPatient: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
  } | null;
  jotformDate: string | null;
  supabaseDate: string | null;
  jotformTotal: number | null;
  supabaseTotal: number | null;
  dateMatch: boolean;
  totalMatch: boolean;
  itemMismatchCount: number;
  itemMatchCount: number;
  status: "match" | "mismatch" | "not_imported";
};

type Detail = SummaryRow & {
  items: Array<{
    key: string;
    title: string;
    jotformText: string;
    jotformScore: number | null;
    supabaseText: string;
    supabaseScore: number | null;
    textMatch: boolean;
    scoreMatch: boolean;
    match: boolean;
  }>;
};

type ListResponse =
  | {
      ok: true;
      generatedAt: string;
      summary: {
        totalJotform: number;
        imported: number;
        fullMatches: number;
        mismatches: number;
        notImported: number;
      };
      rows: SummaryRow[];
    }
  | { ok: false; error: string };

type DetailResponse =
  | { ok: true; detail: Detail }
  | { ok: false; error: string };

export function BdiVerificationPortal() {
  const [data, setData] = useState<ListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | SummaryRow["status"]>("mismatch");
  const [query, setQuery] = useState("");

  async function runVerification() {
    setLoading(true);
    setDetail(null);
    try {
      const response = await fetch("/form/api/import/bdii/verify/", { cache: "no-store" });
      setData((await response.json()) as ListResponse);
    } catch {
      setData({ ok: false, error: "Could not load verification report." });
    } finally {
      setLoading(false);
    }
  }

  async function openDetail(submissionId: string) {
    setDetailLoading(true);
    setDetail(null);
    try {
      const response = await fetch(
        `/form/api/import/bdii/verify/?submissionId=${encodeURIComponent(submissionId)}`,
        { cache: "no-store" },
      );
      const payload = (await response.json()) as DetailResponse;
      if (payload.ok) setDetail(payload.detail);
    } finally {
      setDetailLoading(false);
    }
  }

  const rows = useMemo(() => {
    if (!data?.ok) return [];
    const q = query.trim().toLocaleLowerCase();
    return data.rows.filter((row) => {
      if (filter !== "all" && row.status !== filter) return false;
      if (!q) return true;
      const patient = row.vcitaPatient
        ? [row.vcitaPatient.firstName, row.vcitaPatient.lastName, row.vcitaPatient.email, row.vcitaPatient.phone]
            .filter(Boolean)
            .join(" ")
        : "";
      return [row.jotformName, patient, row.submissionId]
        .join(" ")
        .toLocaleLowerCase()
        .includes(q);
    });
  }, [data, filter, query]);

  return (
    <div>
      <div style={{ padding: "16px", border: "1px solid #bfdbfe", background: "#eff6ff", borderRadius: "10px", marginBottom: "18px" }}>
        <strong>Read-only verification</strong>
        <p style={{ margin: "6px 0 0", lineHeight: 1.5 }}>
          This compares the original Jotform BDI-II submission with the imported Supabase record. It does not modify either source.
        </p>
      </div>

      <button
        type="button"
        onClick={runVerification}
        disabled={loading}
        style={{ padding: "11px 16px", border: 0, borderRadius: "8px", background: "#111827", color: "#fff", fontWeight: 700, cursor: "pointer" }}
      >
        {loading ? "Checking migration…" : "Run BDI-II verification"}
      </button>

      {data && !data.ok ? (
        <p role="alert" style={{ marginTop: "16px", padding: "12px", background: "#fef2f2", borderRadius: "8px" }}>{data.error}</p>
      ) : null}

      {data?.ok ? (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px,1fr))", gap: "12px", margin: "20px 0" }}>
            {[
              ["Jotform", data.summary.totalJotform],
              ["Imported", data.summary.imported],
              ["Full matches", data.summary.fullMatches],
              ["Mismatches", data.summary.mismatches],
              ["Not imported", data.summary.notImported],
            ].map(([label, value]) => (
              <div key={String(label)} style={{ padding: "14px", border: "1px solid #e5e7eb", borderRadius: "10px" }}>
                <div style={{ color: "#6b7280", fontSize: "13px" }}>{label}</div>
                <div style={{ fontSize: "26px", fontWeight: 800, marginTop: "4px" }}>{value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "14px" }}>
            <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}
              style={{ padding: "9px 10px", border: "1px solid #d1d5db", borderRadius: "8px" }}>
              <option value="all">All</option>
              <option value="match">Full matches</option>
              <option value="mismatch">Mismatches</option>
              <option value="not_imported">Not imported</option>
            </select>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by patient or submission ID"
              style={{ flex: 1, minWidth: "240px", padding: "9px 10px", border: "1px solid #d1d5db", borderRadius: "8px" }}
            />
          </div>

          <div style={{ overflowX: "auto", border: "1px solid #e5e7eb", borderRadius: "10px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "10px" }}>Jotform patient</th>
                  <th style={{ textAlign: "left", padding: "10px" }}>vcita patient</th>
                  <th style={{ textAlign: "right", padding: "10px" }}>Jotform score</th>
                  <th style={{ textAlign: "right", padding: "10px" }}>Supabase score</th>
                  <th style={{ textAlign: "right", padding: "10px" }}>Item mismatches</th>
                  <th style={{ textAlign: "left", padding: "10px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.submissionId} onClick={() => openDetail(row.submissionId)} style={{ cursor: "pointer", borderTop: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "10px" }}>
                      <strong style={{ textDecoration: "underline" }}>{row.jotformName || "Unnamed"}</strong>
                      <div style={{ color: "#9ca3af", fontSize: "12px" }}>{row.submissionId}</div>
                    </td>
                    <td style={{ padding: "10px" }}>
                      {row.vcitaPatient
                        ? [row.vcitaPatient.firstName, row.vcitaPatient.lastName].filter(Boolean).join(" ")
                        : "—"}
                    </td>
                    <td style={{ textAlign: "right", padding: "10px" }}>{row.jotformTotal ?? "—"}</td>
                    <td style={{ textAlign: "right", padding: "10px" }}>{row.supabaseTotal ?? "—"}</td>
                    <td style={{ textAlign: "right", padding: "10px", fontWeight: row.itemMismatchCount ? 800 : 400 }}>
                      {row.itemMismatchCount}
                    </td>
                    <td style={{ padding: "10px", fontWeight: 700 }}>
                      {row.status === "match" ? "Match" : row.status === "mismatch" ? "Mismatch" : "Not imported"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {detailLoading ? <p style={{ color: "#6b7280", marginTop: "16px" }}>Loading item comparison…</p> : null}

          {detail ? (
            <section style={{ marginTop: "22px", paddingTop: "18px", borderTop: "2px solid #e5e7eb" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "start" }}>
                <div>
                  <h3 style={{ margin: 0 }}>{detail.jotformName || "Unnamed"} — item verification</h3>
                  <p style={{ margin: "6px 0 0", color: "#4b5563" }}>
                    vcita: {detail.vcitaPatient ? [detail.vcitaPatient.firstName, detail.vcitaPatient.lastName].filter(Boolean).join(" ") : "not resolved"}
                    {" · "}Jotform total {detail.jotformTotal ?? "—"}
                    {" · "}Supabase total {detail.supabaseTotal ?? "—"}
                  </p>
                </div>
                <button type="button" onClick={() => setDetail(null)} style={{ border: 0, background: "transparent", textDecoration: "underline", cursor: "pointer" }}>Close</button>
              </div>

              <div style={{ overflowX: "auto", marginTop: "14px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left", padding: "8px" }}>Item</th>
                      <th style={{ textAlign: "left", padding: "8px" }}>Jotform answer</th>
                      <th style={{ textAlign: "left", padding: "8px" }}>Supabase answer</th>
                      <th style={{ textAlign: "center", padding: "8px" }}>Score</th>
                      <th style={{ textAlign: "left", padding: "8px" }}>Check</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.items.map((item) => (
                      <tr key={item.key} style={{ borderTop: "1px solid #f3f4f6", background: item.match ? "#fff" : "#fef2f2" }}>
                        <td style={{ padding: "9px", fontWeight: 700 }}>{item.title}</td>
                        <td style={{ padding: "9px", maxWidth: "320px" }}>{item.jotformText || "—"}</td>
                        <td style={{ padding: "9px", maxWidth: "320px" }}>{item.supabaseText || "—"}</td>
                        <td style={{ padding: "9px", textAlign: "center" }}>
                          {item.jotformScore ?? "—"} / {item.supabaseScore ?? "—"}
                        </td>
                        <td style={{ padding: "9px", fontWeight: 700 }}>{item.match ? "Match" : "Mismatch"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
