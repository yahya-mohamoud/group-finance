"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

interface MonthYearPickerProps {
  currentMonth: number;
  currentYear: number;
}

export function MonthYearPicker({
  currentMonth,
  currentYear,
}: MonthYearPickerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleMonthChange = (newMonth: number, newYear: number) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("month", newMonth.toString());
    params.set("year", newYear.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const goToPrevious = () => {
    if (currentMonth === 1) {
      handleMonthChange(12, currentYear - 1);
    } else {
      handleMonthChange(currentMonth - 1, currentYear);
    }
  };

  const goToNext = () => {
    if (currentMonth === 12) {
      handleMonthChange(1, currentYear + 1);
    } else {
      handleMonthChange(currentMonth + 1, currentYear);
    }
  };

  const handleSelectMonth = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleMonthChange(parseInt(e.target.value, 10), currentYear);
  };

  const handleSelectYear = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleMonthChange(currentMonth, parseInt(e.target.value, 10));
  };

  // Generate selectable years: past 5 years and next 2 years
  const startYear = currentYear - 4;
  const years = Array.from({ length: 8 }, (_, i) => startYear + i);

  return (
    <div className="flex items-center gap-1 sm:gap-2 bg-white px-2 py-1.5 rounded-lg border border-slate-200 shadow-xs">
      <Button
        variant="ghost"
        size="icon"
        onClick={goToPrevious}
        title="Previous Month"
        className="h-8 w-8 text-slate-600 hover:text-slate-900"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-1.5">
        <Calendar className="h-4 w-4 text-teal-700 hidden sm:inline-block" />
        
        <select
          value={currentMonth}
          onChange={handleSelectMonth}
          className="text-sm font-semibold text-slate-800 bg-transparent py-1 pl-1 pr-2 rounded hover:bg-slate-100 cursor-pointer focus:outline-none focus:ring-1 focus:ring-teal-600"
        >
          {MONTH_NAMES.map((name, index) => (
            <option key={name} value={index + 1}>
              {name}
            </option>
          ))}
        </select>

        <select
          value={currentYear}
          onChange={handleSelectYear}
          className="text-sm font-semibold text-slate-800 bg-transparent py-1 pl-1 pr-2 rounded hover:bg-slate-100 cursor-pointer focus:outline-none focus:ring-1 focus:ring-teal-600"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={goToNext}
        title="Next Month"
        className="h-8 w-8 text-slate-600 hover:text-slate-900"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
