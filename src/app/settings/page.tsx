"use client";

import * as React from "react";
import { KeyRound, ShieldCheck, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { changePin } from "@/lib/actions/auth";

export default function SettingsPage() {
  const [currentPin, setCurrentPin] = React.useState("");
  const [newPin, setNewPin] = React.useState("");
  const [confirmNewPin, setConfirmNewPin] = React.useState("");

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (currentPin.length !== 4) {
      setError("Current PIN must be exactly 4 numeric digits.");
      return;
    }
    if (newPin.length !== 4) {
      setError("New PIN must be exactly 4 numeric digits.");
      return;
    }
    if (newPin !== confirmNewPin) {
      setError("New PIN and confirmation PIN do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await changePin(currentPin, newPin, confirmNewPin);
      if (!res.success) {
        setError(res.error || "Failed to update PIN");
      } else {
        setSuccess(true);
        setCurrentPin("");
        setNewPin("");
        setConfirmNewPin("");
      }
    } catch (err: any) {
      setError(err?.message || "An error occurred while updating the PIN");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Security Settings
        </h1>
        <p className="text-sm text-slate-500">
          Manage your organization security credentials and access PIN.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 text-teal-800">
            <KeyRound className="h-5 w-5 text-teal-700" />
            <CardTitle>Change 4-Digit Access PIN</CardTitle>
          </div>
          <CardDescription>
            Update the recurring administrator PIN used to unlock this ledger. The new PIN will be hashed using Argon2id.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                <span>PIN has been successfully updated! Use your new PIN on your next login.</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Current PIN <span className="text-rose-500">*</span>
              </label>
              <Input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                required
                placeholder="••••"
                value={currentPin}
                onChange={(e) =>
                  setCurrentPin(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                disabled={loading}
              />
              <p className="text-[11px] text-slate-400 mt-0.5">
                Default PIN is 1234 on fresh installations.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                New 4-Digit PIN <span className="text-rose-500">*</span>
              </label>
              <Input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                required
                placeholder="••••"
                value={newPin}
                onChange={(e) =>
                  setNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirm New PIN <span className="text-rose-500">*</span>
              </label>
              <Input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                required
                placeholder="••••"
                value={confirmNewPin}
                onChange={(e) =>
                  setConfirmNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                disabled={loading}
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" disabled={loading} className="gap-2">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating PIN...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    Update Access PIN
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
