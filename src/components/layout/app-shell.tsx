"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sidebar, NAVIGATION_ITEMS } from "./sidebar";
import { Menu, X, Coins } from "lucide-react";
import { CURRENCY_CONFIG } from "@/lib/currency";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const pathname = usePathname();

  // Close mobile menu on page navigation
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Mobile Header Bar */}
        <header className="lg:hidden sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-teal-700 text-white">
              <Coins className="h-4 w-4" />
            </div>
            <span className="text-base font-bold text-slate-900">Group Finance</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded bg-teal-50 border border-teal-200 px-2 py-0.5 text-xs font-semibold text-teal-800">
              {CURRENCY_CONFIG.code}
            </span>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-none"
              aria-label="Open mobile menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </header>

        {/* Mobile Menu Dropdown / Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 top-16 z-40 bg-slate-900/50 backdrop-blur-xs">
            <div className="bg-white border-b border-slate-200 p-4 space-y-1">
              {NAVIGATION_ITEMS.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium ${
                      isActive
                        ? "bg-teal-50 text-teal-800 font-semibold"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className="h-5 w-5 text-teal-700" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
