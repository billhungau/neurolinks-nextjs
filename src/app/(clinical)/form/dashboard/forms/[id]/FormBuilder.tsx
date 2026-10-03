"use client";

import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";
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
type InspectorTab = "question" | "scoring" | "settings";
type SaveState = "saved" | "saving" | "unsaved" | "error";

const fieldLabels: Record<NativeField["kind"], string> = {
  paragraph: "Text / instructions",
  text: "Short answer",
  textarea: "Long answer",
  single: "Single choice",
  multiple: "Multiple choice",
  matrix: "Matrix",
  pagebreak: "Page break",
};

const palette: Array<{ kind: NativeField["kind"]; icon: string; label: string; description: string }> = [
  { kind: "single", icon: "◉", label: "Single choice", description: "One scored answer" },
  { kind: "multiple", icon: "☑", label: "Multiple choice", description: "Select several answers" },
  { kind: "matrix", icon: "▦", label: "Matrix", description: "Rows with shared choices" },
  { kind: "text", icon: "Aa", label: "Short answer", description: "One-line text response" },
  { kind: "textarea", icon: "≡", label: "Long answer", description: "Multi-line text response" },
  { kind: "paragraph", icon: "¶", label: "Text", description: "Instructions or information" },
  { kind: "pagebreak", icon: "↳", label: "Page break", description: "Start a new page" },
];

function fieldTitle(field: NativeField) {
  if (field.kind === "paragraph") return field.text.split("\n")[0]?.trim() || "Instructions";
  if (field.kind === "pagebreak") return "Page break";
  return field.label || "Untitled question";
}

function fieldMeta(field: NativeField) {
  if (field.kind === "paragraph") return "Text block";
  if (field.kind === "pagebreak") return "New patient page";
  if (field.kind === "text" || field.kind === "textarea") return `${fieldLabels[field.kind]}${field.required ? " · Required" : ""}`;
  if (field.kind === "matrix") return `${field.rows.length} rows · ${field.columns.length} choices${field.required ? " · Required" : ""}`;
  return `${field.options.length} options${field.required ? " · Required" : ""}`;
}

function OptionEditor({ options, onChange }: { options: NativeOption[]; onChange: (next: NativeOption[]) => void }) {
  return (
    <div className="nl-options-editor">
      <div className="nl-options-head"><span>Score</span><span>Answer</span><span /></div>
      {options.map((option, index) => (
        <div key={option.id} className="nl-option-row">
          <input className="nl-score-input" type="number" value={option.score} onChange={(event) => onChange(options.map((item, i) => i === index ? { ...item, score: Number(event.target.value) } : item))} />
          <input value={option.label} onChange={(event) => onChange(options.map((item, i) => i === index ? { ...item, label: event.target.value } : item))} />
          <button type="button" className="nl-icon-button nl-danger-ghost" aria-label="Delete option" onClick={() => onChange(options.filter((_, i) => i !== index))}>×</button>
        </div>
      ))}
      <button type="button" className="nl-text-button" onClick={() => onChange([...options, { id: `opt_${Date.now()}`, label: `Option ${options.length + 1}`, score: options.length }])}>+ Add option</button>
    </div>
  );
}

