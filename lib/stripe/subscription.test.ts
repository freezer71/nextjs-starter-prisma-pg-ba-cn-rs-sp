import type Stripe from "stripe";
import { describe, expect, it } from "vitest";

import { mapStripeSubscription, stripeId } from "./subscription";

export function fakeSubscription(overrides: Partial<Stripe.Subscription> = {}): Stripe.Subscription {
  return {
    id: "sub_123",
    object: "subscription",
    customer: "cus_123",
    status: "active",
    cancel_at_period_end: false,
    metadata: {},
    items: {
      object: "list",
      data: [
        {
          id: "si_1",
          object: "subscription_item",
          current_period_end: 1_800_000_000,
          price: { id: "price_pro", object: "price" } as Stripe.Price,
        } as Stripe.SubscriptionItem,
      ],
      has_more: false,
      url: "/v1/subscription_items",
    },
    ...overrides,
  } as Stripe.Subscription;
}

describe("stripeId", () => {
  it("accepte un id ou un objet expansé", () => {
    expect(stripeId("cus_1")).toBe("cus_1");
    expect(stripeId({ id: "cus_2" })).toBe("cus_2");
    expect(stripeId(null)).toBeNull();
  });
});

describe("mapStripeSubscription", () => {
  it("convertit un abonnement Stripe en enregistrement local", () => {
    const record = mapStripeSubscription(fakeSubscription(), "user_1");
    expect(record).toEqual({
      id: "sub_123",
      userId: "user_1",
      stripeCustomerId: "cus_123",
      status: "active",
      priceId: "price_pro",
      currentPeriodEnd: new Date(1_800_000_000 * 1000),
      cancelAtPeriodEnd: false,
    });
  });

  it("gère un customer expansé et l'annulation en fin de période", () => {
    const record = mapStripeSubscription(
      fakeSubscription({ customer: { id: "cus_exp" } as Stripe.Customer, cancel_at_period_end: true, status: "trialing" }),
      "user_1",
    );
    expect(record.stripeCustomerId).toBe("cus_exp");
    expect(record.cancelAtPeriodEnd).toBe(true);
    expect(record.status).toBe("trialing");
  });

  it("refuse un abonnement sans customer", () => {
    expect(() => mapStripeSubscription(fakeSubscription({ customer: null as unknown as string }), "u")).toThrow();
  });
});
