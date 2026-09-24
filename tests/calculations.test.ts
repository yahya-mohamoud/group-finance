import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateMonthlySummary,
  calculateMonthComparison,
  computePeoplePaymentStatuses,
  getPreviousMonthAndYear,
} from "../src/lib/calculations";

test("getPreviousMonthAndYear handles normal months and year boundaries", () => {
  assert.deepEqual(getPreviousMonthAndYear(9, 2026), { month: 8, year: 2026 });
  assert.deepEqual(getPreviousMonthAndYear(1, 2026), { month: 12, year: 2025 });
});

test("calculateMonthlySummary handles full, partial, and unpaid members", () => {
  const activePeople = [
    { id: "1", name: "Ahmed", phone: "111", monthlyFee: 100, active: true },
    { id: "2", name: "Mohamed", phone: "222", monthlyFee: 100, active: true },
    { id: "3", name: "Ali", phone: "333", monthlyFee: 100, active: true },
  ];

  const payments = [
    { id: "p1", personId: "1", month: 9, year: 2026, amount: 100, paidAt: new Date() },
    { id: "p2", personId: "3", month: 9, year: 2026, amount: 50, paidAt: new Date() }, // Partial
    // person 2 has no payment
  ];

  const expenses = [
    { id: "e1", description: "Electricity", amount: 30, date: new Date(2026, 8, 5) },
  ];

  const summary = calculateMonthlySummary(activePeople, payments, expenses, 9, 2026);

  assert.equal(summary.totalActivePeople, 3);
  assert.equal(summary.expectedTotal, 300);
  assert.equal(summary.collectedTotal, 150);
  assert.equal(summary.uncollectedTotal, 150);
  assert.equal(summary.paidPeopleCount, 2); // Ahmed (100) + Ali (50 partial) both count as paid
  assert.equal(summary.unpaidPeopleCount, 1); // Mohamed
  assert.equal(summary.partialPeopleCount, 1); // Ali
  assert.equal(summary.collectionRate, 50.0);
  assert.equal(summary.totalExpenses, 30);
  assert.equal(summary.netSavings, 120);
});

test("calculateMonthlySummary handles zero expected total without NaN", () => {
  const summary = calculateMonthlySummary([], [], [], 9, 2026);
  assert.equal(summary.expectedTotal, 0);
  assert.equal(summary.collectedTotal, 0);
  assert.equal(summary.collectionRate, 0);
  assert.equal(summary.netSavings, 0);
});

test("calculateMonthComparison computes correct differences", () => {
  const curr = {
    month: 9,
    year: 2026,
    totalActivePeople: 50,
    paidPeopleCount: 45,
    unpaidPeopleCount: 5,
    partialPeopleCount: 2,
    expectedTotal: 5000,
    collectedTotal: 4500,
    uncollectedTotal: 500,
    collectionRate: 90.0,
    totalExpenses: 800,
    netSavings: 3700,
  };

  const prev = {
    month: 8,
    year: 2026,
    totalActivePeople: 50,
    paidPeopleCount: 42,
    unpaidPeopleCount: 8,
    partialPeopleCount: 1,
    expectedTotal: 5000,
    collectedTotal: 4200,
    uncollectedTotal: 800,
    collectionRate: 84.0,
    totalExpenses: 600,
    netSavings: 3600,
  };

  const comp = calculateMonthComparison(curr, prev);
  assert.equal(comp.difference.collected, 300);
  assert.equal(comp.difference.expenses, 200);
  assert.equal(comp.difference.savings, 100);
});

test("computePeoplePaymentStatuses flags PAID, PARTIAL, and NOT_PAID correctly", () => {
  const people = [
    { id: "1", name: "Ahmed", phone: "111", monthlyFee: 100, active: true },
    { id: "2", name: "Mohamed", phone: "222", monthlyFee: 100, active: true },
    { id: "3", name: "Ali", phone: "333", monthlyFee: 100, active: true },
  ];

  const payments = [
    { id: "p1", personId: "1", month: 9, year: 2026, amount: 100, paidAt: new Date() },
    { id: "p3", personId: "3", month: 9, year: 2026, amount: 50, paidAt: new Date() },
  ];

  const statuses = computePeoplePaymentStatuses(people, payments, 9, 2026);
  assert.equal(statuses[0].status, "PAID");
  assert.equal(statuses[1].status, "NOT_PAID");
  assert.equal(statuses[2].status, "PARTIAL");
});
