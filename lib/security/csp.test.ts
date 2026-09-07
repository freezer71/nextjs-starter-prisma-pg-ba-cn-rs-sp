import { describe, expect, it } from "vitest";

import { buildCsp, generateNonce } from "./csp";

describe("buildCsp", () => {
  it("inclut le nonce et strict-dynamic dans script-src", () => {
    const csp = buildCsp({ nonce: "abc123" });
    expect(csp).toMatch(/script-src [^;]*'nonce-abc123'/);
    expect(csp).toMatch(/script-src [^;]*'strict-dynamic'/);
  });

  it("n'autorise unsafe-eval qu'en développement", () => {
    expect(buildCsp({ nonce: "n", isDev: true })).toContain("'unsafe-eval'");
    expect(buildCsp({ nonce: "n", isDev: false })).not.toContain("'unsafe-eval'");
  });

  it("interdit l'embarquement dans une iframe et les objets", () => {
    const csp = buildCsp({ nonce: "n" });
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("form-action 'self'");
  });

  it("force HTTPS en production uniquement", () => {
    expect(buildCsp({ nonce: "n", isDev: false })).toContain("upgrade-insecure-requests");
    expect(buildCsp({ nonce: "n", isDev: true })).not.toContain("upgrade-insecure-requests");
  });

  it("autorise les domaines Stripe", () => {
    const csp = buildCsp({ nonce: "n" });
    expect(csp).toMatch(/frame-src [^;]*https:\/\/checkout\.stripe\.com/);
    expect(csp).toMatch(/connect-src [^;]*https:\/\/api\.stripe\.com/);
  });
});

describe("generateNonce", () => {
  it("produit des nonces uniques en base64", () => {
    const a = generateNonce();
    const b = generateNonce();
    expect(a).not.toBe(b);
    expect(a).toMatch(/^[A-Za-z0-9+/]+=*$/);
  });
});
