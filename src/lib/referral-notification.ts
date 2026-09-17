import { once } from "node:events";
import { createInterface } from "node:readline";
import { connect as tlsConnect, type TLSSocket } from "node:tls";

import type { ReferralFields } from "./referral-form.ts";

type ReferralNotificationContext = {
  fields: ReferralFields;
  jotformSubmissionId: string;
};

type ReferralNotificationResult = {
  primary: "sent" | "failed" | "not-configured";
  resendEmailId?: string;
  fallbackReferral?: "sent" | "failed" | "not-configured";
  fallbackAlert?: "sent" | "failed" | "not-configured";
};

type ResendFailure = {
  status?: number;
  code?: string;
  message: string;
};

type SmtpMessage = {
  to: string;
  subject: string;
  text: string;
};

type SmtpSender = (message: SmtpMessage) => Promise<void>;

const DEFAULT_NOTIFICATION_TO = "contact@neurolinks.ca";
const DEFAULT_RESEND_FROM = "NeuroLinks Website <notifications@neurolinks.ca>";
const DEFAULT_SMTP_PORT = 465;
const SMTP_TIMEOUT_MS = 10_000;

function notificationRecipient() {
  return (
    process.env.REFERRAL_NOTIFICATION_EMAIL?.trim() ||
    process.env.CONTACT_NOTIFICATION_EMAIL?.trim() ||
    DEFAULT_NOTIFICATION_TO
  );
}

function patientName(fields: ReferralFields) {
  return `${fields.patientFirstName} ${fields.patientLastName}`.trim();
}

function displayValue(value: string) {
  return value || "Not provided";
}

