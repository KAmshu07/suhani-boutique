// ─── Service Definitions ─────────────────────────────────────────
// Zero imports. Zero functions. Plain data describing available services.

export const services = [
  {
    key: "custom_stitching",
    icon: "scissors",
    priceRange: "500-5000",
  },
  {
    key: "alterations",
    icon: "ruler",
    priceRange: "100-1500",
  },
  {
    key: "bridal_wear",
    icon: "crown",
    priceRange: "5000-50000",
  },
  {
    key: "fabric_sales",
    icon: "fabric",
    priceRange: "200-2000",
  },
  {
    key: "ready_made",
    icon: "shirt",
    priceRange: "500-5000",
  },
  {
    key: "accessories",
    icon: "sparkles",
    priceRange: "100-3000",
  },
] as const;
