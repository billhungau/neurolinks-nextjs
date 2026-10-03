"use client";

import { useEffect, useState } from "react";
import {
  nativeFieldTemplate,
  type NativeField,
  type NativeOption,
  type NativeQuestionnaireSchema,
} from "@/lib/clinical/questionnaires/native-builder";

type FormRow = {
  id: string;
  code: string;
  version: number;
  name: string;
  active: boolean;
  metadata?: Record<string, unknown> | null;
};

type GetResponse = { ok: true; form: FormRow } | { ok: false; error: string };

function optionList(options: NativeOption[], onChange: (value: NativeOption[]) => void, disabled: boolean) {
  return (
    <div style={{ display: "grid", gap: 6, marginTop: 10 }}>
      {options.map((option, index) => (
        <div key={option.id} style={{ display: "grid", gridTemplateColumns: "70px 1fr auto", gap: 6 }}>
          <input disabled={disabled} type="number" value={option.score} onChange={(e) => onChange(options.map((item, i) => i === index ? { ...item, score: Number(e.target.value) } : item))} />
          <input disabled={disabled} value={option.label} onChange={(e) => onChange(options.map((item, i) => i === index ? { ...item, label: e.target.value } : item))} />
          {!disabled ? <button type="button" onClick={() => onChange(options.filter((_, i) => i !== index))}>×</button> : null}
        </div>
      ))}
      {!disabled ? <button type="button" onClick={() => onChange([...options, { id: `opt_${Date.now()}`, label: `Option ${options.length + 1}`, score: options.length }])} style={{ justifySelf: "start" }}>+ Add option</button> : null}
    </div>
  );
}

