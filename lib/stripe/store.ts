import "server-only";

import { db } from "@/lib/db";
import type { SubscriptionRecord } from "@/lib/stripe/subscription";

/**
 * Accès aux données nécessaires aux webhooks Stripe.
 * Interface volontairement étroite : les handlers sont testables avec un double en mémoire.
 */
export interface SubscriptionStore {
  upsertSubscription(record: SubscriptionRecord): Promise<void>;
  deleteSubscription(subscriptionId: string): Promise<void>;
  findUserIdByCustomerId(stripeCustomerId: string): Promise<string | null>;
  detachCustomer(stripeCustomerId: string): Promise<void>;
}

export const prismaSubscriptionStore: SubscriptionStore = {
  async upsertSubscription(record) {
    const { id, userId, ...data } = record;
    await db.$transaction([
      // Un seul abonnement par utilisateur : un nouvel abonnement remplace l'ancien.
      db.subscription.deleteMany({ where: { userId, NOT: { id } } }),
      db.subscription.upsert({
        where: { id },
        create: { id, userId, ...data },
        update: data,
      }),
    ]);
  },

  async deleteSubscription(subscriptionId) {
    await db.subscription.deleteMany({ where: { id: subscriptionId } });
  },

  async findUserIdByCustomerId(stripeCustomerId) {
    const user = await db.user.findUnique({ where: { stripeCustomerId }, select: { id: true } });
    return user?.id ?? null;
  },

  async detachCustomer(stripeCustomerId) {
    await db.$transaction([
      db.subscription.deleteMany({ where: { stripeCustomerId } }),
      db.user.updateMany({ where: { stripeCustomerId }, data: { stripeCustomerId: null } }),
    ]);
  },
};
