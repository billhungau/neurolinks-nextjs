import { createCipheriv, createDecipheriv, createHmac, randomBytes } from "node:crypto";
import { clinicalConfig } from "./config";

const KEY_NAMESPACE = "neurolinks:invitation-token-encryption:v1";
const VERSION = "v1";

function encryptionKey(): Buffer {
  const { pseudonymizationKeyV1 } = clinicalConfig();
  return createHmac("sha256", pseudonymizationKeyV1)
    .update(KEY_NAMESPACE, "utf8")
    .digest();
}

export function encryptInvitationToken(rawToken: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(rawToken, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return [VERSION, iv.toString("base64url"), tag.toString("base64url"), ciphertext.toString("base64url")].join(".");
}

export function decryptInvitationToken(payload: string): string | null {
  try {
    const [version, ivText, tagText, ciphertextText] = payload.split(".");
    if (version !== VERSION || !ivText || !tagText || !ciphertextText) return null;
    const decipher = createDecipheriv(
      "aes-256-gcm",
      encryptionKey(),
      Buffer.from(ivText, "base64url"),
    );
    decipher.setAuthTag(Buffer.from(tagText, "base64url"));
    return Buffer.concat([
      decipher.update(Buffer.from(ciphertextText, "base64url")),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    return null;
  }
}
