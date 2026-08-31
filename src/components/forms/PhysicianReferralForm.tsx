"use client";

import {
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type RefObject,
} from "react";
import { createSubmitLock } from "@/lib/contact-form";
import {
  DIAGNOSES,
  EMPTY_REFERRAL_FIELDS,
  HONEYPOT_FIELD,
  KETAMINE_CONTRAINDICATIONS,
  REFERRAL_LIMITS,
  REFERRAL_PDF_URL,
  REFERRAL_SUCCESS_MESSAGE,
  TMS_CONTRAINDICATIONS,
  TREATMENTS,
  otherDiagnosisSelected,
  trimReferralScalars,
  validateReferralFields,
  type ReferralFieldErrors,
  type ReferralFields,
} from "@/lib/referral-form";
import { SITE } from "@/lib/site";

type Status = "idle" | "submitting" | "success" | "error";
type ScalarName = Exclude<
  keyof ReferralFields,
  "diagnoses" | "treatments" | "tmsContraindications" | "ketamineContraindications"
>;

export function PhysicianReferralForm() {
  const [values, setValues] = useState<ReferralFields>(EMPTY_REFERRAL_FIELDS);
  const [errors, setErrors] = useState<ReferralFieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [honeypot, setHoneypot] = useState("");
  const lockRef = useRef(createSubmitLock());
  const successRef = useRef<HTMLParagraphElement>(null);
  const patientFirstNameRef = useRef<HTMLInputElement>(null);
  const patientLastNameRef = useRef<HTMLInputElement>(null);
  const phnRef = useRef<HTMLInputElement>(null);
  const patientPhoneRef = useRef<HTMLInputElement>(null);
  const referrerNameRef = useRef<HTMLInputElement>(null);
  const mspNumberRef = useRef<HTMLInputElement>(null);
  const referrerPhoneRef = useRef<HTMLInputElement>(null);
  const faxNumberRef = useRef<HTMLInputElement>(null);
  const diagnosesRef = useRef<HTMLInputElement>(null);
  const clinicalDetailsRef = useRef<HTMLTextAreaElement>(null);
  const treatmentsRef = useRef<HTMLInputElement>(null);
  const otherInformationRef = useRef<HTMLTextAreaElement>(null);

  function clearError(name: keyof ReferralFieldErrors) {
    if (!errors[name]) return;
    setErrors((current) => {
      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  function updateScalar(name: ScalarName, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
    clearError(name);
  }

  function toggleGroup<K extends "diagnoses" | "treatments" | "tmsContraindications" | "ketamineContraindications">(
    name: K,
    value: ReferralFields[K][number],
    checked: boolean,
  ) {
    setValues((current) => {
      const group = current[name] as readonly string[];
      const next = checked
        ? group.includes(value)
          ? group
          : [...group, value]
        : group.filter((item) => item !== value);
      return { ...current, [name]: next };
    });
    clearError(name);
    if (name === "diagnoses") clearError("clinicalDetails");
  }

  function focusFirstInvalid(nextErrors: ReferralFieldErrors) {
    if (nextErrors.patientFirstName) {
      patientFirstNameRef.current?.focus();
      return;
    }
    if (nextErrors.patientLastName) {
      patientLastNameRef.current?.focus();
      return;
    }
    if (nextErrors.phn) {
      phnRef.current?.focus();
      return;
    }
    if (nextErrors.patientPhone) {
      patientPhoneRef.current?.focus();
      return;
    }
    if (nextErrors.referrerName) {
      referrerNameRef.current?.focus();
      return;
    }
    if (nextErrors.mspNumber) {
      mspNumberRef.current?.focus();
      return;
    }
    if (nextErrors.referrerPhone) {
      referrerPhoneRef.current?.focus();
      return;
    }
    if (nextErrors.faxNumber) {
      faxNumberRef.current?.focus();
      return;
    }
    if (nextErrors.diagnoses) {
      diagnosesRef.current?.focus();
      return;
    }
    if (nextErrors.clinicalDetails) {
      clinicalDetailsRef.current?.focus();
      return;
    }
    if (nextErrors.treatments) {
      treatmentsRef.current?.focus();
      return;
    }
    otherInformationRef.current?.focus();
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!lockRef.current.tryAcquire()) return;

    const trimmed = {
      ...values,
      ...trimReferralScalars(values),
    };
    setValues(trimmed);
    const nextErrors = validateReferralFields(trimmed);
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
      const response = await fetch("/api/forms/referral/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...trimmed, [HONEYPOT_FIELD]: honeypot }),
      });
      const data = (await response.json().catch(() => null)) as
        | { success?: boolean; message?: string }
        | null;
      if (response.ok && data?.success) {
        setValues(EMPTY_REFERRAL_FIELDS);
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
  const otherSelected = otherDiagnosisSelected(values.diagnoses);
  const clinicalRequired = otherSelected;

  return (
    <div className="ref-native">
      {status === "success" ? (
        <p
          ref={successRef}
          className="ref-form-success"
          tabIndex={-1}
          role="status"
          aria-live="polite"
        >
          {REFERRAL_SUCCESS_MESSAGE}
        </p>
      ) : null}

      {status === "error" ? (
        <p className="ref-form-error-banner" role="alert" aria-live="assertive">
          The referral could not be submitted. Please try again or use the{" "}
          <a href={REFERRAL_PDF_URL} rel="noopener noreferrer" target="_blank">
            PDF referral form
          </a>{" "}
          and fax it to <a href={SITE.faxHref}>{SITE.fax}</a>.
        </p>
      ) : null}

      <form
        className="ref-form"
        onSubmit={onSubmit}
        noValidate
        autoComplete="off"
        aria-busy={submitting}
      >
        <div className="ref-hp" aria-hidden="true">
          <label htmlFor="referral-website">Website</label>
          <input
            id="referral-website"
            name={HONEYPOT_FIELD}
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(event) => setHoneypot(event.target.value)}
          />
        </div>

        <section className="ref-section" aria-labelledby="referral-patient-heading">
          <h2 id="referral-patient-heading" className="ref-section-title">
            Patient information
          </h2>
          <div className="ref-form-row">
            <TextField
              id="referral-patientFirstName"
              name="patientFirstName"
              label="Patient first name"
              required
              maxLength={REFERRAL_LIMITS.patientFirstName}
              value={values.patientFirstName}
              error={errors.patientFirstName}
              inputRef={patientFirstNameRef}
              disabled={submitting}
              autoComplete="off"
              onChange={updateScalar}
            />
            <TextField
              id="referral-patientLastName"
              name="patientLastName"
              label="Patient last name"
              required
              maxLength={REFERRAL_LIMITS.patientLastName}
              value={values.patientLastName}
              error={errors.patientLastName}
              inputRef={patientLastNameRef}
              disabled={submitting}
              autoComplete="off"
              onChange={updateScalar}
            />
          </div>
          <div className="ref-form-row">
            <TextField
              id="referral-phn"
              name="phn"
              label="PHN"
              required
              maxLength={REFERRAL_LIMITS.phn}
              value={values.phn}
              error={errors.phn}
              inputRef={phnRef}
              disabled={submitting}
              autoComplete="off"
              spellCheck={false}
              onChange={updateScalar}
            />
            <TextField
              id="referral-patientPhone"
              name="patientPhone"
              label="Patient phone number"
              type="tel"
              required
              maxLength={REFERRAL_LIMITS.patientPhone}
              value={values.patientPhone}
              error={errors.patientPhone}
              inputRef={patientPhoneRef}
              disabled={submitting}
              autoComplete="off"
              onChange={updateScalar}
            />
          </div>
        </section>

        <section className="ref-section" aria-labelledby="referral-referrer-heading">
          <h2 id="referral-referrer-heading" className="ref-section-title">
            Referrer information
          </h2>
          <TextField
            id="referral-referrerName"
            name="referrerName"
            label="Referrer name"
            required
            maxLength={REFERRAL_LIMITS.referrerName}
            value={values.referrerName}
            error={errors.referrerName}
            inputRef={referrerNameRef}
            disabled={submitting}
            autoComplete="off"
            onChange={updateScalar}
          />
          <div className="ref-form-row">
            <TextField
              id="referral-mspNumber"
              name="mspNumber"
              label="MSP number"
              maxLength={REFERRAL_LIMITS.mspNumber}
              value={values.mspNumber}
              error={errors.mspNumber}
              inputRef={mspNumberRef}
              disabled={submitting}
              autoComplete="off"
              onChange={updateScalar}
            />
            <TextField
              id="referral-referrerPhone"
              name="referrerPhone"
              label="Referrer phone number"
              type="tel"
              maxLength={REFERRAL_LIMITS.referrerPhone}
              value={values.referrerPhone}
              error={errors.referrerPhone}
              inputRef={referrerPhoneRef}
              disabled={submitting}
              autoComplete="off"
              onChange={updateScalar}
            />
          </div>
          <TextField
            id="referral-faxNumber"
            name="faxNumber"
            label="Fax number"
            type="tel"
            maxLength={REFERRAL_LIMITS.faxNumber}
            value={values.faxNumber}
            error={errors.faxNumber}
            inputRef={faxNumberRef}
            disabled={submitting}
            autoComplete="off"
            onChange={updateScalar}
          />
        </section>

        <section className="ref-section" aria-labelledby="referral-clinical-heading">
          <h2 id="referral-clinical-heading" className="ref-section-title">
            Clinical information
          </h2>
          <CheckGroup
            legend="Diagnosis"
            required
            hint="Select at least one."
            error={errors.diagnoses}
            errorId="referral-diagnoses-error"
            name="diagnoses"
            options={DIAGNOSES}
            selected={values.diagnoses}
            disabled={submitting}
            firstInputRef={diagnosesRef}
            onToggle={(value, checked) => toggleGroup("diagnoses", value, checked)}
          />
          <TextField
            id="referral-clinicalDetails"
            name="clinicalDetails"
            label="Clinical Details"
            multiline
            required={clinicalRequired}
            maxLength={REFERRAL_LIMITS.clinicalDetails}
            value={values.clinicalDetails}
            error={errors.clinicalDetails}
            hint={
              otherSelected
                ? "Required when Other is selected. Specify the diagnosis here."
                : "Optional unless Other is selected as a diagnosis."
            }
            inputRef={clinicalDetailsRef}
            disabled={submitting}
            onChange={updateScalar}
          />
        </section>

        <section className="ref-section" aria-labelledby="referral-treatment-heading">
          <h2 id="referral-treatment-heading" className="ref-section-title">
            Treatment considerations
          </h2>
          <CheckGroup
            legend="Treatment options"
            required
            hint="Select at least one."
            error={errors.treatments}
            errorId="referral-treatments-error"
            name="treatments"
            options={TREATMENTS}
            selected={values.treatments}
            disabled={submitting}
            firstInputRef={treatmentsRef}
            onToggle={(value, checked) => toggleGroup("treatments", value, checked)}
          />
          <CheckGroup
            legend="Potential contraindications to TMS treatment"
            hint="Screening prompt only. Selecting an item does not determine eligibility."
            name="tmsContraindications"
            options={TMS_CONTRAINDICATIONS}
            selected={values.tmsContraindications}
            disabled={submitting}
            onToggle={(value, checked) => toggleGroup("tmsContraindications", value, checked)}
          />
          <CheckGroup
            legend="Potential contraindications to ketamine therapy"
            hint="Screening prompt only. Selecting an item does not determine eligibility."
            name="ketamineContraindications"
            options={KETAMINE_CONTRAINDICATIONS}
            selected={values.ketamineContraindications}
            disabled={submitting}
            onToggle={(value, checked) => toggleGroup("ketamineContraindications", value, checked)}
          />
          <TextField
            id="referral-otherInformation"
            name="otherInformation"
            label="Other important information"
            multiline
            maxLength={REFERRAL_LIMITS.otherInformation}
            value={values.otherInformation}
            error={errors.otherInformation}
            inputRef={otherInformationRef}
            disabled={submitting}
            onChange={updateScalar}
          />
        </section>

        <div className="ref-form-actions">
          <button className="ref-submit" type="submit" disabled={submitting}>
            {submitting ? "Submitting referral…" : "Submit referral"}
          </button>
        </div>
      </form>
    </div>
  );
}

function TextField({
  id,
  name,
  label,
  value,
  error,
  onChange,
  disabled,
  inputRef,
  maxLength,
  type = "text",
  autoComplete,
  spellCheck,
  multiline = false,
  required = false,
  hint,
}: {
  id: string;
  name: ScalarName;
  label: string;
  value: string;
  error?: string;
  onChange: (name: ScalarName, value: string) => void;
  disabled: boolean;
  inputRef: RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
  maxLength: number;
  type?: "text" | "tel";
  autoComplete?: string;
  spellCheck?: boolean;
  multiline?: boolean;
  required?: boolean;
  hint?: string;
}) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const invalid = Boolean(error);
  const describedBy = [hint ? hintId : null, invalid ? errorId : null].filter(Boolean).join(" ") || undefined;
  const shared = {
    id,
    name,
    value,
    required,
    "aria-required": required || undefined,
    "aria-invalid": invalid,
    "aria-describedby": describedBy,
    maxLength,
    disabled,
    autoComplete: autoComplete ?? "off",
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(name, event.target.value),
  };

  return (
    <div className={`ref-field${invalid ? " is-invalid" : ""}`}>
      <label htmlFor={id}>
        {label}
        {required ? (
          <>
            {" "}
            <span className="ref-req" aria-hidden="true">
              *
            </span>
          </>
        ) : null}
      </label>
      {multiline ? (
        <textarea {...shared} ref={inputRef as RefObject<HTMLTextAreaElement>} rows={6} />
      ) : (
        <input
          {...shared}
          ref={inputRef as RefObject<HTMLInputElement>}
          type={type}
          spellCheck={spellCheck}
        />
      )}
      {hint ? (
        <p id={hintId} className="ref-field-hint">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="ref-field-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function CheckGroup<T extends string>({
  legend,
  name,
  options,
  selected,
  disabled,
  onToggle,
  required = false,
  hint,
  error,
  errorId,
  firstInputRef,
}: {
  legend: string;
  name: string;
  options: readonly T[];
  selected: readonly T[];
  disabled: boolean;
  onToggle: (value: T, checked: boolean) => void;
  required?: boolean;
  hint?: string;
  error?: string;
  errorId?: string;
  firstInputRef?: RefObject<HTMLInputElement | null>;
}) {
  const hintId = `${name}-hint`;
  const describedBy = [hint ? hintId : null, error && errorId ? errorId : null]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <fieldset
      className={`ref-check-group${error ? " is-invalid" : ""}`}
      aria-required={required || undefined}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy}
    >
      <legend>
        {legend}
        {required ? (
          <>
            {" "}
            <span className="ref-req" aria-hidden="true">
              *
            </span>
          </>
        ) : null}
      </legend>
      {hint ? (
        <p id={hintId} className="ref-field-hint">
          {hint}
        </p>
      ) : null}
      <div className="ref-check-grid">
        {options.map((option, index) => {
          const id = `${name}-${index}`;
          return (
            <label key={option} className="ref-check" htmlFor={id}>
              <input
                ref={index === 0 ? firstInputRef : undefined}
                id={id}
                type="checkbox"
                name={name}
                value={option}
                checked={selected.includes(option)}
                disabled={disabled}
                onChange={(event) => onToggle(option, event.target.checked)}
              />
              <span>{option}</span>
            </label>
          );
        })}
      </div>
      {error && errorId ? (
        <p id={errorId} className="ref-field-error">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
