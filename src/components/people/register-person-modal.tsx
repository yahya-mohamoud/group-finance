"use client";

import * as React from "react";
import { UserPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { createPerson } from "@/lib/actions/people";
import { CURRENCY_CONFIG } from "@/lib/currency";

export function RegisterPersonModal() {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [monthlyFee, setMonthlyFee] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const feeNum = parseFloat(monthlyFee);
      if (isNaN(feeNum) || feeNum < 0) {
        throw new Error("Monthly fee must be a valid positive number.");
      }

      const res = await createPerson({
        name,
        phone,
        monthlyFee: feeNum,
        active: true,
      });

      if (!res.success) {
        setError(res.error || "Failed to register person");
      } else {
        setName("");
        setPhone("");
        setMonthlyFee("");
        setOpen(false);
      }
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-2 shadow-xs">
        <UserPlus className="h-4 w-4" />
        Register Person
      </Button>

      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Register New Person"
        description="Add a new member to the organization with their expected recurring monthly fee."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <Input
              type="text"
              required
              placeholder="e.g. Ahmed Hassan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Phone Number <span className="text-rose-500">*</span>
            </label>
            <Input
              type="tel"
              required
              placeholder="e.g. +251 91 123 4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Expected Monthly Fee ({CURRENCY_CONFIG.code}) <span className="text-rose-500">*</span>
            </label>
            <Input
              type="number"
              step="any"
              min="0"
              required
              placeholder="e.g. 500"
              value={monthlyFee}
              onChange={(e) => setMonthlyFee(e.target.value)}
              disabled={loading}
            />
            <p className="mt-1 text-[11px] text-slate-400">
              The monthly contribution expected from this person each cycle.
            </p>
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
              Save Member
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
