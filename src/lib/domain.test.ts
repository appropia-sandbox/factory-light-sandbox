import { describe, expect, it } from "vitest";
import { isAllowedEmail } from "./domain";

describe("isAllowedEmail", () => {
  it("acepta correos del dominio permitido", () => {
    expect(isAllowedEmail("ana@appropia.com", "appropia.com")).toBe(true);
    expect(isAllowedEmail("ANA@Appropia.com", "appropia.com")).toBe(true);
  });
  it("rechaza otros dominios y subdominios falsos", () => {
    expect(isAllowedEmail("ana@gmail.com", "appropia.com")).toBe(false);
    expect(isAllowedEmail("ana@evil-appropia.com", "appropia.com")).toBe(false);
    expect(isAllowedEmail("ana@appropia.com.evil.io", "appropia.com")).toBe(false);
  });
  it("rechaza valores vacios", () => {
    expect(isAllowedEmail(null, "appropia.com")).toBe(false);
    expect(isAllowedEmail("", "appropia.com")).toBe(false);
  });
});
