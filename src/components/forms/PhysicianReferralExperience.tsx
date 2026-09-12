"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { PhysicianReferralForm } from "@/components/forms/PhysicianReferralForm";
import { REFERRAL_PDF_URL } from "@/lib/referral-form";
import { SITE } from "@/lib/site";

type ReferralSnapshot = {
  patientFirstName: string;
  patientLastName: string;
  phn: string;
  patientPhone: string;
  referrerName: string;
  mspNumber: string;
  referrerPhone: string;
  faxNumber: string;
  diagnoses: string[];
  clinicalDetails: string;
  treatments: string[];
  tmsContraindications: string[];
  ketamineContraindications: string[];
  otherInformation: string;
};

const EMPTY_SNAPSHOT: ReferralSnapshot = {
  patientFirstName: "",
  patientLastName: "",
  phn: "",
  patientPhone: "",
  referrerName: "",
  mspNumber: "",
  referrerPhone: "",
  faxNumber: "",
  diagnoses: [],
  clinicalDetails: "",
  treatments: [],
  tmsContraindications: [],
  ketamineContraindications: [],
  otherInformation: "",
};

function formValue(data: FormData, name: string) {
  const value = data.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function formValues(data: FormData, name: string) {
  return data
    .getAll(name)
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);
}

function captureSnapshot(form: HTMLFormElement): ReferralSnapshot {
  const data = new FormData(form);
  return {
    patientFirstName: formValue(data, "patientFirstName"),
    patientLastName: formValue(data, "patientLastName"),
    phn: formValue(data, "phn"),
    patientPhone: formValue(data, "patientPhone"),
    referrerName: formValue(data, "referrerName"),
    mspNumber: formValue(data, "mspNumber"),
    referrerPhone: formValue(data, "referrerPhone"),
    faxNumber: formValue(data, "faxNumber"),
    diagnoses: formValues(data, "diagnoses"),
    clinicalDetails: formValue(data, "clinicalDetails"),
    treatments: formValues(data, "treatments"),
    tmsContraindications: formValues(data, "tmsContraindications"),
    ketamineContraindications: formValues(data, "ketamineContraindications"),
    otherInformation: formValue(data, "otherInformation"),
  };
}

function DisplayValue({ value }: { value: string }) {
  return <dd>{value || "Not provided"}</dd>;
}

function DisplayList({ values }: { values: string[] }) {
  return (
    <dd>
      {values.length ? (
        <ul>
          {values.map((value) => (
            <li key={value}>{value}</li>
          ))}
        </ul>
      ) : (
        "None selected"
      )}
    </dd>
  );
}

function SummarySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="ref-confirm-section">
      <h3>{title}</h3>
      <dl className="ref-confirm-grid">{children}</dl>
    </section>
  );
}

function SummaryRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="ref-confirm-row">
      <dt>{label}</dt>
      {children}
    </div>
  );
}

