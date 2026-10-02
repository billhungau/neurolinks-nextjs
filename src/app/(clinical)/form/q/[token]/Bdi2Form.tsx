"use client";

import { FormEvent, useState } from "react";
import { BDI2_INSTRUCTIONS, BDI2_ITEMS } from "@/lib/clinical/questionnaires/bdii-definition";

type SubmitResponse =
  | { ok: true; totalScore: number; severity: string }
  | { ok: false; error: string };

export function Bdi2Form({ token }: { token: string }) {
  const [result, setResult] = useState<SubmitResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setResult(null);

    const data = new FormData(event.currentTarget);
    const answers: Record<string, number> = {};
    for (const item of BDI2_ITEMS) {
      answers[item.key] = Number(data.get(item.key));
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
      <p style={{ lineHeight: 1.65, color: "#374151", marginBottom: "28px" }}>{BDI2_INSTRUCTIONS}</p>

      {BDI2_ITEMS.map((item) => (
        <fieldset key={item.key} style={{ border: 0, padding: 0, margin: "0 0 30px" }}>
          <legend style={{ fontSize: "18px", fontWeight: 700, marginBottom: "12px" }}>{item.title}</legend>
          <div style={{ display: "grid", gap: "9px" }}>
            {item.options.map((option, index) => (
              <label key={index} style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "11px 12px", border: "1px solid #e5e7eb", borderRadius: "9px", cursor: "pointer" }}>
                <input type="radio" name={item.key} value={option.value} required style={{ marginTop: "4px" }} />
                <span><strong>{option.value}.</strong> {option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}

      {result && !result.ok ? (
        <p role="alert" style={{ padding: "12px", background: "#fef2f2", borderRadius: "8px" }}>{result.error}</p>
      ) : null}

      <button type="submit" disabled={submitting} style={{ padding: "13px 20px", border: 0, borderRadius: "9px", background: "#111827", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
        {submitting ? "Submitting…" : "Submit questionnaire"}
      </button>
    </form>
  );
}
