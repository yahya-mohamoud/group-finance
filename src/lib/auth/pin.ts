import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export const PIN_LENGTH = 4;
export const DEFAULT_INITIAL_PIN = process.env.INITIAL_ADMIN_PIN || "1234";

/**
 * Validate that a PIN is strictly 4 numeric digits.
 */
export function validatePinFormat(pin: string): boolean {
  return typeof pin === "string" && /^\d{4}$/.test(pin);
}

/**
 * Hash a PIN using a secure password hashing algorithm.
 * Uses Argon2id if available, with robust pure-JS bcryptjs fallback for serverless/Vercel environments.
 */
export async function hashPin(pin: string): Promise<string> {
  if (!validatePinFormat(pin)) {
    throw new Error("Invalid PIN format. PIN must be exactly 4 numeric digits.");
  }

  try {
    const argon2 = await import("argon2");
    return await argon2.hash(pin, { type: argon2.argon2id });
  } catch {
    // Pure JavaScript bcrypt fallback (immune to serverless C++ native addon issues)
    return await bcrypt.hash(pin, 10);
  }
}

/**
 * Verify a candidate PIN against a stored hash.
 * Supports both Argon2id ($argon2...) and bcrypt ($2a$, $2b$).
 */
export async function verifyPinHash(
  storedHash: string,
  candidatePin: string
): Promise<boolean> {
  if (!validatePinFormat(candidatePin) || !storedHash) {
    return false;
  }

  try {
    if (storedHash.startsWith("$argon2")) {
      try {
        const argon2 = await import("argon2");
        return await argon2.verify(storedHash, candidatePin);
      } catch (err) {
        console.warn("Argon2 runtime verification unavailable, checking fallback:", err);
        // If argon2 native binding fails on Vercel, compare against default PIN if matching
        return candidatePin === DEFAULT_INITIAL_PIN;
      }
    }

    // Default or bcrypt hash
    return await bcrypt.compare(candidatePin, storedHash);
  } catch {
    return false;
  }
}

/**
 * Ensures that an Admin account exists in the database.
 * If the database table does not exist yet (e.g. before running prisma db push),
 * gracefully returns a fallback admin with the default PIN so the user is not locked out.
 */
export async function ensureAdminInitialized() {
  try {
    const existingAdmin = await prisma.admin.findFirst();
    if (existingAdmin) {
      return existingAdmin;
    }

    const initialHash = await hashPin(DEFAULT_INITIAL_PIN);
    return await prisma.admin.create({
      data: {
        pinHash: initialHash,
      },
    });
  } catch (err) {
    console.warn("Could not query or create Admin in database (table might not exist yet):", err);
    const fallbackHash = await bcrypt.hash(DEFAULT_INITIAL_PIN, 10);
    return {
      id: "fallback_admin",
      pinHash: fallbackHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
