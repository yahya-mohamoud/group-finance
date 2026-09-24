"use client";

import * as React from "react";
import {
  Printer,
  TrendingUp,
  Receipt,
  PiggyBank,
  CheckCircle2,
  XCircle,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CollectionChart } from "@/components/dashboard/collection-chart";
import { MonthlyFinancialSummary, MonthComparison } from "@/lib/calculations";
import { formatCurrency, formatMonthYear } from "@/lib/currency";

interface MonthlyReportViewProps {
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
  selectedMonth: number;
  selectedYear: number;
}

export function MonthlyReportView({
  currentSummary,
  previousSummary,
  comparison,
  trend,
  selectedMonth,
  selectedYear,
}: MonthlyReportViewProps) {
  const currentMonthName = formatMonthYear(selectedMonth, selectedYear);
  const prevMonthName = formatMonthYear(
    comparison.previousMonth.month,
    comparison.previousMonth.year
  );

  const handlePrint = () => {
    window.print();
  };

  const renderDelta = (delta: number, inverse: boolean = false) => {
    const isPositive = delta > 0;
    const isZero = delta === 0;

    let isGood = isPositive;
    if (inverse) isGood = !isPositive;

    if (isZero) {
      return (
        <span className="inline-flex items-center text-xs text-slate-500 font-medium">
          <Minus className="h-3 w-3 mr-0.5" /> 0
        </span>
      );
    }

    return (
      <span
        className={`inline-flex items-center text-xs font-semibold ${
          isGood ? "text-emerald-700" : "text-rose-700"
        }`}
      >
        {isPositive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
        {delta > 0 ? `+${formatCurrency(delta)}` : formatCurrency(delta)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Action Toolbar */}
      <div className="flex justify-end print:hidden">
        <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
          <Printer className="h-4 w-4" /> Print / Save as PDF
        </Button>
      </div>

      {/* Main Report Document Container */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm print:border-none print:shadow-none print:p-0 space-y-8">
        {/* Document Header */}
        <div className="border-b border-slate-200 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-teal-700">
                Official Financial Statement
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
                Monthly Financial Report
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Reporting Period:{" "}
                <span className="font-semibold text-slate-800">{currentMonthName}</span>
              </p>
            </div>
            <div className="text-left sm:text-right text-xs text-slate-400">
              <p>Generated: {new Date().toLocaleDateString("en-US", { dateStyle: "long" })}</p>
              <p>Status: Completed</p>
            </div>
          </div>
        </div>

        {/* Section 1: Collection Overview */}
        <div>
          <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 text-teal-800 text-xs font-bold">
              1
            </span>
            Member Collections
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <span className="text-xs text-slate-500 font-medium">Expected</span>
              <p className="text-lg font-bold text-slate-800 mt-1">
                {formatCurrency(currentSummary.expectedTotal)}
              </p>
            </div>

            <div className="rounded-xl border border-teal-200 bg-teal-50/40 p-4">
              <span className="text-xs text-teal-800 font-medium">Collected</span>
              <p className="text-lg font-bold text-teal-900 mt-1">
                {formatCurrency(currentSummary.collectedTotal)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <span className="text-xs text-slate-500 font-medium">Uncollected</span>
              <p className="text-lg font-bold text-rose-600 mt-1">
                {formatCurrency(currentSummary.uncollectedTotal)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <span className="text-xs text-slate-500 font-medium">Paid Members</span>
              <p className="text-lg font-bold text-emerald-700 mt-1 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                {currentSummary.paidPeopleCount}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <span className="text-xs text-slate-500 font-medium">Not Paid</span>
              <p className="text-lg font-bold text-rose-600 mt-1 flex items-center gap-1.5">
                <XCircle className="h-4 w-4" />
                {currentSummary.unpaidPeopleCount}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <span className="text-xs text-slate-500 font-medium">Collection Rate</span>
              <p className="text-lg font-bold text-teal-800 mt-1 flex items-center gap-1">
                <Percent className="h-4 w-4" />
                {currentSummary.collectionRate}%
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Expenses & Financial Result */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Expenses */}
          <div className="rounded-xl border border-slate-200 p-5 bg-white">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                2
              </span>
              Expenses
            </h3>

            <div className="flex items-center justify-between p-4 rounded-lg bg-amber-50/40 border border-amber-200/60">
              <div>
                <span className="text-xs text-amber-800 font-medium uppercase tracking-wider">
                  Total Monthly Expenses
                </span>
                <p className="text-2xl font-black text-amber-900 mt-1">
                  {formatCurrency(currentSummary.totalExpenses)}
                </p>
              </div>
              <div className="p-3 bg-amber-100 rounded-lg text-amber-800">
                <Receipt className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* Financial Result */}
          <div className="rounded-xl border border-slate-200 p-5 bg-white">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                3
              </span>
              Financial Result
            </h3>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm py-1.5 border-b border-slate-100">
                <span className="text-slate-600">Total Collected:</span>
                <span className="font-semibold text-slate-900">
                  {formatCurrency(currentSummary.collectedTotal)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm py-1.5 border-b border-slate-100">
                <span className="text-slate-600">Less Total Expenses:</span>
                <span className="font-semibold text-rose-600">
                  − {formatCurrency(currentSummary.totalExpenses)}
                </span>
              </div>
              <div className="flex justify-between items-center text-base font-bold pt-2">
                <span className="text-slate-900">Net Monthly Savings:</span>
                <span
                  className={
                    currentSummary.netSavings >= 0 ? "text-emerald-700" : "text-rose-700"
                  }
                >
                  {formatCurrency(currentSummary.netSavings)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Previous Month Comparison */}
        <div>
          <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold">
              4
            </span>
            Previous Month Comparison
          </h3>

          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                <tr>
                  <th className="p-3.5">Metric</th>
                  <th className="p-3.5">{prevMonthName}</th>
                  <th className="p-3.5">{currentMonthName}</th>
                  <th className="p-3.5 text-right">Difference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-3.5 font-medium text-slate-800">Collected</td>
                  <td className="p-3.5 text-slate-600">
                    {formatCurrency(comparison.previousMonth.collected)}
                  </td>
                  <td className="p-3.5 font-bold text-slate-900">
                    {formatCurrency(comparison.currentMonth.collected)}
                  </td>
                  <td className="p-3.5 text-right">
                    {renderDelta(comparison.difference.collected)}
                  </td>
                </tr>
                <tr>
                  <td className="p-3.5 font-medium text-slate-800">Expenses</td>
                  <td className="p-3.5 text-slate-600">
                    {formatCurrency(comparison.previousMonth.expenses)}
                  </td>
                  <td className="p-3.5 font-bold text-slate-900">
                    {formatCurrency(comparison.currentMonth.expenses)}
                  </td>
                  <td className="p-3.5 text-right">
                    {renderDelta(comparison.difference.expenses, true)}
                  </td>
                </tr>
                <tr className="bg-slate-50/50">
                  <td className="p-3.5 font-bold text-slate-900">Net Savings</td>
                  <td className="p-3.5 font-medium text-slate-700">
                    {formatCurrency(comparison.previousMonth.savings)}
                  </td>
                  <td className="p-3.5 font-bold text-teal-800">
                    {formatCurrency(comparison.currentMonth.savings)}
                  </td>
                  <td className="p-3.5 text-right">
                    {renderDelta(comparison.difference.savings)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 5: Historical Trend Chart */}
        <div className="print:hidden">
          <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-800 text-xs font-bold">
              5
            </span>
            6-Month Historical Trend
          </h3>
          <CollectionChart data={trend} />
        </div>
      </div>
    </div>
  );
}
