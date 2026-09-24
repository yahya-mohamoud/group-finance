import Link from "next/link";
import { ArrowRight, CreditCard, Receipt } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency, formatMonthYear } from "@/lib/currency";

interface RecentPaymentsProps {
  payments: Array<{
    id: string;
    personName: string;
    amount: number;
    paidAt: Date;
    month: number;
    year: number;
  }>;
}

interface RecentExpensesProps {
  expenses: Array<{
    id: string;
    description: string;
    amount: number;
    date: Date;
  }>;
}

export function RecentActivity({
  payments,
  expenses,
}: RecentPaymentsProps & RecentExpensesProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Recent Payments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-teal-700" />
            Recent Payments
          </CardTitle>
          <Link
            href="/payments"
            className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
          >
            Manage payments <ArrowRight className="h-3 w-3" />
          </Link>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400">
              No recent payments recorded.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {payments.map((p) => (
                <div key={p.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{p.personName}</p>
                    <p className="text-xs text-slate-400">
                      For {formatMonthYear(p.month, p.year)} •{" "}
                      {new Date(p.paidAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-teal-800">
                    {formatCurrency(p.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Expenses */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <Receipt className="h-4 w-4 text-amber-600" />
            Recent Expenses
          </CardTitle>
          <Link
            href="/expenses"
            className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
          >
            Manage expenses <ArrowRight className="h-3 w-3" />
          </Link>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400">
              No recent expenses recorded.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {expenses.map((e) => (
                <div key={e.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{e.description}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(e.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-amber-700">
                    {formatCurrency(e.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
