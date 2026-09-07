import { CircleCheckIcon } from "lucide-react";
import type { Metadata } from "next";

import { BillingCard } from "@/components/billing/billing-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Tableau de bord" };

export default async function DashboardPage(props: PageProps<"/dashboard">) {
  const session = await requireSession("/dashboard");
  const searchParams = await props.searchParams;
  const checkoutStatus = typeof searchParams.checkout === "string" ? searchParams.checkout : undefined;

  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Bonjour {session.user.name}</h1>
        <p className="text-muted-foreground">Bienvenue sur votre espace.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Compte</CardTitle>
            <CardDescription>Informations de votre profil.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Nom</span>
              <span className="truncate">{session.user.name}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Email</span>
              <span className="truncate">{session.user.email}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Statut</span>
              {session.user.emailVerified ? (
                <Badge variant="secondary">
                  <CircleCheckIcon aria-hidden="true" />
                  Email vérifié
                </Badge>
              ) : (
                <Badge variant="outline">Email non vérifié</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <BillingCard userId={session.user.id} checkoutStatus={checkoutStatus} />
      </div>
    </>
  );
}
