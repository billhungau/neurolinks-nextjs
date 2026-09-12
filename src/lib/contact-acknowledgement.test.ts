import assert from "node:assert/strict";
import { afterEach, test } from "node:test";

import { sendContactAcknowledgement } from "./contact-acknowledgement.ts";

const context = {
  fields: {
    firstName: "Jane",
    lastName: "Doe",
    email: "jane@example.com",
    phone: "250-555-0100",
    message: "Please contact me about an assessment.",
  },
  jotformSubmissionId: "sub_123",
};

const ENV_KEYS = ["RESEND_API_KEY", "RESEND_FROM_EMAIL"] as const;
const originalEnv = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));

function restoreEnv() {
  for (const key of ENV_KEYS) {
    const value = originalEnv[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

afterEach(restoreEnv);

test("sends patient acknowledgement with a copy of the submitted message", async () => {
  process.env.RESEND_API_KEY = "re_test";
  process.env.RESEND_FROM_EMAIL = "NeuroLinks Website <notifications@neurolinks.ca>";

  const result = await sendContactAcknowledgement(context, async (input, init = {}) => {
    assert.equal(String(input), "https://api.resend.com/emails");
    const headers = new Headers(init.headers);
    assert.equal(headers.get("Authorization"), "Bearer re_test");
    assert.equal(headers.get("Idempotency-Key"), "neurolinks-contact-receipt/sub_123");

    const body = JSON.parse(String(init.body)) as Record<string, unknown>;
    assert.deepEqual(body.to, ["jane@example.com"]);
    assert.equal(body.reply_to, "contact@neurolinks.ca");
    assert.equal(body.subject, "We received your message | NeuroLinks");

    const text = String(body.text);
    assert.equal(text.includes("Hi Jane,"), true);
    assert.equal(text.includes("We’ve received your message"), true);
    assert.equal(text.includes("Please contact me about an assessment."), true);
    assert.equal(text.includes("250-739-5530"), true);
    assert.equal(text.includes("Jotform"), false);

    return new Response(JSON.stringify({ id: "email_receipt_123" }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  });

  assert.deepEqual(result, { status: "sent", resendEmailId: "email_receipt_123" });
});

test("missing Resend configuration does not affect the contact submission", async () => {
  delete process.env.RESEND_API_KEY;
  let called = false;

  const result = await sendContactAcknowledgement(context, async () => {
    called = true;
    throw new Error("fetch should not run without Resend configuration");
  });

  assert.deepEqual(result, { status: "not-configured" });
  assert.equal(called, false);
});

test("Resend failure is contained and does not expose the patient message in logs", async () => {
  process.env.RESEND_API_KEY = "re_test";

  const result = await sendContactAcknowledgement(
    context,
    async () =>
      new Response(JSON.stringify({ name: "validation_error", message: "Delivery rejected" }), {
        status: 403,
        headers: { "content-type": "application/json" },
      }),
  );

  assert.deepEqual(result, { status: "failed" });
});
