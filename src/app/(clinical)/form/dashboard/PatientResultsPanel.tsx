"use client";

import { useEffect, useMemo, useState } from "react";

type Result = {
  id: string;
  submittedAt: string;
  totalScore: number;
  severity: string | null;
  item9Positive: boolean;
  item9Score: number;
};

type ApiResponse =
  | { ok: true; results: Result[] }
  | { ok: false; error: string };

function TrendChart({ results }: { results: Result[] }) {
  const width = 620;
  const height = 180;
  const pad = 28;

  const points = useMemo(() => {
    if (results.length === 0) return "";
    const usableWidth = width - pad * 2;
    const usableHeight = height - pad * 2;
    return results
      .map((result, index) => {
        const x =
          results.length === 1
            ? width / 2
            : pad + (index / (results.length - 1)) * usableWidth;
        const y = height - pad - (Math.min(63, Math.max(0, result.totalScore)) / 63) * usableHeight;
        return `${x},${y}`;
      })
      .join(" ");
  }, [results]);

  if (results.length === 0) return null;

  return (
    <div style={{ overflowX: "auto", marginTop: "14px" }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="BDI-II score trend"
        style={{ width: "100%", minWidth: "420px", height: "auto" }}
      >
        <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} stroke="currentColor" opacity="0.25" />
        <line x1={pad} y1={pad} x2={pad} y2={height - pad} stroke="currentColor" opacity="0.25" />
        <text x="4" y={pad + 4} fontSize="11" fill="currentColor" opacity="0.65">63</text>
        <text x="10" y={height - pad + 4} fontSize="11" fill="currentColor" opacity="0.65">0</text>
        {results.length > 1 ? (
          <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2.5" />
        ) : null}
        {results.map((result, index) => {
          const usableWidth = width - pad * 2;
          const usableHeight = height - pad * 2;
          const x =
            results.length === 1
              ? width / 2
              : pad + (index / (results.length - 1)) * usableWidth;
          const y = height - pad - (result.totalScore / 63) * usableHeight;
          return (
            <g key={result.id}>
              <circle cx={x} cy={y} r="5" fill="currentColor" />
              <text x={x} y={y - 10} textAnchor="middle" fontSize="12" fontWeight="700" fill="currentColor">
                {result.totalScore}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function PatientResultsPanel({ vcitaUuid }: { vcitaUuid: string }) {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/form/api/results/?vcitaUuid=${encodeURIComponent(vcitaUuid)}`,
          { cache: "no-store", signal: controller.signal },
        );
        const data = (await response.json()) as ApiResponse;
        if (controller.signal.aborted) return;

        if (data.ok) setResults(data.results);
        else {
          setResults([]);
          setError(data.error);
        }
      } catch {
        if (!controller.signal.aborted) {
          setResults([]);
          setError("Could not load BDI-II history.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [vcitaUuid]);

  return (
    <section
      aria-labelledby="bdii-history-heading"
      style={{
        marginBottom: "24px",
        padding: "18px",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        background: "#fff",
      }}
    >
      <h3 id="bdii-history-heading" style={{ margin: "0 0 6px", fontSize: "20px" }}>
        BDI-II history
      </h3>

      {loading ? <p style={{ color: "#6b7280" }}>Loading previous results…</p> : null}
      {error ? <p role="alert" style={{ color: "#991b1b" }}>{error}</p> : null}

      {!loading && !error && results.length === 0 ? (
        <p style={{ marginBottom: 0, color: "#6b7280" }}>No previous BDI-II results.</p>
      ) : null}

      {!loading && !error && results.length > 0 ? (
        <>
          <TrendChart results={results} />

          <div style={{ overflowX: "auto", marginTop: "16px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "8px 6px", borderBottom: "1px solid #e5e7eb" }}>Date</th>
                  <th style={{ textAlign: "right", padding: "8px 6px", borderBottom: "1px solid #e5e7eb" }}>Score</th>
                  <th style={{ textAlign: "left", padding: "8px 6px", borderBottom: "1px solid #e5e7eb" }}>Severity</th>
                  <th style={{ textAlign: "left", padding: "8px 6px", borderBottom: "1px solid #e5e7eb" }}>Item 9</th>
                </tr>
              </thead>
              <tbody>
                {[...results].reverse().map((result) => (
                  <tr key={result.id}>
                    <td style={{ padding: "9px 6px", borderBottom: "1px solid #f3f4f6" }}>
                      {new Date(result.submittedAt).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: "right", padding: "9px 6px", borderBottom: "1px solid #f3f4f6", fontWeight: 700 }}>
                      {result.totalScore}
                    </td>
                    <td style={{ padding: "9px 6px", borderBottom: "1px solid #f3f4f6", textTransform: "capitalize" }}>
                      {result.severity ?? "—"}
                    </td>
                    <td style={{ padding: "9px 6px", borderBottom: "1px solid #f3f4f6", fontWeight: result.item9Positive ? 700 : 400 }}>
                      {result.item9Positive ? `Positive (${result.item9Score})` : "0"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </section>
  );
}
