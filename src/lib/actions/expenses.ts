"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ExpenseFormSchema, ExpenseFormData } from "@/lib/validation/schemas";
import { requireAuth } from "@/lib/auth/session";
import { ActionResult } from "./people";

export async function getExpensesForMonth(month: number, year: number) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1); // 1st of next month

  return await prisma.expense.findMany({
    where: {
      date: {
        gte: startDate,
        lt: endDate,
      },
    },
    orderBy: {
      date: "desc",
    },
  });
}

export async function createExpense(raw: ExpenseFormData): Promise<ActionResult> {
  try {
    await requireAuth();
    const validated = ExpenseFormSchema.parse(raw);

    const expense = await prisma.expense.create({
      data: {
        description: validated.description,
        amount: validated.amount,
        date: validated.date,
      },
    });

    revalidatePath("/expenses");
    revalidatePath("/dashboard");
    revalidatePath("/reports");

    return { success: true, data: expense };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to record expense";
    return { success: false, error: message };
  }
}

export async function updateExpense(
  id: string,
  raw: ExpenseFormData
): Promise<ActionResult> {
  try {
    await requireAuth();
    const validated = ExpenseFormSchema.parse(raw);

    const updated = await prisma.expense.update({
      where: { id },
      data: {
        description: validated.description,
        amount: validated.amount,
        date: validated.date,
      },
    });

    revalidatePath("/expenses");
    revalidatePath("/dashboard");
    revalidatePath("/reports");

    return { success: true, data: updated };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update expense";
    return { success: false, error: message };
  }
}

export async function deleteExpense(id: string): Promise<ActionResult> {
  try {
    await requireAuth();
    await prisma.expense.delete({
      where: { id },
    });

    revalidatePath("/expenses");
    revalidatePath("/dashboard");
    revalidatePath("/reports");

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete expense";
    return { success: false, error: message };
  }
}
