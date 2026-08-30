"use client";

import { useState } from "react";

export function ContactForm() {
  const [status, setStatus] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    setPending(true);
    setStatus(null);
    const res = await fetch("/api/forms/contact/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ preview: true }),
    });
    const json = (await res.json()) as { message: string };
    setStatus(json.message);
    setPending(false);
  }

  return (
    <form className="grid max-w-xl gap-4" onSubmit={onSubmit} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1 text-sm">
          Name
          <span className="text-red-600">*</span>
          <input
            required
            name="firstName"
            autoComplete="given-name"
            className="rounded border border-slate-300 px-3 py-2"
            aria-required="true"
          />
          <span className="text-slate-500">First</span>
        </label>
        <label className="grid gap-1 text-sm">
          Last
          <span className="text-red-600">*</span>
          <input
            required
            name="lastName"
            autoComplete="family-name"
            className="rounded border border-slate-300 px-3 py-2"
            aria-required="true"
          />
          <span className="text-slate-500">Last</span>
        </label>
      </div>
      <label className="grid gap-1 text-sm">
        Email <span className="text-red-600">*</span>
        <input
          required
          type="email"
          name="email"
          autoComplete="email"
          className="rounded border border-slate-300 px-3 py-2"
        />
      </label>
      <label className="grid gap-1 text-sm">
        Phone <span className="text-red-600">*</span>
        <input
          required
          type="tel"
          name="phone"
          autoComplete="tel"
          className="rounded border border-slate-300 px-3 py-2"
        />
      </label>
      <label className="grid gap-1 text-sm">
        Message <span className="text-red-600">*</span>
        <textarea
          required
          name="message"
          rows={5}
          className="rounded border border-slate-300 px-3 py-2"
        />
      </label>
      <p className="rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
        Development preview: submissions are not delivered, stored, emailed, or
        logged. WordPress Formidable CAPTCHA is not connected.
      </p>
      <button
        disabled={pending}
        className="w-fit rounded bg-[#3260eb] px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
        type="submit"
      >
        Submit
      </button>
      {status ? <p role="status">{status}</p> : null}
    </form>
  );
}
