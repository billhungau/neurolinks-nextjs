import { JOTFORM_SUBMIT_TIMEOUT_MS } from "./contact-form.ts";

export const REFERRAL_PDF_URL =
  "https://neurolinks.ca/wp-content/uploads/2024/04/physician_referral_form-2.pdf";

export const REFERRAL_SUCCESS_MESSAGE =
  "Thank you. The referral has been submitted to NeuroLinks.";
export const REFERRAL_ERROR_MESSAGE =
  "The referral could not be submitted. Please try again or use the PDF referral form and fax it to 250-739-5530.";
export const REFERRAL_UPSTREAM_LOG = "Referral submission rejected by upstream service";

export const HONEYPOT_FIELD = "website";
export const MAX_REFERRAL_BODY_BYTES = 64 * 1024;
export const DEFAULT_JOTFORM_API_BASE_URL = "https://api.jotform.com";

export const JOTFORM_API_BASE_URLS = [
  "https://api.jotform.com",
  "https://eu-api.jotform.com",
  "https://hipaa-api.jotform.com",
] as const;

export const DIAGNOSES = [
  "Major Depressive Disorder (MDD)",
  "Bipolar Disorder",
  "Generalized Anxiety Disorder (GAD)",
  "Obsessive Compulsive Disorder (OCD)",
  "Post-Traumatic Stress Disorder (PTSD)",
  "Post Concussion Syndrome",
  "Substance/alcohol misuse",
  "Psychotic illness",
  "Other (Please write in clinical details)",
] as const;

export const OTHER_DIAGNOSIS = DIAGNOSES[8];

export const TREATMENTS = [
  "Transcranial Magnetic Stimulation (TMS)",
  "Ketamine Therapy",
  "To be determined in collaboration with the patient",
] as const;

export const TMS_CONTRAINDICATIONS = [
  "Aneurysm clips",
  "Stent in the neck or brain",
  "Deep brain stimulator",
  "Metal devices or objects implanted in or near the head",
  "Seizure disorder",
] as const;

export const KETAMINE_CONTRAINDICATIONS = [
  "Pregnancy",
  "History of psychosis",
  "Unstable angina",
  "Uncontrolled hypertension",
  "Uncontrolled hyperthyroidism",
  "Severe liver disease",
  "Elevated intracranial/intraocular pressure",
] as const;

export type Diagnosis = (typeof DIAGNOSES)[number];
export type Treatment = (typeof TREATMENTS)[number];
export type TmsContraindication = (typeof TMS_CONTRAINDICATIONS)[number];
export type KetamineContraindication = (typeof KETAMINE_CONTRAINDICATIONS)[number];

export const REFERRAL_LIMITS = {
  patientFirstName: 150,
  patientLastName: 150,
  phn: 30,
  patientPhone: 40,
  referrerName: 150,
  mspNumber: 50,
  referrerPhone: 40,
  faxNumber: 40,
  clinicalDetails: 5000,
  otherInformation: 5000,
} as const;

export type ReferralFields = {
  patientFirstName: string;
  patientLastName: string;
  phn: string;
  patientPhone: string;
  referrerName: string;
  mspNumber: string;
  referrerPhone: string;
  faxNumber: string;
  diagnoses: Diagnosis[];
  clinicalDetails: string;
  treatments: Treatment[];
  tmsContraindications: TmsContraindication[];
  ketamineContraindications: KetamineContraindication[];
  otherInformation: string;
};

export type ReferralFieldName = keyof ReferralFields;

export type ReferralFieldErrors = Partial<Record<ReferralFieldName, string>>;

export type ValidatedReferral =
  | { ok: true; fields: ReferralFields; honeypot: boolean }
  | { ok: false; errors: ReferralFieldErrors };

