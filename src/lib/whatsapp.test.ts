import { describe, it, expect } from "vitest";
import { getContactUrl } from "./whatsapp";

describe("getContactUrl", () => {
  it("prefixes 91 for a bare 10-digit number", () => {
    expect(getContactUrl("9876543210")).toBe("https://wa.me/919876543210");
  });
  it("strips non-digits and keeps an already-qualified number", () => {
    expect(getContactUrl("+91 98765 43210")).toBe("https://wa.me/919876543210");
  });
});
