"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { PersonFormSchema, PersonFormData } from "@/lib/validation/schemas";
import { requireAuth } from "@/lib/auth/session";

export type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function getPeople() {
  return await prisma.person.findMany({
    orderBy: [
      { active: "desc" },
      { name: "asc" },
    ],
  });
}

export async function getPersonById(id: string) {
  return await prisma.person.findUnique({
    where: { id },
    include: {
      payments: {
        orderBy: [
          { year: "desc" },
          { month: "desc" },
        ],
      },
    },
  });
}

export async function createPerson(raw: PersonFormData): Promise<ActionResult> {
  try {
    await requireAuth();
    const validated = PersonFormSchema.parse(raw);

    const created = await prisma.person.create({
      data: {
        name: validated.name,
        phone: validated.phone,
        monthlyFee: validated.monthlyFee,
        active: validated.active ?? true,
      },
    });

    revalidatePath("/people");
    revalidatePath("/payments");
    revalidatePath("/dashboard");
    revalidatePath("/reports");

    return { success: true, data: created };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to register person";
    return { success: false, error: message };
  }
}

export async function updatePerson(
  id: string,
  raw: Partial<PersonFormData>
): Promise<ActionResult> {
  try {
    await requireAuth();
    const validated = PersonFormSchema.partial().parse(raw);

    const updated = await prisma.person.update({
      where: { id },
      data: validated,
    });

    revalidatePath("/people");
    revalidatePath(`/people/${id}`);
    revalidatePath("/payments");
    revalidatePath("/dashboard");
    revalidatePath("/reports");

    return { success: true, data: updated };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update person";
    return { success: false, error: message };
  }
}

export async function togglePersonStatus(
  id: string,
  active: boolean
): Promise<ActionResult> {
  try {
    await requireAuth();
    const updated = await prisma.person.update({
      where: { id },
      data: { active },
    });

    revalidatePath("/people");
    revalidatePath(`/people/${id}`);
    revalidatePath("/payments");
    revalidatePath("/dashboard");
    revalidatePath("/reports");

    return { success: true, data: updated };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to change status";
    return { success: false, error: message };
  }
}

export async function deletePersonSafely(id: string): Promise<ActionResult> {
  try {
    await requireAuth();
    const paymentCount = await prisma.payment.count({
      where: { personId: id },
    });

    if (paymentCount > 0) {
      return {
        success: false,
        error:
          "Cannot permanently delete a person who has payment history. Please deactivate them instead to preserve historical records.",
      };
    }

    await prisma.person.delete({
      where: { id },
    });

    revalidatePath("/people");
    revalidatePath("/payments");
    revalidatePath("/dashboard");
    revalidatePath("/reports");

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete person";
    return { success: false, error: message };
  }
}
