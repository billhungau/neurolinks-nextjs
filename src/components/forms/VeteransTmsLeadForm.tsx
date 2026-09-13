"use client";

import { useRef, useState, type FormEvent } from "react";
import { CONTACT_ERROR_WITH_PHONE, HONEYPOT_FIELD, VETERANS_SOURCE, createSubmitLock } from "@/lib/contact-form";
import { SITE } from "@/lib/site";

export function VeteransTmsLeadForm({ compact = false }: { compact?: boolean }) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const lockRef = useRef(createSubmitLock());

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!lockRef.current.tryAcquire()) return;
    const cleanName = name.trim();
    const cleanContact = contact.trim();
    if (!cleanName || !cleanContact) {
      setError("Enter your name and an email address or phone number.");
      lockRef.current.release();
      return;
    }
    const isEmail = cleanContact.includes("@");
    if (isEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanContact)) {
      setError("Enter a valid email address or phone number.");
      lockRef.current.release();
      return;
    }
    setError("");
    setStatus("submitting");
    try {
      const response = await fetch("/api/forms/contact/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cleanName,
          email: isEmail ? cleanContact : "veterans-tms-inquiry@neurolinks.ca",
          phone: isEmail ? "" : cleanContact,
          message: "Veterans TMS advertising landing page inquiry. Please contact me about TMS and next steps.",
          source: VETERANS_SOURCE,
          [HONEYPOT_FIELD]: honeypot,
        }),
      });
      const data = (await response.json().catch(() => null)) as { success?: boolean } | null;
      if (response.ok && data?.success) {
        setName(""); setContact(""); setHoneypot(""); setStatus("success");
      } else setStatus("error");
    } catch { setStatus("error"); }
    finally { lockRef.current.release(); }
  }

  if (status === "success") return <div className="vtms-form-success" role="status"><strong>Thank you.</strong><span>We’ve received your inquiry. A member of the NeuroLinks team will contact you about the next steps.</span></div>;

  return (
    <form className={`vtms-lead-form${compact ? " vtms-lead-form-compact" : ""}`} onSubmit={submit} noValidate>
      <div className="vtms-hp" aria-hidden="true"><label htmlFor={`vtms-website-${compact ? "hero" : "body"}`}>Website</label><input id={`vtms-website-${compact ? "hero" : "body"}`} tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} /></div>
      <label>Name <span aria-hidden="true">*</span><input name="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required /></label>
      <label>Email or phone <span aria-hidden="true">*</span><input name="contact" autoComplete="email" inputMode="email" value={contact} onChange={(e) => setContact(e.target.value)} required /></label>
      {error ? <p className="vtms-form-error" role="alert">{error}</p> : null}
      {status === "error" ? <p className="vtms-form-error" role="alert">{CONTACT_ERROR_WITH_PHONE} <a href={SITE.phoneHref}>{SITE.phone}</a></p> : null}
      <button type="submit" className="vtms-button vtms-submit" disabled={status === "submitting"}>{status === "submitting" ? "Sending…" : compact ? "Request a Call" : "Request Information"}</button>
      <p className="vtms-form-privacy">Your information is confidential. No obligation.</p>
    </form>
  );
}
