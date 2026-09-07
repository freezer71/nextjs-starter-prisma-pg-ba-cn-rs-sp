import type Stripe from "stripe";

/** Représentation persistée d'un abonnement (modèle Prisma `Subscription`). */
export type SubscriptionRecord = {
  id: string;
  userId: string;
  stripeCustomerId: string;
  status: string;
  priceId: string;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
};

/** Extrait l'identifiant d'un objet Stripe pouvant être expansé ou non. */
export function stripeId(value: string | { id: string } | null | undefined): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

/**
 * Convertit un abonnement Stripe en enregistrement local.
 * Depuis l'API 2025-03-31, `current_period_end` est porté par chaque item, plus par l'abonnement.
 */
export function mapStripeSubscription(subscription: Stripe.Subscription, userId: string): SubscriptionRecord {
  const item = subscription.items.data[0];
  const customerId = stripeId(subscription.customer);
  if (!customerId) {
    throw new Error(`Abonnement ${subscription.id} sans customer.`);
  }

  return {
    id: subscription.id,
    userId,
    stripeCustomerId: customerId,
    status: subscription.status,
    priceId: item?.price.id ?? "",
    currentPeriodEnd: item?.current_period_end ? new Date(item.current_period_end * 1000) : null,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  };
}
