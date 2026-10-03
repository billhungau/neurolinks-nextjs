"use client";

import { FormEvent, useMemo, useState } from "react";
import type { ImportedField, ImportedQuestionnaireSchema } from "@/lib/clinical/questionnaires/jotform-import";

type SubmitResponse =
  | { ok: true; totalScore: number; severity: string | null }
  | { ok: false; error: string };

function splitIntoPages(fields: ImportedField[]) {
  const pages: ImportedField[][] = [[]];
  for (const field of fields) {
    if (field.kind === "pagebreak") {
      if (pages[pages.length - 1].length > 0) pages.push([]);
      continue;
    }
    pages[pages.length - 1].push(field);
  }
  return pages.filter((page) => page.length > 0);
}

export function ImportedQuestionnaireForm({
  token,
  schema,
}: {
  token: string;
  schema: ImportedQuestionnaireSchema;
}) {
  const [result, setResult] = useState<SubmitResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const pages = useMemo(() => splitIntoPages(schema.fields), [schema.fields]);
  const pageCount = Math.max(1, pages.length);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setResult(null);

    const data = new FormData(event.currentTarget);
    const answers: Record<string, unknown> = {};

    for (const field of schema.fields) {
      if (field.kind === "display" || field.kind === "pagebreak") continue;

      if (field.kind === "checkbox") {
        answers[field.qid] = data.getAll(field.qid).map(String);
      } else if (field.kind === "matrix_checkbox") {
        field.rows.forEach((_, rowIndex) => {
          answers[`${field.qid}:${rowIndex}`] = data.getAll(`${field.qid}:${rowIndex}`).map(String);
        });
      } else if (field.kind === "matrix_radio") {
        field.rows.forEach((_, rowIndex) => {
          answers[`${field.qid}:${rowIndex}`] = String(
            data.get(`${field.qid}:${rowIndex}`) ?? "",
          );
        });
      } else {
        answers[field.qid] = String(data.get(field.qid) ?? "");
      }
    }

    const response = await fetch("/form/api/submit/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, answers }),
    });
    const payload = (await response.json()) as SubmitResponse;
    setResult(payload);
    setSubmitting(false);

    if (payload.ok) {
      event.currentTarget.reset();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function nextPage(form: HTMLFormElement) {
    const visiblePage = form.querySelector(`[data-questionnaire-page="${pageIndex}"]`);
    const controls = visiblePage?.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>("input, textarea, select") ?? [];
    for (const control of Array.from(controls)) {
      if (!control.checkValidity()) {
        control.reportValidity();
        return;
      }
    }
    setPageIndex((value) => Math.min(value + 1, pageCount - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (result?.ok) {
    return (
      <div style={{ padding: "24px", borderRadius: "12px", background: "#ecfdf5", border: "1px solid #a7f3d0" }}>
        <h2 style={{ marginTop: 0 }}>Questionnaire submitted</h2>
        <p style={{ marginBottom: 0 }}>Thank you. Your responses have been securely recorded.</p>
      </div>
    );
  }

  function renderField(field: ImportedField) {
    if (field.kind === "display") {
      return <p key={field.qid} style={{ lineHeight: 1.65, color: "#374151", whiteSpace: "pre-line" }}>{field.text}</p>;
    }

    if (field.kind === "radio") {
      return (
        <fieldset key={field.qid} style={{ border: 0, padding: 0, margin: "0 0 28px" }}>
          <legend style={{ fontSize: "18px", fontWeight: 700, marginBottom: "12px" }}>{field.text}</legend>
          <div style={{ display: "grid", gap: "9px" }}>
            {field.options.map((option) => (
              <label key={option} style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "11px 12px", border: "1px solid #e5e7eb", borderRadius: "9px", cursor: "pointer" }}>
                <input type="radio" name={field.qid} value={option} required={field.required} style={{ marginTop: "4px" }} />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </fieldset>
      );
    }

    if (field.kind === "select") {
      return (
        <label key={field.qid} style={{ display: "block", marginBottom: "24px" }}>
          <span style={{ display: "block", marginBottom: "8px", fontWeight: 700 }}>{field.text}</span>
          <select name={field.qid} required={field.required} defaultValue="" style={{ width: "100%", boxSizing: "border-box", padding: "11px 12px", border: "1px solid #d1d5db", borderRadius: "8px", background: "#fff" }}>
            <option value="" disabled>Select an option</option>
            {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
      );
    }

    if (field.kind === "checkbox") {
      return (
        <fieldset key={field.qid} style={{ border: 0, padding: 0, margin: "0 0 28px" }}>
          <legend style={{ fontSize: "18px", fontWeight: 700, marginBottom: "12px" }}>{field.text}</legend>
          <div style={{ display: "grid", gap: "9px" }}>
            {field.options.map((option) => (
              <label key={option} style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "9px" }}>
                <input type="checkbox" name={field.qid} value={option} style={{ marginTop: "4px" }} />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </fieldset>
      );
    }

    if (field.kind === "matrix_radio" || field.kind === "matrix_checkbox") {
      const isCheckbox = field.kind === "matrix_checkbox";
      return (
        <fieldset key={field.qid} style={{ border: 0, padding: 0, margin: "0 0 30px" }}>
          <legend style={{ fontSize: "18px", fontWeight: 700, marginBottom: "14px", whiteSpace: "pre-line" }}>{field.text}</legend>
          <div style={{ display: "grid", gap: "18px" }}>
            {field.rows.map((row, rowIndex) => (
              <fieldset key={rowIndex} style={{ border: "1px solid #e5e7eb", borderRadius: "10px", padding: "14px" }}>
                <legend style={{ fontWeight: 600, padding: "0 6px" }}>{row}</legend>
                <div style={{ display: "grid", gap: "8px", marginTop: "8px" }}>
                  {field.columns.map((column) => (
                    <label key={column} style={{ display: "flex", gap: "9px", alignItems: "flex-start" }}>
                      <input
                        type={isCheckbox ? "checkbox" : "radio"}
                        name={`${field.qid}:${rowIndex}`}
                        value={column}
                        required={!isCheckbox && field.required}
                        style={{ marginTop: "4px" }}
                      />
                      <span>{column}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>
        </fieldset>
      );
    }

    if (field.kind === "textarea") {
      return (
        <label key={field.qid} style={{ display: "block", marginBottom: "24px" }}>
          <span style={{ display: "block", marginBottom: "8px", fontWeight: 700 }}>{field.text}</span>
          <textarea name={field.qid} required={field.required} rows={4} style={{ width: "100%", boxSizing: "border-box", padding: "11px 12px", border: "1px solid #d1d5db", borderRadius: "8px" }} />
        </label>
      );
    }

    if (field.kind === "pagebreak") return null;

    return (
      <label key={field.qid} style={{ display: "block", marginBottom: "24px" }}>
        <span style={{ display: "block", marginBottom: "8px", fontWeight: 700 }}>{field.text}</span>
        <input name={field.qid} required={field.required} style={{ width: "100%", boxSizing: "border-box", padding: "11px 12px", border: "1px solid #d1d5db", borderRadius: "8px" }} />
      </label>
    );
  }

  return (
    <form onSubmit={submit}>
      {pageCount > 1 ? (
        <div style={{ marginBottom: "22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center", marginBottom: "8px", fontSize: "14px", color: "#4b5563" }}>
            <strong style={{ color: "#111827" }}>Page {pageIndex + 1} of {pageCount}</strong>
            <span>{Math.round(((pageIndex + 1) / pageCount) * 100)}%</span>
          </div>
          <div style={{ height: "7px", background: "#e5e7eb", borderRadius: "999px", overflow: "hidden" }}>
            <div style={{ width: `${((pageIndex + 1) / pageCount) * 100}%`, height: "100%", background: "#111827", transition: "width .2s ease" }} />
          </div>
        </div>
      ) : null}

      {pages.map((page, index) => (
        <div key={index} data-questionnaire-page={index} style={{ display: index === pageIndex ? "block" : "none" }}>
          {page.map(renderField)}
        </div>
      ))}

      {result && !result.ok ? (
        <p role="alert" style={{ padding: "12px", background: "#fef2f2", borderRadius: "8px" }}>{result.error}</p>
      ) : null}

      <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", flexWrap: "wrap", marginTop: "8px" }}>
        {pageIndex > 0 ? (
          <button type="button" onClick={() => { setPageIndex((value) => Math.max(0, value - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }} style={{ padding: "13px 20px", border: "1px solid #d1d5db", borderRadius: "9px", background: "#fff", fontWeight: 700, cursor: "pointer" }}>
            Previous
          </button>
        ) : <span />}

        {pageIndex < pageCount - 1 ? (
          <button type="button" onClick={(event) => nextPage(event.currentTarget.form!)} style={{ padding: "13px 20px", border: 0, borderRadius: "9px", background: "#111827", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
            Next
          </button>
        ) : (
          <button type="submit" disabled={submitting} style={{ padding: "13px 20px", border: 0, borderRadius: "9px", background: "#111827", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
            {submitting ? "Submitting…" : "Submit questionnaire"}
          </button>
        )}
      </div>
    </form>
  );
}
