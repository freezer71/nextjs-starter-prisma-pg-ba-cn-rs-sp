import type Stripe from "stripe";

import type { SubscriptionStore } from "@/lib/stripe/store";
import { mapStripeSubscription, stripeId } from "@/lib/stripe/subscription";

export type WebhookDeps = {
  store: SubscriptionStore;
  /** Récupère un abonnement complet depuis Stripe (les sessions Checkout ne portent que son id). */
  retrieveSubscription: (subscriptionId: string) => Promise<Stripe.Subscription>;
  logger?: Pick<Console, "info" | "warn" | "error">;
};

/** Événements auxquels le webhook doit être abonné (Dashboard Stripe ou `stripe listen`). */
export const HANDLED_STRIPE_EVENTS = [
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.paid",
  "invoice.payment_failed",
  "customer.deleted",
] as const satisfies readonly Stripe.Event.Type[];

/**
 * Traite un événement Stripe déjà authentifié (signature vérifiée par la route).
 * Idempotent par construction : les upserts peuvent être rejoués sans effet de bord.
 */
export async function handleStripeEvent(event: Stripe.Event, deps: WebhookDeps): Promise<void> {
  const logger = deps.logger ?? console;

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object;
      if (session.mode !== "subscription") return;
      // Avec les moyens de paiement différés, `completed` peut arriver alors que le paiement est encore `unpaid`.
      if (session.payment_status === "unpaid") return;
      const subscriptionId = stripeId(session.subscription);
      if (!subscriptionId) return;
      const subscription = await deps.retrieveSubscription(subscriptionId);
      const userId = await resolveUserId(subscription, deps, session.client_reference_id);
      if (!userId) {
        logger.warn("[stripe] checkout sans utilisateur associé", { sessionId: session.id, subscriptionId });
        return;
      }
      await deps.store.upsertSubscription(mapStripeSubscription(subscription, userId));
      return;
    }

    case "checkout.session.async_payment_failed": {
      logger.warn("[stripe] paiement différé échoué", { sessionId: event.data.object.id });
      return;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object;
      const userId = await resolveUserId(subscription, deps);
      if (!userId) {
        logger.warn("[stripe] abonnement sans utilisateur associé", { subscriptionId: subscription.id });
        return;
      }
      await deps.store.upsertSubscription(mapStripeSubscription(subscription, userId));
      return;
    }

    case "customer.subscription.deleted": {
      await deps.store.deleteSubscription(event.data.object.id);
      return;
    }

    case "invoice.paid": {
      // Point d'extension : email de reçu, journal comptable...
      logger.info("[stripe] facture payée", { invoiceId: event.data.object.id });
      return;
    }

    case "invoice.payment_failed": {
      // Point d'extension : email de relance. Le statut `past_due` arrive via customer.subscription.updated.
      logger.warn("[stripe] paiement de facture échoué", { invoiceId: event.data.object.id });
      return;
    }

    case "customer.deleted": {
      await deps.store.detachCustomer(event.data.object.id);
      return;
    }

    default:
      // Événement non géré : accusé de réception sans traitement.
      return;
  }
}

/**
 * Retrouve l'utilisateur d'un abonnement :
 * 1. `client_reference_id` de la session Checkout ;
 * 2. `metadata.userId` posé à la création de l'abonnement ;
 * 3. l'utilisateur portant ce `stripeCustomerId`.
 */
async function resolveUserId(
  subscription: Stripe.Subscription,
  deps: WebhookDeps,
  clientReferenceId?: string | null,
): Promise<string | null> {
  if (clientReferenceId) return clientReferenceId;
  if (subscription.metadata?.userId) return subscription.metadata.userId;
  const customerId = stripeId(subscription.customer);
  if (!customerId) return null;
  return deps.store.findUserIdByCustomerId(customerId);
}
