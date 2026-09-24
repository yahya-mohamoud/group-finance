/**
 * Global Currency Configuration
 * Can be changed to "USD", "EUR", "KES", etc., or overridden via env vars.
 */
export const CURRENCY_CONFIG = {
  code: process.env.NEXT_PUBLIC_CURRENCY_CODE || "ETB",
  symbol: process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "ETB",
  position: "prefix" as "prefix" | "suffix",
};

/**
 * Format a number as currency, e.g., "ETB 5,200" or "ETB 5,200.50"
 */
export function formatCurrency(
  amount: number | null | undefined,
  includeDecimals: boolean = false
): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return `${CURRENCY_CONFIG.symbol} 0`;
  }

  const hasFractions = amount % 1 !== 0;
  const showDecimals = includeDecimals || hasFractions;

  const formattedNumber = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount);

  return `${CURRENCY_CONFIG.symbol} ${formattedNumber}`;
}

/**
 * Format a month and year for display, e.g. "September 2026"
 */
export function formatMonthYear(month: number, year: number): string {
  const date = new Date(year, month - 1, 1);
  return date.toLocaleString("en-US", { month: "long", year: "numeric" });
}

/**
 * Get short month name, e.g. "Sep"
 */
export function getShortMonth(month: number): string {
  const date = new Date(2020, month - 1, 1);
  return date.toLocaleString("en-US", { month: "short" });
}
