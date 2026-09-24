"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { PaymentFormSchema, PaymentFormData } from "@/lib/validation/schemas";
import { requireAuth } from "@/lib/auth/session";
import { ActionResult } from "./people";

export async function recordOrUpdatePayment(
  raw: PaymentFormData
): Promise<ActionResult> {
  try {
    await requireAuth();
    const validated = PaymentFormSchema.parse(raw);

    // Upsert ensures we enforce and utilize the unique constraint @@unique([personId, month, year])
    const payment = await prisma.payment.upsert({
      where: {
        personId_month_year: {
          personId: validated.personId,
          month: validated.month,
          year: validated.year,
        },
      },
      update: {
        amount: validated.amount,
        paidAt: validated.paidAt ?? new Date(),
      },
      create: {
        personId: validated.personId,
        month: validated.month,
        year: validated.year,
        amount: validated.amount,
        paidAt: validated.paidAt ?? new Date(),
      },
    });

    revalidatePath("/payments");
    revalidatePath("/dashboard");
    revalidatePath("/reports");
    revalidatePath(`/people/${validated.personId}`);

    return { success: true, data: payment };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to record payment";
    return { success: false, error: message };
  }
}

export async function deletePayment(
  paymentId: string,
  personId?: string
): Promise<ActionResult> {
  try {
    await requireAuth();
    await prisma.payment.delete({
      where: { id: paymentId },
    });

    revalidatePath("/payments");
    revalidatePath("/dashboard");
    revalidatePath("/reports");
    if (personId) {
      revalidatePath(`/people/${personId}`);
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to remove payment";
    return { success: false, error: message };
  }
}
