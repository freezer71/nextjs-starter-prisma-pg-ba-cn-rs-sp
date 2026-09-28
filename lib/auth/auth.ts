import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { captcha } from "better-auth/plugins";
import { haveIBeenPwned } from "better-auth/plugins/haveibeenpwned";
import { magicLink } from "better-auth/plugins/magic-link";

import { authConfig } from "@/config/auth";
import { siteConfig } from "@/config/site";
import MagicLinkEmail from "@/emails/magic-link";
import ResetPasswordEmail from "@/emails/reset-password";
import VerifyEmail from "@/emails/verify-email";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email/send";
import { env, isProduction } from "@/lib/env";
import { syncStripeCustomerOnSignup } from "@/lib/stripe/customer";

const trustedOrigins = [
  env.NEXT_PUBLIC_APP_URL,
  ...(env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",").map((origin) => origin.trim()).filter(Boolean) ?? []),
];

// Une seule des deux clés Turnstile = captcha à moitié configuré : on refuse de démarrer
// plutôt que de bloquer toutes les connexions (clé secrète seule) ou de ne rien vérifier (clé de site seule).
if (Boolean(env.TURNSTILE_SECRET_KEY) !== Boolean(env.NEXT_PUBLIC_TURNSTILE_SITE_KEY)) {
  throw new Error("TURNSTILE_SECRET_KEY et NEXT_PUBLIC_TURNSTILE_SITE_KEY doivent être renseignées ensemble.");
}

/**
 * Configuration serveur de Better Auth.
 * Après ajout d'un plugin modifiant le schéma : `npm run auth:generate` puis `npm run db:migrate`.
 */
export const auth = betterAuth({
  appName: siteConfig.name,
  baseURL: env.NEXT_PUBLIC_APP_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins,
  database: prismaAdapter(db, { provider: "postgresql" }),

  emailAndPassword: {
    enabled: true,
    // L'email doit être vérifié avant toute connexion par mot de passe.
    requireEmailVerification: true,
    autoSignIn: false,
    minPasswordLength: authConfig.passwordMinLength,
    maxPasswordLength: authConfig.passwordMaxLength,
    resetPasswordTokenExpiresIn: authConfig.resetPasswordTokenExpiresIn,
    // Toutes les sessions sont révoquées après un changement de mot de passe.
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Réinitialisation de votre mot de passe",
        react: ResetPasswordEmail({ name: user.name, url }),
        tags: [{ name: "type", value: "reset-password" }],
      });
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    // Renvoie un lien de confirmation à chaque tentative de connexion d'un compte non vérifié.
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    expiresIn: authConfig.verificationTokenExpiresIn,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Confirmez votre adresse email",
        react: VerifyEmail({ name: user.name, url }),
        tags: [{ name: "type", value: "verify-email" }],
      });
    },
  },

  session: {
    expiresIn: authConfig.sessionExpiresIn,
    updateAge: authConfig.sessionUpdateAge,
    // Cache signé de la session en cookie : évite une requête DB à chaque rendu.
    cookieCache: {
      enabled: true,
      maxAge: authConfig.sessionCookieCacheMaxAge,
    },
  },

  rateLimit: {
    enabled: true,
    // Persistant (table RateLimit) : fonctionne en serverless et multi-instances.
    storage: "database",
    window: 10,
    max: 100,
    // Chemins relatifs à /api/auth. Limites renforcées sur les endpoints sensibles.
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 3 },
      "/sign-in/magic-link": { window: 60, max: 3 },
      "/request-password-reset": { window: 60, max: 3 },
      "/reset-password": { window: 60, max: 5 },
      "/send-verification-email": { window: 60, max: 3 },
    },
  },

  advanced: {
    cookiePrefix: authConfig.cookiePrefix,
    useSecureCookies: isProduction,
    ipAddress: {
      // À adapter selon le reverse proxy (ex. "cf-connecting-ip" derrière Cloudflare).
      ipAddressHeaders: ["x-forwarded-for", "x-real-ip"],
    },
  },

  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await syncStripeCustomerOnSignup(user);
        },
      },
    },
  },

  plugins: [
    // Refuse les mots de passe présents dans des fuites connues (k-anonymity, le mot de passe ne quitte pas le serveur).
    haveIBeenPwned({
      customPasswordCompromisedMessage: "Ce mot de passe apparaît dans une fuite de données connue. Choisissez-en un autre.",
    }),
    // Cloudflare Turnstile sur les endpoints qui créent un compte, testent un mot de passe ou envoient un email.
    // Le token est lu dans l'en-tête `x-captcha-response` (voir components/auth/turnstile.tsx).
    ...(env.TURNSTILE_SECRET_KEY
      ? [
          captcha({
            provider: "cloudflare-turnstile",
            secretKey: env.TURNSTILE_SECRET_KEY,
            endpoints: [...authConfig.captchaEndpoints],
          }),
        ]
      : []),
    magicLink({
      expiresIn: authConfig.magicLinkExpiresIn,
      // Le token est stocké haché : une fuite de la base ne permet pas de se connecter.
      storeToken: "hashed",
      sendMagicLink: async ({ email, url }) => {
        await sendEmail({
          to: email,
          subject: "Votre lien de connexion",
          react: MagicLinkEmail({ url }),
          tags: [{ name: "type", value: "magic-link" }],
        });
      },
    }),
    // Doit rester le dernier plugin : pose les cookies dans les Server Actions / RSC.
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;
export type SessionUser = Session["user"];
