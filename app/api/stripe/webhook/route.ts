import type Stripe from "stripe";

import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { getStripe } from "@/lib/stripe/client";
import { prismaSubscriptionStore } from "@/lib/stripe/store";
import { handleStripeEvent } from "@/lib/stripe/webhook-handlers";

/**
 * Webhook Stripe.
 * 1. Vérification de la signature sur le corps BRUT (jamais parsé avant).
 * 2. Idempotence : chaque événement n'est traité qu'une fois (table StripeWebhookEvent).
 * 3. Dispatch vers les handlers ; une erreur renvoie 500 pour que Stripe rejoue l'événement.
 *
 * Développement : `npm run stripe:listen` puis copier le secret `whsec_...` dans STRIPE_WEBHOOK_SECRET.
 */
export async function POST(request: Request) {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    return new Response("Webhook Stripe non configuré", { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Signature manquante", { status: 400 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    const payload = await request.text();
    event = await stripe.webhooks.constructEventAsync(payload, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    console.warn("[stripe] signature de webhook invalide", { message: (error as Error).message });
    return new Response("Signature invalide", { status: 400 });
  }

  // Idempotence : un événement déjà reçu est acquitté sans retraitement.
  // La clé primaire garantit l'unicité même en cas de livraisons simultanées.
  const alreadyProcessed = await db.stripeWebhookEvent.findUnique({ where: { id: event.id }, select: { id: true } });
  if (alreadyProcessed) {
    return Response.json({ received: true, duplicate: true });
  }
  try {
    await db.stripeWebhookEvent.create({ data: { id: event.id, type: event.type } });
  } catch {
    return Response.json({ received: true, duplicate: true });
  }

  try {
    await handleStripeEvent(event, {
      store: prismaSubscriptionStore,
      retrieveSubscription: (id) => stripe.subscriptions.retrieve(id),
    });
  } catch (error) {
    console.error("[stripe] échec du traitement du webhook", { eventId: event.id, type: event.type, error });
    // On libère l'idempotence pour permettre à Stripe de rejouer l'événement.
    await db.stripeWebhookEvent.deleteMany({ where: { id: event.id } });
    return new Response("Erreur de traitement", { status: 500 });
  }

  return Response.json({ received: true });
}
