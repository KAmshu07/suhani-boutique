// ─── Order Status Flow ───────────────────────────────────────────
// Zero imports. Zero functions. Describes the 9-step order pipeline.
// Each status knows which statuses can follow it.

export const orderFlow = [
  { key: "booked", step: 1, next: ["consulted"] },
  { key: "consulted", step: 2, next: ["measured"] },
  { key: "measured", step: 3, next: ["fabric_selected"] },
  { key: "fabric_selected", step: 4, next: ["in_progress"] },
  { key: "in_progress", step: 5, next: ["ready_for_fitting"] },
  { key: "ready_for_fitting", step: 6, next: ["alterations", "completed"] },
  { key: "alterations", step: 7, next: ["completed"] },
  { key: "completed", step: 8, next: ["delivered"] },
  { key: "delivered", step: 9, next: [] },
] as const;
