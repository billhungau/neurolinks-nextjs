"use client";

import { useState } from "react";

const DIAGNOSES = [
  "Major depressive disorder",
  "Bipolar disorder",
  "Obsessive compulsive disorder",
  "Post-traumatic stress disorder",
  "Anxiety disorder",
  "Substance/alcohol misuse",
  "Psychotic illness",
];

const TREATMENTS = [
  "Transcranial Magnetic Stimulation",
  "Ketamine treatment",
  "To be determined in collaboration with the patient",
];

const TMS_CI = [
  "Aneurysm clips",
  "Stent in the neck or brain",
  "Deep brain stimulator",
  "Metal devices or objects implanted in or near the head",
  "Seizure disorder",
];

const KET_CI = [
  "Pregnancy",
  "History of psychosis",
  "Unstable angina",
  "Uncontrolled hypertension",
  "Uncontrolled hyperthyroidism",
  "Severe liver disease",
  "Elevated intracranial/intraocular pressure",
];

export function ReferralForm() {
  const [status, setStatus] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const treatments = new FormData(form).getAll("treatments");
    if (treatments.length === 0) {
      setStatus("Treatment Options cannot be blank.");
      return;
    }
    setPending(true);
    const res = await fetch("/api/forms/referral/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ preview: true }),
    });
    const json = (await res.json()) as { message: string };
    setStatus(json.message);
    setPending(false);
    /* Preview adapter never delivers; do not imply success by clearing the form. */
  }

  return (
    <form className="grid max-w-3xl gap-8" onSubmit={onSubmit}>
      <fieldset className="grid gap-4">
        <legend className="font-serif text-xl font-bold">Patient Information</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1 text-sm">
            First <span className="text-red-600">*</span>
            <input required name="patientFirst" className="rounded border px-3 py-2" />
          </label>
          <label className="grid gap-1 text-sm">
            Last <span className="text-red-600">*</span>
            <input required name="patientLast" className="rounded border px-3 py-2" />
          </label>
          <label className="grid gap-1 text-sm">
            PHN <span className="text-red-600">*</span>
            <input required name="phn" className="rounded border px-3 py-2" />
          </label>
          <label className="grid gap-1 text-sm">
            Phone <span className="text-red-600">*</span>
            <input required name="patientPhone" className="rounded border px-3 py-2" />
          </label>
        </div>
      </fieldset>

      <fieldset className="grid gap-4">
        <legend className="font-serif text-xl font-bold">
          Referring Physician Information
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1 text-sm">
            Referrer Name <span className="text-red-600">*</span>
            <input required name="referrerName" className="rounded border px-3 py-2" />
          </label>
          <label className="grid gap-1 text-sm">
            MSP number <span className="text-red-600">*</span>
            <input required name="msp" className="rounded border px-3 py-2" />
          </label>
          <label className="grid gap-1 text-sm">
            Phone
            <input type="tel" name="referrerPhone" className="rounded border px-3 py-2" />
          </label>
          <label className="grid gap-1 text-sm">
            Fax
            <input type="tel" name="fax" className="rounded border px-3 py-2" />
          </label>
        </div>
      </fieldset>

      <fieldset className="grid gap-3">
        <legend className="font-serif text-xl font-bold">Reason for Referral</legend>
        <p className="text-sm">Diagnosis(es)</p>
        {DIAGNOSES.map((d) => (
          <label key={d} className="flex gap-2 text-sm">
            <input type="checkbox" name="diagnoses" value={d} />
            {d}
          </label>
        ))}
        <label className="flex flex-col gap-1 text-sm">
          <span className="flex gap-2">
            <input type="checkbox" name="diagnoses" value="Other" />
            Other
          </span>
          <input name="diagnosisOther" className="rounded border px-3 py-2" />
        </label>
      </fieldset>

      <fieldset className="grid gap-3">
        <legend className="font-serif text-xl font-bold">Treatment</legend>
        <p className="text-sm">
          Treatment Options <span className="text-red-600">*</span>
        </p>
        {TREATMENTS.map((d) => (
          <label key={d} className="flex gap-2 text-sm">
            <input type="checkbox" name="treatments" value={d} />
            {d}
          </label>
        ))}
        <p className="mt-4 text-sm">Potential contradindications for TMS</p>
        {TMS_CI.map((d) => (
          <label key={d} className="flex gap-2 text-sm">
            <input type="checkbox" name="tmsCi" value={d} />
            {d}
          </label>
        ))}
        <p className="mt-4 text-sm">Potential contraindications for ketamine</p>
        {KET_CI.map((d) => (
          <label key={d} className="flex gap-2 text-sm">
            <input type="checkbox" name="ketCi" value={d} />
            {d}
          </label>
        ))}
        <label className="grid gap-1 text-sm">
          Other important information
          <textarea name="other" rows={4} className="rounded border px-3 py-2" />
        </label>
      </fieldset>

      <p className="rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
        Development preview: this referral is not sent to the clinic, faxed,
        emailed, stored, or logged.
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
