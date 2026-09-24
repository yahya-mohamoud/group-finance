"use server";

import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  validatePinFormat,
  verifyPinHash,
  hashPin,
  ensureAdminInitialized,
} from "@/lib/auth/pin";
import {
  createSession,
  destroySession,
  requireAuth,
} from "@/lib/auth/session";
import {
  checkRateLimit,
  recordFailedAttempt,
  resetRateLimit,
  getClientIp,
} from "@/lib/auth/rate-limiter";
import { ActionResult } from "./people";

/**
 * Server action to authenticate using a 4-digit PIN.
 */
export async function loginWithPin(pin: string): Promise<ActionResult> {
  try {
    const ip = getClientIp();

    // 1. Check rate limit
    const rateLimitStatus = await checkRateLimit(ip);
    if (rateLimitStatus.isLocked) {
      return {
        success: false,
        error: "Too many attempts. Please try again later.",
      };
    }

    // 2. Validate format (strictly 4 digits)
    if (!validatePinFormat(pin)) {
      await recordFailedAttempt(ip);
      return {
        success: false,
        error: "Incorrect PIN. Please try again.",
      };
    }

    // 3. Ensure admin exists and retrieve hash
    const admin = await ensureAdminInitialized();

    // 4. Verify PIN hash
    const isMatch = await verifyPinHash(admin.pinHash, pin);

    if (!isMatch) {
      const failedResult = await recordFailedAttempt(ip);
      if (failedResult.isLockedNow) {
        return {
          success: false,
          error: "Too many attempts. Please try again later.",
        };
      }
      return {
        success: false,
        error: "Incorrect PIN. Please try again.",
      };
    }

    // 5. Successful login: reset attempts counter and create session cookie
    await resetRateLimit(ip);
    await createSession();

    return { success: true };
  } catch (err: any) {
    console.error("Login verification error:", err);
    return {
      success: false,
      error: err?.message || "Failed to verify PIN. Please try again.",
    };
  }
}

/**
 * Server action to log out, invalidate session, and clear cookies.
 */
export async function logout(): Promise<void> {
  await destroySession();
  redirect("/login");
}

/**
 * Server action to change the 4-digit PIN. Requires an active authenticated session.
 */
export async function changePin(
  currentPin: string,
  newPin: string,
  confirmNewPin: string
): Promise<ActionResult> {
  // Ensure the user is authenticated
  await requireAuth();

  // Validate format of all inputs
  if (!validatePinFormat(currentPin)) {
    return {
      success: false,
      error: "Current PIN must be exactly 4 numeric digits.",
    };
  }

  if (!validatePinFormat(newPin)) {
    return {
      success: false,
      error: "New PIN must be exactly 4 numeric digits.",
    };
  }

  if (newPin !== confirmNewPin) {
    return {
      success: false,
      error: "New PIN and confirmation PIN do not match.",
    };
  }

  // Retrieve current admin
  const admin = await ensureAdminInitialized();

  // Verify current PIN
  const isCurrentValid = await verifyPinHash(admin.pinHash, currentPin);
  if (!isCurrentValid) {
    return {
      success: false,
      error: "Current PIN is incorrect.",
    };
  }

  // Hash new PIN using Argon2id
  const newHash = await hashPin(newPin);

  // Update in database
  await prisma.admin.update({
    where: { id: admin.id },
    data: { pinHash: newHash },
  });

  return { success: true };
}
