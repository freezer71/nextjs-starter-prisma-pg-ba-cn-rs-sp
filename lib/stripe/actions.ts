"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getPlan } from "@/config/billing";
import { requireSession } from "@/lib/auth/session";
import { env } from "@/lib/env";
import { getStripe } from "@/lib/stripe/client";
import { getOrCreateStripeCustomer } from "@/lib/stripe/customer";

const checkoutInputSchema = z.object({ planId: z.string().min(1) });

/** Suffixe aléatoire recommandé par Stripe pour identifier l'intégration dans le Dashboard. */
function integrationIdentifier() {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return `starter-checkout-${Array.from(bytes, (byte) => letters[byte % letters.length]).join("")}`;
}

/**
 * Démarre un Checkout Stripe (mode abonnement) et redirige l'utilisateur.
 * Server action : la session est revérifiée, le plan validé côté serveur.
 */
export async function createCheckoutSession(formData: FormData) {
  const session = await requireSession("/dashboard");
  const parsed = checkoutInputSchema.safeParse({ planId: formData.get("planId") });
  const plan = parsed.success ? getPlan(parsed.data.planId) : undefined;
  if (!plan?.priceId) {
    throw new Error("Plan inconnu ou non configuré.");
  }

  const stripe = getStripe();
  const customerId = await getOrCreateStripeCustomer(session.user.id);

  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: session.user.id,
    // Pas de `payment_method_types` : Stripe choisit dynamiquement les moyens de paiement (Dashboard).
    line_items: [{ price: plan.priceId, quantity: 1 }],
    subscription_data: { metadata: { userId: session.user.id } },
    allow_promotion_codes: true,
    success_url: `${env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
    cancel_url: `${env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=cancelled`,
    integration_identifier: integrationIdentifier(),
  });

  if (!checkout.url) {
    throw new Error("Stripe n'a pas renvoyé d'URL de paiement.");
  }

  // `redirect` lève une exception de contrôle : toujours hors d'un try/catch.
  // URL externe (Stripe) : hors du typage des routes internes.
  redirect(checkout.url as Route);
}

/** Ouvre le portail client Stripe (changement de carte, factures, résiliation). */
export async function createBillingPortalSession() {
  const session = await requireSession("/dashboard");
  const stripe = getStripe();
  const customerId = await getOrCreateStripeCustomer(session.user.id);

  const portal = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${env.NEXT_PUBLIC_APP_URL}/dashboard`,
  });

  redirect(portal.url as Route);
}
