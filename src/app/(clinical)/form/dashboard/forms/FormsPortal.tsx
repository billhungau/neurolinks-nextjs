"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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

export function FormsPortal() {
  const [forms, setForms] = useState<FormRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [creating, setCreating] = useState(false);
  const [converting, setConverting] = useState(false);
  const [versioningId, setVersioningId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const response = await fetch("/form/api/forms/", { cache: "no-store" });
      const data = await response.json() as ListResponse;
      if (data.ok) setForms(data.forms);
      else setError(data.error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function createForm() {
    if (!name.trim()) return;
    setCreating(true); setError(null);
    try {
      const response = await fetch("/form/api/forms/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), code: code.trim() || undefined }),
      });
      const data = await response.json() as { ok?: boolean; form?: FormRow; error?: string };
      if (!data.ok || !data.form) { setError(data.error ?? "Could not create form."); return; }
      window.location.href = `/form/dashboard/forms/${data.form.id}/`;
    } finally { setCreating(false); }
  }

  async function convertBdi() {
    setConverting(true); setError(null);
    try {
      const response = await fetch("/form/api/forms/import-bdii/", { method: "POST" });
      const data = await response.json() as { ok?: boolean; id?: string; error?: string };
      if (!data.ok || !data.id) { setError(data.error ?? "Could not create BDI-II draft."); return; }
      window.location.href = `/form/dashboard/forms/${data.id}/`;
    } finally { setConverting(false); }
  }

  async function createNewVersion(form: FormRow) {
    setVersioningId(form.id); setError(null);
    try {
      const response = await fetch(`/form/api/forms/${form.id}/new-version/`, { method: "POST" });
      const data = await response.json() as { ok?: boolean; id?: string; error?: string };
      if (!data.ok || !data.id) { setError(data.error ?? "Could not create a new draft version."); return; }
      window.location.href = `/form/dashboard/forms/${data.id}/`;
    } finally { setVersioningId(null); }
  }

  const grouped = forms.reduce<Record<string, FormRow[]>>((acc, form) => {
    (acc[form.code] ??= []).push(form);
    return acc;
  }, {});

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, marginBottom: 24 }}>
        <section style={{ padding: 18, border: "1px solid #e5e7eb", borderRadius: 12, background: "#f9fafb" }}>
          <h2 style={{ margin: "0 0 8px", fontSize: 20 }}>Create form</h2>
          <p style={{ margin: "0 0 14px", color: "#6b7280", fontSize: 14 }}>Create a new native NeuroLinks questionnaire draft.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Form name" style={{ flex: "2 1 260px", padding: 10, border: "1px solid #d1d5db", borderRadius: 8 }} />
            <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Code (optional)" style={{ flex: "1 1 160px", padding: 10, border: "1px solid #d1d5db", borderRadius: 8 }} />
            <button type="button" onClick={createForm} disabled={creating || !name.trim()} style={{ padding: "10px 14px", border: 0, borderRadius: 8, background: "#111827", color: "#fff", fontWeight: 700 }}>{creating ? "Creating…" : "Create"}</button>
          </div>
        </section>

        <section style={{ padding: 18, border: "1px solid #bfdbfe", borderRadius: 12, background: "#eff6ff" }}>
          <h2 style={{ margin: "0 0 8px", fontSize: 20 }}>BDI-II native trial</h2>
          <p style={{ margin: "0 0 14px", color: "#4b5563", fontSize: 14 }}>Creates an editable draft from the validated 21-item BDI-II definition. It does not alter the current patient form until you explicitly publish it.</p>
          <button type="button" onClick={convertBdi} disabled={converting} style={{ padding: "10px 14px", border: 0, borderRadius: 8, background: "#1d4ed8", color: "#fff", fontWeight: 700 }}>{converting ? "Creating draft…" : "Create BDI-II native draft"}</button>
        </section>
      </div>

      {error ? <p role="alert" style={{ padding: 12, background: "#fef2f2", borderRadius: 8 }}>{error}</p> : null}
      {loading ? <p>Loading forms…</p> : null}

      {!loading ? (
        <div style={{ display: "grid", gap: 12 }}>
          {Object.entries(grouped).map(([formCode, versions]) => (
            <section key={formCode} style={{ border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ padding: "12px 14px", background: "#f9fafb", display: "flex", justifyContent: "space-between", gap: 12 }}>
                <strong>{versions[0]?.name}</strong><span style={{ color: "#6b7280" }}>{formCode}</span>
              </div>
              {versions.map((form) => {
                const status = String(form.metadata?.builder_status ?? (form.active ? "published" : "legacy"));
                const native = Boolean(form.metadata?.native_schema);
                const publishedNative = native && status === "published";
                return (
                  <div key={form.id} style={{ padding: "12px 14px", borderTop: "1px solid #e5e7eb", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                    <strong style={{ minWidth: 55 }}>v{form.version}</strong>
                    <span style={{ minWidth: 85 }}>{status === "draft" ? "Draft" : form.active ? "Published" : "Inactive"}</span>
                    <span style={{ color: "#6b7280", fontSize: 13, flex: "1 1 200px" }}>{native ? "Native NeuroLinks form" : "Legacy / Jotform-backed"}</span>
                    {native ? <Link href={`/form/dashboard/forms/${form.id}/`} style={{ color: "#111827", fontWeight: 700 }}>{status === "draft" ? "Edit" : "View"}</Link> : <span style={{ color: "#9ca3af" }}>Read-only</span>}
                    {publishedNative ? <button type="button" disabled={versioningId === form.id} onClick={() => createNewVersion(form)} style={{ padding: "7px 10px" }}>{versioningId === form.id ? "Creating…" : "New draft version"}</button> : null}
                  </div>
                );
              })}
            </section>
          ))}
        </div>
      ) : null}
    </div>
  );
}
