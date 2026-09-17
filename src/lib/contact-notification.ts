import { once } from "node:events";
import { createInterface } from "node:readline";
import { connect as tlsConnect, type TLSSocket } from "node:tls";

import type { ContactFields, ContactSource } from "./contact-form.ts";

type NotificationContext = { fields: ContactFields; source: ContactSource; jotformSubmissionId: string };
type NotificationResult = { primary: "sent" | "failed" | "not-configured"; resendEmailId?: string; fallbackContact?: "sent" | "failed" | "not-configured"; fallbackAlert?: "sent" | "failed" | "not-configured" };
type ResendFailure = { status?: number; code?: string; message: string };
type SmtpMessage = { to: string; replyTo?: string; subject: string; text: string };
type SmtpSender = (message: SmtpMessage) => Promise<void>;

const DEFAULT_NOTIFICATION_TO = "contact@neurolinks.ca";
const DEFAULT_RESEND_FROM = "NeuroLinks Website <notifications@neurolinks.ca>";
const DEFAULT_SMTP_PORT = 465;
const SMTP_TIMEOUT_MS = 10_000;

function fullName(fields: ContactFields) { return `${fields.firstName} ${fields.lastName}`.trim(); }
function contactSubject(fields: ContactFields) { return `New website inquiry — ${fullName(fields)}`; }
function sourceLabel(source: ContactSource) { if (source === "advertising-landing") return "Advertising landing page"; if (source === "veterans") return "Veterans TMS page"; return "Contact page"; }
function sourcePath(source: ContactSource) { if (source === "advertising-landing") return "/neurolinks-psychiatry-nanaimo-bc/"; if (source === "veterans") return "/veterans-tms-treatment/"; return "/contact/"; }
function formatPhone(value: string) {
  if (!value) return "Not provided";
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  if (digits.length === 11 && digits.startsWith("1")) return `1-${digits.slice(1, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
  return value;
}
function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
function normalContactText(context: NotificationContext) {
  const { fields, source } = context;
  return [
    `New website inquiry from ${fullName(fields)}`,
    "",
    `Email: ${fields.email}`,
    `Phone: ${formatPhone(fields.phone)}`,
    "",
    "Message",
    fields.message,
    "",
    `Submitted through neurolinks.ca${sourcePath(source)}`,
  ].join("\n");
}
function contactNotificationHtml(context: NotificationContext) {
  const { fields, source } = context;
  const name = escapeHtml(fullName(fields));
  const email = escapeHtml(fields.email);
  const phone = escapeHtml(formatPhone(fields.phone));
  const message = escapeHtml(fields.message).replace(/\n/g, "<br>");
  const path = sourcePath(source);
  const pageLabel = escapeHtml(sourceLabel(source));

  return `<!doctype html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="format-detection" content="telephone=no">
  <meta name="x-apple-disable-message-reformatting">
  <style>
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; }
  </style>
</head>
<body style="margin:0;padding:0;background:#f5f7f9;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#f5f7f9;">
    <tr>
      <td align="center" style="padding:28px 12px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:520px;background:#ffffff;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">
          <tr>
            <td style="padding:24px 26px 20px;border-bottom:1px solid #e8edf2;">
              <div style="font-size:12px;line-height:18px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#355b7d;">New Website Inquiry</div>
              <div style="margin-top:5px;font-size:22px;line-height:29px;font-weight:700;color:#172b3f;">${name}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:22px 26px 10px;">
              <div style="margin:0 0 10px;font-size:13px;line-height:18px;font-weight:700;color:#355b7d;">CONTACT INFORMATION</div>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;">
                <tr>
                  <td width="28%" style="padding:11px 12px;background:#f7f9fb;border-bottom:1px solid #e2e8f0;font-size:13px;line-height:19px;font-weight:700;color:#475569;">Email</td>
                  <td style="padding:11px 12px;border-bottom:1px solid #e2e8f0;font-size:14px;line-height:20px;color:#1f2937;"><a href="mailto:${email}" style="color:#245f8f;text-decoration:underline;">${email}</a></td>
                </tr>
                <tr>
                  <td width="28%" style="padding:11px 12px;background:#f7f9fb;font-size:13px;line-height:19px;font-weight:700;color:#475569;">Phone</td>
                  <td style="padding:11px 12px;font-size:14px;line-height:20px;color:#1f2937;text-decoration:none;">${phone}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:14px 26px 24px;">
              <div style="margin:0 0 10px;font-size:13px;line-height:18px;font-weight:700;color:#355b7d;">MESSAGE</div>
              <div style="padding:14px 15px;background:#f7f9fb;border:1px solid #e2e8f0;border-radius:6px;font-size:14px;line-height:21px;color:#1f2937;">${message}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:14px 26px 18px;border-top:1px solid #e8edf2;font-size:11px;line-height:17px;color:#7a8794;">
              Submitted through <span style="color:#5d6b78;">neurolinks.ca${path}</span> · ${pageLabel}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
