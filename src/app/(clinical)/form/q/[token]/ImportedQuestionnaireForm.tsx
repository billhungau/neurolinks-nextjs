"use client";

import { FormEvent, useState } from "react";
import type { ImportedQuestionnaireSchema } from "@/lib/clinical/questionnaires/jotform-import";

type SubmitResponse =
  | { ok: true; totalScore: number; severity: string | null }
  | { ok: false; error: string };

export function ImportedQuestionnaireForm({
  token,
  schema,
}: {
  token: string;
  schema: ImportedQuestionnaireSchema;
}) {
  const [result, setResult] = useState<SubmitResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setResult(null);

    const data = new FormData(event.currentTarget);
    const answers: Record<string, unknown> = {};

    for (const field of schema.fields) {
      if (field.kind === "display") continue;

      if (field.kind === "checkbox") {
        answers[field.qid] = data.getAll(field.qid).map(String);
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

  if (result?.ok) {
    return (
      <div style={{ padding: "24px", borderRadius: "12px", background: "#ecfdf5", border: "1px solid #a7f3d0" }}>
        <h2 style={{ marginTop: 0 }}>Questionnaire submitted</h2>
        <p style={{ marginBottom: 0 }}>Thank you. Your responses have been securely recorded.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit}>
      {schema.fields.map((field) => {
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

        if (field.kind === "matrix_radio") {
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
                          <input type="radio" name={`${field.qid}:${rowIndex}`} value={column} required={field.required} style={{ marginTop: "4px" }} />
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

        return (
          <label key={field.qid} style={{ display: "block", marginBottom: "24px" }}>
            <span style={{ display: "block", marginBottom: "8px", fontWeight: 700 }}>{field.text}</span>
            <input name={field.qid} required={field.required} style={{ width: "100%", boxSizing: "border-box", padding: "11px 12px", border: "1px solid #d1d5db", borderRadius: "8px" }} />
          </label>
        );
      })}

      {result && !result.ok ? (
        <p role="alert" style={{ padding: "12px", background: "#fef2f2", borderRadius: "8px" }}>{result.error}</p>
      ) : null}

      <button type="submit" disabled={submitting} style={{ padding: "13px 20px", border: 0, borderRadius: "9px", background: "#111827", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
        {submitting ? "Submitting…" : "Submit questionnaire"}
      </button>
    </form>
  );
}
