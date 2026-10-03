"use client";

import { useEffect, useMemo, useState } from "react";
import {
  nativeFieldTemplate,
  type NativeField,
  type NativeOption,
  type NativeQuestionnaireSchema,
  type SeverityBand,
} from "@/lib/clinical/questionnaires/native-builder";

type FormRow = {
  id: string;
  code: string;
  version: number;
  name: string;
  max_score: number | null;
  active: boolean;
  metadata?: Record<string, unknown> | null;
};

type Props = { formId: string };

type GetResponse = { ok: true; form: FormRow } | { ok: false; error: string };

function clone<T>(value: T): T { return JSON.parse(JSON.stringify(value)) as T; }

function OptionEditor({ options, onChange }: { options: NativeOption[]; onChange: (options: NativeOption[]) => void }) {
  function patch(index: number, patch: Partial<NativeOption>) {
    onChange(options.map((option, i) => i === index ? { ...option, ...patch } : option));
  }
  return (
    <div style={{ display: "grid", gap: "7px", marginTop: "10px" }}>
      {options.map((option, index) => (
        <div key={option.id} style={{ display: "grid", gridTemplateColumns: "70px 1fr auto", gap: "7px" }}>
          <input type="number" value={option.score} onChange={(e) => patch(index, { score: Number(e.target.value) })} aria-label="Score" style={{ padding: "8px", border: "1px solid #d1d5db", borderRadius: "7px" }} />
          <input value={option.label} onChange={(e) => patch(index, { label: e.target.value })} aria-label="Option label" style={{ padding: "8px", border: "1px solid #d1d5db", borderRadius: "7px" }} />
          <button type="button" onClick={() => onChange(options.filter((_, i) => i !== index))} style={{ border: "1px solid #d1d5db", borderRadius: "7px", background: "#fff" }}>×</button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...options, { id: `opt_${Date.now()}`, label: `Option ${options.length + 1}`, score: options.length }])} style={{ justifySelf: "start", border: 0, background: "transparent", textDecoration: "underline", cursor: "pointer" }}>+ Add option</button>
    </div>
  );
}

