"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { PatientResultsPanel } from "./PatientResultsPanel";
import { InvitationHistoryPanel } from "./InvitationHistoryPanel";

type InvitationResponse =
  | { ok: true; url: string; expiresAt: string; noExpiry?: boolean }
  | { ok: false; error: string; code?: string };

type Client = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
};

type SearchResponse =
  | { ok: true; clients: Client[] }
  | { ok: false; error: string };

type QuestionnaireCode = "bdii" | "bai" | "ybocs" | "pss";

type CreatedLink = {
  code: QuestionnaireCode;
  url: string;
};

const QUESTIONNAIRES: Array<{
  code: QuestionnaireCode;
  label: string;
  emailLabel: string;
}> = [
  { code: "bdii", label: "BDI-II", emailLabel: "Depression questionnaire" },
  { code: "bai", label: "Beck Anxiety Inventory (BAI)", emailLabel: "Anxiety questionnaire" },
  { code: "ybocs", label: "Y-BOCS", emailLabel: "OCD questionnaire" },
  { code: "pss", label: "PTSD Symptom Scale (PSS)", emailLabel: "PTSD questionnaire" },
];

function buildEmailDraft(patient: Client, links: CreatedLink[]) {
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

export function SendQuestionnaireForm() {
  const [submitting, setSubmitting] = useState(false);
  const [query, setQuery] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [selected, setSelected] = useState<Client | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const requestIdRef = useRef(0);
  const [activityRefreshKey, setActivityRefreshKey] = useState(0);
  const [selectedCodes, setSelectedCodes] = useState<QuestionnaireCode[]>(["bdii"]);
  const [createdLinks, setCreatedLinks] = useState<CreatedLink[]>([]);
  const [creationErrors, setCreationErrors] = useState<string[]>([]);
  const [emailDraft, setEmailDraft] = useState("");
  const [editingDraft, setEditingDraft] = useState(false);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < 2) {
      setClients([]);
      setSelected(null);
      setSearchError(null);
      setSearching(false);
      setHasSearched(false);
      return;
    }

    const requestId = ++requestIdRef.current;
    const controller = new AbortController();

    setSearching(true);
    setSearchError(null);
    setHasSearched(false);

    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch("/form/api/vcita/clients/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ q: trimmed }),
          cache: "no-store",
          signal: controller.signal,
        });
        const data = (await response.json()) as SearchResponse;

        if (requestId !== requestIdRef.current) return;

        if (data.ok) {
          setClients(data.clients);
          setSearchError(null);
        } else {
          setClients([]);
          setSearchError(data.error);
        }
        setHasSearched(true);
      } catch {
        if (controller.signal.aborted || requestId !== requestIdRef.current) return;
        setClients([]);
        setSearchError("vcita patient search is unavailable.");
        setHasSearched(true);
      } finally {
        if (requestId === requestIdRef.current) setSearching(false);
      }
    }, 350);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  function toggleQuestionnaire(code: QuestionnaireCode) {
    setSelectedCodes((current) =>
      current.includes(code)
        ? current.filter((item) => item !== code)
        : [...current, code],
    );
    setCreatedLinks([]);
    setCreationErrors([]);
    setEmailDraft("");
    setEditingDraft(false);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    if (selectedCodes.length === 0) {
      setCreationErrors(["Select at least one questionnaire."]);
      return;
    }

    setSubmitting(true);
    setCreatedLinks([]);
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
          body: JSON.stringify({
            vcitaUuid: selected.id,
            questionnaireCode: code,
            noExpiry: true,
          }),
        });
        const data = (await response.json()) as InvitationResponse;
        if (data.ok) {
          links.push({ code, url: data.url });
        } else {
          errors.push(`${questionnaire?.label ?? code}: ${data.error}`);
        }
      } catch {
        errors.push(`${questionnaire?.label ?? code}: Could not create questionnaire link.`);
      }
    }

    setCreatedLinks(links);
    setCreationErrors(errors);
    if (links.length > 0) {
      setEmailDraft(buildEmailDraft(selected, links));
      setActivityRefreshKey((value) => value + 1);
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
    if (!selected?.email || !emailDraft) return;
    const subject = "Questionnaires before your next appointment";
    window.location.href = `mailto:${encodeURIComponent(selected.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailDraft)}`;
  }

  return (
    <div>
      <div style={{ marginBottom: "22px" }}>
        <label style={{ display: "block", marginBottom: "8px" }}>
          <span style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}>Find patient in vcita</span>
          <span style={{ display: "block", marginBottom: "8px", color: "#6b7280", fontSize: "14px" }}>
            Start typing a patient name, email, or phone number. Results update automatically.
          </span>
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSelected(null);
              setCreatedLinks([]);
              setCreationErrors([]);
              setEmailDraft("");
            }}
            minLength={2}
            autoComplete="off"
            aria-label="Search vcita patients by name, email, or phone"
            style={{ width: "100%", boxSizing: "border-box", padding: "11px 12px", border: "1px solid #d1d5db", borderRadius: "8px" }}
          />
        </label>
        {searching ? (
          <p aria-live="polite" style={{ margin: "8px 0 0", color: "#6b7280", fontSize: "14px" }}>
            Searching vcita…
          </p>
        ) : null}
      </div>

      {searchError ? <p role="alert" style={{ padding: "12px", background: "#fef2f2", borderRadius: "8px" }}>{searchError}</p> : null}

      {clients.length > 0 && !selected ? (
        <div style={{ marginBottom: "24px", display: "grid", gap: "8px" }}>
          {clients.map((client) => {
            const name = [client.firstName, client.lastName].filter(Boolean).join(" ") || "Unnamed vcita client";
            const details = [client.email, client.phone].filter(Boolean).join(" · ");
            return (
              <button
                key={client.id}
                type="button"
                onClick={() => {
                  setSelected(client);
                  setCreatedLinks([]);
                  setCreationErrors([]);
                  setEmailDraft("");
                }}
                style={{ textAlign: "left", padding: "12px", border: "1px solid #d1d5db", borderRadius: "9px", background: "#fff", cursor: "pointer" }}
              >
                <strong>{name}</strong>
                {details ? <span style={{ display: "block", marginTop: "3px", color: "#6b7280" }}>{details}</span> : null}
              </button>
            );
          })}
        </div>
      ) : null}

      {clients.length === 0 && hasSearched && !searching && query.trim().length >= 2 && !selected && !searchError ? (
        <p aria-live="polite" style={{ color: "#6b7280", marginBottom: "20px" }}>
          No matching vcita patients found.
        </p>
      ) : null}

      {selected ? (
        <>
          <div style={{ marginBottom: "16px", padding: "14px", border: "1px solid #bfdbfe", borderRadius: "10px", background: "#eff6ff" }}>
            <strong>{[selected.firstName, selected.lastName].filter(Boolean).join(" ") || "Selected vcita client"}</strong>
            <div style={{ marginTop: "3px", color: "#4b5563" }}>{[selected.email, selected.phone].filter(Boolean).join(" · ")}</div>
            <button type="button" onClick={() => setSelected(null)} style={{ marginTop: "9px", border: 0, padding: 0, background: "transparent", textDecoration: "underline", cursor: "pointer" }}>
              Choose another patient
            </button>
          </div>
          <PatientResultsPanel vcitaUuid={selected.id} refreshKey={activityRefreshKey} />
          <InvitationHistoryPanel vcitaUuid={selected.id} refreshKey={activityRefreshKey} />
        </>
      ) : null}

      <form onSubmit={submit}>
        <fieldset style={{ border: 0, padding: 0, margin: "0 0 20px" }}>
          <legend style={{ marginBottom: "8px", fontWeight: 600 }}>Questionnaires</legend>
          <div style={{ display: "grid", gap: "8px" }}>
            {QUESTIONNAIRES.map((questionnaire) => (
              <label
                key={questionnaire.code}
                style={{ display: "flex", alignItems: "center", gap: "10px", padding: "11px 12px", border: "1px solid #d1d5db", borderRadius: "8px", cursor: "pointer" }}
              >
                <input
                  type="checkbox"
                  checked={selectedCodes.includes(questionnaire.code)}
                  onChange={() => toggleQuestionnaire(questionnaire.code)}
                />
                <span>{questionnaire.label}</span>
              </label>
            ))}
          </div>
          <div style={{ marginTop: "8px", color: "#6b7280", fontSize: "13px" }}>
            Links do not expire. They remain usable until completed or revoked.
          </div>
        </fieldset>

        <button disabled={submitting || !selected || selectedCodes.length === 0} type="submit" style={{ padding: "12px 18px", border: 0, borderRadius: "8px", fontWeight: 700, cursor: selected && selectedCodes.length > 0 ? "pointer" : "not-allowed", background: "#111827", color: "#fff", opacity: selected && selectedCodes.length > 0 ? 1 : 0.5 }}>
          {submitting ? "Creating links…" : selectedCodes.length > 1 ? "Create questionnaire links" : "Create questionnaire link"}
        </button>
      </form>

      {creationErrors.length > 0 ? (
        <div role="alert" style={{ marginTop: "20px", padding: "12px", borderRadius: "8px", background: "#fef2f2" }}>
          <strong>Some links could not be created</strong>
          <ul style={{ marginBottom: 0 }}>
            {creationErrors.map((error) => <li key={error}>{error}</li>)}
          </ul>
        </div>
      ) : null}

      {createdLinks.length > 0 && selected ? (
        <section style={{ marginTop: "24px", padding: "18px", border: "1px solid #d1fae5", borderRadius: "10px", background: "#ecfdf5" }}>
          <h3 style={{ margin: "0 0 12px" }}>Questionnaire links created</h3>
          <div style={{ display: "grid", gap: "9px" }}>
            {createdLinks.map((link) => {
              const questionnaire = QUESTIONNAIRES.find((item) => item.code === link.code);
              return (
                <div key={link.code} style={{ padding: "10px 12px", background: "#fff", border: "1px solid #d1fae5", borderRadius: "8px" }}>
                  <strong>{questionnaire?.label ?? link.code}</strong>
                  <div style={{ overflowWrap: "anywhere", marginTop: "4px" }}><a href={link.url}>{link.url}</a></div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: "20px", paddingTop: "18px", borderTop: "1px solid #bbf7d0" }}>
            <h3 style={{ margin: "0 0 8px" }}>Email draft</h3>
            <div style={{ marginBottom: "10px", fontSize: "14px" }}>
              <strong>To:</strong> {selected.email || "No email address in vcita"}<br />
              <strong>Subject:</strong> Questionnaires before your next appointment
            </div>

            {editingDraft ? (
              <textarea
                value={emailDraft}
                onChange={(event) => setEmailDraft(event.target.value)}
                rows={12}
                style={{ width: "100%", boxSizing: "border-box", padding: "12px", border: "1px solid #d1d5db", borderRadius: "8px", font: "inherit", lineHeight: 1.5, background: "#fff" }}
              />
            ) : (
              <div style={{ whiteSpace: "pre-wrap", padding: "14px", border: "1px solid #d1d5db", borderRadius: "8px", background: "#fff", lineHeight: 1.55 }}>
                {emailDraft}
              </div>
            )}

            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
              <button type="button" onClick={() => setEditingDraft((value) => !value)} style={{ padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: "8px", background: "#fff", cursor: "pointer", fontWeight: 700 }}>
                {editingDraft ? "Done editing" : "Edit email"}
              </button>
              <button type="button" onClick={() => copyText(emailDraft, "Email copied.")} style={{ padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: "8px", background: "#fff", cursor: "pointer", fontWeight: 700 }}>
                Copy email
              </button>
              {selected.email ? (
                <button type="button" onClick={openEmailApp} style={{ padding: "9px 12px", border: 0, borderRadius: "8px", background: "#111827", color: "#fff", cursor: "pointer", fontWeight: 700 }}>
                  Open in email app
                </button>
              ) : null}
            </div>
            {copyMessage ? <div aria-live="polite" style={{ marginTop: "8px", color: "#166534", fontSize: "14px", fontWeight: 700 }}>{copyMessage}</div> : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}
