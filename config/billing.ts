/**
 * Plans proposés à l'abonnement. Un Product Stripe par plan, un Price par périodicité.
 * Les Price IDs viennent des variables d'environnement pour différer entre test et production.
 */
export type Plan = {
  id: string;
  name: string;
  description: string;
  /** Price ID Stripe (`price_...`). Absent si non configuré. */
  priceId: string | undefined;
  features: string[];
};

export const plans: Plan[] = [
  {
    id: "pro-monthly",
    name: "Pro",
    description: "Abonnement mensuel, résiliable à tout moment.",
    priceId: process.env.STRIPE_PRICE_PRO_MONTHLY,
    features: ["Toutes les fonctionnalités", "Support par email"],
  },
];

export function getPlan(planId: string): Plan | undefined {
  return plans.find((plan) => plan.id === planId);
}

export function getPlanByPriceId(priceId: string): Plan | undefined {
  return plans.find((plan) => plan.priceId === priceId);
}

/** Statuts Stripe considérés comme donnant accès au service. */
export const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["active", "trialing", "past_due"]);
