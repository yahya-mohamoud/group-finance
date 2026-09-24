import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export const SESSION_COOKIE_NAME = "auth_session";
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  "group-finance-auth-secret-key-32-chars-long!!";

/**
 * Sign a token using Web Crypto HMAC-SHA256 (compatible with Node & Edge runtime).
 */
export async function signToken(token: string): Promise<string> {
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
    enc.encode(token)
  );
  const signatureHex = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${token}.${signatureHex}`;
}

/**
 * Verify a signed token and extract the raw token if valid.
 */
export async function verifySignedToken(
  signedToken: string | undefined | null
): Promise<string | null> {
  if (!signedToken || !signedToken.includes(".")) {
    return null;
  }
  const [token, signatureHex] = signedToken.split(".");
  if (!token || !signatureHex) {
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
      enc.encode(token)
    );

    return isValid ? token : null;
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
 * Create a new authenticated session in database and set secure cookie.
 */
export async function createSession(): Promise<void> {
  const rawToken = generateRandomToken();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

  // Store session in DB
  await prisma.session.create({
    data: {
      token: rawToken,
      expiresAt,
    },
  });

  // Sign token for the cookie
  const signedCookieValue = await signToken(rawToken);

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

    const session = await prisma.session.findUnique({
      where: { token: rawToken },
    });

    if (!session) return false;

    // Check expiration
    if (new Date() > session.expiresAt) {
      // Clean up expired session
      await prisma.session.delete({ where: { token: rawToken } }).catch(() => {});
      return false;
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
