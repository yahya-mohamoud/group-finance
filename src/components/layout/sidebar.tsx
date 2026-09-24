"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Receipt,
  FileBarChart,
  ShieldCheck,
  Coins,
  LogOut,
  Loader2,
} from "lucide-react";
import { CURRENCY_CONFIG } from "@/lib/currency";
import { logout } from "@/lib/actions/auth";

export const NAVIGATION_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "People", href: "/people", icon: Users },
  { name: "Monthly Payments", href: "/payments", icon: CreditCard },
  { name: "Expenses", href: "/expenses", icon: Receipt },
  { name: "Reports", href: "/reports", icon: FileBarChart },
  { name: "Settings", href: "/settings", icon: ShieldCheck },
];

export function Sidebar() {
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } catch {
      setLoggingOut(false);
    }
  };

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-slate-200 bg-white min-h-screen">
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-700 text-white shadow-xs">
          <Coins className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-900 leading-tight">
            RAJO CHARITY
          </h1>
          <p className="text-xs text-slate-500 font-medium">Monthly Ledger</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAVIGATION_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-teal-50 text-teal-800 font-semibold"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon
                className={`h-4 w-4 ${
                  isActive
                    ? "text-teal-700"
                    : "text-slate-400 group-hover:text-slate-600"
                }`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer Info & Logout */}
      <div className="border-t border-slate-200 p-4 space-y-3">
        <div className="rounded-lg bg-slate-50 p-3 border border-slate-200/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Active Currency
            </span>
            <span className="rounded bg-teal-100 px-2 py-0.5 text-xs font-bold text-teal-800">
              {CURRENCY_CONFIG.code}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            All records displayed in {CURRENCY_CONFIG.code}
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 py-2 px-3 text-xs font-semibold text-slate-600 transition-colors disabled:opacity-50"
        >
          {loggingOut ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Logging out...
            </>
          ) : (
            <>
              <LogOut className="h-3.5 w-3.5" />
              Lock & Log Out
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