export const EMPTY_REFERRAL_FIELDS: ReferralFields = {
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

export function referralTimeoutMs() {
  const raw = Number(process.env.REFERRAL_UPSTREAM_TIMEOUT_MS);
  if (Number.isFinite(raw) && raw >= 1) return raw;
  return JOTFORM_SUBMIT_TIMEOUT_MS;
}

export function approvedJotformApiBaseUrl(): string | null {
  const raw = process.env.JOTFORM_REFERRAL_API_BASE_URL?.trim();
  const candidate = (raw && raw.length > 0 ? raw : DEFAULT_JOTFORM_API_BASE_URL).replace(/\/+$/, "");
  return (JOTFORM_API_BASE_URLS as readonly string[]).includes(candidate) ? candidate : null;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function normalizeCheckboxGroup<T extends string>(
  value: unknown,
  allowlist: readonly T[],
): { ok: true; values: T[] } | { ok: false } {
  if (value === undefined || value === null) return { ok: true, values: [] };
  if (!Array.isArray(value)) return { ok: false };
  const allowed = new Set<string>(allowlist);
  const selected = new Set<T>();
  for (const item of value) {
    if (typeof item !== "string" || !allowed.has(item)) return { ok: false };
    selected.add(item as T);
  }
  return { ok: true, values: allowlist.filter((item) => selected.has(item)) };
}

export function trimReferralScalars(input: Partial<Record<string, unknown>>) {
  return {
    patientFirstName: asString(input.patientFirstName).trim(),
    patientLastName: asString(input.patientLastName).trim(),
    phn: asString(input.phn).trim(),
    patientPhone: asString(input.patientPhone).trim(),
    referrerName: asString(input.referrerName).trim(),
    mspNumber: asString(input.mspNumber).trim(),
    referrerPhone: asString(input.referrerPhone).trim(),
    faxNumber: asString(input.faxNumber).trim(),
    clinicalDetails: asString(input.clinicalDetails).trim(),
    otherInformation: asString(input.otherInformation).trim(),
  };
}

export function otherDiagnosisSelected(diagnoses: readonly string[]) {
  return diagnoses.includes(OTHER_DIAGNOSIS);
}

export function validateReferralFields(fields: ReferralFields): ReferralFieldErrors {
  const errors: ReferralFieldErrors = {};

  if (!fields.patientFirstName) {
    errors.patientFirstName = "Enter the patient’s first name.";
  } else if (fields.patientFirstName.length > REFERRAL_LIMITS.patientFirstName) {
    errors.patientFirstName = `First name must be ${REFERRAL_LIMITS.patientFirstName} characters or fewer.`;
  }

  if (!fields.patientLastName) {
    errors.patientLastName = "Enter the patient’s last name.";
  } else if (fields.patientLastName.length > REFERRAL_LIMITS.patientLastName) {
    errors.patientLastName = `Last name must be ${REFERRAL_LIMITS.patientLastName} characters or fewer.`;
  }

  if (!fields.phn) {
    errors.phn = "Enter the patient’s PHN.";
  } else if (fields.phn.length > REFERRAL_LIMITS.phn) {
    errors.phn = `PHN must be ${REFERRAL_LIMITS.phn} characters or fewer.`;
  }

  if (!fields.patientPhone) {
    errors.patientPhone = "Enter the patient’s phone number.";
  } else if (fields.patientPhone.length > REFERRAL_LIMITS.patientPhone) {
    errors.patientPhone = `Phone number must be ${REFERRAL_LIMITS.patientPhone} characters or fewer.`;
  }

  if (!fields.referrerName) {
    errors.referrerName = "Enter the referrer’s name.";
  } else if (fields.referrerName.length > REFERRAL_LIMITS.referrerName) {
    errors.referrerName = `Referrer name must be ${REFERRAL_LIMITS.referrerName} characters or fewer.`;
  }

  if (fields.mspNumber.length > REFERRAL_LIMITS.mspNumber) {
    errors.mspNumber = `MSP number must be ${REFERRAL_LIMITS.mspNumber} characters or fewer.`;
  }

  if (fields.referrerPhone.length > REFERRAL_LIMITS.referrerPhone) {
    errors.referrerPhone = `Phone number must be ${REFERRAL_LIMITS.referrerPhone} characters or fewer.`;
  }

  if (fields.faxNumber.length > REFERRAL_LIMITS.faxNumber) {
    errors.faxNumber = `Fax number must be ${REFERRAL_LIMITS.faxNumber} characters or fewer.`;
  }

  if (fields.diagnoses.length === 0) {
    errors.diagnoses = "Select at least one diagnosis.";
  }

  const clinicalRequired = otherDiagnosisSelected(fields.diagnoses);
  if (clinicalRequired && !fields.clinicalDetails) {
    errors.clinicalDetails =
      "Enter the diagnosis in Clinical Details when Other is selected.";
  } else if (fields.clinicalDetails.length > REFERRAL_LIMITS.clinicalDetails) {
    errors.clinicalDetails = `Clinical details must be ${REFERRAL_LIMITS.clinicalDetails.toLocaleString("en-CA")} characters or fewer.`;
  }

  if (fields.treatments.length === 0) {
    errors.treatments = "Select at least one treatment option.";
  }

  if (fields.otherInformation.length > REFERRAL_LIMITS.otherInformation) {
    errors.otherInformation = `This field must be ${REFERRAL_LIMITS.otherInformation.toLocaleString("en-CA")} characters or fewer.`;
  }

  return errors;
}

export function parseReferralPayload(raw: unknown): ValidatedReferral {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, errors: { otherInformation: REFERRAL_ERROR_MESSAGE } };
  }

  const record = raw as Record<string, unknown>;
  const scalars = trimReferralScalars(record);
  const diagnoses = normalizeCheckboxGroup(record.diagnoses, DIAGNOSES);
  const treatments = normalizeCheckboxGroup(record.treatments, TREATMENTS);
  const tmsContraindications = normalizeCheckboxGroup(
    record.tmsContraindications,
    TMS_CONTRAINDICATIONS,
  );
  const ketamineContraindications = normalizeCheckboxGroup(
    record.ketamineContraindications,
    KETAMINE_CONTRAINDICATIONS,
  );

  if (
    !diagnoses.ok ||
    !treatments.ok ||
    !tmsContraindications.ok ||
    !ketamineContraindications.ok
  ) {
    return { ok: false, errors: { diagnoses: REFERRAL_ERROR_MESSAGE } };
  }

  const fields: ReferralFields = {
    ...scalars,
    diagnoses: diagnoses.values,
    treatments: treatments.values,
    tmsContraindications: tmsContraindications.values,
    ketamineContraindications: ketamineContraindications.values,
  };
  const honeypot = asString(record[HONEYPOT_FIELD]).trim().length > 0;
  const errors = validateReferralFields(fields);
  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, fields, honeypot };
}

