import { isJotformSuccessPayload, originIsAllowed } from "./contact-form.ts";
import {
  MAX_REFERRAL_BODY_BYTES,
  REFERRAL_ERROR_MESSAGE,
  REFERRAL_SUCCESS_MESSAGE,
  REFERRAL_UPSTREAM_LOG,
  approvedJotformApiBaseUrl,
  jotformReferralSubmissionBody,
  parseReferralPayload,
  referralTimeoutMs,
} from "./referral-form.ts";

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
  return json({ success: false, message: REFERRAL_ERROR_MESSAGE }, status);
}

function contentTypeIsJson(value: string | null) {
  if (!value) return false;
  return value.split(";")[0]?.trim().toLowerCase() === "application/json";
}

export async function handleReferralPost(request: Request, fetcher?: typeof fetch) {
  const send = fetcher ?? globalThis.fetch;
  const apiKey = process.env.JOTFORM_API_KEY?.trim();
  const formId = process.env.JOTFORM_REFERRAL_FORM_ID?.trim();
  const apiBase = approvedJotformApiBaseUrl();
  if (!apiKey || !formId || !apiBase) {
    return json({ success: false, message: REFERRAL_ERROR_MESSAGE }, 503);
  }

  if (!originIsAllowed(request)) {
    return json({ success: false, message: REFERRAL_ERROR_MESSAGE }, 403);
  }

  if (!contentTypeIsJson(request.headers.get("content-type"))) {
    return json({ success: false, message: REFERRAL_ERROR_MESSAGE }, 400);
  }

  const declaredLength = request.headers.get("content-length");
  if (declaredLength) {
    const size = Number(declaredLength);
    if (Number.isFinite(size) && size > MAX_REFERRAL_BODY_BYTES) {
      return json({ success: false, message: REFERRAL_ERROR_MESSAGE }, 413);
    }
  }

  let rawText: string;
  try {
    rawText = await request.text();
  } catch {
    return json({ success: false, message: REFERRAL_ERROR_MESSAGE }, 400);
  }

  if (rawText.length > MAX_REFERRAL_BODY_BYTES) {
    return json({ success: false, message: REFERRAL_ERROR_MESSAGE }, 413);
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawText) as unknown;
  } catch {
    return json({ success: false, message: REFERRAL_ERROR_MESSAGE }, 400);
  }

  const parsed = parseReferralPayload(payload);
  if (!parsed.ok) {
    return json({ success: false, message: REFERRAL_ERROR_MESSAGE }, 400);
  }

  if (parsed.honeypot) {
    return json({ success: true, message: REFERRAL_SUCCESS_MESSAGE }, 200);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), referralTimeoutMs());

  try {
    const upstream = await send(`${apiBase}/form/${formId}/submissions`, {
      method: "POST",
      headers: {
        APIKEY: apiKey,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: jotformReferralSubmissionBody(parsed.fields),
      signal: controller.signal,
      cache: "no-store",
    });

    let data: unknown;
    try {
      data = await upstream.json();
    } catch {
      console.error(REFERRAL_UPSTREAM_LOG);
      return genericError(502);
    }

    if (!upstream.ok || !isJotformSuccessPayload(data)) {
      console.error(REFERRAL_UPSTREAM_LOG);
      return genericError(502);
    }

    return json({ success: true, message: REFERRAL_SUCCESS_MESSAGE }, 200);
  } catch {
    console.error(REFERRAL_UPSTREAM_LOG);
    return genericError(502);
  } finally {
    clearTimeout(timer);
  }
}
