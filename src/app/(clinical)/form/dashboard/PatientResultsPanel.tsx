"use client";

import { useEffect, useMemo, useState } from "react";
import { BDI2_ITEMS, getBdi2OptionById } from "@/lib/clinical/questionnaires/bdii-definition";
import type { ImportedField, ImportedQuestionnaireSchema } from "@/lib/clinical/questionnaires/jotform-import";

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

type ComparisonItem = {
  key: string;
  label: string;
  answer: string;
  score: number | null;
};

const ORDER = ["bdii", "bai", "ybocs", "pss"];
const LABELS: Record<string, string> = {
  bdii: "BDI-II",
  bai: "BAI",
  ybocs: "Y-BOCS",
  pss: "PSS",
};

const SCORE_BACKGROUNDS = ["#f8fbff", "#e7f1ff", "#bdd8ff", "#7faef2"];

function itemBackground(score: number | null | undefined) {
  if (score === null || score === undefined || !Number.isFinite(score)) return "#fff";
  const index = Math.max(0, Math.min(3, Math.round(score)));
  return SCORE_BACKGROUNDS[index];
}

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
    <div style={{ marginTop: "14px", width: "100%" }}>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Questionnaire score trend" style={{ width: "100%", height: "auto", display: "block" }}>
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
          const dateLabel = new Date(result.submittedAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: results.length <= 6 ? "2-digit" : undefined,
          });
          const showDate = results.length <= 8 || index === 0 || index === results.length - 1 || index === Math.floor((results.length - 1) / 2);
          return (
            <g key={result.id}>
              <title>{dateLabel}: score {result.totalScore}</title>
              <circle cx={x} cy={y} r="5" fill="currentColor" />
              <text x={x} y={y - 10} textAnchor="middle" fontSize="12" fontWeight="700" fill="currentColor">{result.totalScore}</text>
              {showDate ? <text x={x} y={height - 22} textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.7">{dateLabel}</text> : null}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function numericPrefix(value: string): number | null {
  const match = value.trim().match(/^([0-9]+)(?:[.\s]|$)/);
  return match ? Number(match[1]) : null;
}

function bdiItem(detail: ResultDetail, itemKey: string): ComparisonItem {
  const item = BDI2_ITEMS.find((candidate) => candidate.key === itemKey)!;
  const rawAnswer = detail.answers[item.key] as number | { optionId?: string; score?: number; legacyText?: string } | undefined;
  const isLegacy = typeof rawAnswer === "number";
  const score = typeof rawAnswer === "number"
    ? rawAnswer
    : typeof rawAnswer?.score === "number"
      ? rawAnswer.score
      : null;
  const exact = typeof rawAnswer === "object" && rawAnswer?.optionId
    ? getBdi2OptionById(item.key, rawAnswer.optionId)
    : null;
  const matching = score === null ? [] : item.options.filter((candidate) => candidate.value === score);
  const option = exact?.option ?? matching[0] ?? null;
  const legacyText = typeof rawAnswer === "object" && rawAnswer?.legacyText ? rawAnswer.legacyText : null;
  const ambiguousLegacy = isLegacy && matching.length > 1;

  return {
    key: item.key,
    label: item.title,
    score,
    answer: legacyText
      ? legacyText
      : ambiguousLegacy
        ? `${score}. Legacy result — direction of this response was not captured.`
        : score === null
          ? "—"
          : `${score}. ${option?.label ?? "Recorded response"}`,
  };
}

function importedFieldItems(detail: ResultDetail, field: ImportedField): ComparisonItem[] {
  if (field.kind === "display") return [];

  if (field.kind === "matrix_radio") {
    return field.rows.map((row, rowIndex) => {
      const value = String(detail.answers[`${field.qid}:${rowIndex}`] ?? "");
      const columnIndex = field.columns.indexOf(value);
      return {
        key: `${field.qid}:${rowIndex}`,
        label: row,
        answer: value || "—",
        score: value ? numericPrefix(value) ?? (columnIndex >= 0 ? columnIndex : null) : null,
      };
    });
  }

  const raw = detail.answers[field.qid];
  const answer = Array.isArray(raw) ? raw.join(", ") : String(raw ?? "");
  let score: number | null = null;

  if (field.kind === "radio" && answer) {
    const optionIndex = field.options.indexOf(answer);
    score = detail.questionnaireCode === "ybocs"
      ? (optionIndex >= 0 ? optionIndex : null)
      : numericPrefix(answer);
  }

  return [{
    key: field.qid,
    label: field.text,
    answer: answer || "—",
    score,
  }];
}

function comparisonItems(detail: ResultDetail): ComparisonItem[] {
  if (detail.questionnaireCode === "bdii") {
    return BDI2_ITEMS.map((item) => bdiItem(detail, item.key));
  }
  if (!detail.schema) return [];
  return detail.schema.fields.flatMap((field) => importedFieldItems(detail, field));
}

function ImportedAnswers({ detail }: { detail: ResultDetail }) {
  const items = comparisonItems(detail);
  if (!items.length) {
    return <p style={{ color: "#6b7280" }}>Exact questionnaire schema is unavailable for this result.</p>;
  }

  return (
    <div style={{ display: "grid", gap: "9px", marginTop: "14px" }}>
      {items.map((item) => (
        <div
          key={item.key}
          style={{
            padding: "10px 12px",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            background: itemBackground(item.score),
          }}
        >
          <strong>{item.label}</strong>
          <div style={{ marginTop: "4px", whiteSpace: "pre-line" }}>{item.answer}</div>
        </div>
      ))}
    </div>
  );
}

function ScoreLegend() {
  return (
    <div className="comparison-legend" aria-label="Item score colour scale">
      <span style={{ color: "#6b7280", fontSize: "12px" }}>Item score:</span>
      {[0, 1, 2, 3].map((score) => (
        <span key={score} className="comparison-legend-item" style={{ background: SCORE_BACKGROUNDS[score] }}>
          {score}
        </span>
      ))}
      <span style={{ color: "#6b7280", fontSize: "12px" }}>lighter → deeper</span>
    </div>
  );
}

function ComparisonTable({ details }: { details: ResultDetail[] }) {
  const sorted = [...details].sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());
  if (sorted.length < 2) return null;

  const itemSets = sorted.map(comparisonItems);
  const keys = itemSets[0].map((item) => item.key);
  const first = new Map(itemSets[0].map((item) => [item.key, item]));
  const last = new Map(itemSets[itemSets.length - 1].map((item) => [item.key, item]));
  const minDesktopWidth = sorted.length <= 3 ? "100%" : `${280 + sorted.length * 210}px`;

  return (
    <div className="comparison-section">
      <style>{`
        .comparison-section {
          margin-top: 18px;
          padding-top: 18px;
          border-top: 1px solid #e5e7eb;
          min-width: 0;
        }
        .comparison-legend {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          margin: 10px 0 14px;
        }
        .comparison-legend-item {
          width: 26px;
          height: 26px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(17, 24, 39, .08);
          border-radius: 6px;
          font-size: 12px;
          font-weight: 800;
        }
        .comparison-desktop {
          display: block;
          max-width: 100%;
          overflow-x: auto;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          -webkit-overflow-scrolling: touch;
        }
        .comparison-mobile {
          display: none;
        }
        .comparison-table {
          border-collapse: collapse;
          font-size: 13px;
          table-layout: fixed;
        }
        .comparison-table th,
        .comparison-table td {
          overflow-wrap: anywhere;
          word-break: normal;
        }
        .comparison-table .symptom-col {
          width: 22%;
          min-width: 170px;
        }
        .comparison-table .date-col {
          width: auto;
          min-width: 160px;
        }
        .comparison-table .change-col {
          width: 76px;
          min-width: 76px;
        }
        @media (max-width: 720px) {
          .comparison-desktop {
            display: none;
          }
          .comparison-mobile {
            display: grid;
            gap: 12px;
          }
          .comparison-card {
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            overflow: hidden;
            background: #fff;
          }
          .comparison-card-header {
            display: flex;
            justify-content: space-between;
            gap: 10px;
            align-items: flex-start;
            padding: 11px 12px;
            border-bottom: 1px solid #e5e7eb;
            background: #f9fafb;
          }
          .comparison-card-item {
            padding: 11px 12px;
            border-bottom: 1px solid rgba(17, 24, 39, .06);
          }
          .comparison-card-item:last-child {
            border-bottom: 0;
          }
          .comparison-date {
            display: flex;
            justify-content: space-between;
            gap: 8px;
            align-items: baseline;
            margin-bottom: 6px;
            font-size: 12px;
            font-weight: 800;
          }
          .comparison-answer {
            font-size: 13px;
            line-height: 1.4;
            overflow-wrap: anywhere;
          }
          .comparison-change {
            white-space: nowrap;
            font-weight: 800;
            font-size: 13px;
          }
        }
      `}</style>

      <h4 style={{ margin: "0 0 6px", fontSize: "18px" }}>Item-by-item comparison</h4>
      <p style={{ margin: "0", color: "#6b7280", fontSize: "14px", lineHeight: 1.45 }}>
        Change compares the earliest selected assessment with the latest selected assessment. Negative numeric change indicates a lower symptom score.
      </p>
      <ScoreLegend />

      <div className="comparison-desktop">
        <table className="comparison-table" style={{ width: minDesktopWidth }}>
          <thead>
            <tr>
              <th className="symptom-col" style={{ textAlign: "left", padding: "10px", borderBottom: "1px solid #e5e7eb", background: "#fff" }}>
                Symptom / item
              </th>
              {sorted.map((detail) => (
                <th key={detail.id} className="date-col" style={{ textAlign: "left", padding: "10px", borderBottom: "1px solid #e5e7eb" }}>
                  <div>{new Date(detail.submittedAt).toLocaleDateString()}</div>
                  <div style={{ marginTop: "3px", color: "#6b7280", fontWeight: 500 }}>Total {detail.totalScore}</div>
                </th>
              ))}
              <th className="change-col" style={{ textAlign: "center", padding: "10px", borderBottom: "1px solid #e5e7eb" }}>Change</th>
            </tr>
          </thead>
          <tbody>
            {keys.map((key) => {
              const baseline = first.get(key);
              const latest = last.get(key);
              const change = baseline?.score !== null && baseline?.score !== undefined && latest?.score !== null && latest?.score !== undefined
                ? latest.score - baseline.score
                : null;

              return (
                <tr key={key}>
                  <td className="symptom-col" style={{ padding: "10px", borderBottom: "1px solid #f3f4f6", verticalAlign: "top", fontWeight: 700, background: "#fff" }}>
                    {baseline?.label ?? key}
                  </td>
                  {itemSets.map((items, index) => {
                    const item = items.find((candidate) => candidate.key === key);
                    return (
                      <td
                        key={`${sorted[index].id}:${key}`}
                        className="date-col"
                        style={{
                          padding: "10px",
                          borderBottom: "1px solid #f3f4f6",
                          verticalAlign: "top",
                          background: itemBackground(item?.score),
                        }}
                      >
                        <div style={{ lineHeight: 1.4 }}>{item?.answer ?? "—"}</div>
                        {item?.score !== null && item?.score !== undefined ? (
                          <div style={{ color: "#4b5563", marginTop: "5px", fontWeight: 700 }}>Score {item.score}</div>
                        ) : null}
                      </td>
                    );
                  })}
                  <td className="change-col" style={{ textAlign: "center", padding: "10px", borderBottom: "1px solid #f3f4f6", verticalAlign: "top", fontWeight: 800 }}>
                    {change === null ? "—" : change > 0 ? `+${change}` : String(change)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="comparison-mobile">
        {keys.map((key) => {
          const baseline = first.get(key);
          const latest = last.get(key);
          const change = baseline?.score !== null && baseline?.score !== undefined && latest?.score !== null && latest?.score !== undefined
            ? latest.score - baseline.score
            : null;

          return (
            <article key={key} className="comparison-card">
              <div className="comparison-card-header">
                <strong style={{ fontSize: "14px", lineHeight: 1.35 }}>{baseline?.label ?? key}</strong>
                <span className="comparison-change">Δ {change === null ? "—" : change > 0 ? `+${change}` : String(change)}</span>
              </div>
              {itemSets.map((items, index) => {
                const item = items.find((candidate) => candidate.key === key);
                return (
                  <div
                    key={`${sorted[index].id}:${key}:mobile`}
                    className="comparison-card-item"
                    style={{ background: itemBackground(item?.score) }}
                  >
                    <div className="comparison-date">
                      <span>{new Date(sorted[index].submittedAt).toLocaleDateString()}</span>
                      <span>Total {sorted[index].totalScore}{item?.score !== null && item?.score !== undefined ? ` · Item ${item.score}` : ""}</span>
                    </div>
                    <div className="comparison-answer">{item?.answer ?? "—"}</div>
                  </div>
                );
              })}
            </article>
          );
        })}
      </div>
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
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [comparisonDetails, setComparisonDetails] = useState<ResultDetail[]>([]);
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [comparisonError, setComparisonError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/form/api/results/?vcitaUuid=${encodeURIComponent(vcitaUuid)}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const data = (await response.json()) as ApiResponse;
        if (controller.signal.aborted) return;
        if (data.ok) {
          setResults(data.results);
          const available = ORDER.find((code) => data.results.some((result) => result.questionnaireCode === code));
          if (available) {
            setActiveCode((current) => data.results.some((r) => r.questionnaireCode === current) ? current : available);
          }
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

  useEffect(() => {
    setCompareIds([]);
    setComparisonDetails([]);
    setComparisonError(null);
    setSelectedDetail(null);
  }, [activeCode, vcitaUuid]);

  const activeResults = results.filter((result) => result.questionnaireCode === activeCode);
  const availableCodes = ORDER.filter((code) => results.some((result) => result.questionnaireCode === code));

  async function fetchDetail(id: string): Promise<ResultDetail | null> {
    const response = await fetch(`/form/api/results/${encodeURIComponent(id)}/?vcitaUuid=${encodeURIComponent(vcitaUuid)}`, { cache: "no-store" });
    const data = (await response.json()) as DetailResponse;
    return data.ok ? data.result : null;
  }

  async function openDetail(id: string) {
    setDetailLoading(true);
    setSelectedDetail(null);
    try {
      const detail = await fetchDetail(id);
      if (detail) setSelectedDetail(detail);
    } finally {
      setDetailLoading(false);
    }
  }

  function toggleCompare(id: string) {
    setComparisonDetails([]);
    setComparisonError(null);
    setCompareIds((current) => current.includes(id)
      ? current.filter((value) => value !== id)
      : [...current, id]);
  }

  async function compareSelected() {
    if (compareIds.length < 2) return;
    setComparisonLoading(true);
    setComparisonError(null);
    setComparisonDetails([]);
    try {
      const details = await Promise.all(compareIds.map(fetchDetail));
      const valid = details.filter((detail): detail is ResultDetail => Boolean(detail));
      if (valid.length !== compareIds.length) {
        setComparisonError("One or more selected assessments could not be loaded.");
        return;
      }
      setComparisonDetails(valid);
    } catch {
      setComparisonError("Could not load the selected assessments for comparison.");
    } finally {
      setComparisonLoading(false);
    }
  }

  return (
    <section style={{ marginBottom: "24px", padding: "clamp(12px, 3vw, 18px)", border: "1px solid #e5e7eb", borderRadius: "12px", background: "#fff", minWidth: 0 }}>
      <h3 style={{ margin: "0 0 12px", fontSize: "20px" }}>Questionnaire results</h3>

      {loading ? <p style={{ color: "#6b7280" }}>Loading previous results…</p> : null}
      {error ? <p role="alert" style={{ color: "#991b1b" }}>{error}</p> : null}
      {!loading && !error && results.length === 0 ? (
        <p style={{ marginBottom: 0, color: "#6b7280" }}>No previous questionnaire results.</p>
      ) : null}

      {!loading && !error && results.length > 0 ? (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
            {availableCodes.map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setActiveCode(code)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "999px",
                  border: "1px solid #d1d5db",
                  background: activeCode === code ? "#111827" : "#fff",
                  color: activeCode === code ? "#fff" : "#111827",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {LABELS[code] ?? code.toUpperCase()}
              </button>
            ))}
          </div>

          <TrendChart results={activeResults} />

          {activeResults.length > 1 ? (
            <div style={{ marginTop: "16px", padding: "12px 14px", border: "1px solid #e5e7eb", borderRadius: "10px", background: "#f9fafb" }}>
              <strong>Compare assessments</strong>
              <div style={{ marginTop: "8px", color: "#4b5563", fontSize: "14px" }}>
                Select two or more dates below, then compare item by item.
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={compareSelected}
                  disabled={compareIds.length < 2 || comparisonLoading}
                  style={{
                    padding: "8px 12px",
                    border: 0,
                    borderRadius: "8px",
                    background: "#111827",
                    color: "#fff",
                    fontWeight: 700,
                    opacity: compareIds.length < 2 ? 0.45 : 1,
                    cursor: compareIds.length < 2 ? "not-allowed" : "pointer",
                  }}
                >
                  {comparisonLoading ? "Loading comparison…" : `Compare selected (${compareIds.length})`}
                </button>
                {compareIds.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setCompareIds([]);
                      setComparisonDetails([]);
                    }}
                    style={{ padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: "8px", background: "#fff", cursor: "pointer" }}
                  >
                    Clear selection
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}

          <div style={{ overflowX: "auto", marginTop: "16px", WebkitOverflowScrolling: "touch" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", minWidth: activeCode === "ybocs" ? "460px" : "300px" }}>
              <thead>
                <tr>
                  {activeResults.length > 1 ? <th style={{ textAlign: "center", padding: "8px 6px", borderBottom: "1px solid #e5e7eb" }}>Compare</th> : null}
                  <th style={{ textAlign: "left", padding: "8px 6px", borderBottom: "1px solid #e5e7eb" }}>Date</th>
                  <th style={{ textAlign: "right", padding: "8px 6px", borderBottom: "1px solid #e5e7eb" }}>Score</th>
                  {activeCode === "ybocs" ? <>
                    <th style={{ textAlign: "right", padding: "8px 6px", borderBottom: "1px solid #e5e7eb" }}>Obs.</th>
                    <th style={{ textAlign: "right", padding: "8px 6px", borderBottom: "1px solid #e5e7eb" }}>Comp.</th>
                  </> : null}
                </tr>
              </thead>
              <tbody>
                {[...activeResults].reverse().map((result) => (
                  <tr key={result.id}>
                    {activeResults.length > 1 ? (
                      <td style={{ textAlign: "center", padding: "9px 6px", borderBottom: "1px solid #f3f4f6" }}>
                        <input
                          type="checkbox"
                          checked={compareIds.includes(result.id)}
                          onChange={() => toggleCompare(result.id)}
                          aria-label={`Compare ${new Date(result.submittedAt).toLocaleDateString()}`}
                          style={{ width: "18px", height: "18px" }}
                        />
                      </td>
                    ) : null}
                    <td onClick={() => openDetail(result.id)} style={{ padding: "9px 6px", borderBottom: "1px solid #f3f4f6", textDecoration: "underline", cursor: "pointer", whiteSpace: "nowrap" }}>
                      {new Date(result.submittedAt).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: "right", padding: "9px 6px", borderBottom: "1px solid #f3f4f6", fontWeight: 700 }}>{result.totalScore}</td>
                    {activeCode === "ybocs" ? <>
                      <td style={{ textAlign: "right", padding: "9px 6px", borderBottom: "1px solid #f3f4f6" }}>{result.obsessionScore ?? "—"}</td>
                      <td style={{ textAlign: "right", padding: "9px 6px", borderBottom: "1px solid #f3f4f6" }}>{result.compulsionScore ?? "—"}</td>
                    </> : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {comparisonError ? <p role="alert" style={{ marginTop: "12px", color: "#991b1b" }}>{comparisonError}</p> : null}
          {comparisonDetails.length >= 2 ? <ComparisonTable details={comparisonDetails} /> : null}

          {detailLoading ? <p style={{ color: "#6b7280" }}>Loading result details…</p> : null}

          {selectedDetail ? (
            <div style={{ marginTop: "18px", paddingTop: "16px", borderTop: "1px solid #e5e7eb" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: "18px" }}>{selectedDetail.questionnaireName}</h4>
                  <div style={{ marginTop: "4px", color: "#4b5563" }}>
                    {new Date(selectedDetail.submittedAt).toLocaleString()} — Score {selectedDetail.totalScore}
                  </div>
                  {selectedDetail.questionnaireCode === "ybocs" ? (
                    <div style={{ marginTop: "4px" }}>Obsession {selectedDetail.obsessionScore ?? "—"} · Compulsion {selectedDetail.compulsionScore ?? "—"}</div>
                  ) : null}
                </div>
                <button type="button" onClick={() => setSelectedDetail(null)} style={{ border: 0, background: "transparent", textDecoration: "underline", cursor: "pointer" }}>
                  Close
                </button>
              </div>
              <ImportedAnswers detail={selectedDetail} />
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
