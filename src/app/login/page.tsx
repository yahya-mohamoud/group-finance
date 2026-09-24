"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Coins, Lock, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loginWithPin } from "@/lib/actions/auth";

export default function LoginPage() {
  const router = useRouter();
  const [pin, setPin] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numeric input up to 4 digits
    const val = e.target.value.replace(/\D/g, "").slice(0, 4);
    setPin(val);
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) {
      setError("PIN must contain exactly 4 numeric digits.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await loginWithPin(pin);
      if (!res.success) {
        setError(res.error || "Incorrect PIN. Please try again.");
        setPin("");
        inputRef.current?.focus();
      } else {
        // Full window navigation ensures cookies are committed and sent on the fresh HTTP request
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-teal-700 flex items-center justify-center text-white shadow-md mb-3">
            <Coins className="h-8 w-8" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            RAJO CHARITY
          </h1>
          <p className="text-xs text-slate-500 font-medium">Monthly Ledger</p>
        </div>

        {/* PIN Login Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="text-center mb-6">
            <h2 className="text-base font-semibold text-slate-800">
              Security Verification
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Enter your 4-digit PIN to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <div className="relative">
                <input
                  ref={inputRef}
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  autoComplete="one-time-code"
                  disabled={loading}
                  value={pin}
                  onChange={handlePinChange}
                  placeholder="••••"
                  className="w-full text-center tracking-[0.75em] text-2xl font-bold py-3 px-4 rounded-xl border border-slate-300 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 transition-all placeholder:tracking-normal placeholder:font-normal placeholder:text-slate-400"
                />
              </div>

              {/* Visual PIN dots indicator */}
              <div className="flex justify-center items-center gap-3 mt-3">
                {[0, 1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className={`h-2.5 w-2.5 rounded-full transition-all ${
                      pin.length > index
                        ? "bg-teal-700 scale-110"
                        : "bg-slate-200"
                    }`}
                  />
                ))}
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || pin.length !== 4}
              className="w-full py-2.5 font-semibold text-sm shadow-xs"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Unlock Ledger
                </>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-[11px] text-slate-400 mt-6">
          Protected private administration ledger
        </p>
      </div>
    </div>
  );
}
