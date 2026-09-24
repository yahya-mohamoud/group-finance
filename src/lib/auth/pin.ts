import argon2 from "argon2";
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
 * Hash a PIN using Argon2id.
 */
export async function hashPin(pin: string): Promise<string> {
  if (!validatePinFormat(pin)) {
    throw new Error("Invalid PIN format. PIN must be exactly 4 numeric digits.");
  }
  return await argon2.hash(pin, {
    type: argon2.argon2id,
  });
}

/**
 * Verify a candidate PIN against a stored Argon2id hash.
 */
export async function verifyPinHash(
  storedHash: string,
  candidatePin: string
): Promise<boolean> {
  if (!validatePinFormat(candidatePin)) {
    return false;
  }
  try {
    return await argon2.verify(storedHash, candidatePin);
  } catch {
    return false;
  }
}

/**
 * Ensures that an Admin account exists in the database.
 * If none exists, initializes one with the default PIN (1234).
 */
export async function ensureAdminInitialized() {
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
}
