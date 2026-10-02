"use client";

import { useEffect, useMemo, useState } from "react";
import { BDI2_ITEMS, getBdi2OptionById } from "@/lib/clinical/questionnaires/bdii-definition";
import type { ImportedQuestionnaireSchema } from "@/lib/clinical/questionnaires/jotform-import";

type Result = {
  id: string;
  submittedAt: string;
  totalScore: number;
  severity: string | null;
  questionnaireCode: string;
  questionnaireName: string;
  maxScore: number | null;
  item9Positive: boolean;
  item9Score: number;
  obsessionScore: number | null;
  compulsionScore: number | null;
};

type ResultDetail = Result & {
  answers: Record<string, unknown>;
  schema: ImportedQuestionnaireSchema | null;
};

type ApiResponse =
  | { ok: true; results: Result[] }
  | { ok: false; error: string };

type DetailResponse =
  | { ok: true; result: ResultDetail }
  | { ok: false; error: string };

const ORDER = ["bdii", "bai", "ybocs", "pss"];
const LABELS: Record<string, string> = {
  bdii: "BDI-II",
  bai: "BAI",
  ybocs: "Y-BOCS",
  pss: "PSS",
};

function TrendChart({ results }: { results: Result[] }) {
  const width = 720;
  const height = 230;
  const padLeft = 34;
  const padRight = 24;
  const padTop = 30;
  const padBottom = 52;
  const maxScore = Math.max(1, results[0]?.maxScore ?? Math.max(...results.map((r) => r.totalScore), 1));

  const points = useMemo(() => {
    if (!results.length) return "";
    const usableWidth = width - padLeft - padRight;
    const usableHeight = height - padTop - padBottom;
    return results
      .map((result, index) => {
        const x = results.length === 1 ? width / 2 : padLeft + (index / (results.length - 1)) * usableWidth;
        const y = height - padBottom - (Math.min(maxScore, Math.max(0, result.totalScore)) / maxScore) * usableHeight;
        return `${x},${y}`;
      })
      .join(" ");
  }, [results, maxScore]);

  if (!results.length) return null;

  return (
    <div style={{ overflowX: "auto", marginTop: "14px" }}>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Questionnaire score trend" style={{ width: "100%", minWidth: "420px", height: "auto" }}>
        <line x1={padLeft} y1={height - padBottom} x2={width - padRight} y2={height - padBottom} stroke="currentColor" opacity="0.25" />
        <line x1={padLeft} y1={padTop} x2={padLeft} y2={height - padBottom} stroke="currentColor" opacity="0.25" />
        <text x="4" y={padTop + 4} fontSize="11" fill="currentColor" opacity="0.65">{maxScore}</text>
        <text x="10" y={height - padBottom + 4} fontSize="11" fill="currentColor" opacity="0.65">0</text>
        {results.length > 1 ? <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2.5" /> : null}
        {results.map((result, index) => {
          const usableWidth = width - padLeft - padRight;
          const usableHeight = height - padTop - padBottom;
          const x = results.length === 1 ? width / 2 : padLeft + (index / (results.length - 1)) * usableWidth;
          const y = height - padBottom - (result.totalScore / maxScore) * usableHeight;
          const dateLabel = new Date(result.submittedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: results.length <= 6 ? "2-digit" : undefined });
          const showDate = results.length <= 8 || index === 0 || index === results.length - 1 || index === Math.floor((results.length - 1) / 2);
          return (
            <g key={result.id}>
              <title>{dateLabel}: score {result.totalScore}</title>
              <circle cx={x} cy={y} r="5" fill="currentColor" />
              <text x={x} y={y - 10} textAnchor="middle" fontSize="12" fontWeight="700" fill="currentColor">{result.totalScore}</text>
              {showDate ? (
                <text x={x} y={height - 22} textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.7">{dateLabel}</text>
              ) : null}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function ImportedAnswers({ detail }: { detail: ResultDetail }) {
  const schema = detail.schema;
  if (!schema) return <p style={{ color: "#6b7280" }}>Exact questionnaire schema is unavailable for this result.</p>;

  return (
    <div style={{ display: "grid", gap: "9px", marginTop: "14px" }}>
      {schema.fields.map((field) => {
        if (field.kind === "display") return null;

        if (field.kind === "matrix_radio") {
          return field.rows.map((row, rowIndex) => {
            const value = String(detail.answers[`${field.qid}:${rowIndex}`] ?? "—");
            return (
              <div key={`${field.qid}:${rowIndex}`} style={{ padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px" }}>
                <strong>{row}</strong>
                <div style={{ marginTop: "4px" }}>{value}</div>
              </div>
            );
          });
        }

        const raw = detail.answers[field.qid];
        const value = Array.isArray(raw) ? raw.join(", ") : String(raw ?? "—");
        return (
          <div key={field.qid} style={{ padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px" }}>
            <strong>{field.text}</strong>
            <div style={{ marginTop: "4px", whiteSpace: "pre-line" }}>{value}</div>
          </div>
        );
      })}
    </div>
  );
}

function BdiAnswers({ detail }: { detail: ResultDetail }) {
  return (
    <div style={{ display: "grid", gap: "8px", marginTop: "14px" }}>
      {BDI2_ITEMS.map((item) => {
        const rawAnswer = detail.answers[item.key] as number | { optionId?: string; score?: number; legacyText?: string } | undefined;
        const isLegacy = typeof rawAnswer === "number";
        const score = typeof rawAnswer === "number" ? rawAnswer : Number(rawAnswer?.score ?? 0);
        const exact = typeof rawAnswer === "object" && rawAnswer?.optionId ? getBdi2OptionById(item.key, rawAnswer.optionId) : null;
        const matching = item.options.filter((candidate) => candidate.value === score);
        const option = exact?.option ?? matching[0] ?? null;
        const legacyText =
          typeof rawAnswer === "object" && rawAnswer?.legacyText
            ? rawAnswer.legacyText
            : null;
        const ambiguousLegacy = isLegacy && matching.length > 1;
        const isItem9 = item.key === "q9";

        return (
          <div key={item.key} style={{
            padding: "10px 12px",
            borderRadius: "8px",
            border: isItem9 && score > 0 ? "2px solid #dc2626" : "1px solid #e5e7eb",
            background: isItem9 && score > 0 ? "#fef2f2" : "#fff",
          }}>
            <strong>{item.title}</strong>
            <div style={{ marginTop: "4px" }}>
              {legacyText
                ? legacyText
                : ambiguousLegacy
                  ? `${score}. Legacy result — direction of this response was not captured.`
                  : `${score}. ${option?.label ?? "Recorded response"}`}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function PatientResultsPanel({ vcitaUuid, refreshKey }: { vcitaUuid: string; refreshKey: number }) {
  const [results, setResults] = useState<Result[]>([]);
  const [activeCode, setActiveCode] = useState("bdii");
  const [selectedDetail, setSelectedDetail] = useState<ResultDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/form/api/results/?vcitaUuid=${encodeURIComponent(vcitaUuid)}`, { cache: "no-store", signal: controller.signal });
        const data = (await response.json()) as ApiResponse;
        if (controller.signal.aborted) return;
        if (data.ok) {
          setResults(data.results);
          const available = ORDER.find((code) => data.results.some((result) => result.questionnaireCode === code));
          if (available) setActiveCode((current) => data.results.some((r) => r.questionnaireCode === current) ? current : available);
        } else {
          setResults([]);
          setError(data.error);
        }
      } catch {
        if (!controller.signal.aborted) setError("Could not load questionnaire history.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [vcitaUuid, refreshKey]);

  const activeResults = results.filter((result) => result.questionnaireCode === activeCode);
  const availableCodes = ORDER.filter((code) => results.some((result) => result.questionnaireCode === code));

  async function openDetail(id: string) {
    setDetailLoading(true);
    setSelectedDetail(null);
    try {
      const response = await fetch(`/form/api/results/${encodeURIComponent(id)}/?vcitaUuid=${encodeURIComponent(vcitaUuid)}`, { cache: "no-store" });
      const data = (await response.json()) as DetailResponse;
      if (data.ok) setSelectedDetail(data.result);
    } finally {
      setDetailLoading(false);
    }
  }

  return (
    <section style={{ marginBottom: "24px", padding: "18px", border: "1px solid #e5e7eb", borderRadius: "12px", background: "#fff" }}>
      <h3 style={{ margin: "0 0 12px", fontSize: "20px" }}>Questionnaire results</h3>

      {loading ? <p style={{ color: "#6b7280" }}>Loading previous results…</p> : null}
      {error ? <p role="alert" style={{ color: "#991b1b" }}>{error}</p> : null}
      {!loading && !error && results.length === 0 ? <p style={{ marginBottom: 0, color: "#6b7280" }}>No previous questionnaire results.</p> : null}

      {!loading && !error && results.length > 0 ? (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
            {availableCodes.map((code) => (
              <button key={code} type="button" onClick={() => { setActiveCode(code); setSelectedDetail(null); }}
                style={{
                  padding: "8px 12px",
                  borderRadius: "999px",
                  border: "1px solid #d1d5db",
                  background: activeCode === code ? "#111827" : "#fff",
                  color: activeCode === code ? "#fff" : "#111827",
                  fontWeight: 700,
                  cursor: "pointer",
                }}>
                {LABELS[code] ?? code.toUpperCase()}
              </button>
            ))}
          </div>

          <TrendChart results={activeResults} />

          <div style={{ overflowX: "auto", marginTop: "16px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "8px 6px", borderBottom: "1px solid #e5e7eb" }}>Date</th>
                  <th style={{ textAlign: "right", padding: "8px 6px", borderBottom: "1px solid #e5e7eb" }}>Score</th>
                  {activeCode === "ybocs" ? <>
                    <th style={{ textAlign: "right", padding: "8px 6px", borderBottom: "1px solid #e5e7eb" }}>Obs.</th>
                    <th style={{ textAlign: "right", padding: "8px 6px", borderBottom: "1px solid #e5e7eb" }}>Comp.</th>
                  </> : null}
                  {activeCode === "bdii" ? <th style={{ textAlign: "left", padding: "8px 6px", borderBottom: "1px solid #e5e7eb" }}>Item 9</th> : null}
                </tr>
              </thead>
              <tbody>
                {[...activeResults].reverse().map((result) => (
                  <tr key={result.id} onClick={() => openDetail(result.id)} style={{ cursor: "pointer" }}>
                    <td style={{ padding: "9px 6px", borderBottom: "1px solid #f3f4f6", textDecoration: "underline" }}>{new Date(result.submittedAt).toLocaleDateString()}</td>
                    <td style={{ textAlign: "right", padding: "9px 6px", borderBottom: "1px solid #f3f4f6", fontWeight: 700 }}>{result.totalScore}</td>
                    {activeCode === "ybocs" ? <>
                      <td style={{ textAlign: "right", padding: "9px 6px", borderBottom: "1px solid #f3f4f6" }}>{result.obsessionScore ?? "—"}</td>
                      <td style={{ textAlign: "right", padding: "9px 6px", borderBottom: "1px solid #f3f4f6" }}>{result.compulsionScore ?? "—"}</td>
                    </> : null}
                    {activeCode === "bdii" ? <td style={{ padding: "9px 6px", borderBottom: "1px solid #f3f4f6", fontWeight: result.item9Positive ? 700 : 400 }}>{result.item9Positive ? `Positive (${result.item9Score})` : "0"}</td> : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {detailLoading ? <p style={{ color: "#6b7280" }}>Loading result details…</p> : null}

          {selectedDetail ? (
            <div style={{ marginTop: "18px", paddingTop: "16px", borderTop: "1px solid #e5e7eb" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center" }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: "18px" }}>{selectedDetail.questionnaireName}</h4>
                  <div style={{ marginTop: "4px", color: "#4b5563" }}>{new Date(selectedDetail.submittedAt).toLocaleString()} — Score {selectedDetail.totalScore}</div>
                  {selectedDetail.questionnaireCode === "ybocs" ? <div style={{ marginTop: "4px" }}>Obsession {selectedDetail.obsessionScore ?? "—"} · Compulsion {selectedDetail.compulsionScore ?? "—"}</div> : null}
                </div>
                <button type="button" onClick={() => setSelectedDetail(null)} style={{ border: 0, background: "transparent", textDecoration: "underline", cursor: "pointer" }}>Close</button>
              </div>

              {selectedDetail.questionnaireCode === "bdii"
                ? <BdiAnswers detail={selectedDetail} />
                : <ImportedAnswers detail={selectedDetail} />}
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
