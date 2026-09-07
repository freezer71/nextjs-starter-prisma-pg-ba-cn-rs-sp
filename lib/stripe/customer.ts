import "server-only";

import { db } from "@/lib/db";
import { getStripe, isStripeConfigured } from "@/lib/stripe/client";

/**
 * Retourne l'identifiant du Stripe Customer de l'utilisateur, en le créant si nécessaire.
 * Le customer porte `metadata.userId` pour retrouver l'utilisateur depuis les webhooks.
 */
export async function getOrCreateStripeCustomer(userId: string): Promise<string> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, stripeCustomerId: true },
  });
  if (!user) {
    throw new Error(`Utilisateur introuvable : ${userId}`);
  }
  if (user.stripeCustomerId) return user.stripeCustomerId;

  const stripe = getStripe();

  // Recherche d'un customer existant (ex. créé manuellement dans le dashboard ou après une panne).
  const existing = await stripe.customers.search({
    query: `metadata['userId']:'${user.id}'`,
    limit: 1,
  });

  const customer =
    existing.data[0] ??
    (await stripe.customers.create(
      {
        email: user.email,
        name: user.name,
        metadata: { userId: user.id },
      },
      // Idempotence : évite les doublons si l'appel est rejoué.
      { idempotencyKey: `customer-create/${user.id}` },
    ));

  await db.user.update({
    where: { id: user.id },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

/**
 * Création du Stripe Customer à l'inscription (hook Better Auth).
 * Non bloquant : une panne Stripe ne doit jamais empêcher l'inscription,
 * `getOrCreateStripeCustomer` rattrapera le cas à la première opération de facturation.
 */
export async function syncStripeCustomerOnSignup(user: { id: string }): Promise<void> {
  if (!isStripeConfigured()) return;
  try {
    await getOrCreateStripeCustomer(user.id);
  } catch (error) {
    console.error("[stripe] création du customer à l'inscription échouée", { userId: user.id, error });
  }
}

/** Détache le customer Stripe (webhook `customer.deleted`). */
export async function detachStripeCustomer(stripeCustomerId: string): Promise<void> {
  await db.user.updateMany({
    where: { stripeCustomerId },
    data: { stripeCustomerId: null },
  });
}
