"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { recordOrUpdatePayment } from "@/lib/actions/payments";
import { CURRENCY_CONFIG, formatCurrency, formatMonthYear } from "@/lib/currency";

interface PersonInfo {
  id: string;
  name: string;
  monthlyFee: number;
}

interface MarkPaidModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  person: PersonInfo;
  defaultMonth: number;
  defaultYear: number;
  existingAmount?: number;
  existingDate?: Date;
}

export function MarkPaidModal({
  open,
  onOpenChange,
  person,
  defaultMonth,
  defaultYear,
  existingAmount,
  existingDate,
}: MarkPaidModalProps) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [amount, setAmount] = React.useState<string>(
    existingAmount !== undefined ? existingAmount.toString() : person.monthlyFee.toString()
  );

  const [month, setMonth] = React.useState<number>(defaultMonth);
  const [year, setYear] = React.useState<number>(defaultYear);

  const initialDateStr = existingDate
    ? new Date(existingDate).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];
  const [paidAtDate, setPaidAtDate] = React.useState(initialDateStr);

  React.useEffect(() => {
    setAmount(
      existingAmount !== undefined ? existingAmount.toString() : person.monthlyFee.toString()
    );
    setMonth(defaultMonth);
    setYear(defaultYear);
    setPaidAtDate(
      existingDate
        ? new Date(existingDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0]
    );
    setError(null);
  }, [open, person, defaultMonth, defaultYear, existingAmount, existingDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount < 0) {
        throw new Error("Payment amount must be a non-negative number.");
      }

      const res = await recordOrUpdatePayment({
        personId: person.id,
        month,
        year,
        amount: parsedAmount,
        paidAt: new Date(paidAtDate),
      });

      if (!res.success) {
        setError(res.error || "Failed to save payment");
      } else {
        onOpenChange(false);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to process payment");
    } finally {
      setLoading(false);
    }
  };

  const isEditing = existingAmount !== undefined;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? `Edit Payment for ${person.name}` : `Mark Payment for ${person.name}`}
      description={`Record collection for ${formatMonthYear(month, year)}`}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
            {error}
          </div>
        )}

        <div className="rounded-lg bg-slate-50 p-3 border border-slate-200/60 text-xs text-slate-600 flex justify-between items-center">
          <span>Expected Monthly Fee:</span>
          <span className="font-bold text-slate-900">{formatCurrency(person.monthlyFee)}</span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Actual Paid Amount ({CURRENCY_CONFIG.code}) <span className="text-rose-500">*</span>
          </label>
          <Input
            type="number"
            step="any"
            min="0"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={loading}
            placeholder={`Default: ${person.monthlyFee}`}
          />
          <p className="mt-1 text-[11px] text-slate-400">
            Enter the exact amount collected. If less than {formatCurrency(person.monthlyFee)}, it will be marked as partial payment.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Payment Date <span className="text-rose-500">*</span>
          </label>
          <Input
            type="date"
            required
            value={paidAtDate}
            onChange={(e) => setPaidAtDate(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="gap-1.5">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEditing ? "Update Payment" : "Save Payment"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
