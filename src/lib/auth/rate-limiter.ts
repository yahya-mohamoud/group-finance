import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export const MAX_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

// In-memory fallback in case of transient database issues
const inMemoryAttempts = new Map<
  string,
  { attempts: number; lockedUntil: number | null }
>();

/**
 * Extract client IP address from headers.
 */
export function getClientIp(): string {
  try {
    const headersList = headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    if (forwardedFor) {
      return forwardedFor.split(",")[0].trim();
    }
    const realIp = headersList.get("x-real-ip");
    if (realIp) {
      return realIp.trim();
    }
  } catch {
    // If called outside of request context (e.g. tests)
  }
  return "127.0.0.1";
}

/**
 * Check if the given IP address is currently locked out.
 * Returns { isLocked: boolean, remainingMinutes?: number }
 */
export async function checkRateLimit(ip: string): Promise<{
  isLocked: boolean;
  remainingMinutes?: number;
}> {
  const now = new Date();

  try {
    const record = await prisma.loginAttempt.findUnique({
      where: { ipAddress: ip },
    });

    if (record?.lockedUntil && record.lockedUntil > now) {
      const remainingMs = record.lockedUntil.getTime() - now.getTime();
      const remainingMinutes = Math.max(1, Math.ceil(remainingMs / (60 * 1000)));
      return { isLocked: true, remainingMinutes };
    }

    // If lockout period expired, reset attempts
    if (record?.lockedUntil && record.lockedUntil <= now) {
      await prisma.loginAttempt.update({
        where: { ipAddress: ip },
        data: { attempts: 0, lockedUntil: null },
      });
    }

    return { isLocked: false };
  } catch {
    // In-memory fallback
    const mem = inMemoryAttempts.get(ip);
    if (mem?.lockedUntil && mem.lockedUntil > Date.now()) {
      const remainingMinutes = Math.max(
        1,
        Math.ceil((mem.lockedUntil - Date.now()) / (60 * 1000))
      );
      return { isLocked: true, remainingMinutes };
    }
    return { isLocked: false };
  }
}

/**
 * Record a failed attempt for an IP address.
 * Locks out if attempts reach MAX_ATTEMPTS.
 */
export async function recordFailedAttempt(ip: string): Promise<{
  isLockedNow: boolean;
  attemptsLeft: number;
}> {
  const now = new Date();

  try {
    const existing = await prisma.loginAttempt.findUnique({
      where: { ipAddress: ip },
    });

    const currentAttempts = (existing?.attempts || 0) + 1;
    const shouldLock = currentAttempts >= MAX_ATTEMPTS;
    const lockedUntil = shouldLock
      ? new Date(now.getTime() + LOCKOUT_DURATION_MS)
      : null;

    await prisma.loginAttempt.upsert({
      where: { ipAddress: ip },
      update: {
        attempts: currentAttempts,
        lockedUntil,
      },
      create: {
        ipAddress: ip,
        attempts: currentAttempts,
        lockedUntil,
      },
    });

    return {
      isLockedNow: shouldLock,
      attemptsLeft: Math.max(0, MAX_ATTEMPTS - currentAttempts),
    };
  } catch {
    // In-memory fallback
    const mem = inMemoryAttempts.get(ip) || { attempts: 0, lockedUntil: null };
    mem.attempts += 1;
    const shouldLock = mem.attempts >= MAX_ATTEMPTS;
    if (shouldLock) {
      mem.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
    }
    inMemoryAttempts.set(ip, mem);

    return {
      isLockedNow: shouldLock,
      attemptsLeft: Math.max(0, MAX_ATTEMPTS - mem.attempts),
    };
  }
}

/**
 * Reset rate limit tracking for an IP address upon successful login.
 */
export async function resetRateLimit(ip: string): Promise<void> {
  inMemoryAttempts.delete(ip);
  try {
    await prisma.loginAttempt.delete({
      where: { ipAddress: ip },
    });
  } catch {
    // Ignored if table does not exist or record already removed
  }
}
