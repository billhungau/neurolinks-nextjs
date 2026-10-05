"use client";

import { FormEvent, useState } from "react";
import { InvitationHistoryPanel } from "../InvitationHistoryPanel";

export type PatientClient = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
};

type InvitationResponse =
  | { ok: true; invitationId: string; url: string; expiresAt: string; noExpiry?: boolean }
  | { ok: false; error: string; code?: string };

type QuestionnaireCode = "bdii" | "bai" | "ybocs" | "pss";
type CreatedLink = { invitationId: string; code: QuestionnaireCode; url: string };

const QUESTIONNAIRES: Array<{ code: QuestionnaireCode; label: string; emailLabel: string }> = [
  { code: "bdii", label: "BDI-II", emailLabel: "Depression questionnaire" },
  { code: "bai", label: "Beck Anxiety Inventory (BAI)", emailLabel: "Anxiety questionnaire" },
  { code: "ybocs", label: "Y-BOCS", emailLabel: "OCD questionnaire" },
  { code: "pss", label: "PTSD Symptom Scale (PSS)", emailLabel: "PTSD questionnaire" },
];

function buildEmailDraft(patient: PatientClient, links: CreatedLink[]) {
  const firstName = patient.firstName.trim() || [patient.firstName, patient.lastName].filter(Boolean).join(" ") || "there";
  const linkLines = links.map((link) => {
    const questionnaire = QUESTIONNAIRES.find((item) => item.code === link.code);
    return `${questionnaire?.emailLabel ?? "Questionnaire"}: ${link.url}`;
  });
  return [
    `Hi ${firstName},`,
    "",
    "Here are some questionnaires needed to be filled out before the next appointment:",
    "",
    ...linkLines,
    "",
    "If you have any questions, please feel free to contact us.",
    "",
    "NeuroLinks",
  ].join("\n");
}

