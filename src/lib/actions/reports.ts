"use server";

import prisma from "@/lib/prisma";
import {
  calculateMonthlySummary,
  calculateMonthComparison,
  computePeoplePaymentStatuses,
  getPreviousMonthAndYear,
  getShortMonth,
  MonthlyFinancialSummary,
  MonthComparison,
  PersonPaymentStatus,
} from "@/lib/calculations";

export interface DashboardData {
  summary: MonthlyFinancialSummary;
  comparison: MonthComparison;
  recentPayments: Array<{
    id: string;
    personName: string;
    amount: number;
    paidAt: Date;
    month: number;
    year: number;
  }>;
  recentExpenses: Array<{
    id: string;
    description: string;
    amount: number;
    date: Date;
  }>;
  historicalChartData: Array<{
    name: string;
    month: number;
    year: number;
    collected: number;
    expenses: number;
    savings: number;
  }>;
}

export async function getDashboardData(
  month: number,
  year: number
): Promise<DashboardData> {
  const prevMonthInfo = getPreviousMonthAndYear(month, year);

  // 1. Fetch active people
  const activePeople = await prisma.person.findMany({
    where: { active: true },
    select: { id: true, name: true, phone: true, monthlyFee: true, active: true },
  });

  // 2. Fetch payments for current month and previous month
  const payments = await prisma.payment.findMany({
    where: {
      OR: [
        { month, year },
        { month: prevMonthInfo.month, year: prevMonthInfo.year },
      ],
    },
  });

  // 3. Fetch expenses for current month and previous month
  const startDatePrev = new Date(prevMonthInfo.year, prevMonthInfo.month - 1, 1);
  const endDateCurr = new Date(year, month, 1);

  const expenses = await prisma.expense.findMany({
    where: {
      date: {
        gte: startDatePrev,
        lt: endDateCurr,
      },
    },
  });

  // 4. Calculate summaries
  const currentSummary = calculateMonthlySummary(
    activePeople,
    payments,
    expenses,
    month,
    year
  );

  const previousSummary = calculateMonthlySummary(
    activePeople,
    payments,
    expenses,
    prevMonthInfo.month,
    prevMonthInfo.year
  );

  const comparison = calculateMonthComparison(currentSummary, previousSummary);

  // 5. Recent 5 payments
  const recentPaymentsRaw = await prisma.payment.findMany({
    take: 5,
    orderBy: { paidAt: "desc" },
    include: {
      person: { select: { name: true } },
    },
  });

  const recentPayments = recentPaymentsRaw.map((p) => ({
    id: p.id,
    personName: p.person.name,
    amount: p.amount,
    paidAt: p.paidAt,
    month: p.month,
    year: p.year,
  }));

  // 6. Recent 5 expenses
  const recentExpensesRaw = await prisma.expense.findMany({
    take: 5,
    orderBy: { date: "desc" },
  });

  const recentExpenses = recentExpensesRaw.map((e) => ({
    id: e.id,
    description: e.description,
    amount: e.amount,
    date: e.date,
  }));

  // 7. Last 6 months trend data
  const historicalChartData = await getHistoricalTrendData(month, year, 6, activePeople);

  return {
    summary: currentSummary,
    comparison,
    recentPayments,
    recentExpenses,
    historicalChartData,
  };
}

export async function getHistoricalTrendData(
  endMonth: number,
  endYear: number,
  count: number = 6,
  cachedActivePeople?: Array<{ id: string; name: string; phone: string; monthlyFee: number; active: boolean }>
) {
  const monthsToFetch: Array<{ month: number; year: number }> = [];

  let curM = endMonth;
  let curY = endYear;
  for (let i = 0; i < count; i++) {
    monthsToFetch.unshift({ month: curM, year: curY });
    const prev = getPreviousMonthAndYear(curM, curY);
    curM = prev.month;
    curY = prev.year;
  }

  const oldest = monthsToFetch[0];
  const newest = monthsToFetch[monthsToFetch.length - 1];

  const startDate = new Date(oldest.year, oldest.month - 1, 1);
  const endDate = new Date(newest.year, newest.month, 1);

  const [activePeople, allPayments, allExpenses] = await Promise.all([
    cachedActivePeople
      ? Promise.resolve(cachedActivePeople)
      : prisma.person.findMany({
          where: { active: true },
          select: { id: true, name: true, phone: true, monthlyFee: true, active: true },
        }),
    prisma.payment.findMany({
      where: {
        OR: monthsToFetch.map((m) => ({ month: m.month, year: m.year })),
      },
    }),
    prisma.expense.findMany({
      where: {
        date: {
          gte: startDate,
          lt: endDate,
        },
      },
    }),
  ]);

  return monthsToFetch.map(({ month, year }) => {
    const summary = calculateMonthlySummary(activePeople, allPayments, allExpenses, month, year);
    return {
      name: `${getShortMonth(month)} ${year}`,
      month,
      year,
      collected: summary.collectedTotal,
      expenses: summary.totalExpenses,
      savings: summary.netSavings,
    };
  });
}

