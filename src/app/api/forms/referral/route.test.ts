import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { handleReferralPost } from "../../../../lib/submit-referral.ts";
import { JOTFORM_SUBMIT_TIMEOUT_MS } from "../../../../lib/contact-form.ts";
import {
  REFERRAL_ERROR_MESSAGE,
  REFERRAL_SUCCESS_MESSAGE,
  REFERRAL_UPSTREAM_LOG,
} from "../../../../lib/referral-form.ts";

const VALID_BODY = {
  patientFirstName: "Alex",
  patientLastName: "Nguyen",
  phn: "9876543210",
  patientPhone: "250-555-0199",
  referrerName: "Dr. Pat Lee",
  mspNumber: "12345",
  referrerPhone: "250-555-0100",
  faxNumber: "250-739-5530",
  diagnoses: ["Major Depressive Disorder (MDD)", "Psychotic illness"],
  clinicalDetails: "Fictional test details only.",
  treatments: ["Ketamine Therapy"],
  tmsContraindications: ["Deep brain stimulator"],
  ketamineContraindications: ["Severe liver disease"],
  otherInformation: "Fictional note.",
};

const originalFetch = globalThis.fetch;
const originalError = console.error;
const originalEnv = {
  JOTFORM_API_KEY: process.env.JOTFORM_API_KEY,
  JOTFORM_REFERRAL_FORM_ID: process.env.JOTFORM_REFERRAL_FORM_ID,
  JOTFORM_REFERRAL_API_BASE_URL: process.env.JOTFORM_REFERRAL_API_BASE_URL,
  REFERRAL_UPSTREAM_TIMEOUT_MS: process.env.REFERRAL_UPSTREAM_TIMEOUT_MS,
};

