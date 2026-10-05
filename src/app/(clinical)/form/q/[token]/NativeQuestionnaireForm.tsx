"use client";

import { FormEvent, useMemo, useState } from "react";
import type { NativeField, NativeQuestionnaireSchema } from "@/lib/clinical/questionnaires/native-builder";

type SubmitResponse =
  | { ok: true; totalScore: number; severity: string | null }
  | { ok: false; error: string };

const HALF_WIDTH_IDS = new Set([
  "date_of_birth",
  "phn",
  "email",
  "contact_number",
  "city",
  "province",
  "postal_code",
  "next_of_kin_name",
  "emergency_relationship",
  "emergency_phone",
  "family_doctor",
  "family_doctor_phone",
  "referred_by",
]);

const FULL_WIDTH_TEXT_IDS = new Set(["address_line1", "address_line2"]);

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

function inputType(fieldId: string) {
  if (fieldId === "date_of_birth") return "date";
  if (fieldId === "email") return "email";
  if (["contact_number", "emergency_phone", "family_doctor_phone"].includes(fieldId)) return "tel";
  return "text";
}

function inputMode(fieldId: string): "numeric" | "text" | undefined {
  if (fieldId === "phn") return "numeric";
  return undefined;
}

function autocomplete(fieldId: string) {
  const values: Record<string, string> = {
    email: "email",
    contact_number: "tel",
    address_line1: "address-line1",
    address_line2: "address-line2",
    city: "address-level2",
    province: "address-level1",
    postal_code: "postal-code",
  };
  return values[fieldId];
}

function fieldSpan(field: NativeField) {
  if (field.kind !== "text") return "full";
  if (FULL_WIDTH_TEXT_IDS.has(field.id)) return "full";
  return HALF_WIDTH_IDS.has(field.id) ? "half" : "full";
}

