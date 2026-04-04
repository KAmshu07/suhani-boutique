// ─── Order Statuses ──────────────────────────────────────────────
export const ORDER_STATUS = {
  BOOKED: "booked",
  CONSULTED: "consulted",
  MEASURED: "measured",
  FABRIC_SELECTED: "fabric_selected",
  IN_PROGRESS: "in_progress",
  READY_FOR_FITTING: "ready_for_fitting",
  ALTERATIONS: "alterations",
  COMPLETED: "completed",
  DELIVERED: "delivered",
} as const;

// ─── Payment Methods ─────────────────────────────────────────────
export const PAYMENT_METHOD = {
  CASH: "cash",
  UPI: "upi",
} as const;

// ─── Payment Statuses ────────────────────────────────────────────
export const PAYMENT_STATUS = {
  PENDING: "pending",
  PARTIAL: "partial",
  PAID: "paid",
} as const;

// ─── User Roles ──────────────────────────────────────────────────
export const USER_ROLE = {
  CUSTOMER: "customer",
  ADMIN: "admin",
} as const;

// ─── Supported Languages ─────────────────────────────────────────
export const LANGUAGE = {
  EN: "en",
  HI: "hi",
  CG: "cg",
} as const;

// ─── Service Categories ──────────────────────────────────────────
export const SERVICE_CATEGORY = {
  CUSTOM_STITCHING: "custom_stitching",
  ALTERATIONS: "alterations",
  BRIDAL_WEAR: "bridal_wear",
  FABRIC_SALES: "fabric_sales",
  READY_MADE: "ready_made",
  ACCESSORIES: "accessories",
} as const;

// ─── Appointment Statuses ────────────────────────────────────────
export const APPOINTMENT_STATUS = {
  REQUESTED: "requested",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
} as const;

// ─── Route Paths ─────────────────────────────────────────────────
// (add as features are built)

// ─── CSS / Layout ────────────────────────────────────────────────
// (add as components are built)

// ─── External URLs ───────────────────────────────────────────────
// (add as integrations are wired)