function FieldCard({ field, index, total, disabled, change, move, remove, duplicate }: {
  field: NativeField;
  index: number;
  total: number;
  disabled: boolean;
  change: (field: NativeField) => void;
  move: (direction: -1 | 1) => void;
  remove: () => void;
  duplicate: () => void;
}) {
  let body: React.ReactNode;

  if (field.kind === "pagebreak") {
    body = <div style={{ textAlign: "center", borderTop: "2px dashed #9ca3af", paddingTop: 10, color: "#6b7280" }}>Page break</div>;
  } else if (field.kind === "paragraph") {
    body = <textarea disabled={disabled} value={field.text} rows={4} onChange={(e) => change({ ...field, text: e.target.value })} style={{ width: "100%", boxSizing: "border-box" }} />;
  } else if (field.kind === "matrix") {
    body = (
      <>
        <input disabled={disabled} value={field.label} onChange={(e) => change({ ...field, label: e.target.value })} style={{ width: "100%", boxSizing: "border-box", fontWeight: 700 }} />
        <label style={{ display: "flex", gap: 6, marginTop: 8 }}><input disabled={disabled} type="checkbox" checked={field.required} onChange={(e) => change({ ...field, required: e.target.checked })} />Required</label>
        <strong style={{ display: "block", marginTop: 12 }}>Rows</strong>
        {field.rows.map((row, rowIndex) => (
          <div key={row.id} style={{ display: "flex", gap: 6, marginTop: 6 }}>
            <input disabled={disabled} value={row.label} onChange={(e) => change({ ...field, rows: field.rows.map((item, i) => i === rowIndex ? { ...item, label: e.target.value } : item) })} style={{ flex: 1 }} />
            {!disabled ? <button type="button" onClick={() => change({ ...field, rows: field.rows.filter((_, i) => i !== rowIndex) })}>×</button> : null}
          </div>
        ))}
        {!disabled ? <button type="button" onClick={() => change({ ...field, rows: [...field.rows, { id: `row_${Date.now()}`, label: `Item ${field.rows.length + 1}` }] })} style={{ marginTop: 6 }}>+ Add row</button> : null}
        <strong style={{ display: "block", marginTop: 12 }}>Columns / scores</strong>
        {optionList(field.columns, (columns) => change({ ...field, columns }), disabled)}
      </>
    );
  } else {
    body = (
      <>
        <input disabled={disabled} value={field.label} onChange={(e) => change({ ...field, label: e.target.value })} style={{ width: "100%", boxSizing: "border-box", fontWeight: 700 }} />
        <label style={{ display: "flex", gap: 6, marginTop: 8 }}><input disabled={disabled} type="checkbox" checked={field.required} onChange={(e) => change({ ...field, required: e.target.checked })} />Required</label>
        {optionList(field.options, (options) => change({ ...field, options }), disabled)}
      </>
    );
  }

  return (
    <section style={{ border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden", background: "#fff" }}>
      <div style={{ padding: "8px 10px", background: "#f9fafb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <strong style={{ fontSize: 12, textTransform: "uppercase", color: "#6b7280" }}>{field.kind}</strong>
        {!disabled ? <div style={{ display: "flex", gap: 5 }}><button type="button" disabled={index === 0} onClick={() => move(-1)}>↑</button><button type="button" disabled={index === total - 1} onClick={() => move(1)}>↓</button><button type="button" onClick={duplicate}>Duplicate</button><button type="button" onClick={remove}>Delete</button></div> : null}
      </div>
      <div style={{ padding: 14 }}>{body}</div>
    </section>
  );
}

export function FormBuilder({ formId }: { formId: string }) {
  const [form, setForm] = useState<FormRow | null>(null);
  const [schema, setSchema] = useState<NativeQuestionnaireSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    void (async () => {
      const response = await fetch(`/form/api/forms/${formId}/`, { cache: "no-store" });
      const data = await response.json() as GetResponse;
      if (!data.ok) { setMessage(data.error); setLoading(false); return; }
      setForm(data.form);
      const raw = data.form.metadata?.native_schema;
      setSchema(raw && typeof raw === "object" ? raw as NativeQuestionnaireSchema : null);
      setLoading(false);
    })();
  }, [formId]);

  if (loading) return <p>Loading form…</p>;
  if (!form || !schema) return <p>{message ?? "This form is not editable in the native builder."}</p>;
  const isDraft = String(form.metadata?.builder_status ?? "") === "draft";

  function updateField(index: number, field: NativeField) {
    setSchema((current) => current ? { ...current, fields: current.fields.map((item, i) => i === index ? field : item) } : current);
  }

  function moveField(index: number, direction: -1 | 1) {
    setSchema((current) => {
      if (!current) return current;
      const target = index + direction;
      if (target < 0 || target >= current.fields.length) return current;
      const fields = [...current.fields];
      const sourceField = fields[index];
      const targetField = fields[target];
      if (!sourceField || !targetField) return current;
      fields[index] = targetField;
      fields[target] = sourceField;
      return { ...current, fields };
    });
  }

  async function saveDraft() {
    if (!isDraft) return true;
    setSaving(true); setMessage(null);
    try {
      const response = await fetch(`/form/api/forms/${formId}/`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: schema.title, schema }) });
      const data = await response.json() as { ok?: boolean; error?: string };
      setMessage(data.ok ? "Draft saved." : data.error ?? "Could not save draft.");
      return Boolean(data.ok);
    } finally { setSaving(false); }
  }

  async function publish() {
    if (!isDraft || !window.confirm("Publish this version? Published versions are immutable.")) return;
    const saved = await saveDraft();
    if (!saved) return;
    const response = await fetch(`/form/api/forms/${formId}/publish/`, { method: "POST" });
    const data = await response.json() as { ok?: boolean; error?: string };
    if (data.ok) {
      setMessage("Published. New questionnaire invitations will use this version.");
      setForm({ ...form, active: true, metadata: { ...(form.metadata ?? {}), builder_status: "published" } });
    } else setMessage(data.error ?? "Could not publish.");
  }

  function add(kind: NativeField["kind"]) {
    setSchema({ ...schema, fields: [...schema.fields, nativeFieldTemplate(kind, schema.fields.length)] });
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        {isDraft ? <><button type="button" onClick={saveDraft} disabled={saving}>{saving ? "Saving…" : "Save draft"}</button><button type="button" onClick={publish} style={{ background: "#111827", color: "#fff", border: 0, borderRadius: 7, padding: "9px 12px", fontWeight: 700 }}>Publish</button></> : <span style={{ background: "#dcfce7", borderRadius: 999, padding: "7px 10px", fontWeight: 700 }}>Published — immutable</span>}
        <button type="button" onClick={() => setPreview((value) => !value)}>{preview ? "Hide preview" : "Preview"}</button>
      </div>
      {message ? <p style={{ padding: 10, background: "#f3f4f6", borderRadius: 8 }}>{message}</p> : null}

      <section style={{ padding: 16, border: "1px solid #e5e7eb", borderRadius: 12, marginBottom: 14 }}>
        <label style={{ display: "block", marginBottom: 10 }}><strong>Form title</strong><input disabled={!isDraft} value={schema.title} onChange={(e) => setSchema({ ...schema, title: e.target.value })} style={{ display: "block", width: "100%", boxSizing: "border-box", marginTop: 5 }} /></label>
        <label style={{ display: "block", marginBottom: 10 }}><strong>Patient-facing name</strong><input disabled={!isDraft} value={schema.patientFacingName} onChange={(e) => setSchema({ ...schema, patientFacingName: e.target.value })} style={{ display: "block", width: "100%", boxSizing: "border-box", marginTop: 5 }} /></label>
        <label style={{ display: "block" }}><strong>Description</strong><textarea disabled={!isDraft} value={schema.description} onChange={(e) => setSchema({ ...schema, description: e.target.value })} rows={3} style={{ display: "block", width: "100%", boxSizing: "border-box", marginTop: 5 }} /></label>
      </section>

      {isDraft ? <section style={{ padding: 12, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, marginBottom: 14 }}><strong>Add field</strong><div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 8 }}>{(["paragraph", "single", "multiple", "matrix", "pagebreak"] as const).map((kind) => <button key={kind} type="button" onClick={() => add(kind)}>+ {kind}</button>)}</div></section> : null}

      <div style={{ display: "grid", gap: 10 }}>
        {schema.fields.map((field, index) => <FieldCard key={field.id} field={field} index={index} total={schema.fields.length} disabled={!isDraft} change={(next) => updateField(index, next)} move={(direction) => moveField(index, direction)} remove={() => setSchema({ ...schema, fields: schema.fields.filter((_, i) => i !== index) })} duplicate={() => { const copy = JSON.parse(JSON.stringify(field)) as NativeField; copy.id = `${copy.id}_copy_${Date.now()}`; setSchema({ ...schema, fields: [...schema.fields.slice(0, index + 1), copy, ...schema.fields.slice(index + 1)] }); }} />)}
      </div>

      <section style={{ padding: 16, border: "1px solid #e5e7eb", borderRadius: 12, marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}>Scoring</h3>
        <p style={{ color: "#6b7280", fontSize: 14 }}>Scores are summed. Optional severity bands:</p>
        {schema.scoring.severityBands.map((band, index) => <div key={index} style={{ display: "grid", gridTemplateColumns: "80px 80px 1fr auto", gap: 6, marginBottom: 6 }}><input disabled={!isDraft} type="number" value={band.min} onChange={(e) => setSchema({ ...schema, scoring: { ...schema.scoring, severityBands: schema.scoring.severityBands.map((item, i) => i === index ? { ...item, min: Number(e.target.value) } : item) } })} /><input disabled={!isDraft} type="number" value={band.max} onChange={(e) => setSchema({ ...schema, scoring: { ...schema.scoring, severityBands: schema.scoring.severityBands.map((item, i) => i === index ? { ...item, max: Number(e.target.value) } : item) } })} /><input disabled={!isDraft} value={band.label} onChange={(e) => setSchema({ ...schema, scoring: { ...schema.scoring, severityBands: schema.scoring.severityBands.map((item, i) => i === index ? { ...item, label: e.target.value } : item) } })} />{isDraft ? <button type="button" onClick={() => setSchema({ ...schema, scoring: { ...schema.scoring, severityBands: schema.scoring.severityBands.filter((_, i) => i !== index) } })}>×</button> : null}</div>)}
        {isDraft ? <button type="button" onClick={() => setSchema({ ...schema, scoring: { ...schema.scoring, severityBands: [...schema.scoring.severityBands, { min: 0, max: 0, label: "" }] } })}>+ Add severity band</button> : null}
      </section>

      {preview ? <section style={{ marginTop: 18, padding: 18, border: "2px solid #bfdbfe", borderRadius: 12 }}><div style={{ fontSize: 12, fontWeight: 800, color: "#2563eb", textTransform: "uppercase" }}>Patient preview</div><h2>{schema.title}</h2><p style={{ whiteSpace: "pre-line" }}>{schema.description}</p>{schema.fields.map((field) => field.kind === "paragraph" ? <p key={field.id}>{field.text}</p> : field.kind === "pagebreak" ? <hr key={field.id} /> : field.kind === "matrix" ? <div key={field.id} style={{ margin: "14px 0" }}><strong>{field.label}</strong>{field.rows.map((row) => <div key={row.id}>{row.label}: {field.columns.map((column) => column.label).join(" / ")}</div>)}</div> : <div key={field.id} style={{ margin: "14px 0" }}><strong>{field.label}</strong>{field.options.map((option) => <div key={option.id}>○ {option.label}</div>)}</div>)}</section> : null}
    </div>
  );
}
