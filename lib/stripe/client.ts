import "server-only";
import Stripe from "stripe";

import { env } from "@/lib/env";
import { siteConfig } from "@/config/site";

let stripeClient: Stripe | null = null;

/** Indique si Stripe est configuré (clé secrète présente). */
export function isStripeConfigured() {
  return Boolean(env.STRIPE_SECRET_KEY);
}

/**
 * Singleton du client Stripe. Lève une erreur explicite si la clé est absente :
 * à n'appeler que dans du code qui a réellement besoin de Stripe.
 */
export function getStripe(): Stripe {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY manquante : Stripe n'est pas configuré.");
  }
  stripeClient ??= new Stripe(env.STRIPE_SECRET_KEY, {
    typescript: true,
    appInfo: { name: siteConfig.name, url: siteConfig.url },
  });
  return stripeClient;
}
