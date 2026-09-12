import assert from "node:assert/strict";
import { afterEach, test } from "node:test";

import { sendContactNotification } from "./contact-notification.ts";

const context = {
  fields: {
    firstName: "Jane",
    lastName: "Doe",
    email: "jane@example.com",
    phone: "250-555-0100",
    message: "Please contact me about an assessment.",
  },
  source: "contact" as const,
  jotformSubmissionId: "sub_123",
};

const ENV_KEYS = [
  "RESEND_API_KEY",
  "RESEND_FROM_EMAIL",
  "CONTACT_NOTIFICATION_EMAIL",
  "SITEGROUND_SMTP_HOST",
  "SITEGROUND_SMTP_PORT",
  "SITEGROUND_SMTP_USER",
  "SITEGROUND_SMTP_PASS",
  "SITEGROUND_SMTP_FROM_EMAIL",
  "SITEGROUND_SMTP_FROM_NAME",
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
  process.env.SITEGROUND_SMTP_HOST = "mail.example.test";
  process.env.SITEGROUND_SMTP_USER = "contact@neurolinks.ca";
  process.env.SITEGROUND_SMTP_PASS = "test-password";
}

afterEach(() => {
  restoreEnv();
});

test("Resend sends a clean replyable contact notification", async () => {
  clearNotificationEnv();
  process.env.RESEND_API_KEY = "re_test";
  process.env.RESEND_FROM_EMAIL = "NeuroLinks Website <notifications@neurolinks.ca>";
  process.env.CONTACT_NOTIFICATION_EMAIL = "contact@neurolinks.ca";

  let smtpCalls = 0;
  const response = await sendContactNotification(
    context,
    async (input, init = {}) => {
      assert.equal(String(input), "https://api.resend.com/emails");
      const headers = new Headers(init.headers);
      assert.equal(headers.get("Authorization"), "Bearer re_test");
      assert.equal(headers.get("Idempotency-Key"), "neurolinks-contact/sub_123");
      const body = JSON.parse(String(init.body)) as Record<string, unknown>;
      assert.equal(body.reply_to, "jane@example.com");
      assert.equal(body.subject, "New website contact - Jane Doe");
      assert.equal(
        body.text,
        "Name: Jane Doe\nEmail: jane@example.com\nPhone: 250-555-0100\n\nMessage:\nPlease contact me about an assessment.",
      );
      assert.equal(String(body.text).includes("Jotform"), false);
      assert.equal(String(body.text).includes("Resend"), false);
      return new Response(JSON.stringify({ id: "email_123" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    },
    async () => {
      smtpCalls += 1;
    },
  );

  assert.deepEqual(response, { primary: "sent", resendEmailId: "email_123" });
  assert.equal(smtpCalls, 0);
});

test("Resend failure sends a clean SMTP contact email plus a separate technical alert", async () => {
  clearNotificationEnv();
  process.env.RESEND_API_KEY = "re_test";
  configureSmtp();

  const smtpMessages: Array<{
    to: string;
    replyTo?: string;
    subject: string;
    text: string;
  }> = [];

  const result = await sendContactNotification(
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
  assert.equal(result.fallbackContact, "sent");
  assert.equal(result.fallbackAlert, "sent");
  assert.equal(smtpMessages.length, 2);

  const contact = smtpMessages[0];
  assert.equal(contact.to, "contact@neurolinks.ca");
  assert.equal(contact.replyTo, "jane@example.com");
  assert.equal(contact.subject, "New website contact - Jane Doe");
  assert.equal(contact.text.includes("Please contact me about an assessment."), true);
  assert.equal(contact.text.includes("Resend"), false);
  assert.equal(contact.text.includes("Jotform"), false);

  const alert = smtpMessages[1];
  assert.equal(alert.replyTo, undefined);
  assert.equal(alert.subject, "Website notification fallback activated - Jotform sub_123");
  assert.equal(alert.text.includes("saved successfully in Jotform"), true);
  assert.equal(alert.text.includes("Jotform submission ID: sub_123"), true);
  assert.equal(alert.text.includes("Resend status: 403"), true);
  assert.equal(alert.text.includes("Resend code: validation_error"), true);
  assert.equal(alert.text.includes("Sender domain is not verified"), true);
  assert.equal(alert.text.includes(context.fields.message), false);
});

test("missing Resend configuration falls back to SiteGround SMTP without failing the inquiry", async () => {
  clearNotificationEnv();
  configureSmtp();

  const smtpMessages: Array<{ subject: string }> = [];
  const result = await sendContactNotification(
    context,
    async () => {
      throw new Error("Resend fetch should not run without an API key");
    },
    async (message) => {
      smtpMessages.push({ subject: message.subject });
    },
  );

  assert.equal(result.primary, "not-configured");
  assert.equal(result.fallbackContact, "sent");
  assert.equal(result.fallbackAlert, "sent");
  assert.equal(smtpMessages.length, 2);
});
