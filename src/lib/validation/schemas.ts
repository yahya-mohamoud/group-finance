import { z } from "zod";

export const PersonFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(120, "Name is too long"),
  phone: z
    .string()
    .trim()
    .min(3, "Valid phone number is required")
    .max(40, "Phone number is too long"),
  monthlyFee: z.coerce
    .number({ invalid_type_error: "Monthly fee must be a valid number" })
    .min(0, "Monthly fee cannot be negative"),
  active: z.boolean().default(true),
});

export type PersonFormData = z.infer<typeof PersonFormSchema>;

export const PaymentFormSchema = z.object({
  personId: z.string().min(1, "Person ID is required"),
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(2100),
  amount: z.coerce
    .number({ invalid_type_error: "Payment amount must be a number" })
    .min(0, "Payment amount cannot be negative"),
  paidAt: z.coerce.date().optional(),
});

export type PaymentFormData = z.infer<typeof PaymentFormSchema>;

export const ExpenseFormSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(255, "Description is too long"),
  amount: z.coerce
    .number({ invalid_type_error: "Amount must be a number" })
    .min(0.01, "Expense amount must be greater than zero"),
  date: z.coerce.date({ invalid_type_error: "Valid date is required" }),
});

export type ExpenseFormData = z.infer<typeof ExpenseFormSchema>;
