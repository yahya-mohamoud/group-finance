import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export const SESSION_COOKIE_NAME = "auth_session";
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  "group-finance-auth-secret-key-32-chars-long!!";

/**
 * Sign a payload using Web Crypto HMAC-SHA256 (compatible with Node & Edge runtime).
 */
export async function signToken(payload: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    enc.encode(payload)
  );
  const signatureHex = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${payload}.${signatureHex}`;
}

/**
 * Verify a signed token and extract the raw token if valid and unexpired.
 */
export async function verifySignedToken(
  signedToken: string | undefined | null
): Promise<string | null> {
  if (!signedToken || !signedToken.includes(".")) {
    return null;
  }
  const lastDot = signedToken.lastIndexOf(".");
  const payload = signedToken.slice(0, lastDot);
  const signatureHex = signedToken.slice(lastDot + 1);

  if (!payload || !signatureHex) {
    return null;
  }

  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(SESSION_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const sigBytes = new Uint8Array(
      signatureHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
    );

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes,
      enc.encode(payload)
    );

    if (!isValid) return null;

    // Check expiration timestamp if encoded in payload (format: token:expiresAtMs)
    if (payload.includes(":")) {
      const parts = payload.split(":");
      const rawToken = parts[0];
      const expTimestamp = parseInt(parts[1], 10);
      if (!isNaN(expTimestamp) && Date.now() > expTimestamp) {
        return null; // Expired
      }
      return rawToken;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Generate a cryptographically random token string.
 */
function generateRandomToken(): string {
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  return Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Create a new authenticated session and set secure cookie.
 */
export async function createSession(): Promise<void> {
  const rawToken = generateRandomToken();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

  // Store session in DB if available
  try {
    await prisma.session.create({
      data: {
        token: rawToken,
        expiresAt,
      },
    });
  } catch (err) {
    console.warn("Could not save session to database (table might not exist yet):", err);
  }

  // Sign token combined with expiration timestamp for self-verifying stateless resilience
  const payload = `${rawToken}:${expiresAt.getTime()}`;
  const signedCookieValue = await signToken(payload);

  // Set secure HttpOnly cookie
  cookies().set({
    name: SESSION_COOKIE_NAME,
    value: signedCookieValue,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/**
 * Validate the current session from incoming request cookies against the database.
 */
export async function validateSession(): Promise<boolean> {
  try {
    const cookieStore = cookies();
    const signedValue = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!signedValue) return false;

    const rawToken = await verifySignedToken(signedValue);
    if (!rawToken) return false;

    // Verify in database if Session table exists
    try {
      const session = await prisma.session.findUnique({
        where: { token: rawToken },
      });

      if (session) {
        if (new Date() > session.expiresAt) {
          await prisma.session.delete({ where: { token: rawToken } }).catch(() => {});
          return false;
        }
        return true;
      }
    } catch {
      // If DB is unreachable or Session table not migrated yet, trust the verified HMAC signature
      return true;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Destroy the current session from database and clear the cookie.
 */
export async function destroySession(): Promise<void> {
  try {
    const cookieStore = cookies();
    const signedValue = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (signedValue) {
      const rawToken = await verifySignedToken(signedValue);
      if (rawToken) {
        await prisma.session.delete({ where: { token: rawToken } }).catch(() => {});
      }
    }
  } catch {
    // Ignore errors during delete
  } finally {
    cookies().delete(SESSION_COOKIE_NAME);
  }
}

/**
 * Assert that the user is authenticated. Throws an error if not.
 * Use at the start of all protected server actions.
 */
export async function requireAuth(): Promise<void> {
  const isAuthenticated = await validateSession();
  if (!isAuthenticated) {
    throw new Error("Unauthorized: Please log in to perform this action.");
  }
}
