import { getReportsPageData } from "@/lib/actions/reports";
import { MonthlyReportView } from "@/components/reports/monthly-report-view";
import { MonthYearPicker } from "@/components/layout/month-year-picker";
import { formatMonthYear } from "@/lib/currency";

export const dynamic = "force-dynamic";

interface ReportsPageProps {
  searchParams?: {
    month?: string;
    year?: string;
  };
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const currentDate = new Date();
  const selectedMonth = searchParams?.month
    ? parseInt(searchParams.month, 10)
    : currentDate.getMonth() + 1;
  const selectedYear = searchParams?.year
    ? parseInt(searchParams.year, 10)
    : currentDate.getFullYear();

  let reportsData;
  let dbError: string | null = null;

  try {
    reportsData = await getReportsPageData(selectedMonth, selectedYear);
  } catch (err: any) {
    dbError = err?.message || "Failed to load financial reports.";
  }

  const monthName = formatMonthYear(selectedMonth, selectedYear);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Financial Reports</h1>
          <p className="text-sm text-slate-500">
            End-of-month financial reconciliation and metrics for{" "}
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
      ) : reportsData ? (
        <MonthlyReportView
          currentSummary={reportsData.currentSummary}
          previousSummary={reportsData.previousSummary}
          comparison={reportsData.comparison}
          trend={reportsData.trend}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
        />
      ) : null}
    </div>
  );
}