function displayList(values: readonly string[], emptyValue = "None selected") {
  return values.length > 0 ? values.join("; ") : emptyValue;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function htmlValue(value: string) {
  return escapeHtml(displayValue(value));
}

function htmlList(values: readonly string[], emptyValue = "None selected") {
  return escapeHtml(displayList(values, emptyValue));
}

function referralSubject(fields: ReferralFields) {
  return `New physician referral — ${patientName(fields)}`;
}

function referralNotificationText(context: ReferralNotificationContext) {
  const { fields } = context;
  return [
    "A new physician referral has been received through neurolinks.ca.",
    "",
    "PATIENT INFORMATION",
    `Patient name: ${patientName(fields)}`,
    `PHN: ${displayValue(fields.phn)}`,
    `Patient phone: ${displayValue(fields.patientPhone)}`,
    "",
    "REFERRER INFORMATION",
    `Referrer name: ${displayValue(fields.referrerName)}`,
    `MSP number: ${displayValue(fields.mspNumber)}`,
    `Referrer phone: ${displayValue(fields.referrerPhone)}`,
    `Fax number: ${displayValue(fields.faxNumber)}`,
    "",
    "CLINICAL INFORMATION",
    `Diagnosis: ${displayList(fields.diagnoses)}`,
    "Clinical details:",
    displayValue(fields.clinicalDetails),
    "",
    "TREATMENT CONSIDERATIONS",
    `Treatment options: ${displayList(fields.treatments)}`,
    `Potential contraindications to TMS: ${displayList(fields.tmsContraindications, "None reported")}`,
    `Potential contraindications to ketamine therapy: ${displayList(fields.ketamineContraindications, "None reported")}`,
    ...(fields.otherInformation
      ? ["", "OTHER INFORMATION", fields.otherInformation]
      : []),
    "",
    `Jotform submission ID: ${context.jotformSubmissionId}`,
  ].join("\n");
}

function tableRow(label: string, value: string, isLast = false) {
  const border = isLast ? "" : "border-bottom:1px solid #e5e7eb;";
  return `<tr>
    <td style="width:180px;padding:11px 14px;background:#f6f8fa;${border}font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.45;font-weight:600;color:#344054;vertical-align:top;">${escapeHtml(label)}</td>
    <td style="padding:11px 14px;${border}font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:#1f2937;vertical-align:top;word-break:break-word;">${value}</td>
  </tr>`;
}

function sectionTable(title: string, rows: string) {
  return `<tr>
    <td style="padding:0 0 22px 0;">
      <div style="margin:0 0 8px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.4;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#163b65;">${escapeHtml(title)}</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:separate;border-spacing:0;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
        ${rows}
      </table>
    </td>
  </tr>`;
}

function referralNotificationHtml(context: ReferralNotificationContext) {
  const { fields } = context;
  const name = escapeHtml(patientName(fields));
  const otherInformation = fields.otherInformation.trim();

  const patientRows = [
    tableRow("Patient name", name),
    tableRow("PHN", htmlValue(fields.phn)),
    tableRow("Patient phone", htmlValue(fields.patientPhone), true),
  ].join("");

  const referrerRows = [
    tableRow("Referrer name", htmlValue(fields.referrerName)),
    tableRow("MSP number", htmlValue(fields.mspNumber)),
    tableRow("Referrer phone", htmlValue(fields.referrerPhone)),
    tableRow("Fax number", htmlValue(fields.faxNumber), true),
  ].join("");

  const treatmentRows = [
    tableRow("Treatment options", htmlList(fields.treatments)),
    tableRow(
      "TMS contraindications",
      htmlList(fields.tmsContraindications, "None reported"),
    ),
    tableRow(
      "Ketamine contraindications",
      htmlList(fields.ketamineContraindications, "None reported"),
      true,
    ),
  ].join("");

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
  <style>
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; }
    @media only screen and (max-width: 620px) {
      .email-shell { width: 100% !important; }
      .email-padding { padding-left: 18px !important; padding-right: 18px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#f4f6f8;color:#1f2937;-webkit-text-size-adjust:100%;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background:#f4f6f8;border-collapse:collapse;">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" width="680" cellpadding="0" cellspacing="0" border="0" class="email-shell" style="width:680px;max-width:680px;background:#ffffff;border:1px solid #e5e7eb;border-radius:10px;border-collapse:separate;">
          <tr>
            <td class="email-padding" style="padding:28px 32px 18px 32px;border-bottom:1px solid #e5e7eb;">
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.4;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#667085;">NeuroLinks</div>
              <h1 style="margin:5px 0 4px 0;font-family:Arial,Helvetica,sans-serif;font-size:24px;line-height:1.25;font-weight:700;color:#163b65;">New Physician Referral</h1>
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:17px;line-height:1.4;font-weight:600;color:#1f2937;">${name}</div>
              <div style="margin-top:5px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;color:#667085;">Received through neurolinks.ca</div>
            </td>
          </tr>
          <tr>
            <td class="email-padding" style="padding:24px 32px 8px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;">
                ${sectionTable("Patient information", patientRows)}
                ${sectionTable("Referrer information", referrerRows)}
                <tr>
                  <td style="padding:0 0 22px 0;">
                    <div style="margin:0 0 8px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.4;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#163b65;">Clinical information</div>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:separate;border-spacing:0;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
                      ${tableRow("Diagnosis", htmlList(fields.diagnoses), true)}
                    </table>
                    <div style="margin:12px 0 6px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.4;font-weight:600;color:#344054;">Clinical details</div>
                    <div style="padding:13px 14px;border:1px solid #e5e7eb;border-radius:8px;background:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#1f2937;white-space:pre-wrap;word-break:break-word;">${htmlValue(fields.clinicalDetails)}</div>
                  </td>
                </tr>
                ${sectionTable("Treatment considerations", treatmentRows)}
                ${otherInformation
                  ? `<tr>
                  <td style="padding:0 0 22px 0;">
                    <div style="margin:0 0 8px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.4;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#163b65;">Other information</div>
                    <div style="padding:13px 14px;border:1px solid #e5e7eb;border-radius:8px;background:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#1f2937;white-space:pre-wrap;word-break:break-word;">${escapeHtml(otherInformation)}</div>
                  </td>
                </tr>`
                  : ""}
              </table>
            </td>
          </tr>
          <tr>
            <td class="email-padding" style="padding:13px 32px 18px 32px;border-top:1px solid #eef0f2;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.5;color:#98a2b3;">
              Jotform submission ID: ${escapeHtml(context.jotformSubmissionId)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function fallbackAlertText(context: ReferralNotificationContext, failure: ResendFailure) {
  return [
    "The normal NeuroLinks physician referral notification could not be sent through Resend.",
    "",
    "A separate referral notification was attempted through the SMTP fallback.",
    "The referral itself was already saved successfully in Jotform.",
    "",
    "Please check Jotform for the official referral record.",
    "",
    `Jotform submission ID: ${context.jotformSubmissionId}`,
    `Resend status: ${failure.status ?? "Unavailable"}`,
    `Resend code: ${failure.code ?? "Unavailable"}`,
    `Resend error: ${failure.message}`,
    `Failure time: ${new Date().toISOString()}`,
  ].join("\n");
}

function safeErrorMessage(value: unknown) {
  if (value instanceof Error) return value.message.slice(0, 500);
  if (typeof value === "string") return value.slice(0, 500);
  return "Unknown error";
}

function resendFailureFromPayload(status: number, data: unknown): ResendFailure {
  if (!data || typeof data !== "object") {
    return { status, message: `Resend returned HTTP ${status}` };
  }
  const record = data as Record<string, unknown>;
  return {
    status,
    code: typeof record.name === "string" ? record.name : undefined,
    message:
      typeof record.message === "string"
        ? record.message.slice(0, 500)
        : `Resend returned HTTP ${status}`,
  };
}

async function sendWithResend(
  context: ReferralNotificationContext,
  fetcher: typeof fetch,
): Promise<
  | { ok: true; id?: string }
  | { ok: false; failure: ResendFailure }
  | { ok: false; notConfigured: true }
> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return { ok: false, notConfigured: true };

  const from = process.env.RESEND_FROM_EMAIL?.trim() || DEFAULT_RESEND_FROM;
  const to = notificationRecipient();

  try {
    const response = await fetcher("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `neurolinks-referral/${context.jotformSubmissionId}`,
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: referralSubject(context.fields),
        text: referralNotificationText(context),
        html: referralNotificationHtml(context),
      }),
      cache: "no-store",
    });

    let data: unknown = null;
    try {
      data = await response.json();
    } catch {
      // A non-JSON response is still a failure unless the HTTP request succeeded.
    }

    if (!response.ok) {
      return { ok: false, failure: resendFailureFromPayload(response.status, data) };
    }

    const id =
      data &&
      typeof data === "object" &&
      typeof (data as Record<string, unknown>).id === "string"
        ? ((data as Record<string, unknown>).id as string)
        : undefined;
    return { ok: true, id };
  } catch (error) {
    return {
      ok: false,
      failure: { message: safeErrorMessage(error) },
    };
  }
}

