"use client";

import * as React from "react";
import { Search, Edit2, Trash2, Calendar, Receipt } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { EditExpenseModal, ExpenseItem } from "./edit-expense-modal";
import { deleteExpense } from "@/lib/actions/expenses";
import { formatCurrency } from "@/lib/currency";

interface ExpensesTableProps {
  expenses: ExpenseItem[];
}

export function ExpensesTable({ expenses }: ExpensesTableProps) {
  const [search, setSearch] = React.useState("");
  const [editingExpense, setEditingExpense] = React.useState<ExpenseItem | null>(null);

  // Delete confirmation
  const [confirmDeleteExpense, setConfirmDeleteExpense] = React.useState<ExpenseItem | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const filtered = React.useMemo(() => {
    return expenses.filter((e) =>
      e.description.toLowerCase().includes(search.toLowerCase())
    );
  }, [expenses, search]);

  const handleDelete = async () => {
    if (!confirmDeleteExpense) return;
    setDeleting(true);
    try {
      await deleteExpense(confirmDeleteExpense.id);
      setConfirmDeleteExpense(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search expenses by description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          {expenses.length} record{expenses.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <Receipt className="mx-auto h-8 w-8 text-slate-300 mb-2" />
            <p className="text-sm font-medium text-slate-600">No expenses recorded for this month</p>
            <p className="text-xs text-slate-400 mt-1">
              {search
                ? "No expenses matched your search."
                : "Click 'Add Expense' above to log an expense for this period."}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date Incurred</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-semibold text-slate-800">
                    {item.description}
                  </TableCell>
                  <TableCell className="font-bold text-amber-700">
                    {formatCurrency(item.amount)}
                  </TableCell>
                  <TableCell className="text-slate-600 text-xs">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {new Date(item.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingExpense(item)}
                        className="h-8 px-2 text-slate-600 hover:text-slate-900"
                        title="Edit Expense"
                      >
                        <Edit2 className="h-3.5 w-3.5 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirmDeleteExpense(item)}
                        className="h-8 px-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50"
                        title="Delete Expense"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Edit Modal */}
      {editingExpense && (
        <EditExpenseModal
          expense={editingExpense}
          open={!!editingExpense}
          onOpenChange={(open) => !open && setEditingExpense(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!confirmDeleteExpense}
        onOpenChange={(open) => !open && setConfirmDeleteExpense(null)}
        title="Delete Expense Record?"
        description={`Are you sure you want to delete the expense "${confirmDeleteExpense?.description}" for ${formatCurrency(confirmDeleteExpense?.amount)}? This action cannot be undone.`}
      >
        <div className="flex items-center justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => setConfirmDeleteExpense(null)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Yes, Delete Expense"}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
