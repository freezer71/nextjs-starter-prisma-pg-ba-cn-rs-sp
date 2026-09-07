import { describe, expect, it } from "vitest";

import { authConfig } from "@/config/auth";

import { emailOnlySchema, fieldErrors, loginSchema, resetPasswordSchema, signupSchema } from "./auth";

const validPassword = "a".repeat(authConfig.passwordMinLength);

describe("schémas d'authentification", () => {
  it("refuse un email invalide", () => {
    const result = emailOnlySchema.safeParse({ email: "pas-un-email" });
    expect(result.success).toBe(false);
    if (!result.success) expect(fieldErrors(result.error)).toEqual({ email: "Adresse email invalide." });
  });

  it("normalise l'email (trim)", () => {
    const result = loginSchema.safeParse({ email: "  marie@example.com ", password: "x" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe("marie@example.com");
  });

  it("refuse un mot de passe trop court à l'inscription", () => {
    const result = signupSchema.safeParse({
      name: "Marie",
      email: "marie@example.com",
      password: "court",
      confirmPassword: "court",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(fieldErrors(result.error).password).toContain(`${authConfig.passwordMinLength}`);
  });

  it("refuse une confirmation différente", () => {
    const result = resetPasswordSchema.safeParse({ password: validPassword, confirmPassword: `${validPassword}b` });
    expect(result.success).toBe(false);
    if (!result.success) expect(fieldErrors(result.error)).toEqual({ confirmPassword: "Les mots de passe ne correspondent pas." });
  });

  it("accepte une inscription valide", () => {
    const result = signupSchema.safeParse({
      name: "Marie",
      email: "marie@example.com",
      password: validPassword,
      confirmPassword: validPassword,
    });
    expect(result.success).toBe(true);
  });
});
