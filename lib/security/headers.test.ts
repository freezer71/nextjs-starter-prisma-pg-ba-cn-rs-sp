import { describe, expect, it } from "vitest";

import { securityHeaders } from "./headers";

describe("securityHeaders", () => {
  it("contient les en-têtes de base", () => {
    const keys = securityHeaders({ isProduction: false }).map((h) => h.key);
    expect(keys).toEqual(
      expect.arrayContaining(["X-Content-Type-Options", "X-Frame-Options", "Referrer-Policy", "Permissions-Policy"]),
    );
  });

  it("n'active HSTS qu'en production", () => {
    expect(securityHeaders({ isProduction: false }).some((h) => h.key === "Strict-Transport-Security")).toBe(false);
    expect(securityHeaders({ isProduction: true }).some((h) => h.key === "Strict-Transport-Security")).toBe(true);
  });
});
