import assert from "node:assert/strict";
import { afterEach, test } from "node:test";

import { sendReferralNotification } from "./referral-notification.ts";

const context = {
  fields: {
    patientFirstName: "Test",
    patientLastName: "Patient",
    phn: "0000000000",
    patientPhone: "000-000-0000",
    referrerName: "Test Referrer",
    mspNumber: "00000",
    referrerPhone: "000-000-0000",
    faxNumber: "000-000-0000",
    diagnoses: ["Major Depressive Disorder (MDD)" as const],
    clinicalDetails: "clinical-detail-placeholder",
    treatments: ["Transcranial Magnetic Stimulation (TMS)" as const],
    tmsContraindications: [],
    ketamineContraindications: [],
    otherInformation: "other-information-placeholder",
  },
  jotformSubmissionId: "ref_123",
};

const ENV_KEYS = [
  "RESEND_API_KEY",
  "RESEND_FROM_EMAIL",
  "CONTACT_NOTIFICATION_EMAIL",
  "REFERRAL_NOTIFICATION_EMAIL",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
  "SMTP_FROM_EMAIL",
  "SMTP_FROM_NAME",
] as const;

const originalEnv = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));

function restoreEnv() {
  for (const key of ENV_KEYS) {
    const value = originalEnv[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

function clearNotificationEnv() {
  for (const key of ENV_KEYS) delete process.env[key];
}

function configureSmtp() {
  process.env.SMTP_HOST = "mail.example.test";
  process.env.SMTP_USER = "contact@example.test";
  process.env.SMTP_PASS = "placeholder";
}

afterEach(() => {
  restoreEnv();
});

test("Resend referral notification includes patient name but excludes clinical data", async () => {
  clearNotificationEnv();
  process.env.RESEND_API_KEY = "re_test";
  process.env.CONTACT_NOTIFICATION_EMAIL = "contact@neurolinks.ca";

  let smtpCalls = 0;
  const result = await sendReferralNotification(
    context,
    async (_input, init = {}) => {
      const headers = new Headers(init.headers);
      assert.equal(headers.get("Idempotency-Key"), "neurolinks-referral/ref_123");
      const body = JSON.parse(String(init.body)) as Record<string, unknown>;
      const text = String(body.text);
      assert.equal(text.includes("Patient: Test Patient"), true);
      assert.equal(text.includes("Referrer: Test Referrer"), true);
      assert.equal(text.includes(context.fields.phn), false);
      assert.equal(text.includes(context.fields.clinicalDetails), false);
      assert.equal(text.includes(context.fields.otherInformation), false);
      return new Response(JSON.stringify({ id: "email_123" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    },
    async () => {
      smtpCalls += 1;
    },
  );

  assert.deepEqual(result, { primary: "sent", resendEmailId: "email_123" });
  assert.equal(smtpCalls, 0);
});

test("Resend failure sends SMTP referral notification and technical alert", async () => {
  clearNotificationEnv();
  process.env.RESEND_API_KEY = "re_test";
  configureSmtp();

  const smtpMessages: Array<{ to: string; subject: string; text: string }> = [];
  const result = await sendReferralNotification(
    context,
    async () =>
      new Response(
        JSON.stringify({ name: "validation_error", message: "Sender domain is not verified" }),
        { status: 403, headers: { "content-type": "application/json" } },
      ),
    async (message) => {
      smtpMessages.push(message);
    },
  );

  assert.equal(result.primary, "failed");
  assert.equal(result.fallbackReferral, "sent");
  assert.equal(result.fallbackAlert, "sent");
  assert.equal(smtpMessages.length, 2);
  assert.equal(smtpMessages[0].text.includes("Patient: Test Patient"), true);
  assert.equal(smtpMessages[0].text.includes(context.fields.phn), false);
  assert.equal(smtpMessages[0].text.includes(context.fields.clinicalDetails), false);
  assert.equal(smtpMessages[1].text.includes("Resend status: 403"), true);
  assert.equal(smtpMessages[1].text.includes(context.fields.clinicalDetails), false);
});

test("missing Resend configuration falls back to SMTP", async () => {
  clearNotificationEnv();
  configureSmtp();

  const smtpMessages: Array<{ subject: string }> = [];
  const result = await sendReferralNotification(
    context,
    async () => {
      throw new Error("Resend fetch should not run without an API key");
    },
    async (message) => {
      smtpMessages.push({ subject: message.subject });
    },
  );

  assert.equal(result.primary, "not-configured");
  assert.equal(result.fallbackReferral, "sent");
  assert.equal(result.fallbackAlert, "sent");
  assert.equal(smtpMessages.length, 2);
});
