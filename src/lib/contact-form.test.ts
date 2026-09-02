import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  ADVERTISING_LANDING_MESSAGE_PREFIX,
  ADVERTISING_LANDING_SOURCE,
  CONTACT_LIMITS,
  HONEYPOT_FIELD,
  JOTFORM_FIELD_KEYS,
  createSubmitLock,
  isJotformSuccessPayload,
  jotformMessageForSource,
  jotformSubmissionBody,
  originIsAllowed,
  parseContactPayload,
  parseContactSource,
  trimContactFields,
  validateContactFields,
} from "./contact-form.ts";

const valid = {
  firstName: "Jane",
  lastName: "O'Neil-Smith",
  email: "jane@example.com",
  phone: "+1 250 555 0100",
  message: "I would like to request an assessment.",
};

test("valid submission maps to the five Jotform API fields", () => {
  const parsed = parseContactPayload(valid);
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  const body = jotformSubmissionBody(parsed.fields);
  assert.equal(body.get("submission[2_first]"), "Jane");
  assert.equal(body.get("submission[2_last]"), "O'Neil-Smith");
  assert.equal(body.get("submission[3]"), "jane@example.com");
  assert.equal(body.get("submission[4_full]"), "+1 250 555 0100");
  assert.equal(body.get("submission[5]"), "I would like to request an assessment.");
  assert.deepEqual([...body.keys()], [...JOTFORM_FIELD_KEYS]);
});

test("missing required fields are rejected", () => {
  const errors = validateContactFields(trimContactFields({}));
  assert.ok(errors.firstName);
  assert.ok(errors.lastName);
  assert.ok(errors.email);
  assert.ok(errors.phone);
  assert.ok(errors.message);
});

test("whitespace-only fields are rejected", () => {
  const parsed = parseContactPayload({
    firstName: "  ",
    lastName: "\n",
    email: "   ",
    phone: " ",
    message: "\t",
  });
  assert.equal(parsed.ok, false);
});

test("invalid email is rejected", () => {
  const parsed = parseContactPayload({ ...valid, email: "not-an-email" });
  assert.equal(parsed.ok, false);
  if (parsed.ok) return;
  assert.ok(parsed.errors.email);
});

test("oversized values are rejected", () => {
  const parsed = parseContactPayload({
    ...valid,
    firstName: "A".repeat(CONTACT_LIMITS.firstName + 1),
    message: "M".repeat(CONTACT_LIMITS.message + 1),
  });
  assert.equal(parsed.ok, false);
  if (parsed.ok) return;
  assert.ok(parsed.errors.firstName);
  assert.ok(parsed.errors.message);
});

test("international names, apostrophes and hyphens are accepted", () => {
  const parsed = parseContactPayload({
    ...valid,
    firstName: "François",
    lastName: "O'Connor-Åberg",
  });
  assert.equal(parsed.ok, true);
});

test("honeypot population is detected without failing field validation", () => {
  const parsed = parseContactPayload({ ...valid, [HONEYPOT_FIELD]: "http://spam.test" });
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  assert.equal(parsed.honeypot, true);
});

test("Jotform success requires a submission id", () => {
  assert.equal(isJotformSuccessPayload({ responseCode: 200, content: { submissionID: "abc" } }), true);
  assert.equal(isJotformSuccessPayload({ responseCode: 200, content: {} }), false);
  assert.equal(isJotformSuccessPayload({ message: "ok" }), false);
});

test("same-origin requests are accepted when Origin matches Host", () => {
  const request = new Request("http://127.0.0.1:3000/api/forms/contact/", {
    headers: {
      origin: "http://127.0.0.1:3000",
      host: "127.0.0.1:3000",
    },
  });
  assert.equal(originIsAllowed(request), true);
});

test("mismatched Origin is rejected", () => {
  const request = new Request("http://127.0.0.1:3000/api/forms/contact/", {
    headers: {
      origin: "https://evil.example",
      host: "127.0.0.1:3000",
    },
  });
  assert.equal(originIsAllowed(request), false);
});

test("missing Origin is allowed", () => {
  const request = new Request("http://127.0.0.1:3000/api/forms/contact/", {
    headers: { host: "127.0.0.1:3000" },
  });
  assert.equal(originIsAllowed(request), true);
});

test("submit lock prevents parallel acquires", () => {
  const lock = createSubmitLock();
  assert.equal(lock.tryAcquire(), true);
  assert.equal(lock.tryAcquire(), false);
  lock.release();
  assert.equal(lock.tryAcquire(), true);
});

test("advertising landing source prefixes the Jotform message without changing fields", () => {
  assert.equal(parseContactSource("advertising-landing"), ADVERTISING_LANDING_SOURCE);
  assert.equal(parseContactSource("contact"), "contact");
  assert.equal(parseContactSource("unknown"), "contact");
  const parsed = parseContactPayload(valid);
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  const contactBody = jotformSubmissionBody(parsed.fields, "contact");
  const adsBody = jotformSubmissionBody(parsed.fields, ADVERTISING_LANDING_SOURCE);
  assert.equal(contactBody.get("submission[5]"), valid.message);
  assert.equal(
    adsBody.get("submission[5]"),
    jotformMessageForSource(valid.message, ADVERTISING_LANDING_SOURCE),
  );
  assert.equal(adsBody.get("submission[5]")?.startsWith(ADVERTISING_LANDING_MESSAGE_PREFIX), true);
  assert.equal(adsBody.get("submission[2_first]"), valid.firstName);
  assert.equal(adsBody.get("submission[3]"), valid.email);
});

test("client form source never references the Jotform API key", () => {
  const root = join(dirname(fileURLToPath(import.meta.url)), "../components/forms/ContactForm.tsx");
  const src = readFileSync(root, "utf8");
  assert.equal(src.includes("JOTFORM_API_KEY"), false);
  assert.equal(src.includes("APIKEY"), false);
  assert.equal(src.includes("api.jotform.com"), false);
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