function CanvasField({ field, selected, preview, onSelect, onDragStart, onDragOver, onDrop }: {
  field: NativeField;
  selected: boolean;
  preview: boolean;
  onSelect: () => void;
  onDragStart: (event: DragEvent<HTMLDivElement>) => void;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
}) {
  if (field.kind === "pagebreak") {
    return <div className={`nl-page-break ${selected ? "is-selected" : ""}`} onClick={onSelect} draggable={!preview} onDragStart={onDragStart} onDragOver={onDragOver} onDrop={onDrop}><span>Page break</span></div>;
  }
  if (field.kind === "paragraph") {
    return <div className={`nl-canvas-field nl-text-field ${selected ? "is-selected" : ""}`} onClick={onSelect} draggable={!preview} onDragStart={onDragStart} onDragOver={onDragOver} onDrop={onDrop}>{!preview ? <div className="nl-drag-handle">⋮⋮</div> : null}<p>{field.text}</p></div>;
  }

  return (
    <div className={`nl-canvas-field ${selected ? "is-selected" : ""}`} onClick={onSelect} draggable={!preview} onDragStart={onDragStart} onDragOver={onDragOver} onDrop={onDrop}>
      {!preview ? <div className="nl-drag-handle">⋮⋮</div> : null}
      <div className="nl-question-title"><strong>{field.label}</strong>{field.required ? <span className="nl-required">*</span> : null}</div>
      {field.kind === "text" ? <div className="nl-fake-input">Short answer</div> : null}
      {field.kind === "textarea" ? <div className="nl-fake-input nl-fake-textarea">Long answer</div> : null}
      {field.kind === "matrix" ? (
        <div className="nl-matrix-preview">
          <div className="nl-matrix-header"><span />{field.columns.map((column) => <span key={column.id}>{column.label}</span>)}</div>
          {field.rows.map((row) => <div className="nl-matrix-row" key={row.id}><span>{row.label}</span>{field.columns.map((column) => <span key={column.id} className="nl-radio-dot" />)}</div>)}
        </div>
      ) : null}
      {(field.kind === "single" || field.kind === "multiple") ? (
        <div className="nl-answer-list">
          {field.options.map((option) => <div key={option.id} className="nl-answer-row"><span className={field.kind === "multiple" ? "nl-checkbox-box" : "nl-radio-circle"} /><span>{option.label}</span></div>)}
        </div>
      ) : null}
      {!preview ? <div className="nl-field-meta">{fieldMeta(field)}</div> : null}
    </div>
  );
}

function InspectorActions({ onDuplicate, onDelete }: { onDuplicate: () => void; onDelete: () => void }) {
  return <div className="nl-inspector-actions"><button type="button" className="nl-secondary-button" onClick={onDuplicate}>Duplicate</button><button type="button" className="nl-danger-button" onClick={onDelete}>Delete</button></div>;
}