export function PhysicianReferralExperience() {
  const [snapshot, setSnapshot] = useState<ReferralSnapshot>(EMPTY_SNAPSHOT);

  function handleSubmitCapture(event: FormEvent<HTMLDivElement>) {
    const target = event.target;
    if (target instanceof HTMLFormElement) {
      setSnapshot(captureSnapshot(target));
    }
  }

  const patientName = [snapshot.patientFirstName, snapshot.patientLastName].filter(Boolean).join(" ");

  return (
    <div className="physician-referral-experience" onSubmitCapture={handleSubmitCapture}>
      <div className="referral-entry">
        <p className="ref-instruction">
          Please fill out the online referral form below. Alternatively, you may download the{" "}
          <a href={REFERRAL_PDF_URL} rel="noopener noreferrer" target="_blank">
            PDF referral form
          </a>{" "}
          and fax it to <a href={SITE.faxHref}>{SITE.fax}</a>.
        </p>

        <div className="ref-form-frame">
          <PhysicianReferralForm />
        </div>
      </div>

      <section
        className="referral-thankyou mx-auto max-w-[900px] py-[clamp(3.5rem,8vw,6.5rem)] text-[var(--nl-navy)]"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="text-center">
          <h2 className="font-serif text-[clamp(2rem,4vw,2.65rem)] font-semibold leading-[1.15]">
            Thank you for your referral
          </h2>
          <p className="mx-auto mt-5 max-w-[44rem] text-[1.05rem] leading-8">
            We sincerely appreciate your trust in NeuroLinks. Your referral has been received, and our
            clinical team will review it with care and attention.
          </p>
          <p className="mx-auto mt-8 max-w-[44rem] text-[1.05rem] leading-8">
            If you have any questions or would like to share additional information, please contact
            NeuroLinks through our usual office channels. We&apos;re here to help make the referral process
            as smooth as possible.
          </p>
          <p className="mx-auto mt-8 max-w-[44rem] text-[1.05rem] leading-8">
            Thank you for partnering with us in caring for your patient.
          </p>
        </div>

        <div className="ref-confirmation" aria-label="Submitted referral summary">
          <div className="ref-confirmation-head">
            <p className="ref-confirmation-kicker">Submission confirmation</p>
            <h3>Your submitted referral</h3>
            <p>This is a copy of the information submitted through the online referral form.</p>
          </div>

          <SummarySection title="Patient information">
            <SummaryRow label="Patient name">
              <DisplayValue value={patientName} />
            </SummaryRow>
            <SummaryRow label="PHN">
              <DisplayValue value={snapshot.phn} />
            </SummaryRow>
            <SummaryRow label="Patient phone number">
              <DisplayValue value={snapshot.patientPhone} />
            </SummaryRow>
          </SummarySection>

          <SummarySection title="Referrer information">
            <SummaryRow label="Referrer name">
              <DisplayValue value={snapshot.referrerName} />
            </SummaryRow>
            <SummaryRow label="MSP number">
              <DisplayValue value={snapshot.mspNumber} />
            </SummaryRow>
            <SummaryRow label="Referrer phone number">
              <DisplayValue value={snapshot.referrerPhone} />
            </SummaryRow>
            <SummaryRow label="Fax number">
              <DisplayValue value={snapshot.faxNumber} />
            </SummaryRow>
          </SummarySection>

          <SummarySection title="Clinical information">
            <SummaryRow label="Diagnosis">
              <DisplayList values={snapshot.diagnoses} />
            </SummaryRow>
            <SummaryRow label="Clinical details">
              <DisplayValue value={snapshot.clinicalDetails} />
            </SummaryRow>
          </SummarySection>

          <SummarySection title="Treatment considerations">
            <SummaryRow label="Treatment options">
              <DisplayList values={snapshot.treatments} />
            </SummaryRow>
            <SummaryRow label="Potential contraindications to TMS treatment">
              <DisplayList values={snapshot.tmsContraindications} />
            </SummaryRow>
            <SummaryRow label="Potential contraindications to ketamine therapy">
              <DisplayList values={snapshot.ketamineContraindications} />
            </SummaryRow>
            <SummaryRow label="Other important information">
              <DisplayValue value={snapshot.otherInformation} />
            </SummaryRow>
          </SummarySection>

          <div className="ref-confirm-actions">
            <button type="button" onClick={() => window.print()}>
              Print this confirmation
            </button>
            <button type="button" className="secondary" onClick={() => window.location.reload()}>
              Submit another referral
            </button>
          </div>
        </div>
      </section>

      <style>{`
        .physician-referral-experience .referral-thankyou {
          display: none;
        }

        .physician-referral-experience:has(.ref-form-success) .referral-entry {
          display: none;
        }

        .physician-referral-experience:has(.ref-form-success) .referral-thankyou {
          display: block;
        }

        .physician-referral-experience .ref-check-group > .ref-field-hint,
        .physician-referral-experience #referral-patientPhone-hint,
        .physician-referral-experience #referral-referrerPhone-hint {
          display: none;
        }

        .ref-confirmation {
          margin-top: 3rem;
          overflow: hidden;
          border: 1px solid color-mix(in srgb, var(--nl-navy) 14%, transparent);
          border-radius: 1.25rem;
          background: #fff;
          box-shadow: 0 18px 50px rgba(16, 39, 63, 0.08);
          text-align: left;
        }

        .ref-confirmation-head {
          padding: 1.5rem 1.6rem;
          background: color-mix(in srgb, var(--nl-navy) 4%, white);
          border-bottom: 1px solid color-mix(in srgb, var(--nl-navy) 10%, transparent);
        }

        .ref-confirmation-kicker {
          margin: 0 0 0.35rem;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: color-mix(in srgb, var(--nl-navy) 64%, white);
        }

        .ref-confirmation-head h3 {
          margin: 0;
          font-family: var(--font-serif), Georgia, serif;
          font-size: clamp(1.45rem, 3vw, 1.85rem);
          font-weight: 600;
        }

        .ref-confirmation-head p:last-child {
          margin: 0.4rem 0 0;
          color: color-mix(in srgb, var(--nl-navy) 68%, white);
          line-height: 1.6;
        }

        .ref-confirm-section {
          padding: 1.5rem 1.6rem;
          border-bottom: 1px solid color-mix(in srgb, var(--nl-navy) 9%, transparent);
        }

        .ref-confirm-section h3 {
          margin: 0 0 1rem;
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: 0.01em;
        }

        .ref-confirm-grid {
          margin: 0;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1rem 1.5rem;
        }

        .ref-confirm-row {
          min-width: 0;
        }

        .ref-confirm-row dt {
          margin-bottom: 0.25rem;
          font-size: 0.78rem;
          font-weight: 700;
          color: color-mix(in srgb, var(--nl-navy) 58%, white);
        }

        .ref-confirm-row dd {
          margin: 0;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
          line-height: 1.55;
        }

        .ref-confirm-row ul {
          margin: 0;
          padding-left: 1.1rem;
        }

        .ref-confirm-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          padding: 1.5rem 1.6rem;
        }

        .ref-confirm-actions button {
          min-height: 44px;
          border: 1px solid var(--nl-navy);
          border-radius: 999px;
          padding: 0.7rem 1.05rem;
          background: var(--nl-navy);
          color: #fff;
          font-weight: 700;
          cursor: pointer;
        }

        .ref-confirm-actions button.secondary {
          background: #fff;
          color: var(--nl-navy);
        }

        @media (max-width: 640px) {
          .ref-confirm-grid {
            grid-template-columns: 1fr;
          }

          .ref-confirmation-head,
          .ref-confirm-section,
          .ref-confirm-actions {
            padding-left: 1.1rem;
            padding-right: 1.1rem;
          }
        }

        @media print {
          .physician-referral-experience .text-center,
          .ref-confirm-actions,
          .site-header,
          .site-footer {
            display: none !important;
          }

          .referral-thankyou {
            display: block !important;
            max-width: none !important;
            padding: 0 !important;
          }

          .ref-confirmation {
            margin-top: 0;
            border: 0;
            box-shadow: none;
          }
        }
      `}</style>
    </div>
  );
}
