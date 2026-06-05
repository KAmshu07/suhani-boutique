import { describe, it, expect } from "vitest";
import { formatINR, formatDate } from "./format";

describe("formatINR", () => {
  it("groups with Indian digit grouping and a rupee sign", () => {
    expect(formatINR(125000)).toBe("₹1,25,000");
  });
  it("handles zero and small numbers", () => {
    expect(formatINR(0)).toBe("₹0");
    expect(formatINR(500)).toBe("₹500");
  });
  it("coerces non-finite values to ₹0", () => {
    expect(formatINR(NaN)).toBe("₹0");
    expect(formatINR(Infinity)).toBe("₹0");
  });
});

describe("formatDate", () => {
  it("formats a date-only ISO string day-first", () => {
    // Assert by parts so an ICU/Node change to the separator or month glyph
    // doesn't break the build without a behavior change.
    const out = formatDate("2026-06-21");
    expect(out).toContain("21");
    expect(out).toContain("Jun");
    expect(out).toContain("2026");
    expect(out.indexOf("21")).toBeLessThan(out.indexOf("2026")); // day before year
  });
  it("returns empty string for nullish or empty input", () => {
    expect(formatDate(null)).toBe("");
    expect(formatDate(undefined)).toBe("");
    expect(formatDate("")).toBe("");
  });
  it("returns empty string for an unparseable date", () => {
    expect(formatDate("not-a-date")).toBe("");
  });
});
