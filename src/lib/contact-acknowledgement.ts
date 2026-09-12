import type { ContactFields } from "./contact-form.ts";
import { SITE } from "./site.ts";

type ContactAcknowledgementContext = {
  fields: ContactFields;
  jotformSubmissionId: string;
};

export type ContactAcknowledgementResult = {
  status: "sent" | "failed" | "not-configured";
  resendEmailId?: string;
};

const DEFAULT_RESEND_FROM = "NeuroLinks Website <notifications@neurolinks.ca>";

function acknowledgementText(fields: ContactFields) {
  return [
    `Hi ${fields.firstName},`,
    "",
    "Thank you for contacting NeuroLinks. We’ve received your message and a member of our team will review it.",
    "",
    "For your reference, here is a copy of the message you sent:",
    "",
    "---",
    fields.message,
    "---",
    "",
    `If you would prefer to speak with us, you can also contact us at ${SITE.phone}.`,
    "",
    "Kind regards,",
    "NeuroLinks",
  ].join("\n");
}

function safeErrorMessage(value: unknown) {
  if (value instanceof Error) return value.message.slice(0, 500);
  if (typeof value === "string") return value.slice(0, 500);
  return "Unknown error";
}

export async function sendContactAcknowledgement(
  context: ContactAcknowledgementContext,
  fetcher: typeof fetch = globalThis.fetch,
): Promise<ContactAcknowledgementResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.error("Contact acknowledgement Resend email is not configured", {
      jotformSubmissionId: context.jotformSubmissionId,
    });
    return { status: "not-configured" };
  }

  const from = process.env.RESEND_FROM_EMAIL?.trim() || DEFAULT_RESEND_FROM;

  try {
    const response = await fetcher("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `neurolinks-contact-receipt/${context.jotformSubmissionId}`,
      },
      body: JSON.stringify({
        from,
        to: [context.fields.email],
        reply_to: SITE.email,
        subject: "We received your message | NeuroLinks",
        text: acknowledgementText(context.fields),
      }),
      cache: "no-store",
    });

    let data: unknown = null;
    try {
      data = await response.json();
    } catch {
      // A successful response does not require JSON for the acknowledgement to be considered sent.
    }

    if (!response.ok) {
      const record = data && typeof data === "object" ? (data as Record<string, unknown>) : null;
      console.error("Contact acknowledgement Resend email failed", {
        jotformSubmissionId: context.jotformSubmissionId,
        status: response.status,
        code: record && typeof record.name === "string" ? record.name : undefined,
        error:
          record && typeof record.message === "string"
            ? record.message.slice(0, 500)
            : `Resend returned HTTP ${response.status}`,
      });
      return { status: "failed" };
    }

    const resendEmailId =
      data &&
      typeof data === "object" &&
      typeof (data as Record<string, unknown>).id === "string"
        ? ((data as Record<string, unknown>).id as string)
        : undefined;

    console.info("Contact acknowledgement sent", {
      jotformSubmissionId: context.jotformSubmissionId,
      resendEmailId,
    });
    return { status: "sent", resendEmailId };
  } catch (error) {
    console.error("Contact acknowledgement Resend email failed", {
      jotformSubmissionId: context.jotformSubmissionId,
      error: safeErrorMessage(error),
    });
    return { status: "failed" };
  }
}
