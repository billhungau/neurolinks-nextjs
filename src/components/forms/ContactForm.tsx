"use client";

import Link from "next/link";
import {
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type RefObject,
} from "react";
import {
  CONTACT_ERROR_WITH_PHONE,
  CONTACT_LIMITS,
  CONTACT_SUCCESS_MESSAGE,
  FIELD_LABELS,
  HONEYPOT_FIELD,
  createSubmitLock,
  trimContactFields,
  validateContactFields,
  type ContactFieldErrors,
  type ContactFieldName,
  type ContactFields,
  type ContactSource,
} from "@/lib/contact-form";
import { SITE } from "@/lib/site";

const EMPTY_FIELDS: ContactFields = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  message: "",
};

const AUTOCOMPLETE: Record<Exclude<ContactFieldName, "message">, string> = {
  firstName: "given-name",
  lastName: "family-name",
  email: "email",
  phone: "tel",
};

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm({
  source = "contact",
  notice,
  showReferralNote = true,
}: {
  source?: ContactSource;
  notice?: string;
  showReferralNote?: boolean;
}) {
  const [values, setValues] = useState<ContactFields>(EMPTY_FIELDS);
  const [errors, setErrors] = useState<ContactFieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [honeypot, setHoneypot] = useState("");
  const lockRef = useRef(createSubmitLock());
  const successRef = useRef<HTMLParagraphElement>(null);
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  function updateField(name: ContactFieldName, value: string) {
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
    if (nextErrors.firstName) {
      firstNameRef.current?.focus();
      return;
    }
    if (nextErrors.lastName) {
      lastNameRef.current?.focus();
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

    const trimmed = trimContactFields(values);
    setValues(trimmed);
    const nextErrors = validateContactFields(trimmed);
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
        body: JSON.stringify({ ...trimmed, source, [HONEYPOT_FIELD]: honeypot }),
      });
      const data = (await response.json().catch(() => null)) as
        | { success?: boolean; message?: string }
        | null;
      if (response.ok && data?.success) {
        setValues(EMPTY_FIELDS);
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
      {showReferralNote ? (
        <p className="ct-referral-note">
          Healthcare professionals:{" "}
          <Link href="/physician-referral/">Physician Referral Form</Link>
        </p>
      ) : null}

      {notice ? <p className="ct-inquiry-note">{notice}</p> : null}

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
        aria-label="Contact NeuroLinks"
        data-nl-form-source={source}
      >
        <div className="ct-hp" aria-hidden="true">
          <label htmlFor="contact-website">Website</label>
          <input
            id="contact-website"
            name={HONEYPOT_FIELD}
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(event) => setHoneypot(event.target.value)}
          />
        </div>

        <div className="ct-form-row">
          <Field
            name="firstName"
            type="text"
            autoComplete={AUTOCOMPLETE.firstName}
            maxLength={CONTACT_LIMITS.firstName}
            value={values.firstName}
            error={errors.firstName}
            inputRef={firstNameRef}
            disabled={submitting}
            onChange={updateField}
          />
          <Field
            name="lastName"
            type="text"
            autoComplete={AUTOCOMPLETE.lastName}
            maxLength={CONTACT_LIMITS.lastName}
            value={values.lastName}
            error={errors.lastName}
            inputRef={lastNameRef}
            disabled={submitting}
            onChange={updateField}
          />
        </div>
        <div className="ct-form-row">
          <Field
            name="email"
            type="email"
            autoComplete={AUTOCOMPLETE.email}
            maxLength={CONTACT_LIMITS.email}
            value={values.email}
            error={errors.email}
            inputRef={emailRef}
            disabled={submitting}
            onChange={updateField}
          />
          <Field
            name="phone"
            type="tel"
            autoComplete={AUTOCOMPLETE.phone}
            maxLength={CONTACT_LIMITS.phone}
            value={values.phone}
            error={errors.phone}
            inputRef={phoneRef}
            disabled={submitting}
            onChange={updateField}
          />
        </div>
        <Field
          name="message"
          multiline
          maxLength={CONTACT_LIMITS.message}
          value={values.message}
          error={errors.message}
          inputRef={messageRef}
          disabled={submitting}
          onChange={updateField}
        />
        <div className="ct-form-actions">
          <button className="ct-submit" type="submit" disabled={submitting}>
            {submitting ? "Sending…" : "Send message"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  name,
  value,
  error,
  onChange,
  disabled,
  inputRef,
  maxLength,
  type = "text",
  autoComplete,
  multiline = false,
}: {
  name: ContactFieldName;
  value: string;
  error?: string;
  onChange: (name: ContactFieldName, value: string) => void;
  disabled: boolean;
  inputRef: RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
  maxLength: number;
  type?: "text" | "email" | "tel";
  autoComplete?: string;
  multiline?: boolean;
}) {
  const id = `contact-${name}`;
  const errorId = `${id}-error`;
  const invalid = Boolean(error);
  const shared = {
    id,
    name,
    value,
    required: true,
    "aria-required": true as const,
    "aria-invalid": invalid,
    "aria-describedby": invalid ? errorId : undefined,
    maxLength,
    disabled,
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(name, event.target.value),
  };

  return (
    <div className={`ct-field${invalid ? " is-invalid" : ""}`}>
      <label htmlFor={id}>
        {FIELD_LABELS[name]}{" "}
        <span className="ct-req" aria-hidden="true">
          *
        </span>
      </label>
      {multiline ? (
        <textarea
          {...shared}
          ref={inputRef as RefObject<HTMLTextAreaElement>}
          rows={7}
        />
      ) : (
        <input
          {...shared}
          ref={inputRef as RefObject<HTMLInputElement>}
          type={type}
          autoComplete={autoComplete}
        />
      )}
      {error ? (
        <p id={errorId} className="ct-field-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