function restore() {
  globalThis.fetch = originalFetch;
  console.error = originalError;
  for (const [key, value] of Object.entries(originalEnv)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

function setEnv() {
  process.env.JOTFORM_API_KEY = "test-server-key";
  process.env.JOTFORM_REFERRAL_FORM_ID = "262418577500054";
  delete process.env.JOTFORM_REFERRAL_API_BASE_URL;
}

function request(body: unknown, init: RequestInit = {}) {
  const headers = new Headers({
    "content-type": "application/json",
    origin: "http://127.0.0.1:3000",
    host: "127.0.0.1:3000",
  });
  if (init.headers) {
    new Headers(init.headers).forEach((value, key) => headers.set(key, value));
  }
  return new Request("http://127.0.0.1:3000/api/forms/referral/", {
    method: "POST",
    ...init,
    headers,
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function jotformOk() {
  return new Response(
    JSON.stringify({ responseCode: 200, content: { submissionID: "sub_ref_1" } }),
    { status: 200, headers: { "content-type": "application/json" } },
  );
}

function captureLogs() {
  const logs: string[] = [];
  console.error = (...args: unknown[]) => {
    logs.push(args.map(String).join(" "));
  };
  return logs;
}

afterEach(restore);

test("valid submission posts URL-encoded Jotform fields with APIKEY header only", async () => {
  setEnv();
  const calls: Array<{ url: string; init: RequestInit }> = [];
  globalThis.fetch = async (input, init = {}) => {
    calls.push({ url: String(input), init });
    return jotformOk();
  };

  const response = await handleReferralPost(request(VALID_BODY));
  const json = await response.json();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  assert.deepEqual(json, { success: true, message: REFERRAL_SUCCESS_MESSAGE });
  assert.equal(json.message.includes(VALID_BODY.phn), false);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://api.jotform.com/form/262418577500054/submissions");
  assert.equal(calls[0].init.cache, "no-store");
  const headers = new Headers(calls[0].init.headers);
  assert.equal(headers.get("APIKEY"), "test-server-key");
  assert.equal(headers.get("Content-Type"), "application/x-www-form-urlencoded");
  assert.equal(String(calls[0].url).includes("test-server-key"), false);
  const body = String(calls[0].init.body);
  assert.equal(body.includes("test-server-key"), false);
  const params = new URLSearchParams(body);
  assert.equal(params.get("submission[3_first]"), "Alex");
  assert.equal(params.get("submission[3_last]"), "Nguyen");
  assert.equal(params.get("submission[23]"), "9876543210");
  assert.equal(params.get("submission[5_full]"), "250-555-0199");
  assert.equal(params.get("submission[21]"), "Dr. Pat Lee");
  assert.equal(params.get("submission[10]"), "12345");
  assert.equal(params.get("submission[11_full]"), "250-555-0100");
  assert.equal(params.get("submission[12]"), "250-739-5530");
  assert.deepEqual(params.getAll("submission[15][]"), VALID_BODY.diagnoses);
  assert.equal(params.get("submission[22]"), "Fictional test details only.");
  assert.deepEqual(params.getAll("submission[16][]"), VALID_BODY.treatments);
  assert.deepEqual(params.getAll("submission[17][]"), VALID_BODY.tmsContraindications);
  assert.deepEqual(params.getAll("submission[18][]"), VALID_BODY.ketamineContraindications);
  assert.equal(params.get("submission[19]"), "Fictional note.");
});

test("approved HIPAA API base URL is used when configured", async () => {
  setEnv();
  process.env.JOTFORM_REFERRAL_API_BASE_URL = "https://hipaa-api.jotform.com/";
  const calls: string[] = [];
  globalThis.fetch = async (input) => {
    calls.push(String(input));
    return jotformOk();
  };
  const response = await handleReferralPost(request(VALID_BODY));
  assert.equal(response.status, 200);
  assert.equal(calls[0], "https://hipaa-api.jotform.com/form/262418577500054/submissions");
});

test("unapproved API base URL returns a controlled 503", async () => {
  setEnv();
  process.env.JOTFORM_REFERRAL_API_BASE_URL = "https://evil.example/api";
  globalThis.fetch = async () => {
    throw new Error("fetch should not be called");
  };
  const response = await handleReferralPost(request(VALID_BODY));
  assert.equal(response.status, 503);
});

test("missing required fields return 400 without forwarding", async () => {
  setEnv();
  globalThis.fetch = async () => {
    throw new Error("fetch should not be called");
  };
  const response = await handleReferralPost(request({ ...VALID_BODY, phn: "" }));
  assert.equal(response.status, 400);
  const json = await response.json();
  assert.equal(json.success, false);
  assert.equal(json.message, REFERRAL_ERROR_MESSAGE);
});

test("diagnosis and treatment groups require at least one value", async () => {
  setEnv();
  globalThis.fetch = async () => {
    throw new Error("fetch should not be called");
  };
  const noDx = await handleReferralPost(request({ ...VALID_BODY, diagnoses: [] }));
  const noTx = await handleReferralPost(request({ ...VALID_BODY, treatments: [] }));
  assert.equal(noDx.status, 400);
  assert.equal(noTx.status, 400);
});

test("Other without Clinical Details returns 400", async () => {
  setEnv();
  globalThis.fetch = async () => {
    throw new Error("fetch should not be called");
  };
  const response = await handleReferralPost(
    request({
      ...VALID_BODY,
      diagnoses: ["Other (Please write in clinical details)"],
      clinicalDetails: "",
    }),
  );
  assert.equal(response.status, 400);
});

test("unexpected checkbox values are rejected", async () => {
  setEnv();
  globalThis.fetch = async () => {
    throw new Error("fetch should not be called");
  };
  const response = await handleReferralPost(
    request({ ...VALID_BODY, diagnoses: ["Invented diagnosis"] }),
  );
  assert.equal(response.status, 400);
});

test("optional contraindication groups may be empty", async () => {
  setEnv();
  let body = "";
  globalThis.fetch = async (_input, init = {}) => {
    body = String(init.body);
    return jotformOk();
  };
  const response = await handleReferralPost(
    request({ ...VALID_BODY, tmsContraindications: [], ketamineContraindications: [] }),
  );
  assert.equal(response.status, 200);
  assert.equal(body.includes("submission[17]"), false);
  assert.equal(body.includes("submission[18]"), false);
});

test("PHN is never included in logs or returned responses", async () => {
  setEnv();
  const logs = captureLogs();
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ responseCode: 500, message: "upstream" }), { status: 500 });
  const response = await handleReferralPost(request(VALID_BODY));
  const text = await response.text();
  assert.equal(response.status, 502);
  assert.equal(text.includes(VALID_BODY.phn), false);
  assert.equal(text.includes(VALID_BODY.patientFirstName), false);
  assert.equal(text.includes("sub_ref_1"), false);
  assert.equal(logs.join("\n").includes(VALID_BODY.phn), false);
  assert.equal(logs.join("\n").includes(VALID_BODY.clinicalDetails), false);
  assert.deepEqual(logs, [REFERRAL_UPSTREAM_LOG]);
});

test("honeypot does not forward to Jotform and still returns success", async () => {
  setEnv();
  let called = 0;
  globalThis.fetch = async () => {
    called += 1;
    return jotformOk();
  };
  const response = await handleReferralPost(request({ ...VALID_BODY, website: "https://spam.test" }));
  const json = await response.json();
  assert.equal(response.status, 200);
  assert.equal(json.success, true);
  assert.equal(called, 0);
  assert.equal(JSON.stringify(json).includes(VALID_BODY.phn), false);
});

test("missing environment variables return 503", async () => {
  delete process.env.JOTFORM_API_KEY;
  delete process.env.JOTFORM_REFERRAL_FORM_ID;
  globalThis.fetch = async () => {
    throw new Error("fetch should not be called");
  };
  const response = await handleReferralPost(request(VALID_BODY));
  assert.equal(response.status, 503);
  const json = await response.json();
  assert.equal(json.success, false);
  assert.equal(json.message, REFERRAL_ERROR_MESSAGE);
});

test("Jotform failure returns a generic response without raw upstream details", async () => {
  setEnv();
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ responseCode: 401, message: "Invalid API Key secret-xyz" }), {
      status: 401,
    });
  const response = await handleReferralPost(request(VALID_BODY));
  const text = await response.text();
  assert.equal(response.status, 502);
  assert.equal(text.includes("secret-xyz"), false);
  assert.equal(text.includes("Invalid API Key"), false);
  assert.equal(text.includes("test-server-key"), false);
  assert.equal(text.includes(VALID_BODY.phn), false);
  const json = JSON.parse(text) as { success: boolean; message: string };
  assert.equal(json.success, false);
  assert.equal(json.message, REFERRAL_ERROR_MESSAGE);
});

