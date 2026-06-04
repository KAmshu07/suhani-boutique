import { describe, it, expect } from "vitest";
import { getLocalizedField } from "./localized";

describe("getLocalizedField", () => {
  it("returns the value for the requested language", () => {
    expect(getLocalizedField({ en: "Hi", hi: "नमस्ते", cg: "नमस्ते" }, "hi")).toBe("नमस्ते");
  });
  it("falls back to en when the language is missing", () => {
    expect(getLocalizedField({ en: "Hi" }, "cg")).toBe("Hi");
  });
  it("returns empty string for nullish input", () => {
    expect(getLocalizedField(null, "en")).toBe("");
    expect(getLocalizedField(undefined, "hi")).toBe("");
  });
});