function fallbackAlertText(context: NotificationContext, failure: ResendFailure) { return ["The normal NeuroLinks website notification could not be sent through Resend.", "", "A separate clean contact email was attempted through the SMTP fallback so staff can reply directly to the patient.", "The submission itself was already saved successfully in Jotform.", "", "Please check Jotform for the official submission record.", "", `Jotform submission ID: ${context.jotformSubmissionId}`, `Source: ${sourceLabel(context.source)}`, `Resend status: ${failure.status ?? "Unavailable"}`, `Resend code: ${failure.code ?? "Unavailable"}`, `Resend error: ${failure.message}`, `Failure time: ${new Date().toISOString()}`].join("\n"); }
function safeErrorMessage(value: unknown) { if (value instanceof Error) return value.message.slice(0, 500); if (typeof value === "string") return value.slice(0, 500); return "Unknown error"; }
function resendFailureFromPayload(status: number, data: unknown): ResendFailure { if (!data || typeof data !== "object") return { status, message: `Resend returned HTTP ${status}` }; const record = data as Record<string, unknown>; return { status, code: typeof record.name === "string" ? record.name : undefined, message: typeof record.message === "string" ? record.message.slice(0, 500) : `Resend returned HTTP ${status}` }; }

async function sendWithResend(context: NotificationContext, fetcher: typeof fetch): Promise<{ ok: true; id?: string } | { ok: false; failure: ResendFailure } | { ok: false; notConfigured: true }> {
  const apiKey = process.env.RESEND_API_KEY?.trim(); if (!apiKey) return { ok: false, notConfigured: true };
  const from = process.env.RESEND_FROM_EMAIL?.trim() || DEFAULT_RESEND_FROM;
  const to = process.env.CONTACT_NOTIFICATION_EMAIL?.trim() || DEFAULT_NOTIFICATION_TO;
  try {
    const response = await fetcher("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "Idempotency-Key": `neurolinks-contact/${context.jotformSubmissionId}` }, body: JSON.stringify({ from, to: [to], reply_to: context.fields.email, subject: contactSubject(context.fields), text: normalContactText(context), html: contactNotificationHtml(context) }), cache: "no-store" });
    let data: unknown = null; try { data = await response.json(); } catch {}
    if (!response.ok) return { ok: false, failure: resendFailureFromPayload(response.status, data) };
    const id = data && typeof data === "object" && typeof (data as Record<string, unknown>).id === "string" ? (data as Record<string, unknown>).id as string : undefined;
    return { ok: true, id };
  } catch (error) { return { ok: false, failure: { message: safeErrorMessage(error) } }; }
}

function smtpConfigured() { return Boolean(process.env.SMTP_HOST?.trim() && process.env.SMTP_USER?.trim() && process.env.SMTP_PASS); }
function smtpPort() { const raw = Number(process.env.SMTP_PORT); return Number.isInteger(raw) && raw > 0 && raw <= 65535 ? raw : DEFAULT_SMTP_PORT; }
function encodeHeader(value: string) { return /^[\x20-\x7E]*$/.test(value) ? value : `=?UTF-8?B?${Buffer.from(value, "utf8").toString("base64")}?=`; }
function base64Lines(value: string) { return Buffer.from(value, "utf8").toString("base64").match(/.{1,76}/g)?.join("\r\n") ?? ""; }
function dotStuff(value: string) { return value.replace(/(^|\r\n)\./g, "$1.."); }
async function readSmtpReply(iterator: AsyncIterator<string>) { const lines: string[] = []; let code: number | null = null; while (true) { const next = await iterator.next(); if (next.done) throw new Error("SMTP connection closed unexpectedly"); const line = next.value; lines.push(line); const match = /^(\d{3})([ -])/.exec(line); if (!match) continue; if (code === null) code = Number(match[1]); if (match[2] === " ") return { code, lines }; } }
function assertSmtp(reply: { code: number | null; lines: string[] }, expected: number | number[]) { const allowed = Array.isArray(expected) ? expected : [expected]; if (reply.code === null || !allowed.includes(reply.code)) throw new Error(`SMTP command failed with ${reply.code ?? "unknown"}`); }
async function smtpCommand(socket: TLSSocket, iterator: AsyncIterator<string>, command: string, expected: number | number[]) { socket.write(`${command}\r\n`); assertSmtp(await readSmtpReply(iterator), expected); }
async function sendSmtpFallback(args: SmtpMessage) {
  const host = process.env.SMTP_HOST?.trim(), user = process.env.SMTP_USER?.trim(), pass = process.env.SMTP_PASS; if (!host || !user || !pass) throw new Error("SMTP fallback is not configured");
  const fromAddress = process.env.SMTP_FROM_EMAIL?.trim() || user, fromName = process.env.SMTP_FROM_NAME?.trim() || "NeuroLinks Website";
  const socket = tlsConnect({ host, port: smtpPort(), servername: host, rejectUnauthorized: true }); socket.setTimeout(SMTP_TIMEOUT_MS, () => socket.destroy(new Error("SMTP connection timed out")));
  try { await once(socket, "secureConnect"); const rl = createInterface({ input: socket, crlfDelay: Infinity }); const iterator = rl[Symbol.asyncIterator](); try { assertSmtp(await readSmtpReply(iterator), 220); await smtpCommand(socket, iterator, "EHLO neurolinks.ca", 250); await smtpCommand(socket, iterator, "AUTH LOGIN", 334); await smtpCommand(socket, iterator, Buffer.from(user, "utf8").toString("base64"), 334); await smtpCommand(socket, iterator, Buffer.from(pass, "utf8").toString("base64"), 235); await smtpCommand(socket, iterator, `MAIL FROM:<${fromAddress}>`, 250); await smtpCommand(socket, iterator, `RCPT TO:<${args.to}>`, [250, 251]); await smtpCommand(socket, iterator, "DATA", 354); const headers = [`From: ${encodeHeader(fromName)} <${fromAddress}>`, `To: ${args.to}`, args.replyTo ? `Reply-To: ${args.replyTo}` : null, `Subject: ${encodeHeader(args.subject)}`, `Date: ${new Date().toUTCString()}`, "MIME-Version: 1.0", "Content-Type: text/plain; charset=UTF-8", "Content-Transfer-Encoding: base64"].filter(Boolean); const message = `${headers.join("\r\n")}\r\n\r\n${base64Lines(args.text)}\r\n`; socket.write(`${dotStuff(message)}.\r\n`); assertSmtp(await readSmtpReply(iterator), 250); await smtpCommand(socket, iterator, "QUIT", 221); } finally { rl.close(); } } finally { socket.destroy(); }
}

async function sendFallback(context: NotificationContext, failure: ResendFailure, smtpSender: SmtpSender) {
  if (!smtpConfigured()) return { contact: "not-configured" as const, alert: "not-configured" as const };
  const to = process.env.CONTACT_NOTIFICATION_EMAIL?.trim() || DEFAULT_NOTIFICATION_TO; let contact: "sent" | "failed" = "failed", alert: "sent" | "failed" = "failed";
  try { await smtpSender({ to, replyTo: context.fields.email, subject: contactSubject(context.fields), text: normalContactText(context) }); contact = "sent"; } catch (error) { console.error("Contact SMTP fallback message failed", { jotformSubmissionId: context.jotformSubmissionId, error: safeErrorMessage(error) }); }
  try { await smtpSender({ to, subject: `Website notification fallback activated - Jotform ${context.jotformSubmissionId}`, text: fallbackAlertText(context, failure) }); alert = "sent"; } catch (error) { console.error("Contact SMTP fallback alert failed", { jotformSubmissionId: context.jotformSubmissionId, error: safeErrorMessage(error) }); }
  return { contact, alert };
}

export async function sendContactNotification(context: NotificationContext, fetcher: typeof fetch = globalThis.fetch, smtpSender: SmtpSender = sendSmtpFallback): Promise<NotificationResult> {
  const resend = await sendWithResend(context, fetcher);
  if (resend.ok) { console.info("Contact notification sent", { jotformSubmissionId: context.jotformSubmissionId, resendEmailId: resend.id }); return { primary: "sent", resendEmailId: resend.id }; }
  if ("notConfigured" in resend) { console.error("Contact Resend notification is not configured", { jotformSubmissionId: context.jotformSubmissionId }); const fallback = await sendFallback(context, { message: "Resend is not configured" }, smtpSender); return { primary: "not-configured", fallbackContact: fallback.contact, fallbackAlert: fallback.alert }; }
  console.error("Contact Resend notification failed", { jotformSubmissionId: context.jotformSubmissionId, status: resend.failure.status, code: resend.failure.code, error: resend.failure.message }); const fallback = await sendFallback(context, resend.failure, smtpSender); return { primary: "failed", fallbackContact: fallback.contact, fallbackAlert: fallback.alert };
}
