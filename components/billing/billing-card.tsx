import { CreditCardIcon, ExternalLinkIcon } from "lucide-react";

import { FormMessage } from "@/components/auth/form-message";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ACTIVE_SUBSCRIPTION_STATUSES, getPlanByPriceId, plans } from "@/config/billing";
import { db } from "@/lib/db";
import { createBillingPortalSession, createCheckoutSession } from "@/lib/stripe/actions";
import { isStripeConfigured } from "@/lib/stripe/client";

type BillingCardProps = {
  userId: string;
  checkoutStatus?: string;
};

const STATUS_LABELS: Record<string, string> = {
  active: "Actif",
  trialing: "Période d'essai",
  past_due: "Paiement en retard",
  canceled: "Résilié",
  unpaid: "Impayé",
  incomplete: "Incomplet",
  incomplete_expired: "Expiré",
  paused: "En pause",
};

const dateFormatter = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" });

/** Carte de facturation : abonnement en cours ou proposition d'abonnement. */
export async function BillingCard({ userId, checkoutStatus }: BillingCardProps) {
  const subscription = await db.subscription.findUnique({ where: { userId } });
  const plan = subscription ? getPlanByPriceId(subscription.priceId) : undefined;
  const isActive = subscription ? ACTIVE_SUBSCRIPTION_STATUSES.has(subscription.status) : false;
  const configuredPlans = plans.filter((item) => item.priceId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Facturation</CardTitle>
        <CardDescription>Votre abonnement et vos moyens de paiement.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 text-sm">
        {checkoutStatus === "success" ? (
          <FormMessage
            variant="success"
            title="Paiement pris en compte"
            description="Votre abonnement sera visible ici dans quelques instants."
          />
        ) : null}
        {checkoutStatus === "cancelled" ? <FormMessage variant="error" title="Paiement annulé" /> : null}

        {!isStripeConfigured() ? (
          <p className="text-muted-foreground">Stripe n&apos;est pas configuré (STRIPE_SECRET_KEY absente).</p>
        ) : subscription ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Plan</span>
              <span>{plan?.name ?? subscription.priceId}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Statut</span>
              <Badge variant={isActive ? "secondary" : "outline"}>
                {STATUS_LABELS[subscription.status] ?? subscription.status}
              </Badge>
            </div>
            {subscription.currentPeriodEnd ? (
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">
                  {subscription.cancelAtPeriodEnd ? "Fin d'accès" : "Prochain renouvellement"}
                </span>
                <span>{dateFormatter.format(subscription.currentPeriodEnd)}</span>
              </div>
            ) : null}
          </div>
        ) : configuredPlans.length === 0 ? (
          <p className="text-muted-foreground">Aucun plan configuré (STRIPE_PRICE_PRO_MONTHLY absente).</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {configuredPlans.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-4 rounded-lg border p-3">
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-muted-foreground">{item.description}</span>
                </div>
                <form action={createCheckoutSession}>
                  <input type="hidden" name="planId" value={item.id} />
                  <Button type="submit" size="sm">
                    S&apos;abonner
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      {isStripeConfigured() ? (
        <CardFooter>
          <form action={createBillingPortalSession}>
            <Button type="submit" variant="outline" size="sm">
              <CreditCardIcon data-icon="inline-start" aria-hidden="true" />
              Gérer la facturation
              <ExternalLinkIcon data-icon="inline-end" aria-hidden="true" />
            </Button>
          </form>
        </CardFooter>
      ) : null}
    </Card>
  );
}