export async function getMonthlyPaymentsPageData(
  month: number,
  year: number
): Promise<{
  statuses: PersonPaymentStatus[];
  summary: MonthlyFinancialSummary;
}> {
  // Fetch active people, plus any inactive people who happen to have a payment in this month
  const activePeople = await prisma.person.findMany({
    where: { active: true },
    select: { id: true, name: true, phone: true, monthlyFee: true, active: true },
    orderBy: { name: "asc" },
  });

  const monthPayments = await prisma.payment.findMany({
    where: { month, year },
    include: {
      person: { select: { id: true, name: true, phone: true, monthlyFee: true, active: true } },
    },
  });

  // Check if any inactive person paid this month
  const activeIds = new Set(activePeople.map((p) => p.id));
  const additionalPeople: Array<{ id: string; name: string; phone: string; monthlyFee: number; active: boolean }> = [];
  for (const p of monthPayments) {
    if (!activeIds.has(p.person.id)) {
      additionalPeople.push(p.person);
      activeIds.add(p.person.id);
    }
  }

  const allDisplayPeople = [...activePeople, ...additionalPeople];

  const paymentRecords = monthPayments.map((p) => ({
    id: p.id,
    personId: p.personId,
    month: p.month,
    year: p.year,
    amount: p.amount,
    paidAt: p.paidAt,
  }));

  const statuses = computePeoplePaymentStatuses(
    allDisplayPeople,
    paymentRecords,
    month,
    year
  );

  // Also fetch expenses for the summary bar
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);
  const expenses = await prisma.expense.findMany({
    where: {
      date: {
        gte: startDate,
        lt: endDate,
      },
    },
  });

  const summary = calculateMonthlySummary(activePeople, paymentRecords, expenses, month, year);

  return {
    statuses,
    summary,
  };
}

export async function getReportsPageData(
  month: number,
  year: number
): Promise<{
  currentSummary: MonthlyFinancialSummary;
  previousSummary: MonthlyFinancialSummary;
  comparison: MonthComparison;
  trend: Array<{
    name: string;
    month: number;
    year: number;
    collected: number;
    expenses: number;
    savings: number;
  }>;
}> {
  const prevMonthInfo = getPreviousMonthAndYear(month, year);

  const activePeople = await prisma.person.findMany({
    where: { active: true },
    select: { id: true, name: true, phone: true, monthlyFee: true, active: true },
  });

  const payments = await prisma.payment.findMany({
    where: {
      OR: [
        { month, year },
        { month: prevMonthInfo.month, year: prevMonthInfo.year },
      ],
    },
  });

  const startDatePrev = new Date(prevMonthInfo.year, prevMonthInfo.month - 1, 1);
  const endDateCurr = new Date(year, month, 1);

  const expenses = await prisma.expense.findMany({
    where: {
      date: {
        gte: startDatePrev,
        lt: endDateCurr,
      },
    },
  });

  const currentSummary = calculateMonthlySummary(
    activePeople,
    payments,
    expenses,
    month,
    year
  );

  const previousSummary = calculateMonthlySummary(
    activePeople,
    payments,
    expenses,
    prevMonthInfo.month,
    prevMonthInfo.year
  );

  const comparison = calculateMonthComparison(currentSummary, previousSummary);
  const trend = await getHistoricalTrendData(month, year, 6, activePeople);

  return {
    currentSummary,
    previousSummary,
    comparison,
    trend,
  };
}
