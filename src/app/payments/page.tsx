import { getMonthlyPaymentsPageData } from "@/lib/actions/reports";
import { MonthlyPaymentsTable } from "@/components/payments/monthly-payments-table";
import { MonthYearPicker } from "@/components/layout/month-year-picker";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatMonthYear } from "@/lib/currency";

export const dynamic = "force-dynamic";

interface PaymentsPageProps {
  searchParams?: {
    month?: string;
    year?: string;
  };
}

export default async function MonthlyPaymentsPage({ searchParams }: PaymentsPageProps) {
  const currentDate = new Date();
  const selectedMonth = searchParams?.month
    ? parseInt(searchParams.month, 10)
    : currentDate.getMonth() + 1;
  const selectedYear = searchParams?.year
    ? parseInt(searchParams.year, 10)
    : currentDate.getFullYear();

  let pageData;
  let dbError: string | null = null;

  try {
    pageData = await getMonthlyPaymentsPageData(selectedMonth, selectedYear);
  } catch (err: any) {
    dbError = err?.message || "Failed to load payment records.";
  }

  const monthName = formatMonthYear(selectedMonth, selectedYear);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Monthly Payments</h1>
          <p className="text-sm text-slate-500">
            Track and record member contributions for{" "}
            <span className="font-semibold text-slate-700">{monthName}</span>
          </p>
        </div>

        <MonthYearPicker currentMonth={selectedMonth} currentYear={selectedYear} />
      </div>

      {dbError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-900">
          <h3 className="font-semibold text-base mb-1">Database Error</h3>
          <p className="text-sm">{dbError}</p>
        </div>
      ) : pageData ? (
        <>
          {/* Quick Summary Card */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="bg-white">
              <CardContent className="p-4">
                <span className="text-xs text-slate-500 font-medium">Expected Total</span>
                <p className="text-lg font-bold text-slate-800 mt-1">
                  {formatCurrency(pageData.summary.expectedTotal)}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-teal-50/40 border-teal-200">
              <CardContent className="p-4">
                <span className="text-xs text-teal-800 font-medium">Actual Collected</span>
                <p className="text-lg font-bold text-teal-900 mt-1">
                  {formatCurrency(pageData.summary.collectedTotal)}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-4">
                <span className="text-xs text-slate-500 font-medium">Uncollected</span>
                <p className="text-lg font-bold text-rose-600 mt-1">
                  {formatCurrency(pageData.summary.uncollectedTotal)}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-4">
                <span className="text-xs text-slate-500 font-medium">Collection Progress</span>
                <p className="text-lg font-bold text-teal-800 mt-1">
                  {pageData.summary.collectionRate}%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Payments Table */}
          <MonthlyPaymentsTable
            statuses={pageData.statuses}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
          />
        </>
      ) : null}
    </div>
  );
}
