import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  DIAGNOSES,
  HONEYPOT_FIELD,
  JOTFORM_REFERRAL_SCALAR_KEYS,
  KETAMINE_CONTRAINDICATIONS,
  OTHER_DIAGNOSIS,
  REFERRAL_LIMITS,
  TMS_CONTRAINDICATIONS,
  TREATMENTS,
  jotformReferralSubmissionBody,
  parseReferralPayload,
  trimReferralScalars,
  validateReferralFields,
} from "./referral-form.ts";

const valid = {
  patientFirstName: "Alex",
  patientLastName: "Nguyen-Smith",
  phn: "9876 543 210",
  patientPhone: "(250) 555-0199",
  referrerName: "Dr. Pat Lee",
  mspNumber: "12345",
  referrerPhone: "250-555-0100",
  faxNumber: "250-739-5530",
  diagnoses: ["Major Depressive Disorder (MDD)", "Bipolar Disorder"] as const,
  clinicalDetails: "Previous SSRI trials without adequate response.",
  treatments: [
    "Transcranial Magnetic Stimulation (TMS)",
    "Ketamine Therapy",
  ] as const,
  tmsContraindications: ["Aneurysm clips", "Seizure disorder"] as const,
  ketamineContraindications: ["Pregnancy", "History of psychosis"] as const,
  otherInformation: "Please contact the clinic nurse first.",
};

test("valid submission maps every scalar field exactly", () => {
  const parsed = parseReferralPayload(valid);
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  const body = jotformReferralSubmissionBody(parsed.fields);
  assert.equal(body.get("submission[3_first]"), "Alex");
  assert.equal(body.get("submission[3_last]"), "Nguyen-Smith");
  assert.equal(body.get("submission[23]"), "9876 543 210");
  assert.equal(body.get("submission[5_full]"), "(250) 555-0199");
  assert.equal(body.get("submission[21]"), "Dr. Pat Lee");
  assert.equal(body.get("submission[10]"), "12345");
  assert.equal(body.get("submission[11_full]"), "250-555-0100");
  assert.equal(body.get("submission[12]"), "250-739-5530");
  assert.equal(body.get("submission[22]"), "Previous SSRI trials without adequate response.");
  assert.equal(body.get("submission[19]"), "Please contact the clinic nurse first.");
  for (const key of JOTFORM_REFERRAL_SCALAR_KEYS) {
    assert.ok(body.get(key));
  }
});

test("checkbox groups append each selected value separately", () => {
  const parsed = parseReferralPayload(valid);
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  const body = jotformReferralSubmissionBody(parsed.fields);
  assert.deepEqual(body.getAll("submission[15][]"), [...valid.diagnoses]);
  assert.deepEqual(body.getAll("submission[16][]"), [...valid.treatments]);
  assert.deepEqual(body.getAll("submission[17][]"), [...valid.tmsContraindications]);
  assert.deepEqual(body.getAll("submission[18][]"), [...valid.ketamineContraindications]);
  assert.equal(body.get("submission[15][]"), "Major Depressive Disorder (MDD)");
});

test("optional contraindication groups may be empty and are omitted", () => {
  const parsed = parseReferralPayload({
    ...valid,
    tmsContraindications: [],
    ketamineContraindications: [],
  });
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  const body = jotformReferralSubmissionBody(parsed.fields);
  assert.deepEqual(body.getAll("submission[17][]"), []);
  assert.deepEqual(body.getAll("submission[18][]"), []);
  assert.equal([...body.keys()].includes("submission[17][]"), false);
  assert.equal([...body.keys()].includes("submission[18][]"), false);
});

test("required-field failures are rejected", () => {
  const errors = validateReferralFields({
    ...trimReferralScalars({}),
    diagnoses: [],
    treatments: [],
    tmsContraindications: [],
    ketamineContraindications: [],
  });
  assert.ok(errors.patientFirstName);
  assert.ok(errors.patientLastName);
  assert.ok(errors.phn);
  assert.ok(errors.patientPhone);
  assert.ok(errors.referrerName);
  assert.ok(errors.diagnoses);
  assert.ok(errors.treatments);
});

test("diagnosis group requires at least one choice", () => {
  const parsed = parseReferralPayload({ ...valid, diagnoses: [] });
  assert.equal(parsed.ok, false);
  if (parsed.ok) return;
  assert.ok(parsed.errors.diagnoses);
});

test("treatment group requires at least one choice", () => {
  const parsed = parseReferralPayload({ ...valid, treatments: [] });
  assert.equal(parsed.ok, false);
  if (parsed.ok) return;
  assert.ok(parsed.errors.treatments);
});

test("selecting Other requires Clinical Details", () => {
  const parsed = parseReferralPayload({
    ...valid,
    diagnoses: [OTHER_DIAGNOSIS],
    clinicalDetails: "",
  });
  assert.equal(parsed.ok, false);
  if (parsed.ok) return;
  assert.ok(parsed.errors.clinicalDetails);
});

test("Other with Clinical Details is accepted", () => {
  const parsed = parseReferralPayload({
    ...valid,
    diagnoses: [OTHER_DIAGNOSIS],
    clinicalDetails: "Persistent depressive symptoms after concussion.",
  });
  assert.equal(parsed.ok, true);
});

test("unexpected checkbox values are rejected", () => {
  const parsed = parseReferralPayload({
    ...valid,
    diagnoses: ["Not a real diagnosis"],
  });
  assert.equal(parsed.ok, false);
});

