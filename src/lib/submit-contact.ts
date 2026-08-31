import {
  CONTACT_ERROR_MESSAGE,
  CONTACT_SUCCESS_MESSAGE,
  MAX_CONTACT_BODY_BYTES,
  isJotformSuccessPayload,
  jotformSubmissionBody,
  jotformTimeoutMs,
  originIsAllowed,
  parseContactPayload,
} from "./contact-form.ts";

type JsonResult = {
  success: boolean;
  message: string;
};

function json(body: JsonResult, status: number) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function genericError(status = 502) {
  return json({ success: false, message: CONTACT_ERROR_MESSAGE }, status);
}

function contentTypeIsJson(value: string | null) {
  if (!value) return false;
  return value.split(";")[0]?.trim().toLowerCase() === "application/json";
}

export async function handleContactPost(request: Request, fetcher?: typeof fetch) {
  const send = fetcher ?? globalThis.fetch;
  const apiKey = process.env.JOTFORM_API_KEY?.trim();
  const formId = process.env.JOTFORM_CONTACT_FORM_ID?.trim();
  if (!apiKey || !formId) {
    return json({ success: false, message: CONTACT_ERROR_MESSAGE }, 503);
  }

  if (!originIsAllowed(request)) {
    return json({ success: false, message: CONTACT_ERROR_MESSAGE }, 403);
  }

  if (!contentTypeIsJson(request.headers.get("content-type"))) {
    return json({ success: false, message: CONTACT_ERROR_MESSAGE }, 400);
  }

  const declaredLength = request.headers.get("content-length");
  if (declaredLength) {
    const size = Number(declaredLength);
    if (Number.isFinite(size) && size > MAX_CONTACT_BODY_BYTES) {
      return json({ success: false, message: CONTACT_ERROR_MESSAGE }, 413);
    }
  }

  let rawText: string;
  try {
    rawText = await request.text();
  } catch {
    return json({ success: false, message: CONTACT_ERROR_MESSAGE }, 400);
  }

  if (rawText.length > MAX_CONTACT_BODY_BYTES) {
    return json({ success: false, message: CONTACT_ERROR_MESSAGE }, 413);
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawText) as unknown;
  } catch {
    return json({ success: false, message: CONTACT_ERROR_MESSAGE }, 400);
  }

  const parsed = parseContactPayload(payload);
  if (!parsed.ok) {
    return json({ success: false, message: CONTACT_ERROR_MESSAGE }, 400);
  }

  if (parsed.honeypot) {
    return json({ success: true, message: CONTACT_SUCCESS_MESSAGE }, 200);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), jotformTimeoutMs());

  try {
    const upstream = await send(`https://api.jotform.com/form/${formId}/submissions`, {
      method: "POST",
      headers: {
        APIKEY: apiKey,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: jotformSubmissionBody(parsed.fields),
      signal: controller.signal,
      cache: "no-store",
    });

    let data: unknown;
    try {
      data = await upstream.json();
    } catch {
      console.error("Contact submission upstream request failed");
      return genericError(502);
    }

    if (!upstream.ok || !isJotformSuccessPayload(data)) {
      console.error("Contact submission upstream request failed");
      return genericError(502);
    }

    return json({ success: true, message: CONTACT_SUCCESS_MESSAGE }, 200);
  } catch {
    console.error("Contact submission upstream request failed");
    return genericError(502);
  } finally {
    clearTimeout(timer);
  }
}
