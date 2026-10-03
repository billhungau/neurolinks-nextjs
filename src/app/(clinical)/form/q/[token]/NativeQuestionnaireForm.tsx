"use client";

import { FormEvent, useMemo, useState } from "react";
import type { NativeField, NativeQuestionnaireSchema } from "@/lib/clinical/questionnaires/native-builder";

type SubmitResponse =
  | { ok: true; totalScore: number; severity: string | null }
  | { ok: false; error: string };

function splitPages(fields: NativeField[]) {
  const pages: NativeField[][] = [[]];
  for (const field of fields) {
    if (field.kind === "pagebreak") {
      if (pages[pages.length - 1].length) pages.push([]);
      continue;
    }
    pages[pages.length - 1].push(field);
  }
  return pages.filter((page) => page.length > 0);
}

export function NativeQuestionnaireForm({ token, schema }: { token: string; schema: NativeQuestionnaireSchema }) {
  const [pageIndex, setPageIndex] = useState(0);
  const [result, setResult] = useState<SubmitResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const pages = useMemo(() => splitPages(schema.fields), [schema.fields]);
  const pageCount = Math.max(1, pages.length);

  function validateCurrentPage(form: HTMLFormElement) {
    const page = form.querySelector(`[data-native-page="${pageIndex}"]`);
    const controls = page?.querySelectorAll<HTMLInputElement>("input") ?? [];
    for (const control of Array.from(controls)) {
      if (!control.checkValidity()) {
        control.reportValidity();
        return false;
      }
    }
    return true;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setResult(null);
    const data = new FormData(event.currentTarget);
    const answers: Record<string, unknown> = {};

    for (const field of schema.fields) {
      if (field.kind === "single") answers[field.id] = String(data.get(field.id) ?? "");
      if (field.kind === "multiple") answers[field.id] = data.getAll(field.id).map(String);
      if (field.kind === "matrix") {
        for (const row of field.rows) {
          answers[`${field.id}:${row.id}`] = String(data.get(`${field.id}:${row.id}`) ?? "");
        }
      }
    }

    const response = await fetch("/form/api/submit/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, answers }),
    });
    const payload = await response.json() as SubmitResponse;
    setResult(payload);
    setSubmitting(false);
    if (payload.ok) window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (result?.ok) {
    return <div style={{ padding: "24px", borderRadius: "12px", background: "#ecfdf5", border: "1px solid #a7f3d0" }}><h2 style={{ marginTop: 0 }}>Questionnaire submitted</h2><p style={{ marginBottom: 0 }}>Thank you. Your responses have been securely recorded.</p></div>;
  }

  function renderField(field: NativeField) {
    if (field.kind === "paragraph") return <p key={field.id} style={{ whiteSpace: "pre-line", lineHeight: 1.65, color: "#374151" }}>{field.text}</p>;
    if (field.kind === "single") return (
      <fieldset key={field.id} style={{ border: 0, padding: 0, margin: "0 0 28px" }}>
        <legend style={{ fontSize: "18px", fontWeight: 700, marginBottom: "12px" }}>{field.label}</legend>
        <div style={{ display: "grid", gap: "9px" }}>{field.options.map((option) => <label key={option.id} style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "11px 12px", border: "1px solid #e5e7eb", borderRadius: "9px" }}><input type="radio" name={field.id} value={option.id} required={field.required} style={{ marginTop: "4px" }} /><span>{option.label}</span></label>)}</div>
      </fieldset>
    );
    if (field.kind === "multiple") return (
      <fieldset key={field.id} style={{ border: 0, padding: 0, margin: "0 0 28px" }}>
        <legend style={{ fontSize: "18px", fontWeight: 700, marginBottom: "12px" }}>{field.label}</legend>
        <div style={{ display: "grid", gap: "9px" }}>{field.options.map((option, index) => <label key={option.id} style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "11px 12px", border: "1px solid #e5e7eb", borderRadius: "9px" }}><input type="checkbox" name={field.id} value={option.id} required={field.required && index === 0} style={{ marginTop: "4px" }} /><span>{option.label}</span></label>)}</div>
      </fieldset>
    );
    if (field.kind === "matrix") return (
      <fieldset key={field.id} style={{ border: 0, padding: 0, margin: "0 0 30px" }}>
        <legend style={{ fontSize: "18px", fontWeight: 700, marginBottom: "14px" }}>{field.label}</legend>
        <div style={{ display: "grid", gap: "14px" }}>{field.rows.map((row) => <fieldset key={row.id} style={{ border: "1px solid #e5e7eb", borderRadius: "10px", padding: "14px" }}><legend style={{ fontWeight: 600, padding: "0 6px" }}>{row.label}</legend><div style={{ display: "grid", gap: "8px", marginTop: "8px" }}>{field.columns.map((column) => <label key={column.id} style={{ display: "flex", gap: "9px", alignItems: "flex-start" }}><input type="radio" name={`${field.id}:${row.id}`} value={column.id} required={field.required} style={{ marginTop: "4px" }} /><span>{column.label}</span></label>)}</div></fieldset>)}</div>
      </fieldset>
    );
    return null;
  }

  return (
    <form onSubmit={submit}>
      {pageCount > 1 ? <div style={{ marginBottom: "22px" }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px" }}><strong>Page {pageIndex + 1} of {pageCount}</strong><span>{Math.round(((pageIndex + 1) / pageCount) * 100)}%</span></div><div style={{ height: "7px", background: "#e5e7eb", borderRadius: "999px", overflow: "hidden" }}><div style={{ width: `${((pageIndex + 1) / pageCount) * 100}%`, height: "100%", background: "#111827" }} /></div></div> : null}
      {pages.map((page, index) => <div key={index} data-native-page={index} style={{ display: index === pageIndex ? "block" : "none" }}>{page.map(renderField)}</div>)}
      {result && !result.ok ? <p role="alert" style={{ padding: "12px", background: "#fef2f2", borderRadius: "8px" }}>{result.error}</p> : null}
      <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", marginTop: "8px" }}>
        {pageIndex > 0 ? <button type="button" onClick={() => { setPageIndex((value) => value - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }} style={{ padding: "13px 20px" }}>Previous</button> : <span />}
        {pageIndex < pageCount - 1 ? <button type="button" onClick={(event) => { const form = event.currentTarget.form!; if (validateCurrentPage(form)) { setPageIndex((value) => value + 1); window.scrollTo({ top: 0, behavior: "smooth" }); } }} style={{ padding: "13px 20px", background: "#111827", color: "#fff", border: 0, borderRadius: "9px", fontWeight: 700 }}>Next</button> : <button type="submit" disabled={submitting} style={{ padding: "13px 20px", background: "#111827", color: "#fff", border: 0, borderRadius: "9px", fontWeight: 700 }}>{submitting ? "Submitting…" : "Submit questionnaire"}</button>}
      </div>
    </form>
  );
}
