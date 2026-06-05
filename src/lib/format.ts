// Pure display formatters. Zero side effects. Storage stays ISO/number;
// these only shape what the admin SEES (Indian digit grouping, day-first dates).

const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

// ₹125000 -> "₹1,25,000". Non-finite values render as ₹0 (never "₹NaN").
export function formatINR(amount: number): string {
  const n = Number.isFinite(amount) ? amount : 0;
  return "₹" + inr.format(n);
}

// Date-only ISO strings are formatted in UTC so the calendar date never shifts
// with the runtime timezone. "2026-06-21" -> "21 Jun 2026". Empty for nullish.
const dateFmt = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return dateFmt.format(d);
}
