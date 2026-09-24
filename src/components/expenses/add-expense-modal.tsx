"use client";

import * as React from "react";
import { PlusCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { createExpense } from "@/lib/actions/expenses";
import { CURRENCY_CONFIG } from "@/lib/currency";

interface AddExpenseModalProps {
  defaultMonth: number;
  defaultYear: number;
}

export function AddExpenseModal({ defaultMonth, defaultYear }: AddExpenseModalProps) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [description, setDescription] = React.useState("");
  const [amount, setAmount] = React.useState("");

  // Default date to today, or 1st of selected month if looking at historical month
  const today = new Date();
  const initialDateStr =
    today.getMonth() + 1 === defaultMonth && today.getFullYear() === defaultYear
      ? today.toISOString().split("T")[0]
      : `${defaultYear}-${String(defaultMonth).padStart(2, "0")}-01`;

  const [date, setDate] = React.useState(initialDateStr);

  React.useEffect(() => {
    const d =
      today.getMonth() + 1 === defaultMonth && today.getFullYear() === defaultYear
        ? today.toISOString().split("T")[0]
        : `${defaultYear}-${String(defaultMonth).padStart(2, "0")}-01`;
    setDate(d);
  }, [defaultMonth, defaultYear, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new Error("Expense amount must be a number greater than zero.");
      }

      const res = await createExpense({
        description,
        amount: parsedAmount,
        date: new Date(date),
      });

      if (!res.success) {
        setError(res.error || "Failed to record expense");
      } else {
        setDescription("");
        setAmount("");
        setOpen(false);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to save expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-2 shadow-xs">
        <PlusCircle className="h-4 w-4" />
        Add Expense
      </Button>

      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Record New Expense"
        description="Add an organization expense incurred during this monthly cycle."
        maxWidth="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description <span className="text-rose-500">*</span>
            </label>
            <Input
              type="text"
              required
              placeholder="e.g. Electricity bill, Hall rent, Supplies"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Amount ({CURRENCY_CONFIG.code}) <span className="text-rose-500">*</span>
            </label>
            <Input
              type="number"
              step="any"
              min="0.01"
              required
              placeholder="e.g. 250"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Date Incurred <span className="text-rose-500">*</span>
            </label>
            <Input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="gap-1.5">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Expense
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