export function NativeQuestionnaireForm({ token, schema }: { token: string; schema: NativeQuestionnaireSchema }) {
  const [pageIndex, setPageIndex] = useState(0);
  const [result, setResult] = useState<SubmitResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const pages = useMemo(() => splitPages(schema.fields), [schema.fields]);
  const pageCount = Math.max(1, pages.length);
  const isIntake = schema.patientFacingName.toLowerCase().includes("intake");
  const today = new Date().toISOString().slice(0, 10);

  function validateCurrentPage(form: HTMLFormElement) {
    const page = form.querySelector(`[data-native-page="${pageIndex}"]`);
    const controls = page?.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input, textarea") ?? [];
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
      if (field.kind === "text" || field.kind === "textarea") answers[field.id] = String(data.get(field.id) ?? "");
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
    return (
      <div className="nl-success" role="status">
        <div className="nl-success-icon">✓</div>
        <div>
          <h2>{isIntake ? "Intake form submitted" : "Questionnaire submitted"}</h2>
          <p>Thank you. Your responses have been submitted.</p>
        </div>
        <style jsx>{nativeStyles}</style>
      </div>
    );
  }

  function renderField(field: NativeField) {
    const spanClass = fieldSpan(field) === "half" ? "nl-field nl-half" : "nl-field nl-full";

    if (field.kind === "paragraph") return (
      <div key={field.id} className="nl-field nl-full nl-paragraph">
        <p>{field.text}</p>
      </div>
    );

    if (field.kind === "text") return (
      <label key={field.id} className={spanClass}>
        <span className="nl-label">{field.label}{field.required ? <b className="nl-required"> *</b> : null}</span>
        <input
          className="nl-input"
          type={inputType(field.id)}
          name={field.id}
          required={field.required}
          placeholder={field.placeholder}
          inputMode={inputMode(field.id)}
          autoComplete={autocomplete(field.id)}
          max={field.id === "date_of_birth" ? today : undefined}
        />
      </label>
    );

    if (field.kind === "textarea") return (
      <label key={field.id} className="nl-field nl-full">
        <span className="nl-label">{field.label}{field.required ? <b className="nl-required"> *</b> : null}</span>
        <textarea className="nl-input nl-textarea" name={field.id} required={field.required} placeholder={field.placeholder} rows={5} />
      </label>
    );

    if (field.kind === "single") return (
      <fieldset key={field.id} className="nl-field nl-full nl-fieldset">
        <legend className="nl-label">{field.label}{field.required ? <b className="nl-required"> *</b> : null}</legend>
        <div className="nl-options">{field.options.map((option) => (
          <label key={option.id} className="nl-option">
            <input type="radio" name={field.id} value={option.id} required={field.required} />
            <span>{option.label}</span>
          </label>
        ))}</div>
      </fieldset>
    );

    if (field.kind === "multiple") return (
      <fieldset key={field.id} className="nl-field nl-full nl-fieldset">
        <legend className="nl-label">{field.label}{field.required ? <b className="nl-required"> *</b> : null}</legend>
        <div className="nl-options">{field.options.map((option, index) => (
          <label key={option.id} className="nl-option">
            <input type="checkbox" name={field.id} value={option.id} required={field.required && index === 0} />
            <span>{option.label}</span>
          </label>
        ))}</div>
      </fieldset>
    );

    if (field.kind === "matrix") return (
      <fieldset key={field.id} className="nl-field nl-full nl-fieldset">
        <legend className="nl-label">{field.label}{field.required ? <b className="nl-required"> *</b> : null}</legend>
        <div className="nl-matrix">{field.rows.map((row) => (
          <fieldset key={row.id} className="nl-matrix-row">
            <legend>{row.label}</legend>
            <div className="nl-matrix-options">{field.columns.map((column) => (
              <label key={column.id} className="nl-matrix-option">
                <input type="radio" name={`${field.id}:${row.id}`} value={column.id} required={field.required} />
                <span>{column.label}</span>
              </label>
            ))}</div>
          </fieldset>
        ))}</div>
      </fieldset>
    );
    return null;
  }

  return (
    <form className="nl-native-form" onSubmit={submit}>
      {schema.description ? <p className="nl-description">{schema.description}</p> : null}
      {pageCount > 1 ? (
        <div className="nl-progress" aria-label={`Page ${pageIndex + 1} of ${pageCount}`}>
          <div className="nl-progress-copy"><strong>Step {pageIndex + 1} of {pageCount}</strong><span>{Math.round(((pageIndex + 1) / pageCount) * 100)}%</span></div>
          <div className="nl-progress-track"><div className="nl-progress-value" style={{ width: `${((pageIndex + 1) / pageCount) * 100}%` }} /></div>
        </div>
      ) : null}
      {pages.map((page, index) => (
        <div key={index} data-native-page={index} className="nl-form-grid" style={{ display: index === pageIndex ? "grid" : "none" }}>
          {page.map(renderField)}
        </div>
      ))}
      {result && !result.ok ? <div role="alert" className="nl-error">{result.error}</div> : null}
      <div className="nl-actions">
        {pageIndex > 0 ? (
          <button className="nl-button nl-button-secondary" type="button" onClick={() => { setPageIndex((value) => value - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Previous</button>
        ) : <span />}
        {pageIndex < pageCount - 1 ? (
          <button className="nl-button nl-button-primary" type="button" onClick={(event) => { const form = event.currentTarget.form!; if (validateCurrentPage(form)) { setPageIndex((value) => value + 1); window.scrollTo({ top: 0, behavior: "smooth" }); } }}>Continue</button>
        ) : (
          <button className="nl-button nl-button-primary" type="submit" disabled={submitting}>{submitting ? "Submitting…" : isIntake ? "Submit intake form" : "Submit questionnaire"}</button>
        )}
      </div>
      <style jsx>{nativeStyles}</style>
    </form>
  );
}

const nativeStyles = `
  .nl-native-form{color:#152a46}.nl-description{margin:-8px auto 25px;max-width:650px;text-align:center;color:#607086;font-size:15px;line-height:1.6}.nl-progress{margin:0 0 29px;padding:14px 16px;background:#f6f9fc;border:1px solid #e1e9f1;border-radius:13px}.nl-progress-copy{display:flex;justify-content:space-between;gap:16px;margin-bottom:9px;color:#53657b;font-size:13px}.nl-progress-copy strong{color:#1b3659}.nl-progress-track{height:6px;overflow:hidden;background:#dfe7ef;border-radius:999px}.nl-progress-value{height:100%;background:linear-gradient(90deg,#00a6d6,#17365d);border-radius:999px;transition:width .2s ease}.nl-form-grid{grid-template-columns:repeat(2,minmax(0,1fr));column-gap:20px;row-gap:22px}.nl-field{min-width:0;margin:0}.nl-full{grid-column:1/-1}.nl-half{grid-column:span 1}.nl-label{display:block;margin:0 0 8px;color:#162d4b;font-size:15px;font-weight:700;line-height:1.35}.nl-required{color:#b42318}.nl-input{display:block;width:100%;box-sizing:border-box;border:1px solid #cdd8e4;border-radius:11px;background:#fff;padding:12px 13px;color:#14263f;font:inherit;font-size:15px;line-height:1.4;outline:none;transition:border-color .15s ease,box-shadow .15s ease,background .15s ease}.nl-input::placeholder{color:#94a3b8}.nl-input:hover{border-color:#afbdcc}.nl-input:focus{border-color:#188eb8;box-shadow:0 0 0 3px rgba(0,166,214,.12)}.nl-textarea{min-height:120px;resize:vertical}.nl-fieldset{border:0;padding:0}.nl-options{display:grid;gap:9px}.nl-option{display:flex;align-items:flex-start;gap:11px;padding:12px 13px;border:1px solid #dce5ee;border-radius:11px;background:#fff;cursor:pointer;line-height:1.45;transition:border-color .15s ease,background .15s ease,box-shadow .15s ease}.nl-option:hover{border-color:#a9bdcf;background:#f9fbfd}.nl-option:has(input:checked){border-color:#1692bd;background:#f0faff;box-shadow:0 0 0 1px rgba(0,166,214,.08)}.nl-option input,.nl-matrix-option input{accent-color:#0e7fa8;margin-top:3px}.nl-paragraph{padding:16px 18px;background:#f7f9fc;border-left:3px solid #18a6cf;border-radius:4px 11px 11px 4px}.nl-paragraph p{white-space:pre-line;margin:0;color:#44566c;font-size:14.5px;line-height:1.7}.nl-matrix{display:grid;gap:13px}.nl-matrix-row{border:1px solid #dce5ee;border-radius:12px;padding:15px 16px}.nl-matrix-row>legend{padding:0 6px;color:#253b57;font-weight:650}.nl-matrix-options{display:grid;gap:8px;margin-top:7px}.nl-matrix-option{display:flex;gap:9px;align-items:flex-start;color:#354b65}.nl-error{margin-top:20px;padding:12px 14px;border:1px solid #fecaca;border-radius:10px;background:#fff2f2;color:#9b1c1c;font-size:14px}.nl-actions{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:30px;padding-top:22px;border-top:1px solid #e7edf3}.nl-button{min-width:112px;border-radius:10px;padding:12px 19px;font:inherit;font-size:14px;font-weight:750;cursor:pointer;transition:transform .1s ease,box-shadow .15s ease,background .15s ease}.nl-button:active{transform:translateY(1px)}.nl-button-primary{border:0;background:#17365d;color:#fff;box-shadow:0 5px 14px rgba(23,54,93,.17)}.nl-button-primary:hover{background:#0f2d50}.nl-button-primary:disabled{opacity:.55;cursor:not-allowed}.nl-button-secondary{border:1px solid #cbd7e3;background:#fff;color:#29415f}.nl-button-secondary:hover{background:#f6f9fc}.nl-success{display:flex;gap:15px;align-items:flex-start;padding:21px 22px;border:1px solid #b8e4d1;border-radius:14px;background:#f0fbf6;color:#174b35}.nl-success-icon{display:grid;place-items:center;flex:0 0 auto;width:31px;height:31px;border-radius:999px;background:#1d8f61;color:#fff;font-weight:800}.nl-success h2{margin:1px 0 5px;font-size:20px}.nl-success p{margin:0;color:#416a59;line-height:1.5}@media(max-width:640px){.nl-form-grid{grid-template-columns:1fr;gap:19px}.nl-half,.nl-full{grid-column:1}.nl-description{text-align:left}.nl-progress{margin-bottom:23px}.nl-actions{margin-top:25px}.nl-button{min-width:104px}.nl-paragraph{padding:14px 15px}}
`;
