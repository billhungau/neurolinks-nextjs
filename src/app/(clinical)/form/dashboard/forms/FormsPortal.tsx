"use client";

import { useEffect, useMemo, useState } from "react";

type FormRow = {
  id: string;
  code: string;
  version: number;
  name: string;
  max_score: number | null;
  active: boolean;
  created_at: string;
  metadata?: Record<string, unknown> | null;
};

type ListResponse = { ok: true; forms: FormRow[] } | { ok: false; error: string };

const LABELS: Record<string, string> = { bdii: "BDI-II", bai: "BAI", ybocs: "Y-BOCS", pss: "PSS" };
const DESCRIPTIONS: Record<string, string> = {
  bdii: "Depression questionnaire",
  bai: "Anxiety questionnaire",
  ybocs: "Obsessive-compulsive symptoms",
  pss: "PTSD symptom questionnaire",
};

export function FormsPortal() {
  const [forms, setForms] = useState<FormRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [creating, setCreating] = useState(false);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/form/api/forms/", { cache: "no-store" });
      const data = await response.json() as ListResponse;
      if (data.ok) setForms(data.forms);
      else setError(data.error);
    } catch {
      setError("Could not load questionnaire forms.");
    } finally {
      setLoading(false);
    }
  }

  // The native forms are persistent Supabase questionnaire records. Opening the
  // library should only read them; rebuilding/importing BAI, Y-BOCS and PSS on
  // every visit caused several unnecessary server mutations before the four
  // forms could be displayed.
  useEffect(() => { void load(); }, []);

  async function createForm() {
    if (!name.trim()) return;
    setCreating(true); setError(null);
    try {
      const response = await fetch("/form/api/forms/", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: name.trim(), code: code.trim() || undefined }) });
      const data = await response.json() as { ok?: boolean; form?: FormRow; error?: string };
      if (!data.ok || !data.form) { setError(data.error ?? "Could not create form."); return; }
      window.location.href = `/form/dashboard/forms/${data.form.id}/`;
    } finally { setCreating(false); }
  }

  const families = useMemo(() => {
    const grouped = forms.reduce<Record<string, FormRow[]>>((acc, form) => {
      if (form.metadata?.builder_deleted === true) return acc;
      (acc[form.code] ??= []).push(form);
      return acc;
    }, {});
    return Object.entries(grouped).map(([formCode, rows]) => {
      const nativeRows = rows.filter((row) => Boolean(row.metadata?.native_schema));
      const draft = nativeRows.find((row) => String(row.metadata?.builder_status ?? "") === "draft") ?? null;
      const published = nativeRows.find((row) => row.active && String(row.metadata?.builder_status ?? "") === "published") ?? null;
      const representative = draft ?? published ?? nativeRows[0] ?? rows[0];
      return { formCode, rows, nativeRows, draft, published, representative };
    }).filter((family) => Boolean(family.representative));
  }, [forms]);

  async function editForm(formCode: string) {
    const family = families.find((item) => item.formCode === formCode);
    if (!family?.representative) return;
    const native = Boolean(family.representative.metadata?.native_schema);
    if (!native) { setError("This questionnaire is still Jotform-backed and cannot yet be edited in the native builder."); return; }
    if (family.draft) { window.location.href = `/form/dashboard/forms/${family.draft.id}/`; return; }
    const source = family.published ?? family.representative;
    setWorkingId(source.id); setError(null);
    try {
      const response = await fetch(`/form/api/forms/${source.id}/new-version/`, { method: "POST" });
      const data = await response.json() as { ok?: boolean; id?: string; error?: string };
      if (!data.ok || !data.id) { setError(data.error ?? "Could not open this form for editing."); return; }
      window.location.href = `/form/dashboard/forms/${data.id}/`;
    } finally { setWorkingId(null); }
  }

  async function deleteForm(formCode: string) {
    const family = families.find((item) => item.formCode === formCode);
    const representative = family?.representative;
    if (!representative?.metadata?.native_schema) return;
    if (!window.confirm(`Delete ${representative.name}? Existing clinical results will be preserved.`)) return;
    setWorkingId(representative.id); setError(null);
    try {
      const response = await fetch(`/form/api/forms/${representative.id}/`, { method: "DELETE" });
      const data = await response.json() as { ok?: boolean; error?: string };
      if (!data.ok) { setError(data.error ?? "Could not delete form."); return; }
      await load();
    } finally { setWorkingId(null); setOpenMenu(null); }
  }

  return (
    <div className="forms-admin">
      <div className="forms-toolbar">
        <div><h2>Questionnaire library</h2><p>Manage forms, review responses, and preview the patient experience.</p></div>
        <button className="primary" type="button" onClick={() => setShowCreate((value) => !value)}>+ Create form</button>
      </div>

      {showCreate ? <section className="create-panel"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Form name" /><input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Code (optional)" /><button className="primary" type="button" onClick={createForm} disabled={creating || !name.trim()}>{creating ? "Creating…" : "Create"}</button></section> : null}
      {error ? <div className="notice error" role="alert">{error}</div> : null}
      {loading ? <div className="loading">Loading forms…</div> : null}

      {!loading ? <div className="forms-list">
        {families.map((family) => {
          const form = family.representative!;
          const native = Boolean(form.metadata?.native_schema);
          const status = family.draft ? "Draft" : family.published ? "Published" : native ? "Inactive" : "Legacy";
          const source = family.published ?? family.draft ?? form;
          const busy = workingId !== null && family.nativeRows.some((row) => row.id === workingId);
          return <div className="form-row" key={family.formCode}>
            <div className="form-icon">▤</div>
            <div className="form-main">
              <div className="form-title-line"><strong>{LABELS[family.formCode] ?? form.name}</strong><span className={`status ${status.toLowerCase()}`}>{status}</span></div>
              <span>{DESCRIPTIONS[family.formCode] ?? form.name}</span>
            </div>
            <div className="form-actions">
              <button type="button" className="text-action" disabled={busy || !native} onClick={() => editForm(family.formCode)}>{busy ? "Opening…" : "Edit"}</button>
              <a className="text-action" href={`/form/dashboard/forms/submissions/${encodeURIComponent(family.formCode)}/`}>Submissions</a>
              {native ? <a className="text-action" href={`/form/dashboard/forms/${source.id}/?preview=1`} target="_blank" rel="noreferrer">View form</a> : null}
              <div className="more-wrap"><button type="button" className="more" onClick={() => setOpenMenu(openMenu === family.formCode ? null : family.formCode)}>More⌄</button>{openMenu === family.formCode ? <div className="more-menu">{native ? <button type="button" onClick={() => deleteForm(family.formCode)}>Delete form</button> : null}</div> : null}</div>
            </div>
          </div>;
        })}
        {families.length === 0 ? <div className="empty">No forms yet.</div> : null}
      </div> : null}

      <style jsx>{`
        .forms-admin{color:#0f172a}.forms-toolbar{display:flex;justify-content:space-between;align-items:flex-end;gap:18px;margin-bottom:18px}.forms-toolbar h2{font-size:20px;margin:0 0 4px}.forms-toolbar p{margin:0;color:#64748b;font-size:14px}.primary{border:0;border-radius:9px;background:#2563eb;color:#fff;padding:10px 14px;font-weight:750;cursor:pointer}.primary:disabled{opacity:.5}.create-panel{display:grid;grid-template-columns:2fr 1fr auto;gap:8px;padding:14px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;margin-bottom:14px}.create-panel input{border:1px solid #cbd5e1;border-radius:8px;padding:10px}.notice{padding:11px 13px;border-radius:10px;margin-bottom:12px;font-size:14px}.notice.info{background:#eff6ff;color:#1e40af}.notice.error{background:#fef2f2;color:#991b1b}.forms-list{border:1px solid #e2e8f0;border-radius:14px;background:#fff;overflow:visible;box-shadow:0 8px 24px rgba(15,23,42,.05)}.form-row{display:grid;grid-template-columns:38px minmax(220px,1fr) auto;align-items:center;gap:12px;min-height:68px;padding:10px 14px;border-bottom:1px solid #eef2f7;position:relative}.form-row:last-child{border-bottom:0}.form-row:hover{background:#f8fbff}.form-icon{display:grid;place-items:center;width:34px;height:34px;border-radius:9px;background:#e0ecff;color:#2563eb;font-weight:800;font-size:18px}.form-main{min-width:0}.form-title-line{display:flex;align-items:center;gap:8px}.form-main strong{font-size:15px}.form-main>span{display:block;margin-top:3px;color:#64748b;font-size:13px}.status{font-size:10px;padding:3px 7px;border-radius:999px;font-weight:800;text-transform:uppercase;letter-spacing:.04em}.status.published{background:#dcfce7;color:#166534}.status.draft{background:#fef3c7;color:#92400e}.status.inactive,.status.legacy{background:#f1f5f9;color:#64748b}.form-actions{display:flex;align-items:center;gap:18px}.text-action,.more{border:0;background:transparent;color:#0f172a;text-decoration:none;font:inherit;font-size:13px;cursor:pointer;padding:7px 2px}.text-action:hover,.more:hover{color:#2563eb}.text-action:disabled{opacity:.45;cursor:not-allowed}.more-wrap{position:relative}.more-menu{position:absolute;right:0;top:34px;z-index:20;min-width:140px;background:#fff;border:1px solid #e2e8f0;border-radius:9px;box-shadow:0 12px 30px rgba(15,23,42,.14);padding:5px}.more-menu button{width:100%;text-align:left;border:0;background:#fff;padding:8px 9px;border-radius:6px;color:#b91c1c;cursor:pointer}.more-menu button:hover{background:#fef2f2}.loading,.empty{padding:20px;color:#64748b}@media(max-width:760px){.forms-toolbar{align-items:flex-start}.create-panel{grid-template-columns:1fr}.form-row{grid-template-columns:36px 1fr}.form-actions{grid-column:1/-1;padding-left:48px;gap:14px;flex-wrap:wrap}.form-main strong{font-size:14px}}
      `}</style>
    </div>
  );
}
