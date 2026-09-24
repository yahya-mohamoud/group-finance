import test from "node:test";
import assert from "node:assert/strict";
import {
  PersonFormSchema,
  PaymentFormSchema,
  ExpenseFormSchema,
} from "../src/lib/validation/schemas";

test("PersonFormSchema validates valid data and rejects negative fee", () => {
  const valid = PersonFormSchema.safeParse({
    name: "Ahmed Ali",
    phone: "+251911223344",
    monthlyFee: 500,
  });
  assert.equal(valid.success, true);

  const negativeFee = PersonFormSchema.safeParse({
    name: "Ahmed Ali",
    phone: "+251911223344",
    monthlyFee: -50,
  });
  assert.equal(negativeFee.success, false);

  const emptyName = PersonFormSchema.safeParse({
    name: "   ",
    phone: "+251911223344",
    monthlyFee: 100,
  });
  assert.equal(emptyName.success, false);
});

test("PaymentFormSchema rejects negative amount and validates month range", () => {
  const valid = PaymentFormSchema.safeParse({
    personId: "p123",
    month: 9,
    year: 2026,
    amount: 100,
  });
  assert.equal(valid.success, true);

  const negative = PaymentFormSchema.safeParse({
    personId: "p123",
    month: 9,
    year: 2026,
    amount: -10,
  });
  assert.equal(negative.success, false);

  const invalidMonth = PaymentFormSchema.safeParse({
    personId: "p123",
    month: 13,
    year: 2026,
    amount: 50,
  });
  assert.equal(invalidMonth.success, false);
});

test("ExpenseFormSchema enforces description and non-negative amount", () => {
  const valid = ExpenseFormSchema.safeParse({
    description: "Office supplies",
    amount: 150,
    date: new Date(),
  });
  assert.equal(valid.success, true);

  const zeroOrNegative = ExpenseFormSchema.safeParse({
    description: "Invalid",
    amount: 0,
    date: new Date(),
  });
  assert.equal(zeroOrNegative.success, false);
});
