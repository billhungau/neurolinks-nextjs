import { originIsAllowed } from "./contact-form.ts";
import {
  MAX_REFERRAL_BODY_BYTES,
  REFERRAL_ERROR_MESSAGE,
  REFERRAL_SUCCESS_MESSAGE,
  isJotformReferralSuccessPayload,
  jotformReferralSubmissionBody,
  logReferralDiagnostic,
  newReferralRequestId,
  parseReferralPayload,
  referralTimeoutMs,
  resolveReferralJotformConfig,
  sanitizeJotformResponseCode,
} from "./referral-form.ts";

type SuccessResult = {
  ok: true;
  success: true;
  message: string;
};

type FailureResult = {
  ok: false;
  error: string;
};

type JsonResult = SuccessResult | FailureResult;

function json(body: JsonResult, status: number) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function genericError(status = 502) {
  return json({ ok: false, error: REFERRAL_ERROR_MESSAGE }, status);
}

function contentTypeIsJson(value: string | null) {
  if (!value) return false;
  return value.split(";")[0]?.trim().toLowerCase() === "application/json";
}

function isAbortError(error: unknown) {
  return (
    (error instanceof DOMException && error.name === "AbortError") ||
    (typeof error === "object" &&
      error !== null &&
      "name" in error &&
      (error as { name?: string }).name === "AbortError")
  );
}

export async function handleReferralPost(request: Request, fetcher?: typeof fetch) {
  const send = fetcher ?? globalThis.fetch;
  const requestId = newReferralRequestId();

  if (!originIsAllowed(request)) {
    return genericError(403);
  }

  if (!contentTypeIsJson(request.headers.get("content-type"))) {
    return genericError(400);
  }

  const declaredLength = request.headers.get("content-length");
  if (declaredLength) {
    const size = Number(declaredLength);
    if (Number.isFinite(size) && size > MAX_REFERRAL_BODY_BYTES) {
      return genericError(413);
    }
  }

  let rawText: string;
  try {
    rawText = await request.text();
  } catch {
    return genericError(400);
  }

  if (rawText.length > MAX_REFERRAL_BODY_BYTES) {
    return genericError(413);
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawText) as unknown;
  } catch {
    return genericError(400);
  }

  const parsed = parseReferralPayload(payload);
  if (!parsed.ok) {
    return genericError(400);
  }

  if (parsed.honeypot) {
    return json({ ok: true, success: true, message: REFERRAL_SUCCESS_MESSAGE }, 200);
  }

  const config = resolveReferralJotformConfig();
  if (!config.ok) {
    logReferralDiagnostic("referral_config_unavailable", { requestId });
    return genericError(503);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), referralTimeoutMs());

  try {
    const upstream = await send(`${config.apiBase}/form/${config.formId}/submissions`, {
      method: "POST",
      headers: {
        APIKEY: config.apiKey,
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
      logReferralDiagnostic("referral_upstream_invalid_json", {
        requestId,
        jotformStatus: upstream.status,
        formId: config.formId,
        apiHost: config.apiHost,
      });
      return genericError(502);
    }

    if (!upstream.ok || !isJotformReferralSuccessPayload(data)) {
      logReferralDiagnostic("referral_upstream_rejected", {
        requestId,
        jotformStatus: upstream.status,
        jotformCode: sanitizeJotformResponseCode(data),
        formId: config.formId,
        apiHost: config.apiHost,
      });
      return genericError(502);
    }

    return json({ ok: true, success: true, message: REFERRAL_SUCCESS_MESSAGE }, 200);
  } catch (error) {
    const timedOut = isAbortError(error);
    logReferralDiagnostic(timedOut ? "referral_upstream_timeout" : "referral_upstream_unavailable", {
      requestId,
      formId: config.formId,
      apiHost: config.apiHost,
    });
    return genericError(timedOut ? 504 : 502);
  } finally {
    clearTimeout(timer);
  }
}