function QuestionInspector({ field, onChange, onDuplicate, onDelete }: {
  field: NativeField | null;
  onChange: (field: NativeField) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  if (!field) return <div className="nl-empty-inspector"><div className="nl-empty-icon">↖</div><strong>Select a question</strong><p>Choose an item on the canvas to edit its settings.</p></div>;
  if (field.kind === "pagebreak") return <div><div className="nl-inspector-section"><div className="nl-field-type-pill">Page break</div><p className="nl-muted">Patients continue on a new page after this point.</p></div><InspectorActions onDuplicate={onDuplicate} onDelete={onDelete} /></div>;
  if (field.kind === "paragraph") return <div><div className="nl-inspector-section"><label className="nl-label">Text</label><textarea rows={8} value={field.text} onChange={(event) => onChange({ ...field, text: event.target.value })} /></div><InspectorActions onDuplicate={onDuplicate} onDelete={onDelete} /></div>;
  if (field.kind === "text" || field.kind === "textarea") return (
    <div>
      <div className="nl-inspector-section">
        <div className="nl-field-type-pill">{fieldLabels[field.kind]}</div>
        <label className="nl-label">Question</label><input value={field.label} onChange={(event) => onChange({ ...field, label: event.target.value })} />
        <label className="nl-label">Placeholder</label><input value={field.placeholder ?? ""} onChange={(event) => onChange({ ...field, placeholder: event.target.value })} />
        <label className="nl-toggle-row"><input type="checkbox" checked={field.required} onChange={(event) => onChange({ ...field, required: event.target.checked })} /><span>Required</span></label>
      </div>
      <InspectorActions onDuplicate={onDuplicate} onDelete={onDelete} />
    </div>
  );
  if (field.kind === "matrix") return (
    <div>
      <div className="nl-inspector-section"><div className="nl-field-type-pill">Matrix</div><label className="nl-label">Question</label><input value={field.label} onChange={(event) => onChange({ ...field, label: event.target.value })} /><label className="nl-toggle-row"><input type="checkbox" checked={field.required} onChange={(event) => onChange({ ...field, required: event.target.checked })} /><span>Required</span></label></div>
      <div className="nl-inspector-section"><div className="nl-section-heading">Rows</div><div className="nl-stack-small">{field.rows.map((row, index) => <div className="nl-inline-edit" key={row.id}><input value={row.label} onChange={(event) => onChange({ ...field, rows: field.rows.map((item, i) => i === index ? { ...item, label: event.target.value } : item) })} /><button className="nl-icon-button" type="button" onClick={() => onChange({ ...field, rows: field.rows.filter((_, i) => i !== index) })}>×</button></div>)}</div><button className="nl-text-button" type="button" onClick={() => onChange({ ...field, rows: [...field.rows, { id: `row_${Date.now()}`, label: `Item ${field.rows.length + 1}` }] })}>+ Add row</button></div>
      <div className="nl-inspector-section"><div className="nl-section-heading">Columns & scores</div><OptionEditor options={field.columns} onChange={(columns) => onChange({ ...field, columns })} /></div>
      <InspectorActions onDuplicate={onDuplicate} onDelete={onDelete} />
    </div>
  );
  return (
    <div>
      <div className="nl-inspector-section"><div className="nl-field-type-pill">{fieldLabels[field.kind]}</div><label className="nl-label">Question</label><input value={field.label} onChange={(event) => onChange({ ...field, label: event.target.value })} /><label className="nl-toggle-row"><input type="checkbox" checked={field.required} onChange={(event) => onChange({ ...field, required: event.target.checked })} /><span>Required</span></label></div>
      <div className="nl-inspector-section"><div className="nl-section-heading">Answer choices</div><OptionEditor options={field.options} onChange={(options) => onChange({ ...field, options })} /></div>
      <InspectorActions onDuplicate={onDuplicate} onDelete={onDelete} />
    </div>
  );
}

export function FormBuilder({ formId }: { formId: string }) {
  const [form, setForm] = useState<FormRow | null>(null);
  const [schema, setSchema] = useState<NativeQuestionnaireSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [preview, setPreview] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<InspectorTab>("question");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const hydratedRef = useRef(false);
  const saveTimerRef = useRef<number | null>(null);

  useEffect(() => {
    void (async () => {
      const response = await fetch(`/form/api/forms/${formId}/`, { cache: "no-store" });
      const data = await response.json() as GetResponse;
      if (!data.ok) { setMessage(data.error); setLoading(false); return; }
      setForm(data.form);
      const raw = data.form.metadata?.native_schema;
      const native = raw && typeof raw === "object" ? raw as NativeQuestionnaireSchema : null;
      setSchema(native);
      setSelectedId(native?.fields.find((field) => field.kind !== "paragraph")?.id ?? native?.fields[0]?.id ?? null);
      hydratedRef.current = true;
      setLoading(false);
    })();
  }, [formId]);

  const isDraft = String(form?.metadata?.builder_status ?? "") === "draft";

  async function persistSchema(nextSchema: NativeQuestionnaireSchema) {
    if (!isDraft) return true;
    setSaveState("saving");
    try {
      const response = await fetch(`/form/api/forms/${formId}/`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: nextSchema.title, schema: nextSchema }) });
      const data = await response.json() as { ok?: boolean; error?: string };
      if (!data.ok) { setSaveState("error"); setMessage(data.error ?? "Could not save changes."); return false; }
      setSaveState("saved");
      return true;
    } catch { setSaveState("error"); setMessage("Could not save changes."); return false; }
  }

  useEffect(() => {
    if (!hydratedRef.current || !schema || !isDraft) return;
    setSaveState("unsaved");
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => { void persistSchema(schema); }, 900);
    return () => { if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current); };
  }, [schema, isDraft]);

  const selectedIndex = useMemo(() => schema?.fields.findIndex((field) => field.id === selectedId) ?? -1, [schema, selectedId]);
  const selectedField = selectedIndex >= 0 && schema ? schema.fields[selectedIndex] ?? null : null;

  function updateSchema(updater: (current: NativeQuestionnaireSchema) => NativeQuestionnaireSchema) { setSchema((current) => current ? updater(current) : current); }
  function updateSelected(next: NativeField) { if (selectedIndex < 0) return; updateSchema((current) => ({ ...current, fields: current.fields.map((field, index) => index === selectedIndex ? next : field) })); }
  function addField(kind: NativeField["kind"]) {
    updateSchema((current) => {
      const next = nativeFieldTemplate(kind, current.fields.length);
      const insertAt = selectedIndex >= 0 ? selectedIndex + 1 : current.fields.length;
      window.setTimeout(() => { setSelectedId(next.id); setTab("question"); }, 0);
      return { ...current, fields: [...current.fields.slice(0, insertAt), next, ...current.fields.slice(insertAt)] };
    });
  }
  function duplicateSelected() {
    if (!selectedField || selectedIndex < 0) return;
    const copy = JSON.parse(JSON.stringify(selectedField)) as NativeField;
    copy.id = `${copy.id}_copy_${Date.now()}`;
    updateSchema((current) => ({ ...current, fields: [...current.fields.slice(0, selectedIndex + 1), copy, ...current.fields.slice(selectedIndex + 1)] }));
    setSelectedId(copy.id);
  }
  function deleteSelected() {
    if (!selectedField || selectedIndex < 0) return;
    if (!window.confirm(`Delete “${fieldTitle(selectedField)}”?`)) return;
    const nextSelection = schema?.fields[selectedIndex + 1]?.id ?? schema?.fields[selectedIndex - 1]?.id ?? null;
    updateSchema((current) => ({ ...current, fields: current.fields.filter((_, index) => index !== selectedIndex) }));
    setSelectedId(nextSelection);
  }
  function handleDrop(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) return;
    updateSchema((current) => {
      const fields = [...current.fields];
      const [moved] = fields.splice(dragIndex, 1);
      if (!moved) return current;
      fields.splice(targetIndex, 0, moved);
      return { ...current, fields };
    });
    setDragIndex(null);
  }
  async function publish() {
    if (!schema || !isDraft) return;
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    const saved = await persistSchema(schema);
    if (!saved || !window.confirm("Publish this form? It will become available for new questionnaire invitations.")) return;
    const response = await fetch(`/form/api/forms/${formId}/publish/`, { method: "POST" });
    const data = await response.json() as { ok?: boolean; error?: string };
    if (!data.ok) { setMessage(data.error ?? "Could not publish."); return; }
    setForm((current) => current ? { ...current, active: true, metadata: { ...(current.metadata ?? {}), builder_status: "published" } } : current);
    setMessage("Published successfully.");
  }

  if (loading) return <div className="nl-builder-loading">Loading form builder…</div>;
  if (!form || !schema) return <div className="nl-builder-loading">{message ?? "This form is not editable."}</div>;

  const visibleFields = schema.fields.filter((field, index) => !(index === 0 && field.kind === "paragraph" && field.text.trim() === schema.description.trim() && schema.description.trim()));

  return (
    <div className="nl-builder-shell">
      <div className="nl-builder-topbar">
        <div className="nl-builder-title"><div className="nl-eyebrow">NeuroLinks Forms</div><strong>{schema.title}</strong><span className={`nl-save-state is-${saveState}`}>{isDraft ? (saveState === "saving" ? "Saving…" : saveState === "unsaved" ? "Unsaved changes" : saveState === "error" ? "Save error" : "Saved") : "Published"}</span></div>
        <div className="nl-top-actions"><button type="button" className="nl-secondary-button" onClick={() => setPreview((value) => !value)}>{preview ? "Edit" : "Preview"}</button>{isDraft ? <button type="button" className="nl-primary-button" onClick={publish}>Publish</button> : null}</div>
      </div>
      {message ? <div className="nl-builder-message">{message}</div> : null}

      <div className={`nl-builder-grid ${preview ? "is-preview" : ""}`}>
        {!preview ? <aside className="nl-palette"><div className="nl-panel-heading">Add field</div><div className="nl-palette-list">{palette.map((item) => <button key={item.kind} type="button" className="nl-palette-item" disabled={!isDraft} onClick={() => addField(item.kind)}><span className="nl-palette-icon">{item.icon}</span><span><strong>{item.label}</strong><small>{item.description}</small></span></button>)}</div></aside> : null}

        <main className="nl-canvas-wrap">
          <div className="nl-canvas">
            <div className="nl-form-heading"><h1>{schema.title}</h1>{schema.description ? <p>{schema.description}</p> : null}</div>
            <div className="nl-canvas-fields">{visibleFields.map((field) => {
              const originalIndex = schema.fields.findIndex((candidate) => candidate.id === field.id);
              return <CanvasField key={field.id} field={field} selected={!preview && field.id === selectedId} preview={preview} onSelect={() => { if (!preview) { setSelectedId(field.id); setTab("question"); } }} onDragStart={() => setDragIndex(originalIndex)} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); handleDrop(originalIndex); }} />;
            })}</div>
            {!schema.fields.length ? <button type="button" className="nl-empty-canvas" onClick={() => addField("single")}>+ Add your first question</button> : null}
          </div>
        </main>

        {!preview ? <aside className="nl-inspector"><div className="nl-inspector-tabs"><button className={tab === "question" ? "active" : ""} onClick={() => setTab("question")}>Question</button><button className={tab === "scoring" ? "active" : ""} onClick={() => setTab("scoring")}>Scoring</button><button className={tab === "settings" ? "active" : ""} onClick={() => setTab("settings")}>Settings</button></div><div className="nl-inspector-body">
          {tab === "question" ? <QuestionInspector field={selectedField} onChange={updateSelected} onDuplicate={duplicateSelected} onDelete={deleteSelected} /> : null}
          {tab === "scoring" ? <div><div className="nl-inspector-section"><div className="nl-section-heading">Severity bands</div><p className="nl-muted">Optional labels applied to the total score.</p>{schema.scoring.severityBands.map((band, index) => <div key={index} className="nl-band-row"><input type="number" value={band.min} onChange={(event) => updateSchema((current) => ({ ...current, scoring: { ...current.scoring, severityBands: current.scoring.severityBands.map((item, i) => i === index ? { ...item, min: Number(event.target.value) } : item) } }))} /><span>to</span><input type="number" value={band.max} onChange={(event) => updateSchema((current) => ({ ...current, scoring: { ...current.scoring, severityBands: current.scoring.severityBands.map((item, i) => i === index ? { ...item, max: Number(event.target.value) } : item) } }))} /><input value={band.label} onChange={(event) => updateSchema((current) => ({ ...current, scoring: { ...current.scoring, severityBands: current.scoring.severityBands.map((item, i) => i === index ? { ...item, label: event.target.value } : item) } }))} /><button className="nl-icon-button" onClick={() => updateSchema((current) => ({ ...current, scoring: { ...current.scoring, severityBands: current.scoring.severityBands.filter((_, i) => i !== index) } }))}>×</button></div>)}<button className="nl-text-button" onClick={() => updateSchema((current) => ({ ...current, scoring: { ...current.scoring, severityBands: [...current.scoring.severityBands, { min: 0, max: 0, label: "" }] } }))}>+ Add severity band</button></div>{(schema.scoring.subscales?.length ?? 0) > 0 ? <div className="nl-inspector-section"><div className="nl-section-heading">Subscales</div>{schema.scoring.subscales?.map((subscale) => <div key={subscale.key} className="nl-subscale-card"><strong>{subscale.label}</strong><span>{subscale.fieldIds.length} items</span></div>)}</div> : null}</div> : null}
          {tab === "settings" ? <div className="nl-inspector-section"><label className="nl-label">Form title</label><input value={schema.title} onChange={(event) => updateSchema((current) => ({ ...current, title: event.target.value }))} /><label className="nl-label">Patient-facing name</label><input value={schema.patientFacingName} onChange={(event) => updateSchema((current) => ({ ...current, patientFacingName: event.target.value }))} /><label className="nl-label">Description</label><textarea rows={7} value={schema.description} onChange={(event) => updateSchema((current) => ({ ...current, description: event.target.value }))} /></div> : null}
        </div></aside> : null}
      </div>

      <style jsx global>{`
        .nl-builder-shell{background:#f5f7fb;min-height:calc(100vh - 88px);border:1px solid #e5e7eb;border-radius:18px;overflow:hidden;color:#111827}.nl-builder-topbar{position:sticky;top:0;z-index:20;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 18px;background:rgba(255,255,255,.96);backdrop-filter:blur(12px);border-bottom:1px solid #e5e7eb}.nl-builder-title{display:flex;align-items:center;gap:10px;min-width:0}.nl-builder-title>strong{font-size:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.nl-eyebrow{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#64748b;font-weight:800}.nl-save-state{font-size:12px;color:#64748b}.nl-save-state.is-error{color:#b91c1c}.nl-top-actions{display:flex;gap:8px}.nl-primary-button,.nl-secondary-button,.nl-danger-button,.nl-text-button,.nl-icon-button{font:inherit;cursor:pointer}.nl-primary-button{border:0;border-radius:9px;background:#2563eb;color:white;padding:9px 14px;font-weight:750}.nl-secondary-button{border:1px solid #d8dee9;border-radius:9px;background:white;padding:9px 13px;font-weight:650}.nl-danger-button{border:1px solid #fecaca;border-radius:9px;background:#fff;color:#b91c1c;padding:9px 13px}.nl-text-button{border:0;background:transparent;color:#2563eb;padding:6px 0;font-weight:650}.nl-icon-button{border:0;background:transparent;padding:5px 7px;border-radius:7px}.nl-builder-message{margin:12px 18px 0;padding:10px 12px;background:#fff;border:1px solid #e5e7eb;border-radius:9px}.nl-builder-grid{display:grid;grid-template-columns:220px minmax(420px,1fr) 330px;min-height:760px}.nl-builder-grid.is-preview{grid-template-columns:minmax(0,1fr)}.nl-palette,.nl-inspector{background:#fff}.nl-palette{border-right:1px solid #e5e7eb;padding:16px}.nl-inspector{border-left:1px solid #e5e7eb}.nl-panel-heading,.nl-section-heading{font-size:12px;text-transform:uppercase;letter-spacing:.06em;font-weight:800;color:#64748b}.nl-palette-list{display:grid;gap:8px;margin-top:12px}.nl-palette-item{display:flex;gap:10px;text-align:left;border:1px solid #e5e7eb;background:#fff;border-radius:11px;padding:10px;transition:.15s}.nl-palette-item:hover{border-color:#93c5fd;background:#f8fbff}.nl-palette-item:disabled{opacity:.5}.nl-palette-item strong,.nl-palette-item small{display:block}.nl-palette-item small{color:#64748b;margin-top:2px}.nl-palette-icon{display:grid;place-items:center;width:29px;height:29px;border-radius:8px;background:#eff6ff;color:#1d4ed8;font-weight:800}.nl-canvas-wrap{padding:28px;overflow:auto}.nl-canvas{max-width:760px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:16px;box-shadow:0 12px 35px rgba(15,23,42,.06);padding:34px}.nl-form-heading{padding-bottom:22px;border-bottom:1px solid #eef2f7;margin-bottom:18px}.nl-form-heading h1{font-size:28px;margin:0 0 8px}.nl-form-heading p{white-space:pre-line;color:#475569;line-height:1.6;margin:0}.nl-canvas-fields{display:grid;gap:11px}.nl-canvas-field{position:relative;border:1px solid transparent;border-radius:12px;padding:14px 16px;transition:.15s}.nl-canvas-field:hover{background:#fafcff;border-color:#dbeafe}.nl-canvas-field.is-selected{background:#f8fbff;border-color:#60a5fa;box-shadow:0 0 0 2px rgba(96,165,250,.12)}.nl-drag-handle{position:absolute;left:-2px;top:12px;color:#94a3b8;cursor:grab;font-weight:800}.nl-question-title{font-size:16px;margin-bottom:11px}.nl-required{color:#dc2626;margin-left:3px}.nl-answer-list{display:grid;gap:8px}.nl-answer-row{display:flex;gap:9px;align-items:flex-start;color:#334155}.nl-radio-circle,.nl-checkbox-box,.nl-radio-dot{display:inline-block;flex:0 0 auto;width:15px;height:15px;border:1.5px solid #94a3b8;margin-top:2px}.nl-radio-circle,.nl-radio-dot{border-radius:50%}.nl-checkbox-box{border-radius:3px}.nl-field-meta{font-size:11px;color:#94a3b8;margin-top:10px}.nl-text-field p{white-space:pre-line;color:#475569;line-height:1.6;margin:0}.nl-page-break{border-top:1px dashed #94a3b8;text-align:center;color:#64748b;margin:14px 0;padding-top:7px;cursor:pointer}.nl-page-break span{background:#fff;padding:0 10px;font-size:12px}.nl-page-break.is-selected{border-color:#2563eb;color:#2563eb}.nl-fake-input{height:39px;border:1px solid #e2e8f0;border-radius:8px;color:#94a3b8;padding:10px 12px;box-sizing:border-box}.nl-fake-textarea{height:88px}.nl-matrix-preview{overflow:auto}.nl-matrix-header,.nl-matrix-row{display:grid;grid-template-columns:minmax(150px,1fr) repeat(4,minmax(42px,auto));gap:8px;align-items:center}.nl-matrix-header{font-size:11px;color:#64748b;margin-bottom:8px}.nl-matrix-row{padding:7px 0;border-top:1px solid #f1f5f9}.nl-matrix-row .nl-radio-dot{justify-self:center}.nl-inspector-tabs{display:grid;grid-template-columns:repeat(3,1fr);border-bottom:1px solid #e5e7eb}.nl-inspector-tabs button{border:0;background:#fff;padding:13px 6px;color:#64748b;font-weight:650;cursor:pointer}.nl-inspector-tabs button.active{color:#1d4ed8;box-shadow:inset 0 -2px #2563eb}.nl-inspector-body{padding:16px;max-height:760px;overflow:auto}.nl-inspector-section{padding-bottom:18px;margin-bottom:18px;border-bottom:1px solid #eef2f7}.nl-inspector-section input,.nl-inspector-section textarea,.nl-option-row input,.nl-inline-edit input,.nl-band-row input{width:100%;box-sizing:border-box;border:1px solid #d8dee9;border-radius:8px;padding:9px 10px;font:inherit;background:#fff}.nl-label{display:block;font-size:12px;font-weight:750;color:#475569;margin:12px 0 6px}.nl-toggle-row{display:flex;align-items:center;gap:8px;margin-top:12px}.nl-toggle-row input{width:auto}.nl-field-type-pill{display:inline-block;background:#eff6ff;color:#1d4ed8;border-radius:999px;padding:5px 8px;font-size:11px;font-weight:800;margin-bottom:10px}.nl-muted{color:#64748b;font-size:13px;line-height:1.5}.nl-options-editor{display:grid;gap:7px;margin-top:8px}.nl-options-head,.nl-option-row{display:grid;grid-template-columns:58px minmax(0,1fr) 28px;gap:6px;align-items:center}.nl-options-head{font-size:10px;text-transform:uppercase;color:#94a3b8;font-weight:800}.nl-score-input{text-align:center}.nl-danger-ghost{color:#b91c1c}.nl-stack-small{display:grid;gap:6px;margin-top:8px}.nl-inline-edit{display:grid;grid-template-columns:1fr 28px;gap:5px}.nl-inspector-actions{display:flex;gap:8px;justify-content:space-between}.nl-empty-inspector{text-align:center;padding:36px 10px;color:#64748b}.nl-empty-icon{font-size:28px;margin-bottom:8px}.nl-band-row{display:grid;grid-template-columns:54px 18px 54px 1fr 26px;gap:5px;align-items:center;margin-top:8px}.nl-subscale-card{display:flex;justify-content:space-between;gap:8px;padding:9px 10px;background:#f8fafc;border-radius:8px;margin-top:7px;font-size:12px}.nl-empty-canvas{width:100%;border:1px dashed #93c5fd;border-radius:12px;background:#f8fbff;padding:22px;color:#2563eb;font-weight:700;cursor:pointer}.nl-builder-loading{padding:28px;color:#64748b}
        @media(max-width:1050px){.nl-builder-grid{grid-template-columns:190px minmax(380px,1fr)}.nl-inspector{grid-column:1/-1;border-left:0;border-top:1px solid #e5e7eb}.nl-inspector-body{max-height:none}.nl-inspector-tabs{position:sticky;top:0;background:white;z-index:2}}
        @media(max-width:720px){.nl-builder-shell{border-radius:12px}.nl-builder-topbar{align-items:flex-start}.nl-eyebrow{display:none}.nl-builder-title{display:grid;gap:3px}.nl-builder-grid{display:block}.nl-palette{border-right:0;border-bottom:1px solid #e5e7eb}.nl-palette-list{display:flex;overflow:auto;padding-bottom:4px}.nl-palette-item{min-width:155px}.nl-canvas-wrap{padding:12px}.nl-canvas{padding:20px 14px;border-radius:12px}.nl-form-heading h1{font-size:23px}.nl-inspector{border-top:1px solid #e5e7eb}.nl-matrix-header,.nl-matrix-row{min-width:520px}.nl-builder-title>strong{max-width:180px}.nl-save-state{font-size:11px}}
      `}</style>
    </div>
  );
}
