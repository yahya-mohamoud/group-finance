"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  XCircle,
  PlusCircle,
  Edit2,
  Trash2,
  Check,
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { MarkPaidModal } from "./mark-paid-modal";
import { deletePayment } from "@/lib/actions/payments";
import { PersonPaymentStatus } from "@/lib/calculations";
import { formatCurrency } from "@/lib/currency";

interface MonthlyPaymentsTableProps {
  statuses: PersonPaymentStatus[];
  selectedMonth: number;
  selectedYear: number;
}

export function MonthlyPaymentsTable({
  statuses,
  selectedMonth,
  selectedYear,
}: MonthlyPaymentsTableProps) {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<
    "ALL" | "PAID" | "NOT_PAID" | "PARTIAL"
  >("ALL");

  // State for Mark as Paid modal
  const [modalPerson, setModalPerson] = React.useState<{
    id: string;
    name: string;
    monthlyFee: number;
    existingAmount?: number;
    existingDate?: Date;
  } | null>(null);

  // State for delete confirmation
  const [confirmDeletePaymentId, setConfirmDeletePaymentId] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const filtered = React.useMemo(() => {
    return statuses.filter((item) => {
      const matchesSearch = item.person.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [statuses, search, statusFilter]);

  const counts = React.useMemo(() => {
    const total = statuses.length;
    const paid = statuses.filter((s) => s.status === "PAID").length;
    const partial = statuses.filter((s) => s.status === "PARTIAL").length;
    const unpaid = statuses.filter((s) => s.status === "NOT_PAID").length;
    return { total, paid, partial, unpaid };
  }, [statuses]);

  const handleDelete = async () => {
    if (!confirmDeletePaymentId) return;
    setDeleting(true);
    try {
      await deletePayment(confirmDeletePaymentId);
      setConfirmDeletePaymentId(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search member by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
          <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs font-medium shrink-0">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                statusFilter === "ALL"
                  ? "bg-teal-700 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All ({counts.total})
            </button>
            <button
              onClick={() => setStatusFilter("PAID")}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                statusFilter === "PAID"
                  ? "bg-teal-700 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Paid ({counts.paid})
            </button>
            <button
              onClick={() => setStatusFilter("PARTIAL")}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                statusFilter === "PARTIAL"
                  ? "bg-teal-700 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Partial ({counts.partial})
            </button>
            <button
              onClick={() => setStatusFilter("NOT_PAID")}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                statusFilter === "NOT_PAID"
                  ? "bg-teal-700 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Not Paid ({counts.unpaid})
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm font-medium text-slate-600">No member records match</p>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your search criteria or filter options.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Person</TableHead>
                <TableHead>Expected</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.person.id}>
                  <TableCell className="font-semibold text-slate-900">
                    <Link
                      href={`/people/${item.person.id}`}
                      className="hover:text-teal-700 hover:underline inline-flex items-center gap-1.5"
                    >
                      {item.person.name}
                      {!item.person.active && (
                        <span className="text-[10px] text-slate-400 font-normal">
                          (Inactive)
                        </span>
                      )}
                    </Link>
                  </TableCell>
                  <TableCell className="text-slate-600 font-medium">
                    {formatCurrency(item.expectedFee)}
                  </TableCell>
                  <TableCell className="font-bold text-slate-900">
                    {item.paidAmount > 0 ? (
                      formatCurrency(item.paidAmount)
                    ) : (
                      <span className="text-slate-400 font-normal">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.status === "PAID" ? (
                      <Badge variant="success" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Paid
                      </Badge>
                    ) : item.status === "PARTIAL" ? (
                      <Badge variant="warning" className="gap-1">
                        <AlertCircle className="h-3 w-3" /> Partial
                      </Badge>
                    ) : (
                      <Badge variant="danger" className="gap-1">
                        <XCircle className="h-3 w-3" /> Not Paid
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.status === "NOT_PAID" ? (
                      <Button
                        size="sm"
                        onClick={() =>
                          setModalPerson({
                            id: item.person.id,
                            name: item.person.name,
                            monthlyFee: item.expectedFee,
                          })
                        }
                        className="h-8 px-3 gap-1 bg-teal-700 hover:bg-teal-800 text-white"
                      >
                        <Check className="h-3.5 w-3.5" /> Mark Paid
                      </Button>
                    ) : (
                      <div className="inline-flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setModalPerson({
                              id: item.person.id,
                              name: item.person.name,
                              monthlyFee: item.expectedFee,
                              existingAmount: item.paidAmount,
                              existingDate: item.paidAt ? new Date(item.paidAt) : undefined,
                            })
                          }
                          className="h-8 px-2.5 text-slate-700"
                          title="Edit Payment Amount"
                        >
                          <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setConfirmDeletePaymentId(item.paymentId!)}
                          className="h-8 px-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50"
                          title="Remove/Correct Payment"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Modal for Recording / Editing Payment */}
      {modalPerson && (
        <MarkPaidModal
          open={!!modalPerson}
          onOpenChange={(open) => !open && setModalPerson(null)}
          person={modalPerson}
          defaultMonth={selectedMonth}
          defaultYear={selectedYear}
          existingAmount={modalPerson.existingAmount}
          existingDate={modalPerson.existingDate}
        />
      )}

      {/* Delete / Correct Payment Confirmation Dialog */}
      <Dialog
        open={!!confirmDeletePaymentId}
        onOpenChange={(open) => !open && setConfirmDeletePaymentId(null)}
        title="Remove Payment Record?"
        description="Are you sure you want to remove this payment? The member will be marked as 'Not Paid' for this month, and collected totals will be recalculated."
      >
        <div className="flex items-center justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => setConfirmDeletePaymentId(null)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Removing..." : "Yes, Remove Payment"}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
