import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { handleContactPost } from "../../../../lib/submit-contact.ts";
import {
  CONTACT_ERROR_MESSAGE,
  CONTACT_SUCCESS_MESSAGE,
  JOTFORM_SUBMIT_TIMEOUT_MS,
} from "../../../../lib/contact-form.ts";

const VALID_BODY = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane@example.com",
  phone: "250-555-0100",
  message: "Please contact me about an assessment.",
};

const originalFetch = globalThis.fetch;
const originalEnv = {
  JOTFORM_API_KEY: process.env.JOTFORM_API_KEY,
  JOTFORM_CONTACT_FORM_ID: process.env.JOTFORM_CONTACT_FORM_ID,
  CONTACT_UPSTREAM_TIMEOUT_MS: process.env.CONTACT_UPSTREAM_TIMEOUT_MS,
};

function restore() {
  globalThis.fetch = originalFetch;
  for (const [key, value] of Object.entries(originalEnv)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

function setEnv() {
  process.env.JOTFORM_API_KEY = "test-server-key";
  process.env.JOTFORM_CONTACT_FORM_ID = "262419361844057";
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
  return new Request("http://127.0.0.1:3000/api/forms/contact/", {
    method: "POST",
    ...init,
    headers,
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function jotformOk() {
  return new Response(
    JSON.stringify({ responseCode: 200, content: { submissionID: "sub_1" } }),
    { status: 200, headers: { "content-type": "application/json" } },
  );
}

afterEach(restore);

test("valid submission posts URL-encoded Jotform fields with APIKEY header", async () => {
  setEnv();
  const calls: Array<{ url: string; init: RequestInit }> = [];
  globalThis.fetch = async (input, init = {}) => {
    calls.push({ url: String(input), init });
    return jotformOk();
  };

  const response = await handleContactPost(request(VALID_BODY));
  const json = await response.json();
  assert.equal(response.status, 200);
  assert.deepEqual(json, { success: true, message: CONTACT_SUCCESS_MESSAGE });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://api.jotform.com/form/262419361844057/submissions");
  const headers = new Headers(calls[0].init.headers);
  assert.equal(headers.get("APIKEY"), "test-server-key");
  assert.equal(headers.get("Content-Type"), "application/x-www-form-urlencoded");
  assert.equal(String(calls[0].url).includes("test-server-key"), false);
  const body = String(calls[0].init.body);
  assert.equal(body.includes("test-server-key"), false);
  const params = new URLSearchParams(body);
  assert.equal(params.get("submission[2_first]"), "Jane");
  assert.equal(params.get("submission[2_last]"), "Doe");
  assert.equal(params.get("submission[3]"), "jane@example.com");
  assert.equal(params.get("submission[4_full]"), "250-555-0100");
  assert.equal(params.get("submission[5]"), "Please contact me about an assessment.");
});

test("veterans submissions tag the Jotform message and allow an empty phone", async () => {
  setEnv();
  const calls: Array<{ url: string; init: RequestInit }> = [];
  globalThis.fetch = async (input, init = {}) => {
    calls.push({ url: String(input), init });
    return jotformOk();
  };

  const response = await handleContactPost(
    request({
      source: "veterans",
      name: "Jane Doe",
      email: "jane@example.com",
      phone: "",
      message: "How many visits are typical?",
    }),
  );
  assert.equal(response.status, 200);
  assert.equal(calls.length, 1);
  const params = new URLSearchParams(String(calls[0].init.body));
  assert.equal(params.get("submission[2_first]"), "Jane");
  assert.equal(params.get("submission[2_last]"), "Doe");
  assert.equal(params.get("submission[3]"), "jane@example.com");
  assert.equal(params.get("submission[4_full]"), "");
  assert.equal(
    params.get("submission[5]"),
    "[Veterans page]\n\nHow many visits are typical?",
  );
});

test("advertising landing submissions tag the Jotform message without sending PII to a second endpoint", async () => {
  setEnv();
  const calls: Array<{ url: string; init: RequestInit }> = [];
  globalThis.fetch = async (input, init = {}) => {
    calls.push({ url: String(input), init });
    return jotformOk();
  };

  const response = await handleContactPost(
    request({ ...VALID_BODY, source: "advertising-landing" }),
  );
  assert.equal(response.status, 200);
  assert.equal(calls.length, 1);
  const params = new URLSearchParams(String(calls[0].init.body));
  assert.equal(params.get("submission[2_first]"), "Jane");
  assert.equal(
    params.get("submission[5]"),
    "[Advertising landing page]\n\nPlease contact me about an assessment.",
  );
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url.startsWith("https://api.jotform.com/"), true);
});

test("missing required fields return 400", async () => {
  setEnv();
  globalThis.fetch = async () => {
    throw new Error("fetch should not be called");
  };
  const response = await handleContactPost(request({ ...VALID_BODY, email: "" }));
  assert.equal(response.status, 400);
  const json = await response.json();
  assert.equal(json.success, false);
});

test("whitespace-only fields return 400", async () => {
  setEnv();
  globalThis.fetch = async () => {
    throw new Error("fetch should not be called");
  };
  const response = await handleContactPost(request({ ...VALID_BODY, message: "   " }));
  assert.equal(response.status, 400);
});

test("invalid email returns 400", async () => {
  setEnv();
  globalThis.fetch = async () => {
    throw new Error("fetch should not be called");
  };
  const response = await handleContactPost(request({ ...VALID_BODY, email: "jane@" }));
  assert.equal(response.status, 400);
});

test("oversized values return 400", async () => {
  setEnv();
  globalThis.fetch = async () => {
    throw new Error("fetch should not be called");
  };
  const response = await handleContactPost(request({ ...VALID_BODY, phone: "1".repeat(31) }));
  assert.equal(response.status, 400);
});

test("malformed JSON returns 400", async () => {
  setEnv();
  globalThis.fetch = async () => {
    throw new Error("fetch should not be called");
  };
  const response = await handleContactPost(request("{", { headers: { "content-type": "application/json" } }));
  assert.equal(response.status, 400);
});

test("oversized body returns 413", async () => {
  setEnv();
  globalThis.fetch = async () => {
    throw new Error("fetch should not be called");
  };
  const response = await handleContactPost(
    request(VALID_BODY, { headers: { "content-length": String(64 * 1024) } }),
  );
  assert.equal(response.status, 413);
});

test("rejected origin returns 403", async () => {
  setEnv();
  globalThis.fetch = async () => {
    throw new Error("fetch should not be called");
  };
  const response = await handleContactPost(
    request(VALID_BODY, { headers: { origin: "https://evil.example" } }),
  );
  assert.equal(response.status, 403);
});

test("honeypot does not forward to Jotform and still returns success", async () => {
  setEnv();
  let called = 0;
  globalThis.fetch = async () => {
    called += 1;
    return jotformOk();
  };
  const response = await handleContactPost(request({ ...VALID_BODY, website: "https://spam.test" }));
  const json = await response.json();
  assert.equal(response.status, 200);
  assert.equal(json.success, true);
  assert.equal(called, 0);
});

test("missing environment variables return 503", async () => {
  delete process.env.JOTFORM_API_KEY;
  delete process.env.JOTFORM_CONTACT_FORM_ID;
  globalThis.fetch = async () => {
    throw new Error("fetch should not be called");
  };
  const response = await handleContactPost(request(VALID_BODY));
  assert.equal(response.status, 503);
  const json = await response.json();
  assert.equal(json.success, false);
  assert.equal(json.message, CONTACT_ERROR_MESSAGE);
});

test("Jotform failure returns a controlled 502 without raw upstream details", async () => {
  setEnv();
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ responseCode: 401, message: "Invalid API Key secret-xyz" }), {
      status: 401,
    });
  const response = await handleContactPost(request(VALID_BODY));
  const text = await response.text();
  assert.equal(response.status, 502);
  assert.equal(text.includes("secret-xyz"), false);
  assert.equal(text.includes("Invalid API Key"), false);
  assert.equal(text.includes("test-server-key"), false);
  assert.equal(text.includes(VALID_BODY.email), false);
  const json = JSON.parse(text) as { success: boolean; message: string };
  assert.equal(json.success, false);
  assert.equal(json.message, CONTACT_ERROR_MESSAGE);
});

test("upstream timeout does not retry", async () => {
  setEnv();
  process.env.CONTACT_UPSTREAM_TIMEOUT_MS = "40";
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

  const response = await handleContactPost(request(VALID_BODY));
  assert.equal(response.status, 502);
  assert.equal(called, 1);
  assert.ok(JOTFORM_SUBMIT_TIMEOUT_MS >= 10_000);
});
