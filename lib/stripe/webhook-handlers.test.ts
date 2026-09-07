import type Stripe from "stripe";
import { describe, expect, it, vi } from "vitest";

import type { SubscriptionStore } from "./store";
import type { SubscriptionRecord } from "./subscription";
import { fakeSubscription } from "./subscription.test";
import { handleStripeEvent, type WebhookDeps } from "./webhook-handlers";

function fakeStore() {
  const subscriptions = new Map<string, SubscriptionRecord>();
  const customers = new Map<string, string>([["cus_123", "user_from_customer"]]);
  const detached: string[] = [];
  const store: SubscriptionStore = {
    async upsertSubscription(record) {
      subscriptions.set(record.id, record);
    },
    async deleteSubscription(id) {
      subscriptions.delete(id);
    },
    async findUserIdByCustomerId(customerId) {
      return customers.get(customerId) ?? null;
    },
    async detachCustomer(customerId) {
      detached.push(customerId);
    },
  };
  return { store, subscriptions, detached };
}

function fakeEvent<T extends Stripe.Event.Type>(type: T, object: unknown): Stripe.Event {
  return { id: `evt_${type}`, type, data: { object } } as unknown as Stripe.Event;
}

const silentLogger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };

function deps(store: SubscriptionStore, retrieve?: WebhookDeps["retrieveSubscription"]): WebhookDeps {
  return {
    store,
    retrieveSubscription: retrieve ?? (async (id) => fakeSubscription({ id })),
    logger: silentLogger,
  };
}

describe("handleStripeEvent", () => {
  it("customer.subscription.created : enregistre l'abonnement avec l'utilisateur des métadonnées", async () => {
    const { store, subscriptions } = fakeStore();
    await handleStripeEvent(
      fakeEvent("customer.subscription.created", fakeSubscription({ metadata: { userId: "user_meta" } })),
      deps(store),
    );
    expect(subscriptions.get("sub_123")?.userId).toBe("user_meta");
  });

  it("customer.subscription.updated : retrouve l'utilisateur via le customer si les métadonnées sont absentes", async () => {
    const { store, subscriptions } = fakeStore();
    await handleStripeEvent(fakeEvent("customer.subscription.updated", fakeSubscription({ status: "past_due" })), deps(store));
    expect(subscriptions.get("sub_123")).toMatchObject({ userId: "user_from_customer", status: "past_due" });
  });

  it("ignore un abonnement dont l'utilisateur est introuvable", async () => {
    const { store, subscriptions } = fakeStore();
    await handleStripeEvent(
      fakeEvent("customer.subscription.created", fakeSubscription({ customer: "cus_inconnu" })),
      deps(store),
    );
    expect(subscriptions.size).toBe(0);
    expect(silentLogger.warn).toHaveBeenCalled();
  });

  it("customer.subscription.deleted : supprime l'abonnement", async () => {
    const { store, subscriptions } = fakeStore();
    subscriptions.set("sub_123", { id: "sub_123" } as SubscriptionRecord);
    await handleStripeEvent(fakeEvent("customer.subscription.deleted", fakeSubscription()), deps(store));
    expect(subscriptions.has("sub_123")).toBe(false);
  });

  it("checkout.session.completed : récupère l'abonnement et utilise client_reference_id", async () => {
    const { store, subscriptions } = fakeStore();
    const retrieve = vi.fn(async (id: string) => fakeSubscription({ id }));
    await handleStripeEvent(
      fakeEvent("checkout.session.completed", {
        id: "cs_1",
        mode: "subscription",
        payment_status: "paid",
        subscription: "sub_from_checkout",
        client_reference_id: "user_ref",
      }),
      deps(store, retrieve),
    );
    expect(retrieve).toHaveBeenCalledWith("sub_from_checkout");
    expect(subscriptions.get("sub_from_checkout")?.userId).toBe("user_ref");
  });

  it("checkout.session.completed : n'active rien tant que le paiement est `unpaid`", async () => {
    const { store, subscriptions } = fakeStore();
    await handleStripeEvent(
      fakeEvent("checkout.session.completed", {
        id: "cs_2",
        mode: "subscription",
        payment_status: "unpaid",
        subscription: "sub_x",
        client_reference_id: "user_ref",
      }),
      deps(store),
    );
    expect(subscriptions.size).toBe(0);
  });

  it("checkout.session.completed : ignore les paiements ponctuels", async () => {
    const { store, subscriptions } = fakeStore();
    await handleStripeEvent(
      fakeEvent("checkout.session.completed", { id: "cs_3", mode: "payment", payment_status: "paid" }),
      deps(store),
    );
    expect(subscriptions.size).toBe(0);
  });

  it("customer.deleted : détache le customer", async () => {
    const { store, detached } = fakeStore();
    await handleStripeEvent(fakeEvent("customer.deleted", { id: "cus_123", object: "customer" }), deps(store));
    expect(detached).toEqual(["cus_123"]);
  });

  it("événement inconnu : aucun effet", async () => {
    const { store, subscriptions, detached } = fakeStore();
    await handleStripeEvent(fakeEvent("payment_intent.succeeded" as Stripe.Event.Type, { id: "pi_1" }), deps(store));
    expect(subscriptions.size).toBe(0);
    expect(detached).toEqual([]);
  });
});
