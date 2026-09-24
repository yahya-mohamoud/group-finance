import { getExpensesForMonth } from "@/lib/actions/expenses";
import { ExpensesTable } from "@/components/expenses/expenses-table";
import { AddExpenseModal } from "@/components/expenses/add-expense-modal";
import { MonthYearPicker } from "@/components/layout/month-year-picker";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatMonthYear } from "@/lib/currency";
import { Receipt } from "lucide-react";

export const dynamic = "force-dynamic";

interface ExpensesPageProps {
  searchParams?: {
    month?: string;
    year?: string;
  };
}

export default async function ExpensesPage({ searchParams }: ExpensesPageProps) {
  const currentDate = new Date();
  const selectedMonth = searchParams?.month
    ? parseInt(searchParams.month, 10)
    : currentDate.getMonth() + 1;
  const selectedYear = searchParams?.year
    ? parseInt(searchParams.year, 10)
    : currentDate.getFullYear();

  let expenses: any[] = [];
  let dbError: string | null = null;

  try {
    expenses = await getExpensesForMonth(selectedMonth, selectedYear);
  } catch (err: any) {
    dbError = err?.message || "Failed to load expenses.";
  }

  const monthName = formatMonthYear(selectedMonth, selectedYear);
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Expenses</h1>
          <p className="text-sm text-slate-500">
            Log and review group expenditures for{" "}
            <span className="font-semibold text-slate-700">{monthName}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <MonthYearPicker currentMonth={selectedMonth} currentYear={selectedYear} />
          <AddExpenseModal defaultMonth={selectedMonth} defaultYear={selectedYear} />
        </div>
      </div>

      {dbError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-900">
          <h3 className="font-semibold text-base mb-1">Database Error</h3>
          <p className="text-sm">{dbError}</p>
        </div>
      ) : (
        <>
          {/* Monthly Expense Summary Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-amber-200 bg-amber-50/30">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-amber-900 uppercase tracking-wider">
                    Total {monthName} Expenses
                  </span>
                  <p className="text-2xl font-bold text-amber-800 mt-1">
                    {formatCurrency(totalExpenses)}
                  </p>
                </div>
                <div className="rounded-xl bg-amber-100 p-3 text-amber-700">
                  <Receipt className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-5">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Items
                </span>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {expenses.length}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">entries this month</p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-5">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Average per Entry
                </span>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {expenses.length > 0 ? formatCurrency(totalExpenses / expenses.length) : formatCurrency(0)}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">average expenditure</p>
              </CardContent>
            </Card>
          </div>

          {/* Expenses Table */}
          <ExpensesTable expenses={expenses} />
        </>
      )}
    </div>
  );
}
