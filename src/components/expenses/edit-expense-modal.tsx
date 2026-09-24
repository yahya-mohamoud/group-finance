"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { updateExpense } from "@/lib/actions/expenses";
import { CURRENCY_CONFIG } from "@/lib/currency";

export interface ExpenseItem {
  id: string;
  description: string;
  amount: number;
  date: Date | string;
}

interface EditExpenseModalProps {
  expense: ExpenseItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditExpenseModal({
  expense,
  open,
  onOpenChange,
}: EditExpenseModalProps) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [description, setDescription] = React.useState(expense.description);
  const [amount, setAmount] = React.useState(expense.amount.toString());

  const initialDateStr = new Date(expense.date).toISOString().split("T")[0];
  const [date, setDate] = React.useState(initialDateStr);

  React.useEffect(() => {
    setDescription(expense.description);
    setAmount(expense.amount.toString());
    setDate(new Date(expense.date).toISOString().split("T")[0]);
    setError(null);
  }, [expense, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new Error("Expense amount must be a number greater than zero.");
      }

      const res = await updateExpense(expense.id, {
        description,
        amount: parsedAmount,
        date: new Date(date),
      });

      if (!res.success) {
        setError(res.error || "Failed to update expense");
      } else {
        onOpenChange(false);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to save expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Expense"
      description="Update expense description, amount, or date."
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
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="gap-1.5">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
