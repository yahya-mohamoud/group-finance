"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { updatePerson } from "@/lib/actions/people";
import { CURRENCY_CONFIG } from "@/lib/currency";

interface PersonData {
  id: string;
  name: string;
  phone: string;
  monthlyFee: number;
  active: boolean;
}

interface EditPersonModalProps {
  person: PersonData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditPersonModal({
  person,
  open,
  onOpenChange,
}: EditPersonModalProps) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [name, setName] = React.useState(person.name);
  const [phone, setPhone] = React.useState(person.phone);
  const [monthlyFee, setMonthlyFee] = React.useState(person.monthlyFee.toString());
  const [active, setActive] = React.useState(person.active);

  React.useEffect(() => {
    setName(person.name);
    setPhone(person.phone);
    setMonthlyFee(person.monthlyFee.toString());
    setActive(person.active);
    setError(null);
  }, [person, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const feeNum = parseFloat(monthlyFee);
      if (isNaN(feeNum) || feeNum < 0) {
        throw new Error("Monthly fee must be a valid positive number.");
      }

      const res = await updatePerson(person.id, {
        name,
        phone,
        monthlyFee: feeNum,
        active,
      });

      if (!res.success) {
        setError(res.error || "Failed to update member");
      } else {
        onOpenChange(false);
      }
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Member Information"
      description="Update contact information, fee, or active status. Note that changing monthly fee will not alter historical payments."
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
            value={monthlyFee}
            onChange={(e) => setMonthlyFee(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 h-4 w-4"
              disabled={loading}
            />
            <span className="text-sm font-medium text-slate-700">
              Active Member
            </span>
          </label>
          <p className="mt-0.5 ml-6 text-xs text-slate-400">
            Inactive members will not be included in expected totals for future monthly calculations.
          </p>
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
