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

const CORE_NATIVE_CODES = ["bai", "ybocs", "pss"] as const;

export function FormsPortal() {
  const [forms, setForms] = useState<FormRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [preparing, setPreparing] = useState(true);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [creating, setCreating] = useState(false);
  const [workingId, setWorkingId] = useState<string | null>(null);
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

  async function prepareCoreForms() {
    setPreparing(true);
    setError(null);
    try {
      await fetch("/form/api/forms/remove-phq9/", { method: "POST" });
      const failures: string[] = [];
      for (const builtInCode of CORE_NATIVE_CODES) {
        const response = await fetch("/form/api/forms/import-native/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: builtInCode }),
        });
        const data = await response.json() as { ok?: boolean; error?: string };
        if (!data.ok) failures.push(`${builtInCode.toUpperCase()}: ${data.error ?? "conversion failed"}`);
      }
      if (failures.length) setError(failures.join(" · "));
      await load();
    } catch {
      setError("Could not prepare the native questionnaire forms.");
      await load();
    } finally {
      setPreparing(false);
    }
  }

  useEffect(() => { void prepareCoreForms(); }, []);

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
    if (!native) {
      setError("This questionnaire is still Jotform-backed and cannot yet be edited in the native builder.");
      return;
    }

    if (family.draft) {
      window.location.href = `/form/dashboard/forms/${family.draft.id}/`;
      return;
    }

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
    if (!representative) return;
    if (!representative.metadata?.native_schema) {
      setError("Legacy Jotform-backed questionnaires cannot be deleted from the native forms builder.");
      return;
    }
    if (!window.confirm(`Delete ${representative.name}? This removes it from the forms builder and prevents future use. Existing clinical results are preserved.`)) return;

    setWorkingId(representative.id); setError(null);
    try {
      const response = await fetch(`/form/api/forms/${representative.id}/`, { method: "DELETE" });
      const data = await response.json() as { ok?: boolean; error?: string };
      if (!data.ok) { setError(data.error ?? "Could not delete form."); return; }
      await load();
    } finally { setWorkingId(null); }
  }

  return (
    <div>
      <section style={{ padding: 18, border: "1px solid #e5e7eb", borderRadius: 12, background: "#f9fafb", marginBottom: 24 }}>
        <h2 style={{ margin: "0 0 8px", fontSize: 20 }}>Create form</h2>
        <p style={{ margin: "0 0 14px", color: "#6b7280", fontSize: 14 }}>Create a new native NeuroLinks questionnaire.</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Form name" style={{ flex: "2 1 260px", padding: 10, border: "1px solid #d1d5db", borderRadius: 8 }} />
          <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Code (optional)" style={{ flex: "1 1 160px", padding: 10, border: "1px solid #d1d5db", borderRadius: 8 }} />
          <button type="button" onClick={createForm} disabled={creating || !name.trim()} style={{ padding: "10px 14px", border: 0, borderRadius: 8, background: "#111827", color: "#fff", fontWeight: 700 }}>{creating ? "Creating…" : "Create"}</button>
        </div>
      </section>

      {preparing ? <p style={{ padding: 12, background: "#eff6ff", borderRadius: 8, color: "#1e40af" }}>Preparing BAI, Y-BOCS and PSS as native NeuroLinks forms…</p> : null}
      {error ? <p role="alert" style={{ padding: 12, background: "#fef2f2", borderRadius: 8 }}>{error}</p> : null}
      {loading ? <p>Loading forms…</p> : null}

      {!loading ? (
        <div style={{ display: "grid", gap: 10 }}>
          {families.map((family) => {
            const form = family.representative!;
            const native = Boolean(form.metadata?.native_schema);
            const status = family.draft ? "Draft" : family.published ? "Published" : native ? "Inactive" : "Jotform-backed";
            const busy = workingId !== null && family.nativeRows.some((row) => row.id === workingId);
            return (
              <section key={family.formCode} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: "14px 16px", background: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                <div>
                  <strong style={{ display: "block", fontSize: 16 }}>{form.name}</strong>
                  <span style={{ color: "#6b7280", fontSize: 13 }}>{status}</span>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button type="button" disabled={busy || !native} onClick={() => editForm(family.formCode)} style={{ padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 8, background: "#fff", fontWeight: 700 }}>{busy ? "Opening…" : "Edit"}</button>
                  {native ? <button type="button" disabled={busy} onClick={() => deleteForm(family.formCode)} style={{ padding: "8px 12px", border: "1px solid #fecaca", borderRadius: 8, background: "#fff", color: "#b91c1c" }}>Delete</button> : null}
                </div>
              </section>
            );
          })}
          {families.length === 0 ? <p style={{ color: "#6b7280" }}>No forms yet.</p> : null}
        </div>
      ) : null}
    </div>
  );
}
