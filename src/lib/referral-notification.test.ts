import assert from "node:assert/strict";
import { afterEach, test } from "node:test";

import { sendReferralNotification } from "./referral-notification.ts";

const context = {
  fields: {
    patientFirstName: "Jane",
    patientLastName: "Doe",
    phn: "9876543210",
    patientPhone: "250-555-0100",
    referrerName: "Dr. Smith",
    mspNumber: "12345",
    referrerPhone: "250-555-0101",
    faxNumber: "250-555-0102",
    diagnoses: ["Major Depressive Disorder (MDD)" as const],
    clinicalDetails: "Sensitive clinical details that must not appear in notification email.",
    treatments: ["Transcranial Magnetic Stimulation (TMS)" as const],
    tmsContraindications: [],
    ketamineContraindications: [],
    otherInformation: "Additional sensitive information.",
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

test("Resend sends a minimal physician referral notification without patient clinical data", async () => {
  clearNotificationEnv();
  process.env.RESEND_API_KEY = "re_test";
  process.env.RESEND_FROM_EMAIL = "NeuroLinks Website <notifications@neurolinks.ca>";
  process.env.CONTACT_NOTIFICATION_EMAIL = "contact@neurolinks.ca";

  let smtpCalls = 0;
  const result = await sendReferralNotification(
    context,
    async (input, init = {}) => {
      assert.equal(String(input), "https://api.resend.com/emails");
      const headers = new Headers(init.headers);
      assert.equal(headers.get("Authorization"), "Bearer re_test");
      assert.equal(headers.get("Idempotency-Key"), "neurolinks-referral/ref_123");
      const body = JSON.parse(String(init.body)) as Record<string, unknown>;
      assert.equal(body.subject, "New physician referral received");
      const text = String(body.text);
      assert.equal(text.includes("Referrer: Dr. Smith"), true);
      assert.equal(text.includes("Jotform submission ID: ref_123"), true);
      assert.equal(text.includes("Jane"), false);
      assert.equal(text.includes("Doe"), false);
      assert.equal(text.includes("9876543210"), false);
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

test("Resend failure sends a clean SMTP referral notification plus a technical alert", async () => {
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

  const referral = smtpMessages[0];
  assert.equal(referral.to, "contact@neurolinks.ca");
  assert.equal(referral.subject, "New physician referral received");
  assert.equal(referral.text.includes("Referrer: Dr. Smith"), true);
  assert.equal(referral.text.includes("Jane"), false);
  assert.equal(referral.text.includes("9876543210"), false);
  assert.equal(referral.text.includes(context.fields.clinicalDetails), false);

  const alert = smtpMessages[1];
  assert.equal(alert.subject, "Referral notification fallback activated - Jotform ref_123");
  assert.equal(alert.text.includes("saved successfully in Jotform"), true);
  assert.equal(alert.text.includes("Jotform submission ID: ref_123"), true);
  assert.equal(alert.text.includes("Resend status: 403"), true);
  assert.equal(alert.text.includes("Resend code: validation_error"), true);
  assert.equal(alert.text.includes("Sender domain is not verified"), true);
  assert.equal(alert.text.includes(context.fields.clinicalDetails), false);
  assert.equal(alert.text.includes(context.fields.otherInformation), false);
});

test("missing Resend configuration falls back to SMTP without failing referral notification", async () => {
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