function FieldEditor({ field, index, count, onChange, onMove, onDelete, onDuplicate }: {
  field: NativeField;
  index: number;
  count: number;
  onChange: (field: NativeField) => void;
  onMove: (direction: -1 | 1) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  return (
    <section style={{ border: "1px solid #e5e7eb", borderRadius: "10px", background: "#fff", overflow: "hidden" }}>
      <div style={{ padding: "8px 10px", background: "#f9fafb", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "12px", fontWeight: 800, textTransform: "uppercase", color: "#6b7280" }}>{field.kind}</span>
        <div style={{ display: "flex", gap: "5px" }}>
          <button type="button" disabled={index === 0} onClick={() => onMove(-1)} aria-label="Move up">↑</button>
          <button type="button" disabled={index === count - 1} onClick={() => onMove(1)} aria-label="Move down">↓</button>
          <button type="button" onClick={onDuplicate}>Duplicate</button>
          <button type="button" onClick={onDelete}>Delete</button>
        </div>
      </div>
      <div style={{ padding: "14px" }}>
        {field.kind === "pagebreak" ? (
          <div style={{ padding: "12px", borderTop: "2px dashed #9ca3af", textAlign: "center", color: "#6b7280" }}>Page break</div>
        ) : field.kind === "paragraph" ? (
          <textarea value={field.text} onChange={(e) => onChange({ ...field, text: e.target.value })} rows={4} style={{ width: "100%", boxSizing: "border-box", padding: "10px", border: "1px solid #d1d5db", borderRadius: "8px" }} />
        ) : field.kind === "matrix" ? (
          <>
            <input value={field.label} onChange={(e) => onChange({ ...field, label: e.target.value })} style={{ width: "100%", boxSizing: "border-box", padding: "9px", border: "1px solid #d1d5db", borderRadius: "8px", fontWeight: 700 }} />
            <label style={{ display: "flex", gap: "8px", marginTop: "9px" }}><input type="checkbox" checked={field.required} onChange={(e) => onChange({ ...field, required: e.target.checked })} />Required</label>
            <h4 style={{ marginBottom: "7px" }}>Rows</h4>
            <div style={{ display: "grid", gap: "6px" }}>
              {field.rows.map((row, rowIndex) => (
                <div key={row.id} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "6px" }}>
                  <input value={row.label} onChange={(e) => onChange({ ...field, rows: field.rows.map((candidate, i) => i === rowIndex ? { ...candidate, label: e.target.value } : candidate) })} style={{ padding: "8px", border: "1px solid #d1d5db", borderRadius: "7px" }} />
                  <button type="button" onClick={() => onChange({ ...field, rows: field.rows.filter((_, i) => i !== rowIndex) })}>×</button>
                </div>
              ))}
              <button type="button" onClick={() => onChange({ ...field, rows: [...field.rows, { id: `row_${Date.now()}`, label: `Item ${field.rows.length + 1}` }] })} style={{ justifySelf: "start" }}>+ Add row</button>
            </div>
            <h4 style={{ marginBottom: "7px" }}>Columns / scores</h4>
            <OptionEditor options={field.columns} onChange={(columns) => onChange({ ...field, columns })} />
          </>
        ) : (
          <>
            <input value={field.label} onChange={(e) => onChange({ ...field, label: e.target.value })} style={{ width: "100%", boxSizing: "border-box", padding: "9px", border: "1px solid #d1d5db", borderRadius: "8px", fontWeight: 700 }} />
            <label style={{ display: "flex", gap: "8px", marginTop: "9px" }}><input type="checkbox" checked={field.required} onChange={(e) => onChange({ ...field, required: e.target.checked })} />Required</label>
            <OptionEditor options={field.options} onChange={(options) => onChange({ ...field, options })} />
          </>
        )}
      </div>
    </section>
  );
}

function FormPreview({ schema }: { schema: NativeQuestionnaireSchema }) {
  const pages = useMemo(() => {
    const result: NativeField[][] = [[]];
    for (const field of schema.fields) {
      if (field.kind === "pagebreak") { if (result[result.length - 1].length) result.push([]); continue; }
      result[result.length - 1].push(field);
    }
    return result.filter(Boolean);
  }, [schema]);
  return (
    <div style={{ border: "1px solid #dbeafe", background: "#fff", borderRadius: "12px", padding: "18px" }}>
      <div style={{ fontSize: "12px", textTransform: "uppercase", fontWeight: 800, color: "#2563eb" }}>Patient preview</div>
      <h2 style={{ margin: "6px 0 4px" }}>{schema.title}</h2>
      {schema.description ? <p style={{ color: "#4b5563" }}>{schema.description}</p> : null}
      {pages.map((page, pageIndex) => (
        <div key={pageIndex} style={{ marginTop: "18px", paddingTop: pageIndex ? "18px" : 0, borderTop: pageIndex ? "1px dashed #d1d5db" : 0 }}>
          {pages.length > 1 ? <strong style={{ fontSize: "13px" }}>Page {pageIndex + 1} of {pages.length}</strong> : null}
          {page.map((field) => {
            if (field.kind === "paragraph") return <p key={field.id} style={{ whiteSpace: "pre-line" }}>{field.text}</p>;
            if (field.kind === "single" || field.kind === "multiple") return <div key={field.id} style={{ margin: "18px 0" }}><strong>{field.label}</strong>{field.options.map((option) => <div key={option.id} style={{ marginTop: "6px" }}>○ {option.label}</div>)}</div>;
            if (field.kind === "matrix") return <div key={field.id} style={{ margin: "18px 0" }}><strong>{field.label}</strong>{field.rows.map((row) => <div key={row.id} style={{ marginTop: "8px" }}>{row.label}: {field.columns.map((column) => column.label).join(" / ")}</div>)}</div>;
            return null;
          })}
        </div>
      ))}
    </div>
  );
}