test("upstream timeout does not retry", async () => {
  setEnv();
  process.env.REFERRAL_UPSTREAM_TIMEOUT_MS = "40";
  let called = 0;
  globalThis.fetch = async (_input, init) => {
    called += 1;
    const signal = init?.signal;
    return await new Promise<Response>((_resolve, reject) => {
      if (signal?.aborted) {
        reject(new DOMException("Aborted", "AbortError"));
        return;
      }
      signal?.addEventListener("abort", () => {
        reject(new DOMException("Aborted", "AbortError"));
      });
    });
  };

  const response = await handleReferralPost(request(VALID_BODY));
  assert.equal(response.status, 502);
  assert.equal(called, 1);
  assert.ok(JOTFORM_SUBMIT_TIMEOUT_MS >= 10_000);
});

test("rejected origin returns 403", async () => {
  setEnv();
  globalThis.fetch = async () => {
    throw new Error("fetch should not be called");
  };
  const response = await handleReferralPost(
    request(VALID_BODY, { headers: { origin: "https://evil.example" } }),
  );
  assert.equal(response.status, 403);
});

test("oversized body returns 413", async () => {
  setEnv();
  globalThis.fetch = async () => {
    throw new Error("fetch should not be called");
  };
  const response = await handleReferralPost(
    request(VALID_BODY, { headers: { "content-length": String(128 * 1024) } }),
  );
  assert.equal(response.status, 413);
});

test("response never includes submitted values or a Location header", async () => {
  setEnv();
  globalThis.fetch = async () => jotformOk();
  const response = await handleReferralPost(request(VALID_BODY));
  const text = await response.text();
  assert.equal(response.headers.get("Location"), null);
  assert.equal(text.includes(VALID_BODY.phn), false);
  assert.equal(text.includes(VALID_BODY.clinicalDetails), false);
  assert.equal(text.includes("sub_ref_1"), false);
});
