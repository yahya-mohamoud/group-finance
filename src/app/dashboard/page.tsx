import { getDashboardData } from "@/lib/actions/reports";
import { SummaryCards, MonthComparisonSection } from "@/components/dashboard/dashboard-cards";
import { CollectionChart } from "@/components/dashboard/collection-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { MonthYearPicker } from "@/components/layout/month-year-picker";
import { formatMonthYear } from "@/lib/currency";
import { getPreviousMonthAndYear } from "@/lib/calculations";

export const dynamic = "force-dynamic";

interface DashboardPageProps {
  searchParams?: {
    month?: string;
    year?: string;
  };
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const currentDate = new Date();
  const selectedMonth = searchParams?.month
    ? parseInt(searchParams.month, 10)
    : currentDate.getMonth() + 1;
  const selectedYear = searchParams?.year
    ? parseInt(searchParams.year, 10)
    : currentDate.getFullYear();

  const prevMonthInfo = getPreviousMonthAndYear(selectedMonth, selectedYear);
  const currentMonthName = formatMonthYear(selectedMonth, selectedYear);
  const previousMonthName = formatMonthYear(prevMonthInfo.month, prevMonthInfo.year);

  let data;
  let dbError: string | null = null;

  try {
    data = await getDashboardData(selectedMonth, selectedYear);
  } catch (error: any) {
    dbError = error?.message || "Failed to load dashboard data. Please check database connection.";
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">
            Financial summary and monthly metrics for{" "}
            <span className="font-semibold text-slate-700">{currentMonthName}</span>
          </p>
        </div>

        <MonthYearPicker currentMonth={selectedMonth} currentYear={selectedYear} />
      </div>

      {dbError ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
          <h3 className="font-semibold text-base mb-1">Database Setup Required</h3>
          <p className="text-sm text-amber-800 mb-3">
            Could not connect to PostgreSQL: {dbError}
          </p>
          <p className="text-xs text-amber-700">
            Please make sure your Supabase <code>DATABASE_URL</code> is set in <code>.env</code> and run <code>npm run prisma:push</code> and <code>npm run prisma:seed</code>.
          </p>
        </div>
      ) : data ? (
        <>
          {/* Key Metric Summary Cards */}
          <SummaryCards summary={data.summary} />

          {/* Month-over-month comparison */}
          <MonthComparisonSection
            comparison={data.comparison}
            currentMonthName={currentMonthName}
            previousMonthName={previousMonthName}
          />

          {/* 6-Month Chart */}
          <CollectionChart data={data.historicalChartData} />

          {/* Recent Payments and Expenses */}
          <RecentActivity
            payments={data.recentPayments}
            expenses={data.recentExpenses}
          />
        </>
      ) : null}
    </div>
  );
}
