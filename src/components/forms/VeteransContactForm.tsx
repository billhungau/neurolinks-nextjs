"use client";

import {
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  CONTACT_ERROR_WITH_PHONE,
  CONTACT_LIMITS,
  CONTACT_NAME_LIMIT,
  CONTACT_SUCCESS_MESSAGE,
  HONEYPOT_FIELD,
  VETERANS_SOURCE,
  createSubmitLock,
  type ContactFieldErrors,
} from "@/lib/contact-form";
import { SITE } from "@/lib/site";

type FormValues = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

const EMPTY: FormValues = {
  name: "",
  email: "",
  phone: "",
  message: "",
};

type Status = "idle" | "submitting" | "success" | "error";

function validateVeteransForm(values: FormValues): ContactFieldErrors {
  const errors: ContactFieldErrors = {};
  const name = values.name.trim();
  const email = values.email.trim();
  const phone = values.phone.trim();
  const message = values.message.trim();

  if (!name) {
    errors.name = "Enter your name.";
  } else if (name.length > CONTACT_NAME_LIMIT) {
    errors.name = `Name must be ${CONTACT_NAME_LIMIT} characters or fewer.`;
  }

  if (!email) {
    errors.email = "Enter your email address.";
  } else if (email.length > CONTACT_LIMITS.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (phone.length > CONTACT_LIMITS.phone) {
    errors.phone = `Phone number must be ${CONTACT_LIMITS.phone} characters or fewer.`;
  }

  if (!message) {
    errors.message = "Enter a message.";
  } else if (message.length > CONTACT_LIMITS.message) {
    errors.message = `Message must be ${CONTACT_LIMITS.message.toLocaleString("en-CA")} characters or fewer.`;
  }

  return errors;
}

export function VeteransContactForm() {
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [errors, setErrors] = useState<ContactFieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [honeypot, setHoneypot] = useState("");
  const lockRef = useRef(createSubmitLock());
  const successRef = useRef<HTMLParagraphElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  function update<K extends keyof FormValues>(name: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [name]: value }));
    if (errors[name]) {
      setErrors((current) => {
        const next = { ...current };
        delete next[name];
        return next;
      });
    }
  }

  function focusFirstInvalid(nextErrors: ContactFieldErrors) {
    if (nextErrors.name) {
      nameRef.current?.focus();
      return;
    }
    if (nextErrors.email) {
      emailRef.current?.focus();
      return;
    }
    if (nextErrors.phone) {
      phoneRef.current?.focus();
      return;
    }
    messageRef.current?.focus();
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!lockRef.current.tryAcquire()) return;

    const trimmed: FormValues = {
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      message: values.message.trim(),
    };
    setValues(trimmed);
    const nextErrors = validateVeteransForm(trimmed);
    if (Object.keys(nextErrors).length > 0) {
      lockRef.current.release();
      setErrors(nextErrors);
      setStatus("idle");
      focusFirstInvalid(nextErrors);
      return;
    }

    setErrors({});
    setStatus("submitting");

    try {
      const response = await fetch("/api/forms/contact/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmed.name,
          email: trimmed.email,
          phone: trimmed.phone,
          message: trimmed.message,
          source: VETERANS_SOURCE,
          [HONEYPOT_FIELD]: honeypot,
        }),
      });
      const data = (await response.json().catch(() => null)) as
        | { success?: boolean; message?: string }
        | null;
      if (response.ok && data?.success) {
        setValues(EMPTY);
        setHoneypot("");
        setStatus("success");
        requestAnimationFrame(() => successRef.current?.focus());
        return;
      }
      setStatus("error");
    } catch {
      setStatus("error");
    } finally {
      lockRef.current.release();
    }
  }

  const submitting = status === "submitting";

  return (
    <div className="ct-native">
      {status === "success" ? (
        <p
          ref={successRef}
          className="ct-form-success"
          tabIndex={-1}
          role="status"
          aria-live="polite"
        >
          {CONTACT_SUCCESS_MESSAGE}
        </p>
      ) : null}

      {status === "error" ? (
        <p className="ct-form-error-banner" role="alert" aria-live="assertive">
          {CONTACT_ERROR_WITH_PHONE}{" "}
          <a href={SITE.phoneHref}>{SITE.phone}</a>
        </p>
      ) : null}

      <form
        className="ct-form"
        onSubmit={onSubmit}
        noValidate
        aria-busy={submitting}
        aria-label="Request a confidential conversation"
        data-nl-form-source={VETERANS_SOURCE}
      >
        <div className="ct-hp" aria-hidden="true">
          <label htmlFor="veterans-website">Website</label>
          <input
            id="veterans-website"
            name={HONEYPOT_FIELD}
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(event) => setHoneypot(event.target.value)}
          />
        </div>

        <Field
          id="veterans-name"
          label="Name"
          error={errors.name}
          required
        >
          <input
            ref={nameRef}
            id="veterans-name"
            name="name"
            type="text"
            autoComplete="name"
            maxLength={CONTACT_NAME_LIMIT}
            value={values.name}
            required
            aria-required="true"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "veterans-name-error" : undefined}
            disabled={submitting}
            onChange={(event) => update("name", event.target.value)}
          />
        </Field>

        <Field id="veterans-email" label="Email" error={errors.email} required>
          <input
            ref={emailRef}
            id="veterans-email"
            name="email"
            type="email"
            autoComplete="email"
            maxLength={CONTACT_LIMITS.email}
            value={values.email}
            required
            aria-required="true"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "veterans-email-error" : undefined}
            disabled={submitting}
            onChange={(event) => update("email", event.target.value)}
          />
        </Field>

        <Field id="veterans-phone" label="Phone" error={errors.phone} optional>
          <input
            ref={phoneRef}
            id="veterans-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            maxLength={CONTACT_LIMITS.phone}
            value={values.phone}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "veterans-phone-error" : undefined}
            disabled={submitting}
            onChange={(event) => update("phone", event.target.value)}
          />
        </Field>

        <Field id="veterans-message" label="Message" error={errors.message} required>
          <textarea
            ref={messageRef}
            id="veterans-message"
            name="message"
            rows={4}
            maxLength={CONTACT_LIMITS.message}
            value={values.message}
            required
            aria-required="true"
            aria-invalid={Boolean(errors.message)}
            aria-describedby={
              errors.message ? "veterans-message-error veterans-message-hint" : "veterans-message-hint"
            }
            disabled={submitting}
            onChange={(event) => update("message", event.target.value)}
          />
        </Field>

        <p id="veterans-message-hint" className="vet-form-reassurance">
          You do not need to describe your trauma or medical history here. A brief question is
          enough.
        </p>

        <div className="ct-form-actions">
          <button className="ct-submit" type="submit" disabled={submitting}>
            {submitting ? "Sending…" : "Ask our team to contact me"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  id,
  label,
  error,
  required = false,
  optional = false,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`ct-field${error ? " is-invalid" : ""}`}>
      <label htmlFor={id}>
        {label}{" "}
        {required ? (
          <span className="ct-req" aria-hidden="true">
            *
          </span>
        ) : null}
        {optional ? <span className="vet-optional">Optional</span> : null}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="ct-field-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
