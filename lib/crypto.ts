import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

function getEncryptionKey() {
  const configured = process.env.LICENSE_ENCRYPTION_KEY;
  if (!configured) throw new Error("LICENSE_ENCRYPTION_KEY no está configurada.");

  const key = /^[a-f\d]{64}$/i.test(configured) ? Buffer.from(configured, "hex") : Buffer.from(configured, "base64");
  if (key.length !== 32) throw new Error("LICENSE_ENCRYPTION_KEY debe representar exactamente 32 bytes.");
  return key;
}

export function encryptSecret(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const encryptedValue = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return {
    encryptedValue: encryptedValue.toString("base64"),
    iv: iv.toString("base64"),
    authTag: cipher.getAuthTag().toString("base64"),
  };
}

export function decryptSecret(encryptedValue: string, iv: string, authTag: string) {
  const decipher = createDecipheriv("aes-256-gcm", getEncryptionKey(), Buffer.from(iv, "base64"));
  decipher.setAuthTag(Buffer.from(authTag, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(encryptedValue, "base64")), decipher.final()]).toString("utf8");
}

export function fingerprintSecret(value: string) {
  return createHmac("sha256", getEncryptionKey()).update(value).digest("hex");
}

export function hashPublicToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function publicTokenMatches(token: string, expectedHash: string) {
  const actual = Buffer.from(hashPublicToken(token), "hex");
  const expected = Buffer.from(expectedHash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function paymentReturnSecret() {
  const secret = process.env.MP_WEBHOOK_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("No hay un secreto configurado para firmar el retorno de pago.");
  return secret;
}

export function createPaymentReturnToken(orderNumber: string, outcome: "success" | "pending" | "failure") {
  const issuedAt = Math.floor(Date.now() / 1000).toString(36);
  const signature = createHmac("sha256", paymentReturnSecret()).update(`${orderNumber}:${outcome}:${issuedAt}`).digest("base64url");
  return `${issuedAt}.${signature}`;
}

export function verifyPaymentReturnToken(orderNumber: string, outcome: "success" | "pending" | "failure", token: string) {
  const [issuedAt, receivedSignature] = token.split(".");
  const timestamp = Number.parseInt(issuedAt || "", 36);
  if (!issuedAt || !receivedSignature || !Number.isFinite(timestamp)) return false;
  const ageSeconds = Math.floor(Date.now() / 1000) - timestamp;
  if (ageSeconds < -300 || ageSeconds > 48 * 60 * 60) return false;
  const expectedSignature = createHmac("sha256", paymentReturnSecret()).update(`${orderNumber}:${outcome}:${issuedAt}`).digest("base64url");
  const actual = Buffer.from(receivedSignature);
  const expected = Buffer.from(expectedSignature);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