export function FormBuilder({ formId }: Props) {
  const [form, setForm] = useState<FormRow | null>(null);
  const [schema, setSchema] = useState<NativeQuestionnaireSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [preview, setPreview] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const response = await fetch(`/form/api/forms/${formId}/`, { cache: "no-store" });
      const data = await response.json() as GetResponse;
      if (!data.ok) { setMessage(data.error); setLoading(false); return; }
      setForm(data.form);
      setSchema(data.form.metadata?.native_schema as NativeQuestionnaireSchema ?? null);
      setLoading(false);
    })();
  }, [formId]);

  const isDraft = String(form?.metadata?.builder_status ?? "") === "draft";
  if (loading) return <p>Loading form…</p>;
  if (!form || !schema) return <p>{message ?? "This is not a native editable form."}</p>;

  function replaceField(index: number, field: NativeField) { setSchema({ ...schema!, fields: schema!.fields.map((candidate, i) => i === index ? field : candidate) }); }
  function moveField(index: number, direction: -1 | 1) {
    const target = index + direction; if (target < 0 || target >= schema.fields.length) return;
    const fields = [...schema.fields]; [fields[index], fields[target]] = [fields[target], fields[index]]; setSchema({ ...schema, fields });
  }
  function addField(kind: NativeField["kind"]) { setSchema({ ...schema, fields: [...schema.fields, nativeFieldTemplate(kind, schema.fields.length)] }); }
  function duplicateField(index: number) {
    const copy = clone(schema.fields[index]); copy.id = `${copy.id}_copy_${Date.now()}`;
    setSchema({ ...schema, fields: [...schema.fields.slice(0, index + 1), copy, ...schema.fields.slice(index + 1)] });
  }

  async function save() {
    if (!isDraft) return;
    setSaving(true); setMessage(null);
    try {
      const response = await fetch(`/form/api/forms/${formId}/`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: schema.title, schema }) });
      const data = await response.json() as { ok?: boolean; error?: string };
      setMessage(data.ok ? "Draft saved." : data.error ?? "Could not save draft.");
    } finally { setSaving(false); }
  }

  async function publish() {
    if (!isDraft || !window.confirm("Publish this version? Published versions are immutable. New invitations will use the highest published version.")) return;
    setPublishing(true); setMessage(null);
    try {
      await save();
      const response = await fetch(`/form/api/forms/${formId}/publish/`, { method: "POST" });
      const data = await response.json() as { ok?: boolean; error?: string };
      if (data.ok) { setMessage("Published."); setForm({ ...form, active: true, metadata: { ...(form.metadata ?? {}), builder_status: "published" } }); }
      else setMessage(data.error ?? "Could not publish.");
    } finally { setPublishing(false); }
  }

  function setBands(bands: SeverityBand[]) { setSchema({ ...schema, scoring: { ...schema.scoring, severityBands: bands } }); }

  return (
    <div style={{ display: "grid", gridTemplateColumns: preview ? "minmax(0,1fr) minmax(320px,0.8fr)" : "1fr", gap: "20px" }}>
      <div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
          {isDraft ? <><button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save draft"}</button><button onClick={publish} disabled={publishing} style={{ background: "#111827", color: "#fff", border: 0, borderRadius: "7px", padding: "9px 12px", fontWeight: 700 }}>{publishing ? "Publishing…" : "Publish"}</button></> : <span style={{ padding: "7px 10px", borderRadius: "999px", background: "#dcfce7", fontWeight: 700 }}>Published — read only</span>}
          <button type="button" onClick={() => setPreview((value) => !value)}>{preview ? "Hide preview" : "Preview"}</button>
        </div>
        {message ? <p style={{ padding: "10px 12px", background: "#f3f4f6", borderRadius: "8px" }}>{message}</p> : null}

        <section style={{ padding: "16px", border: "1px solid #e5e7eb", borderRadius: "12px", marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "10px" }}><strong>Form title</strong><input disabled={!isDraft} value={schema.title} onChange={(e) => setSchema({ ...schema, title: e.target.value })} style={{ display: "block", width: "100%", boxSizing: "border-box", marginTop: "5px", padding: "9px", border: "1px solid #d1d5db", borderRadius: "8px" }} /></label>
          <label style={{ display: "block", marginBottom: "10px" }}><strong>Patient-facing name</strong><input disabled={!isDraft} value={schema.patientFacingName} onChange={(e) => setSchema({ ...schema, patientFacingName: e.target.value })} style={{ display: "block", width: "100%", boxSizing: "border-box", marginTop: "5px", padding: "9px", border: "1px solid #d1d5db", borderRadius: "8px" }} /></label>
          <label style={{ display: "block" }}><strong>Description / instructions</strong><textarea disabled={!isDraft} value={schema.description} onChange={(e) => setSchema({ ...schema, description: e.target.value })} rows={3} style={{ display: "block", width: "100%", boxSizing: "border-box", marginTop: "5px", padding: "9px", border: "1px solid #d1d5db", borderRadius: "8px" }} /></label>
        </section>

        {isDraft ? <section style={{ padding: "12px", border: "1px solid #dbeafe", borderRadius: "10px", background: "#eff6ff", marginBottom: "14px" }}><strong>Add field</strong><div style={{ display: "flex", gap: "7px", flexWrap: "wrap", marginTop: "9px" }}>{(["paragraph", "single", "multiple", "matrix", "pagebreak"] as const).map((kind) => <button key={kind} type="button" onClick={() => addField(kind)}>+ {kind}</button>)}</div></section> : null}

        <div style={{ display: "grid", gap: "10px" }}>
          {schema.fields.map((field, index) => isDraft ? <FieldEditor key={field.id} field={field} index={index} count={schema.fields.length} onChange={(next) => replaceField(index, next)} onMove={(direction) => moveField(index, direction)} onDelete={() => setSchema({ ...schema, fields: schema.fields.filter((_, i) => i !== index) })} onDuplicate={() => duplicateField(index)} /> : <div key={field.id} />)}
        </div>

        {isDraft ? <section style={{ marginTop: "18px", padding: "16px", border: "1px solid #e5e7eb", borderRadius: "12px" }}><h3 style={{ marginTop: 0 }}>Scoring severity bands</h3><p style={{ color: "#6b7280", fontSize: "14px" }}>The total is the sum of option scores. Severity labels are optional.</p>{schema.scoring.severityBands.map((band, index) => <div key={index} style={{ display: "grid", gridTemplateColumns: "90px 90px 1fr auto", gap: "7px", marginBottom: "7px" }}><input type="number" value={band.min} onChange={(e) => setBands(schema.scoring.severityBands.map((candidate, i) => i === index ? { ...candidate, min: Number(e.target.value) } : candidate))} /><input type="number" value={band.max} onChange={(e) => setBands(schema.scoring.severityBands.map((candidate, i) => i === index ? { ...candidate, max: Number(e.target.value) } : candidate))} /><input value={band.label} onChange={(e) => setBands(schema.scoring.severityBands.map((candidate, i) => i === index ? { ...candidate, label: e.target.value } : candidate))} /><button type="button" onClick={() => setBands(schema.scoring.severityBands.filter((_, i) => i !== index))}>×</button></div>)}<button type="button" onClick={() => setBands([...schema.scoring.severityBands, { min: 0, max: 0, label: "" }])}>+ Add severity band</button></section> : null}
      </div>
      {preview ? <FormPreview schema={schema} /> : null}
    </div>
  );
}