export function PatientQuestionnaireSender({ patient }: { patient: PatientClient }) {
  const [selectedCodes, setSelectedCodes] = useState<QuestionnaireCode[]>(["bdii"]);
  const [submitting, setSubmitting] = useState(false);
  const [createdLinks, setCreatedLinks] = useState<CreatedLink[]>([]);
  const [creationErrors, setCreationErrors] = useState<string[]>([]);
  const [emailDraft, setEmailDraft] = useState("");
  const [editingDraft, setEditingDraft] = useState(false);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  function toggleQuestionnaire(code: QuestionnaireCode) {
    setSelectedCodes((current) => current.includes(code) ? current.filter((item) => item !== code) : [...current, code]);
    setCreationErrors([]);
    setEditingDraft(false);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (selectedCodes.length === 0) {
      setCreationErrors(["Select at least one questionnaire."]);
      return;
    }
    setSubmitting(true);
    setCreationErrors([]);
    setEmailDraft("");
    setEditingDraft(false);
    setCopyMessage(null);

    const links: CreatedLink[] = [];
    const errors: string[] = [];
    for (const code of selectedCodes) {
      const questionnaire = QUESTIONNAIRES.find((item) => item.code === code);
      try {
        const response = await fetch("/form/api/invitations/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vcitaUuid: patient.id, questionnaireCode: code, noExpiry: true }),
        });
        const data = (await response.json()) as InvitationResponse;
        if (data.ok) links.push({ invitationId: data.invitationId, code, url: data.url });
        else errors.push(`${questionnaire?.label ?? code}: ${data.error}`);
      } catch {
        errors.push(`${questionnaire?.label ?? code}: Could not create questionnaire link.`);
      }
    }

    setCreatedLinks((current) => {
      const byId = new Map(current.map((link) => [link.invitationId, link] as const));
      for (const link of links) byId.set(link.invitationId, link);
      return [...byId.values()];
    });
    setCreationErrors(errors);
    if (links.length > 0) {
      setEmailDraft(buildEmailDraft(patient, links));
      setRefreshKey((value) => value + 1);
    }
    setSubmitting(false);
  }

  async function copyText(value: string, successMessage: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopyMessage(successMessage);
      window.setTimeout(() => setCopyMessage(null), 1800);
    } catch {
      setCopyMessage("Could not copy automatically.");
    }
  }

  function openEmailApp() {
    if (!patient.email || !emailDraft) return;
    const subject = "Questionnaires before your next appointment";
    window.location.href = `mailto:${encodeURIComponent(patient.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailDraft)}`;
  }

  return (
    <div>
      <section style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 18, marginBottom: 18 }}>
        <h2 style={{ margin: "0 0 5px", fontSize: 19 }}>Send questionnaires</h2>
        <p style={{ margin: "0 0 16px", color: "#64748b", fontSize: 14 }}>Select one or more forms and create secure links for this patient.</p>
        <form onSubmit={submit}>
          <fieldset style={{ border: 0, padding: 0, margin: "0 0 16px" }}>
            <legend style={{ marginBottom: 8, fontWeight: 700 }}>Questionnaires</legend>
            <div style={{ display: "grid", gap: 8 }}>
              {QUESTIONNAIRES.map((questionnaire) => (
                <label key={questionnaire.code} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 12px", border: "1px solid #d1d5db", borderRadius: 8, cursor: "pointer" }}>
                  <input type="checkbox" checked={selectedCodes.includes(questionnaire.code)} onChange={() => toggleQuestionnaire(questionnaire.code)} />
                  <span>{questionnaire.label}</span>
                </label>
              ))}
            </div>
            <div style={{ marginTop: 8, color: "#6b7280", fontSize: 13 }}>Links remain usable until completed or revoked.</div>
          </fieldset>
          <button disabled={submitting || selectedCodes.length === 0} type="submit" style={{ padding: "11px 16px", border: 0, borderRadius: 8, fontWeight: 750, cursor: selectedCodes.length ? "pointer" : "not-allowed", background: "#111827", color: "#fff", opacity: selectedCodes.length ? 1 : 0.5 }}>
            {submitting ? "Creating links…" : selectedCodes.length > 1 ? "Create questionnaire links" : "Create questionnaire link"}
          </button>
        </form>
      </section>

      {creationErrors.length > 0 ? (
        <div role="alert" style={{ marginBottom: 18, padding: 12, borderRadius: 8, background: "#fef2f2" }}>
          <strong>Some links could not be created</strong>
          <ul style={{ marginBottom: 0 }}>{creationErrors.map((error) => <li key={error}>{error}</li>)}</ul>
        </div>
      ) : null}

      {emailDraft ? (
        <section style={{ marginBottom: 18, padding: 18, border: "1px solid #d1fae5", borderRadius: 12, background: "#ecfdf5" }}>
          <h3 style={{ margin: "0 0 8px" }}>Email draft</h3>
          <div style={{ marginBottom: 10, fontSize: 14 }}><strong>To:</strong> {patient.email || "No email address in vcita"}<br /><strong>Subject:</strong> Questionnaires before your next appointment</div>
          {editingDraft ? (
            <textarea value={emailDraft} onChange={(event) => setEmailDraft(event.target.value)} rows={12} style={{ width: "100%", boxSizing: "border-box", padding: 12, border: "1px solid #d1d5db", borderRadius: 8, font: "inherit", lineHeight: 1.5, background: "#fff" }} />
          ) : (
            <div style={{ whiteSpace: "pre-wrap", padding: 14, border: "1px solid #d1d5db", borderRadius: 8, background: "#fff", lineHeight: 1.55 }}>{emailDraft}</div>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
            <button type="button" onClick={() => setEditingDraft((value) => !value)} style={{ padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: 8, background: "#fff", cursor: "pointer", fontWeight: 700 }}>{editingDraft ? "Done editing" : "Edit email"}</button>
            <button type="button" onClick={() => copyText(emailDraft, "Email copied.")} style={{ padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: 8, background: "#fff", cursor: "pointer", fontWeight: 700 }}>Copy email</button>
            {patient.email ? <button type="button" onClick={openEmailApp} style={{ padding: "9px 12px", border: 0, borderRadius: 8, background: "#111827", color: "#fff", cursor: "pointer", fontWeight: 700 }}>Open in email app</button> : null}
          </div>
          {copyMessage ? <div aria-live="polite" style={{ marginTop: 8, color: "#166534", fontSize: 14, fontWeight: 700 }}>{copyMessage}</div> : null}
        </section>
      ) : null}

      <InvitationHistoryPanel
        vcitaUuid={patient.id}
        refreshKey={refreshKey}
        recentLinks={createdLinks.map((link) => ({ invitationId: link.invitationId, questionnaireCode: link.code, url: link.url }))}
      />
    </div>
  );
}
