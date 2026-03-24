import { createHmac, timingSafeEqual } from "node:crypto";

const SESSION_COOKIE = "session";
const ONE_DAY_SECONDS = 60 * 60 * 24;

function getSecret() {
  return (
    process.env.JWT_SECRET ||
    process.env.SESSION_SECRET ||
    "dev-only-secret-change-me"
  );
}

function toBase64Url(value: string) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (normalized.length % 4)) % 4);
  return Buffer.from(normalized + padding, "base64").toString("utf8");
}

function signJwt(unsignedToken: string) {
  return createHmac("sha256", getSecret())
    .update(unsignedToken)
    .digest("base64url");
}

export function createSessionValue(email: string) {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    email,
    iat: now,
    exp: now + ONE_DAY_SECONDS,
  };

  const encodedHeader = toBase64Url(JSON.stringify(header));
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const unsigned = `${encodedHeader}.${encodedPayload}`;
  const signature = signJwt(unsigned);
  return `${unsigned}.${signature}`;
}

export function readEmailFromSession(value?: string) {
  if (!value) return null;
  const parts = value.split(".");
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, incomingSignature] = parts;
  if (!encodedHeader || !encodedPayload || !incomingSignature) return null;

  const unsigned = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = signJwt(unsigned);

  const incoming = Buffer.from(incomingSignature);
  const expected = Buffer.from(expectedSignature);
  if (incoming.length !== expected.length) return null;
  if (!timingSafeEqual(incoming, expected)) return null;

  try {
    const payloadRaw = fromBase64Url(encodedPayload);
    const payload = JSON.parse(payloadRaw) as {
      email?: string;
      exp?: number;
    };

    if (!payload.email || typeof payload.exp !== "number") return null;
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp <= now) return null;

    return payload.email;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
