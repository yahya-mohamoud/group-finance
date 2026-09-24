"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Phone,
  Wallet,
  Calendar,
  Edit2,
  PlusCircle,
  Trash2,
  CheckCircle2,
  AlertCircle,
  UserX,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { EditPersonModal } from "./edit-person-modal";
import { MarkPaidModal } from "@/components/payments/mark-paid-modal";
import { deletePayment } from "@/lib/actions/payments";
import { deletePersonSafely, togglePersonStatus } from "@/lib/actions/people";
import { formatCurrency, formatMonthYear } from "@/lib/currency";

interface PaymentHistoryItem {
  id: string;
  month: number;
  year: number;
  amount: number;
  paidAt: Date | string;
}

interface PersonDetailsViewProps {
  person: {
    id: string;
    name: string;
    phone: string;
    monthlyFee: number;
    active: boolean;
    createdAt: Date | string;
    payments: PaymentHistoryItem[];
  };
}

export function PersonDetailsView({ person }: PersonDetailsViewProps) {
  const router = useRouter();

  const [editOpen, setEditOpen] = React.useState(false);
  const [recordPaymentOpen, setRecordPaymentOpen] = React.useState(false);
  const [editingPayment, setEditingPayment] = React.useState<PaymentHistoryItem | null>(null);

  // Member delete dialog
  const [confirmDeletePerson, setConfirmDeletePerson] = React.useState(false);
  const [deletingPerson, setDeletingPerson] = React.useState(false);
  const [deletePersonError, setDeletePersonError] = React.useState<string | null>(null);

  // Payment delete dialog
  const [confirmDeletePaymentId, setConfirmDeletePaymentId] = React.useState<string | null>(null);
  const [deletingPayment, setDeletingPayment] = React.useState(false);

  const totalPaid = person.payments.reduce((sum, p) => sum + p.amount, 0);

  const handleDeleteMember = async () => {
    setDeletingPerson(true);
    setDeletePersonError(null);
    try {
      const res = await deletePersonSafely(person.id);
      if (!res.success) {
        setDeletePersonError(res.error || "Failed to delete person");
      } else {
        router.push("/people");
      }
    } catch (err: any) {
      setDeletePersonError(err?.message || "Failed to delete person");
    } finally {
      setDeletingPerson(false);
    }
  };

  const handleDeactivateInstead = async () => {
    setDeletingPerson(true);
    try {
      await togglePersonStatus(person.id, false);
      setConfirmDeletePerson(false);
      setDeletePersonError(null);
      router.refresh();
    } finally {
      setDeletingPerson(false);
    }
  };

  const handleDeletePaymentConfirm = async () => {
    if (!confirmDeletePaymentId) return;
    setDeletingPayment(true);
    try {
      await deletePayment(confirmDeletePaymentId, person.id);
      setConfirmDeletePaymentId(null);
    } finally {
      setDeletingPayment(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/people"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to People
        </Link>
      </div>

      {/* Profile Overview Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">{person.name}</h1>
                {person.active ? (
                  <Badge variant="success">Active Member</Badge>
                ) : (
                  <Badge variant="secondary">Inactive</Badge>
                )}
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4 text-slate-400" />
                  {person.phone}
                </span>
                <span className="flex items-center gap-1.5">
                  <Wallet className="h-4 w-4 text-slate-400" />
                  Expected Fee:{" "}
                  <strong className="text-slate-800 font-semibold">
                    {formatCurrency(person.monthlyFee)}
                  </strong>{" "}
                  / month
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  Registered:{" "}
                  {new Date(person.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditOpen(true)}
                className="gap-1.5"
              >
                <Edit2 className="h-4 w-4" />
                Edit Profile
              </Button>

              <Button
                size="sm"
                onClick={() => setRecordPaymentOpen(true)}
                className="gap-1.5"
              >
                <PlusCircle className="h-4 w-4" />
                Record Payment
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDeletePersonError(null);
                  setConfirmDeletePerson(true);
                }}
                className="gap-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 border-rose-200"
                title="Delete Member"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-slate-100 pt-4">
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold">Total Contributed</span>
              <p className="text-lg font-bold text-teal-800 mt-0.5">{formatCurrency(totalPaid)}</p>
            </div>
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold">Payments Recorded</span>
              <p className="text-lg font-bold text-slate-800 mt-0.5">
                {person.payments.length} month{person.payments.length === 1 ? "" : "s"}
              </p>
            </div>
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold">Expected Monthly</span>
              <p className="text-lg font-bold text-slate-800 mt-0.5">{formatCurrency(person.monthlyFee)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment History Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-semibold text-slate-900">
            Payment History
          </CardTitle>
          <span className="text-xs text-slate-400">
            {person.payments.length} recorded payments
          </span>
        </CardHeader>
        <CardContent className="p-0">
          {person.payments.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm font-medium text-slate-600">No payment history yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Record a payment for this person to start tracking their contributions.
              </p>
              <Button
                size="sm"
                onClick={() => setRecordPaymentOpen(true)}
                className="mt-3 gap-1.5"
              >
                <PlusCircle className="h-4 w-4" /> Record First Payment
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Billing Month</TableHead>
                  <TableHead>Expected</TableHead>
                  <TableHead>Amount Paid</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {person.payments.map((p) => {
                  const isPartial = p.amount < person.monthlyFee;
                  const isPaid = p.amount >= person.monthlyFee;

                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-semibold text-slate-800">
                        {formatMonthYear(p.month, p.year)}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {formatCurrency(person.monthlyFee)}
                      </TableCell>
                      <TableCell className="font-bold text-slate-900">
                        {formatCurrency(p.amount)}
                      </TableCell>
                      <TableCell className="text-slate-500 text-xs">
                        {new Date(p.paidAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        {isPaid ? (
                          <Badge variant="success" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Paid
                          </Badge>
                        ) : isPartial ? (
                          <Badge variant="warning" className="gap-1">
                            <AlertCircle className="h-3 w-3" /> Partial
                          </Badge>
                        ) : (
                          <Badge variant="danger">Not Paid</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingPayment(p)}
                            className="h-8 px-2 text-slate-600 hover:text-slate-900"
                            title="Edit Payment"
                          >
                            <Edit2 className="h-3.5 w-3.5 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setConfirmDeletePaymentId(p.id)}
                            className="h-8 px-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50"
                            title="Remove Payment Record"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Profile Modal */}
      <EditPersonModal
        person={person}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      {/* Record New Payment Modal */}
      <MarkPaidModal
        open={recordPaymentOpen}
        onOpenChange={setRecordPaymentOpen}
        person={person}
        defaultMonth={new Date().getMonth() + 1}
        defaultYear={new Date().getFullYear()}
      />

      {/* Edit Existing Payment Modal */}
      {editingPayment && (
        <MarkPaidModal
          open={!!editingPayment}
          onOpenChange={(open) => !open && setEditingPayment(null)}
          person={person}
          defaultMonth={editingPayment.month}
          defaultYear={editingPayment.year}
          existingAmount={editingPayment.amount}
          existingDate={new Date(editingPayment.paidAt)}
        />
      )}

      {/* Delete Member Confirmation Dialog - matches Expenses delete dialog */}
      <Dialog
        open={confirmDeletePerson}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmDeletePerson(false);
            setDeletePersonError(null);
          }
        }}
        title="Delete Member?"
        description={`Are you sure you want to delete "${person.name}"? This action cannot be undone.`}
      >
        {deletePersonError && (
          <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 mt-2 mb-2">
            <p className="font-semibold">{deletePersonError}</p>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => {
              setConfirmDeletePerson(false);
              setDeletePersonError(null);
            }}
            disabled={deletingPerson}
          >
            Cancel
          </Button>

          {deletePersonError ? (
            <Button
              variant="primary"
              onClick={handleDeactivateInstead}
              disabled={deletingPerson}
            >
              {deletingPerson ? "Deactivating..." : "Deactivate Instead"}
            </Button>
          ) : (
            <Button
              variant="danger"
              onClick={handleDeleteMember}
              disabled={deletingPerson}
            >
              {deletingPerson ? "Deleting..." : "Yes, Delete Member"}
            </Button>
          )}
        </div>
      </Dialog>

      {/* Delete Payment Confirmation Dialog */}
      <Dialog
        open={!!confirmDeletePaymentId}
        onOpenChange={(open) => !open && setConfirmDeletePaymentId(null)}
        title="Remove Payment Record?"
        description="Are you sure you want to remove this payment record? This action cannot be undone."
      >
        <div className="flex items-center justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => setConfirmDeletePaymentId(null)}
            disabled={deletingPayment}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeletePaymentConfirm}
            disabled={deletingPayment}
          >
            {deletingPayment ? "Removing..." : "Yes, Remove Payment"}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