export const JOTFORM_REFERRAL_SCALAR_KEYS = [
  "submission[3_first]",
  "submission[3_last]",
  "submission[23]",
  "submission[5_full]",
  "submission[21]",
] as const;

export function jotformReferralSubmissionBody(fields: ReferralFields): URLSearchParams {
  const submission = new URLSearchParams();
  submission.set("submission[3_first]", fields.patientFirstName);
  submission.set("submission[3_last]", fields.patientLastName);
  submission.set("submission[23]", fields.phn);
  submission.set("submission[5_full]", fields.patientPhone);
  submission.set("submission[21]", fields.referrerName);
  if (fields.mspNumber) submission.set("submission[10]", fields.mspNumber);
  if (fields.referrerPhone) submission.set("submission[11_full]", fields.referrerPhone);
  if (fields.faxNumber) submission.set("submission[12]", fields.faxNumber);
  for (const diagnosis of fields.diagnoses) {
    submission.append("submission[15][]", diagnosis);
  }
  if (fields.clinicalDetails) submission.set("submission[22]", fields.clinicalDetails);
  for (const treatment of fields.treatments) {
    submission.append("submission[16][]", treatment);
  }
  for (const item of fields.tmsContraindications) {
    submission.append("submission[17][]", item);
  }
  for (const item of fields.ketamineContraindications) {
    submission.append("submission[18][]", item);
  }
  if (fields.otherInformation) submission.set("submission[19]", fields.otherInformation);
  return submission;
}
