export { getShortMonth, formatMonthYear } from "./currency";

export interface PersonSummary {
  id: string;
  name: string;
  phone: string;
  monthlyFee: number;
  active: boolean;
}

export interface PaymentRecord {
  id: string;
  personId: string;
  month: number;
  year: number;
  amount: number;
  paidAt: Date | string;
}

export interface ExpenseRecord {
  id: string;
  description: string;
  amount: number;
  date: Date | string;
}

export interface MonthlyFinancialSummary {
  month: number;
  year: number;
  totalActivePeople: number;
  paidPeopleCount: number;
  unpaidPeopleCount: number;
  partialPeopleCount: number;
  expectedTotal: number;
  collectedTotal: number;
  uncollectedTotal: number;
  collectionRate: number; // percentage, e.g. 86.5
  totalExpenses: number;
  netSavings: number;
}

export interface MonthComparison {
  currentMonth: {
    month: number;
    year: number;
    collected: number;
    expenses: number;
    savings: number;
  };
  previousMonth: {
    month: number;
    year: number;
    collected: number;
    expenses: number;
    savings: number;
  };
  difference: {
    collected: number;
    expenses: number;
    savings: number;
  };
}

export interface PersonPaymentStatus {
  person: PersonSummary;
  expectedFee: number;
  paidAmount: number;
  status: "PAID" | "PARTIAL" | "NOT_PAID";
  paymentId?: string;
  paidAt?: Date | string;
}

/**
 * Calculates financial metrics for a selected month and year based on active people,
 * payments recorded in that month/year, and expenses incurred during that month/year.
 */
export function calculateMonthlySummary(
  activePeople: PersonSummary[],
  payments: PaymentRecord[],
  expenses: ExpenseRecord[],
  month: number,
  year: number
): MonthlyFinancialSummary {
  // Expected total = sum of monthlyFee of all active people
  const expectedTotal = activePeople.reduce(
    (sum, person) => sum + (person.monthlyFee || 0),
    0
  );

  // Map payments by personId for fast lookup
  const paymentMap = new Map<string, PaymentRecord>();
  let collectedTotal = 0;

  for (const payment of payments) {
    if (payment.month === month && payment.year === year) {
      paymentMap.set(payment.personId, payment);
      collectedTotal += payment.amount || 0;
    }
  }

  // Active people payment status counts
  let paidPeopleCount = 0;
  let unpaidPeopleCount = 0;
  let partialPeopleCount = 0;

  for (const person of activePeople) {
    const payment = paymentMap.get(person.id);
    if (!payment || payment.amount <= 0) {
      unpaidPeopleCount++;
    } else if (payment.amount < person.monthlyFee) {
      // Partial payment
      paidPeopleCount++;
      partialPeopleCount++;
    } else {
      // Full or over payment
      paidPeopleCount++;
    }
  }

  // Uncollected total = Expected total - Collected total
  const uncollectedTotal = Math.max(0, expectedTotal - collectedTotal);

  // Collection rate = (Collected total / Expected total) * 100
  const collectionRate =
    expectedTotal > 0
      ? Number(((collectedTotal / expectedTotal) * 100).toFixed(1))
      : 0;

  // Expenses = sum of expenses during this month & year
  const totalExpenses = expenses.reduce((sum, expense) => {
    const expDate = new Date(expense.date);
    // Compare in local/UTC month and year
    if (expDate.getMonth() + 1 === month && expDate.getFullYear() === year) {
      return sum + (expense.amount || 0);
    }
    return sum;
  }, 0);

  // Net savings = Collected total - Expenses
  const netSavings = collectedTotal - totalExpenses;

  return {
    month,
    year,
    totalActivePeople: activePeople.length,
    paidPeopleCount,
    unpaidPeopleCount,
    partialPeopleCount,
    expectedTotal,
    collectedTotal,
    uncollectedTotal,
    collectionRate,
    totalExpenses,
    netSavings,
  };
}

/**
 * Compare two monthly summaries and calculate differences.
 */
export function calculateMonthComparison(
  current: MonthlyFinancialSummary,
  previous: MonthlyFinancialSummary
): MonthComparison {
  return {
    currentMonth: {
      month: current.month,
      year: current.year,
      collected: current.collectedTotal,
      expenses: current.totalExpenses,
      savings: current.netSavings,
    },
    previousMonth: {
      month: previous.month,
      year: previous.year,
      collected: previous.collectedTotal,
      expenses: previous.totalExpenses,
      savings: previous.netSavings,
    },
    difference: {
      collected: current.collectedTotal - previous.collectedTotal,
      expenses: current.totalExpenses - previous.totalExpenses,
      savings: current.netSavings - previous.netSavings,
    },
  };
}

/**
 * Determine payment status for each person for monthly view
 */
export function computePeoplePaymentStatuses(
  people: PersonSummary[],
  payments: PaymentRecord[],
  month: number,
  year: number
): PersonPaymentStatus[] {
  const paymentMap = new Map<string, PaymentRecord>();
  for (const payment of payments) {
    if (payment.month === month && payment.year === year) {
      paymentMap.set(payment.personId, payment);
    }
  }

  return people.map((person) => {
    const payment = paymentMap.get(person.id);
    const expectedFee = person.monthlyFee;
    const paidAmount = payment?.amount ?? 0;

    let status: "PAID" | "PARTIAL" | "NOT_PAID" = "NOT_PAID";
    if (payment && paidAmount > 0) {
      if (paidAmount >= expectedFee) {
        status = "PAID";
      } else {
        status = "PARTIAL";
      }
    }

    return {
      person,
      expectedFee,
      paidAmount,
      status,
      paymentId: payment?.id,
      paidAt: payment?.paidAt,
    };
  });
}

/**
 * Helper to get the previous month and year.
 */
export function getPreviousMonthAndYear(
  month: number,
  year: number
): { month: number; year: number } {
  if (month === 1) {
    return { month: 12, year: year - 1 };
  }
  return { month: month - 1, year };
}