test("unexpected treatment, TMS and ketamine values are rejected", () => {
  assert.equal(parseReferralPayload({ ...valid, treatments: ["Massage"] }).ok, false);
  assert.equal(
    parseReferralPayload({ ...valid, tmsContraindications: ["Pacemaker nearby"] }).ok,
    false,
  );
  assert.equal(
    parseReferralPayload({ ...valid, ketamineContraindications: ["Allergy"] }).ok,
    false,
  );
});

test("PHN separators are preserved without aggressive normalization", () => {
  const parsed = parseReferralPayload({ ...valid, phn: "  9876-543-210  " });
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  assert.equal(parsed.fields.phn, "9876-543-210");
  assert.equal(jotformReferralSubmissionBody(parsed.fields).get("submission[23]"), "9876-543-210");
});

test("fax is not treated as an email field", () => {
  const parsed = parseReferralPayload({ ...valid, faxNumber: "250-739-5530" });
  assert.equal(parsed.ok, true);
  const also = parseReferralPayload({ ...valid, faxNumber: "not-an-email" });
  assert.equal(also.ok, true);
});

test("optional referrer fields may be omitted", () => {
  const parsed = parseReferralPayload({
    ...valid,
    mspNumber: "",
    referrerPhone: "",
    faxNumber: "",
    clinicalDetails: "",
    otherInformation: "",
    diagnoses: ["Bipolar Disorder"],
  });
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  const keys = [...jotformReferralSubmissionBody(parsed.fields).keys()];
  assert.equal(keys.includes("submission[10]"), false);
  assert.equal(keys.includes("submission[11_full]"), false);
  assert.equal(keys.includes("submission[12]"), false);
  assert.equal(keys.includes("submission[22]"), false);
  assert.equal(keys.includes("submission[19]"), false);
});

test("honeypot population is detected without failing field validation", () => {
  const parsed = parseReferralPayload({ ...valid, [HONEYPOT_FIELD]: "http://spam.test" });
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  assert.equal(parsed.honeypot, true);
});

test("oversized values are rejected", () => {
  const parsed = parseReferralPayload({
    ...valid,
    patientFirstName: "A".repeat(REFERRAL_LIMITS.patientFirstName + 1),
    phn: "1".repeat(REFERRAL_LIMITS.phn + 1),
  });
  assert.equal(parsed.ok, false);
  if (parsed.ok) return;
  assert.ok(parsed.errors.patientFirstName);
  assert.ok(parsed.errors.phn);
});

test("allowlists match the live Jotform choices", () => {
  assert.deepEqual([...DIAGNOSES], [
    "Major Depressive Disorder (MDD)",
    "Bipolar Disorder",
    "Generalized Anxiety Disorder (GAD)",
    "Obsessive Compulsive Disorder (OCD)",
    "Post-Traumatic Stress Disorder (PTSD)",
    "Post Concussion Syndrome",
    "Substance/alcohol misuse",
    "Psychotic illness",
    "Other (Please write in clinical details)",
  ]);
  assert.deepEqual([...TREATMENTS], [
    "Transcranial Magnetic Stimulation (TMS)",
    "Ketamine Therapy",
    "To be determined in collaboration with the patient",
  ]);
  assert.deepEqual([...TMS_CONTRAINDICATIONS], [
    "Aneurysm clips",
    "Stent in the neck or brain",
    "Deep brain stimulator",
    "Metal devices or objects implanted in or near the head",
    "Seizure disorder",
  ]);
  assert.deepEqual([...KETAMINE_CONTRAINDICATIONS], [
    "Pregnancy",
    "History of psychosis",
    "Unstable angina",
    "Uncontrolled hypertension",
    "Uncontrolled hyperthyroidism",
    "Severe liver disease",
    "Elevated intracranial/intraocular pressure",
  ]);
});

test("client form source never references secrets, storage or analytics", () => {
  const root = join(
    dirname(fileURLToPath(import.meta.url)),
    "../components/forms/PhysicianReferralForm.tsx",
  );
  const src = readFileSync(root, "utf8");
  assert.equal(src.includes("JOTFORM_API_KEY"), false);
  assert.equal(src.includes("APIKEY"), false);
  assert.equal(src.includes("api.jotform.com"), false);
  assert.equal(src.includes("localStorage"), false);
  assert.equal(src.includes("sessionStorage"), false);
  assert.equal(src.includes("indexedDB"), false);
  assert.equal(src.includes("document.cookie"), false);
  assert.equal(/gtag|plausible|posthog|analytics/i.test(src), false);
});

test("success copy never includes PHN or clinical details", () => {
  const root = join(
    dirname(fileURLToPath(import.meta.url)),
    "../components/forms/PhysicianReferralForm.tsx",
  );
  const src = readFileSync(root, "utf8");
  assert.match(src, /REFERRAL_SUCCESS_MESSAGE/);
  assert.equal(src.includes("values.phn"), true);
  assert.equal(src.includes("REFERRAL_SUCCESS_MESSAGE}\n          {values"), false);
});

test("built client bundles do not contain the Jotform API key env name", () => {
  const staticDir = join(dirname(fileURLToPath(import.meta.url)), "../../.next/static");
  if (!existsSync(staticDir)) return;
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (entry.name.endsWith(".js")) files.push(path);
    }
  };
  walk(staticDir);
  for (const file of files) {
    const src = readFileSync(file, "utf8");
    assert.equal(src.includes("JOTFORM_API_KEY"), false, file);
  }
});