function smtpConfigured() {
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASS,
  );
}

function smtpPort() {
  const raw = Number(process.env.SMTP_PORT);
  if (Number.isInteger(raw) && raw > 0 && raw <= 65535) return raw;
  return DEFAULT_SMTP_PORT;
}

function encodeHeader(value: string) {
  if (/^[\x20-\x7E]*$/.test(value)) return value;
  return `=?UTF-8?B?${Buffer.from(value, "utf8").toString("base64")}?=`;
}

function base64Lines(value: string) {
  return (
    Buffer.from(value, "utf8")
      .toString("base64")
      .match(/.{1,76}/g)
      ?.join("\r\n") ?? ""
  );
}

function dotStuff(value: string) {
  return value.replace(/(^|\r\n)\./g, "$1..");
}

async function readSmtpReply(iterator: AsyncIterator<string>) {
  const lines: string[] = [];
  let code: number | null = null;
  while (true) {
    const next = await iterator.next();
    if (next.done) throw new Error("SMTP connection closed unexpectedly");
    const line = next.value;
    lines.push(line);
    const match = /^(\d{3})([ -])/.exec(line);
    if (!match) continue;
    if (code === null) code = Number(match[1]);
    if (match[2] === " ") return { code, lines };
  }
}

function assertSmtp(
  reply: { code: number | null; lines: string[] },
  expected: number | number[],
) {
  const allowed = Array.isArray(expected) ? expected : [expected];
  if (reply.code === null || !allowed.includes(reply.code)) {
    throw new Error(`SMTP command failed with ${reply.code ?? "unknown"}`);
  }
}

async function smtpCommand(
  socket: TLSSocket,
  iterator: AsyncIterator<string>,
  command: string,
  expected: number | number[],
) {
  socket.write(`${command}\r\n`);
  const reply = await readSmtpReply(iterator);
  assertSmtp(reply, expected);
}

