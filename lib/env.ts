import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * Variables d'environnement validées au démarrage.
 * - `server` : jamais exposées au navigateur.
 * - `client` : préfixées NEXT_PUBLIC_, inlinées au build.
 * Une variable manquante ou invalide fait échouer le démarrage (fail fast).
 */
export const env = createEnv({
  server: {
    DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
    BETTER_AUTH_SECRET: z
      .string()
      .min(32, "BETTER_AUTH_SECRET doit faire au moins 32 caractères (openssl rand -base64 32)"),
    BETTER_AUTH_TRUSTED_ORIGINS: z.string().optional(),
    RESEND_API_KEY: z.string().startsWith("re_").optional(),
    EMAIL_FROM: z.string().min(3),
    STRIPE_SECRET_KEY: z.string().regex(/^[sr]k_(test|live)_/).optional(),
    STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_").optional(),
    STRIPE_PRICE_PRO_MONTHLY: z.string().startsWith("price_").optional(),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.url(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_TRUSTED_ORIGINS: process.env.BETTER_AUTH_TRUSTED_ORIGINS,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    STRIPE_PRICE_PRO_MONTHLY: process.env.STRIPE_PRICE_PRO_MONTHLY,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  // Une chaîne vide dans .env est traitée comme absente (utile pour les variables optionnelles).
  emptyStringAsUndefined: true,
  // Permet de sauter la validation (ex. lint / CI sans secrets) : SKIP_ENV_VALIDATION=1
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});

export const isProduction = env.NODE_ENV === "production";
export const isDevelopment = env.NODE_ENV === "development";
