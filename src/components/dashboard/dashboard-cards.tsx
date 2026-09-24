import {
  Users,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Wallet,
  Receipt,
  PiggyBank,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency";
import { MonthlyFinancialSummary, MonthComparison } from "@/lib/calculations";

interface SummaryCardsProps {
  summary: MonthlyFinancialSummary;
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Active People */}
      <Card className="hover:border-slate-300 transition-colors">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-slate-500">Active People</span>
            <div className="rounded-md bg-blue-50 p-2 text-blue-600">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold text-slate-900">
              {summary.totalActivePeople}
            </span>
            <span className="text-xs text-slate-400">members</span>
          </div>
        </CardContent>
      </Card>

      {/* 2. Paid People */}
      <Card className="hover:border-slate-300 transition-colors">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-slate-500">Paid Members</span>
            <div className="rounded-md bg-emerald-50 p-2 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold text-emerald-700">
              {summary.paidPeopleCount}
            </span>
            {summary.partialPeopleCount > 0 && (
              <span className="text-xs text-amber-600 font-medium">
                ({summary.partialPeopleCount} partial)
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 3. Not Paid */}
      <Card className="hover:border-slate-300 transition-colors">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-slate-500">Not Paid</span>
            <div className="rounded-md bg-rose-50 p-2 text-rose-600">
              <XCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold text-rose-600">
              {summary.unpaidPeopleCount}
            </span>
            <span className="text-xs text-slate-400">unpaid</span>
          </div>
        </CardContent>
      </Card>

      {/* 4. Collection Rate */}
      <Card className="hover:border-slate-300 transition-colors">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-slate-500">Collection Rate</span>
            <div className="rounded-md bg-teal-50 p-2 text-teal-700">
              <Percent className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold text-teal-800">
              {summary.collectionRate}%
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-600 rounded-full transition-all"
              style={{ width: `${Math.min(100, Math.max(0, summary.collectionRate))}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* 5. Expected Total */}
      <Card className="hover:border-slate-300 transition-colors">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-slate-500">Expected Total</span>
            <div className="rounded-md bg-slate-100 p-2 text-slate-600">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-lg sm:text-xl font-bold text-slate-800">
              {formatCurrency(summary.expectedTotal)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 6. Actual Collected */}
      <Card className="border-teal-200 bg-teal-50/20 hover:border-teal-300 transition-colors">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-teal-900">Collected Total</span>
            <div className="rounded-md bg-teal-600 p-2 text-white">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-lg sm:text-xl font-bold text-teal-900">
              {formatCurrency(summary.collectedTotal)}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Uncollected: {formatCurrency(summary.uncollectedTotal)}
          </p>
        </CardContent>
      </Card>

      {/* 7. Total Expenses */}
      <Card className="hover:border-slate-300 transition-colors">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-slate-500">Total Expenses</span>
            <div className="rounded-md bg-amber-50 p-2 text-amber-700">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-lg sm:text-xl font-bold text-amber-700">
              {formatCurrency(summary.totalExpenses)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 8. Net Savings / Balance */}
      <Card
        className={`hover:border-slate-300 transition-colors ${
          summary.netSavings >= 0 ? "border-emerald-200 bg-emerald-50/20" : "border-rose-200 bg-rose-50/20"
        }`}
      >
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-slate-700">Net Savings</span>
            <div
              className={`rounded-md p-2 ${
                summary.netSavings >= 0 ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
              }`}
            >
              <PiggyBank className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span
              className={`text-lg sm:text-xl font-bold ${
                summary.netSavings >= 0 ? "text-emerald-800" : "text-rose-700"
              }`}
            >
              {formatCurrency(summary.netSavings)}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Collected − Expenses</p>
        </CardContent>
      </Card>
    </div>
  );
}

interface MonthComparisonSectionProps {
  comparison: MonthComparison;
  currentMonthName: string;
  previousMonthName: string;
}

export function MonthComparisonSection({
  comparison,
  currentMonthName,
  previousMonthName,
}: MonthComparisonSectionProps) {
  const renderDiffBadge = (diff: number, inverse: boolean = false) => {
    const isPositive = diff > 0;
    const isZero = diff === 0;

    let isGood = isPositive;
    if (inverse) {
      isGood = !isPositive; // e.g. for expenses, increase is bad
    }

    if (isZero) {
      return (
        <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium">
          <Minus className="h-3 w-3" /> 0
        </span>
      );
    }

    return (
      <span
        className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
          isGood ? "text-emerald-600" : "text-rose-600"
        }`}
      >
        {isPositive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
        {diff > 0 ? `+${formatCurrency(diff)}` : formatCurrency(diff)}
      </span>
    );
  };

  return (
    <Card>
      <CardContent className="p-5">
        <h4 className="text-sm font-semibold text-slate-800 mb-4 flex items-center justify-between">
          <span>Comparison with Previous Month</span>
          <span className="text-xs text-slate-400 font-normal">
            {previousMonthName} vs {currentMonthName}
          </span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {/* Collected */}
          <div className="pt-2 md:pt-0 md:px-3 first:pl-0">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Collected</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-base font-bold text-slate-900">
                {formatCurrency(comparison.currentMonth.collected)}
              </span>
              {renderDiffBadge(comparison.difference.collected)}
            </div>
            <p className="mt-1 text-xs text-slate-400">
              {previousMonthName}: {formatCurrency(comparison.previousMonth.collected)}
            </p>
          </div>

          {/* Expenses */}
          <div className="pt-3 md:pt-0 md:px-3">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Expenses</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-base font-bold text-slate-900">
                {formatCurrency(comparison.currentMonth.expenses)}
              </span>
              {renderDiffBadge(comparison.difference.expenses, true)}
            </div>
            <p className="mt-1 text-xs text-slate-400">
              {previousMonthName}: {formatCurrency(comparison.previousMonth.expenses)}
            </p>
          </div>

          {/* Savings */}
          <div className="pt-3 md:pt-0 md:px-3 last:pr-0">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Net Savings</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-base font-bold text-slate-900">
                {formatCurrency(comparison.currentMonth.savings)}
              </span>
              {renderDiffBadge(comparison.difference.savings)}
            </div>
            <p className="mt-1 text-xs text-slate-400">
              {previousMonthName}: {formatCurrency(comparison.previousMonth.savings)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
