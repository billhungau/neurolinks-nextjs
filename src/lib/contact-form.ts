export const CONTACT_FIELD_NAMES = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "message",
] as const;

export type ContactFieldName = (typeof CONTACT_FIELD_NAMES)[number];

export type ContactFields = Record<ContactFieldName, string>;

export const CONTACT_LIMITS = {
  firstName: 100,
  lastName: 100,
  email: 254,
  phone: 30,
  message: 5000,
} as const;

export const HONEYPOT_FIELD = "website";
export const MAX_CONTACT_BODY_BYTES = 32 * 1024;
export const JOTFORM_SUBMIT_TIMEOUT_MS = 12_000;

/** Non-sensitive origin of the shared contact form. Never include PHI. */
export const CONTACT_SOURCES = ["contact", "advertising-landing", "veterans"] as const;
export type ContactSource = (typeof CONTACT_SOURCES)[number];
export const ADVERTISING_LANDING_SOURCE = "advertising-landing" as const;
export const ADVERTISING_LANDING_MESSAGE_PREFIX = "[Advertising landing page]";
export const VETERANS_SOURCE = "veterans" as const;
export const VETERANS_MESSAGE_PREFIX = "[Veterans page]";
export const CONTACT_NAME_LIMIT = CONTACT_LIMITS.firstName + CONTACT_LIMITS.lastName;

export function jotformTimeoutMs() {
  const raw = Number(process.env.CONTACT_UPSTREAM_TIMEOUT_MS);
  if (Number.isFinite(raw) && raw >= 1) return raw;
  return JOTFORM_SUBMIT_TIMEOUT_MS;
}

export const CONTACT_SUCCESS_MESSAGE = "Thank you. Your message has been sent.";
export const CONTACT_ERROR_MESSAGE = "We couldn't send your message. Please try again.";
export const CONTACT_ERROR_WITH_PHONE =
  "We couldn't send your message. Please try again or contact the clinic by phone.";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const FIELD_LABELS: Record<ContactFieldName, string> = {
  firstName: "First name",
  lastName: "Last name",
  email: "Email",
  phone: "Phone",
  message: "Message",
};

export type ContactFieldErrors = Partial<
  Record<ContactFieldName | "name", string>
>;

export type ValidatedContact =
  | { ok: true; fields: ContactFields; honeypot: boolean }
  | { ok: false; errors: ContactFieldErrors };

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function trimContactFields(input: Partial<Record<string, unknown>>): ContactFields {
  return {
    firstName: asString(input.firstName).trim(),
    lastName: asString(input.lastName).trim(),
    email: asString(input.email).trim(),
    phone: asString(input.phone).trim(),
    message: asString(input.message).trim(),
  };
}

