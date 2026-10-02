"use client";

import { FormEvent, useState } from "react";

type ApiResponse =
  | { ok: true; url: string; expiresAt: string }
  | { ok: false; error: string };

export function SendQuestionnaireForm() {
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setResult(null);

    const form = new FormData(event.currentTarget);
    const response = await fetch("/form/api/invitations/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vcitaUuid: String(form.get("vcitaUuid") ?? ""),
        questionnaireCode: String(form.get("questionnaireCode") ?? "bdii"),
        expiresInHours: Number(form.get("expiresInHours") ?? 72),
      }),
    });

    const data = (await response.json()) as ApiResponse;
    setResult(data);
    setSubmitting(false);
  }

  return (
    <div>
      <form onSubmit={submit}>
        <label style={{ display: "block", marginBottom: "16px" }}>
          <span style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}>vcita client UUID</span>
          <input name="vcitaUuid" required autoComplete="off" style={{ width: "100%", boxSizing: "border-box", padding: "11px 12px", border: "1px solid #d1d5db", borderRadius: "8px" }} />
        </label>

        <label style={{ display: "block", marginBottom: "16px" }}>
          <span style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}>Questionnaire</span>
          <select name="questionnaireCode" defaultValue="bdii" style={{ width: "100%", padding: "11px 12px", border: "1px solid #d1d5db", borderRadius: "8px" }}>
            <option value="bdii">BDI-II</option>
          </select>
        </label>

        <label style={{ display: "block", marginBottom: "20px" }}>
          <span style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}>Link expiry</span>
          <select name="expiresInHours" defaultValue="72" style={{ width: "100%", padding: "11px 12px", border: "1px solid #d1d5db", borderRadius: "8px" }}>
            <option value="24">24 hours</option>
            <option value="72">72 hours</option>
            <option value="168">7 days</option>
          </select>
        </label>

        <button disabled={submitting} type="submit" style={{ padding: "12px 18px", border: 0, borderRadius: "8px", fontWeight: 700, cursor: "pointer", background: "#111827", color: "#fff" }}>
          {submitting ? "Creating…" : "Send questionnaire"}
        </button>
      </form>

      {result?.ok ? (
        <div style={{ marginTop: "24px", padding: "16px", border: "1px solid #d1fae5", borderRadius: "10px", background: "#ecfdf5" }}>
          <strong>Secure link created</strong>
          <p style={{ overflowWrap: "anywhere" }}>
            <a href={result.url}>{result.url}</a>
          </p>
          <p style={{ marginBottom: 0 }}>Expires: {new Date(result.expiresAt).toLocaleString()}</p>
        </div>
      ) : null}

      {result && !result.ok ? (
        <p role="alert" style={{ marginTop: "20px", padding: "12px", borderRadius: "8px", background: "#fef2f2" }}>
          {result.error}
        </p>
      ) : null}
    </div>
  );
}
