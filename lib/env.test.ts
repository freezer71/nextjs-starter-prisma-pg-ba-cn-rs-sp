import { describe, expect, it } from "vitest";

/**
 * La validation d'env est construite avec @t3-oss/env-nextjs : on vérifie ici
 * que les règles zod refusent bien une configuration invalide (fail fast).
 */
describe("env", () => {
  it("refuse une configuration invalide", async () => {
    const { createEnv } = await import("@t3-oss/env-nextjs");
    const { z } = await import("zod");
    expect(() =>
      createEnv({
        server: { BETTER_AUTH_SECRET: z.string().min(32) },
        runtimeEnv: { BETTER_AUTH_SECRET: "trop-court" },
        skipValidation: false,
      }),
    ).toThrow();
  });

  it("accepte la configuration d'exemple", async () => {
    process.env.SKIP_ENV_VALIDATION = "";
    process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/starter";
    process.env.BETTER_AUTH_SECRET = "x".repeat(32);
    process.env.EMAIL_FROM = "Starter <onboarding@resend.dev>";
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
    process.env.STRIPE_SECRET_KEY = "";
    const { env } = await import("./env");
    expect(env.NEXT_PUBLIC_APP_URL).toBe("http://localhost:3000");
    expect(env.STRIPE_SECRET_KEY).toBeUndefined();
  });
});