export function validateContactFields(fields: ContactFields): ContactFieldErrors {
  const errors: ContactFieldErrors = {};

  if (!fields.firstName) {
    errors.firstName = "Enter your first name.";
  } else if (fields.firstName.length > CONTACT_LIMITS.firstName) {
    errors.firstName = `First name must be ${CONTACT_LIMITS.firstName} characters or fewer.`;
  }

  if (!fields.lastName) {
    errors.lastName = "Enter your last name.";
  } else if (fields.lastName.length > CONTACT_LIMITS.lastName) {
    errors.lastName = `Last name must be ${CONTACT_LIMITS.lastName} characters or fewer.`;
  }

  if (!fields.email) {
    errors.email = "Enter your email address.";
  } else if (fields.email.length > CONTACT_LIMITS.email || !EMAIL_PATTERN.test(fields.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!fields.phone) {
    errors.phone = "Enter your phone number.";
  } else if (fields.phone.length > CONTACT_LIMITS.phone) {
    errors.phone = `Phone number must be ${CONTACT_LIMITS.phone} characters or fewer.`;
  }

  if (!fields.message) {
    errors.message = "Enter a message.";
  } else if (fields.message.length > CONTACT_LIMITS.message) {
    errors.message = `Message must be ${CONTACT_LIMITS.message.toLocaleString("en-CA")} characters or fewer.`;
  }

  return errors;
}

export function splitPersonName(name: string): Pick<ContactFields, "firstName" | "lastName"> {
  const trimmed = name.trim();
  const breakAt = trimmed.search(/\s+/);
  if (breakAt === -1) {
    return { firstName: trimmed, lastName: "-" };
  }
  return {
    firstName: trimmed.slice(0, breakAt),
    lastName: trimmed.slice(breakAt).trim() || "-",
  };
}

function parseVeteransContactPayload(
  record: Record<string, unknown>,
  honeypot: boolean,
): ValidatedContact {
  const name = asString(record.name).trim() ||
    [asString(record.firstName), asString(record.lastName)].filter(Boolean).join(" ").trim();
  const email = asString(record.email).trim();
  const phone = asString(record.phone).trim();
  const message = asString(record.message).trim();
  const errors: ContactFieldErrors = {};

  if (!name) {
    errors.name = "Enter your name.";
  } else if (name.length > CONTACT_NAME_LIMIT) {
    errors.name = `Name must be ${CONTACT_NAME_LIMIT} characters or fewer.`;
  }

  if (!email) {
    errors.email = "Enter your email address.";
  } else if (email.length > CONTACT_LIMITS.email || !EMAIL_PATTERN.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (phone.length > CONTACT_LIMITS.phone) {
    errors.phone = `Phone number must be ${CONTACT_LIMITS.phone} characters or fewer.`;
  }

  if (!message) {
    errors.message = "Enter a message.";
  } else if (message.length > CONTACT_LIMITS.message) {
    errors.message = `Message must be ${CONTACT_LIMITS.message.toLocaleString("en-CA")} characters or fewer.`;
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  const { firstName, lastName } = splitPersonName(name);
  return {
    ok: true,
    fields: {
      firstName,
      lastName,
      email,
      phone,
      message,
    },
    honeypot,
  };
}

export function parseContactPayload(raw: unknown): ValidatedContact {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {
      ok: false,
      errors: { message: CONTACT_ERROR_MESSAGE },
    };
  }

  const record = raw as Record<string, unknown>;
  const honeypot = asString(record[HONEYPOT_FIELD]).trim().length > 0;
  if (parseContactSource(record.source) === VETERANS_SOURCE) {
    return parseVeteransContactPayload(record, honeypot);
  }

  const fields = trimContactFields(record);
  const errors = validateContactFields(fields);
  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, fields, honeypot };
}

export function parseContactSource(raw: unknown): ContactSource {
  if (raw === ADVERTISING_LANDING_SOURCE) return ADVERTISING_LANDING_SOURCE;
  if (raw === VETERANS_SOURCE) return VETERANS_SOURCE;
  return "contact";
}

export function jotformMessageForSource(message: string, source: ContactSource): string {
  if (source === ADVERTISING_LANDING_SOURCE) {
    return `${ADVERTISING_LANDING_MESSAGE_PREFIX}\n\n${message}`;
  }
  if (source === VETERANS_SOURCE) {
    return `${VETERANS_MESSAGE_PREFIX}\n\n${message}`;
  }
  return message;
}

export function jotformSubmissionBody(
  fields: ContactFields,
  source: ContactSource = "contact",
): URLSearchParams {
  const submission = new URLSearchParams();
  submission.set("submission[2_first]", fields.firstName);
  submission.set("submission[2_last]", fields.lastName);
  submission.set("submission[3]", fields.email);
  submission.set("submission[4_full]", fields.phone);
  submission.set("submission[5]", jotformMessageForSource(fields.message, source));
  return submission;
}

export function isJotformSuccessPayload(data: unknown): boolean {
  if (!data || typeof data !== "object") return false;
  const record = data as Record<string, unknown>;
  const code = record.responseCode;
  if (code !== 200 && code !== "200") return false;
  const content = record.content;
  if (!content || typeof content !== "object") return false;
  const id = (content as Record<string, unknown>).submissionID;
  return typeof id === "string" && id.length > 0;
}

export function originIsAllowed(request: Request): boolean {
  const originHeader = request.headers.get("origin");
  if (!originHeader) return true;

  let incoming: string;
  try {
    incoming = new URL(originHeader).origin;
  } catch {
    return false;
  }

  const allowed = new Set<string>();
  const add = (value: string | null | undefined) => {
    if (!value) return;
    try {
      allowed.add(new URL(value).origin);
    } catch {
      try {
        allowed.add(new URL(`https://${value}`).origin);
      } catch {
        /* ignore unparseable hosts */
      }
    }
  };

  add("https://neurolinks.ca");
  add("https://www.neurolinks.ca");
  add(process.env.NEXT_PUBLIC_SITE_URL);
  if (process.env.VERCEL_URL) add(`https://${process.env.VERCEL_URL.replace(/\/$/, "")}`);
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    add(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/$/, "")}`);
  }

  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  if (host) {
    add(`${proto}://${host}`);
    add(`https://${host}`);
    add(`http://${host}`);
  }

  return allowed.has(incoming);
}

export function createSubmitLock() {
  let locked = false;
  return {
    tryAcquire() {
      if (locked) return false;
      locked = true;
      return true;
    },
    release() {
      locked = false;
    },
  };
}

export const JOTFORM_FIELD_KEYS = [
  "submission[2_first]",
  "submission[2_last]",
  "submission[3]",
  "submission[4_full]",
  "submission[5]",
] as const;