async function sendSmtpFallback(args: SmtpMessage) {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) {
    throw new Error("SMTP fallback is not configured");
  }

  const fromAddress = process.env.SMTP_FROM_EMAIL?.trim() || user;
  const fromName = process.env.SMTP_FROM_NAME?.trim() || "NeuroLinks Website";
  const port = smtpPort();
  const socket = tlsConnect({
    host,
    port,
    servername: host,
    rejectUnauthorized: true,
  });
  socket.setTimeout(SMTP_TIMEOUT_MS, () =>
    socket.destroy(new Error("SMTP connection timed out")),
  );

  try {
    await once(socket, "secureConnect");
    const rl = createInterface({ input: socket, crlfDelay: Infinity });
    const iterator = rl[Symbol.asyncIterator]();
    try {
      assertSmtp(await readSmtpReply(iterator), 220);
      await smtpCommand(socket, iterator, "EHLO neurolinks.ca", 250);
      await smtpCommand(socket, iterator, "AUTH LOGIN", 334);
      await smtpCommand(
        socket,
        iterator,
        Buffer.from(user, "utf8").toString("base64"),
        334,
      );
      await smtpCommand(
        socket,
        iterator,
        Buffer.from(pass, "utf8").toString("base64"),
        235,
      );
      await smtpCommand(socket, iterator, `MAIL FROM:<${fromAddress}>`, 250);
      await smtpCommand(socket, iterator, `RCPT TO:<${args.to}>`, [250, 251]);
      await smtpCommand(socket, iterator, "DATA", 354);

      const headers = [
        `From: ${encodeHeader(fromName)} <${fromAddress}>`,
        `To: ${args.to}`,
        `Subject: ${encodeHeader(args.subject)}`,
        `Date: ${new Date().toUTCString()}`,
        "MIME-Version: 1.0",
        "Content-Type: text/plain; charset=UTF-8",
        "Content-Transfer-Encoding: base64",
      ];
      const message = `${headers.join("\r\n")}\r\n\r\n${base64Lines(args.text)}\r\n`;
      socket.write(`${dotStuff(message)}.\r\n`);
      assertSmtp(await readSmtpReply(iterator), 250);
      await smtpCommand(socket, iterator, "QUIT", 221);
    } finally {
      rl.close();
    }
  } finally {
    socket.destroy();
  }
}

async function sendFallback(
  context: ReferralNotificationContext,
  failure: ResendFailure,
  smtpSender: SmtpSender,
) {
  if (!smtpConfigured()) {
    return { referral: "not-configured" as const, alert: "not-configured" as const };
  }

  const to = notificationRecipient();
  let referral: "sent" | "failed" = "failed";
  let alert: "sent" | "failed" = "failed";

  try {
    await smtpSender({
      to,
      subject: referralSubject(context.fields),
      text: referralNotificationText(context),
    });
    referral = "sent";
  } catch (error) {
    console.error("Referral SMTP fallback message failed", {
      jotformSubmissionId: context.jotformSubmissionId,
      error: safeErrorMessage(error),
    });
  }

  try {
    await smtpSender({
      to,
      subject: `Referral notification fallback activated - Jotform ${context.jotformSubmissionId}`,
      text: fallbackAlertText(context, failure),
    });
    alert = "sent";
  } catch (error) {
    console.error("Referral SMTP fallback alert failed", {
      jotformSubmissionId: context.jotformSubmissionId,
      error: safeErrorMessage(error),
    });
  }

  return { referral, alert };
}

export async function sendReferralNotification(
  context: ReferralNotificationContext,
  fetcher: typeof fetch = globalThis.fetch,
  smtpSender: SmtpSender = sendSmtpFallback,
): Promise<ReferralNotificationResult> {
  const resend = await sendWithResend(context, fetcher);

  if (resend.ok) {
    console.info("Referral notification sent", {
      jotformSubmissionId: context.jotformSubmissionId,
      resendEmailId: resend.id,
    });
    return { primary: "sent", resendEmailId: resend.id };
  }

  if ("notConfigured" in resend) {
    console.error("Referral Resend notification is not configured", {
      jotformSubmissionId: context.jotformSubmissionId,
    });
    const fallback = await sendFallback(
      context,
      { message: "Resend is not configured" },
      smtpSender,
    );
    return {
      primary: "not-configured",
      fallbackReferral: fallback.referral,
      fallbackAlert: fallback.alert,
    };
  }

  console.error("Referral Resend notification failed", {
    jotformSubmissionId: context.jotformSubmissionId,
    status: resend.failure.status,
    code: resend.failure.code,
    error: resend.failure.message,
  });
  const fallback = await sendFallback(context, resend.failure, smtpSender);
  return {
    primary: "failed",
    fallbackReferral: fallback.referral,
    fallbackAlert: fallback.alert,
  };
}
