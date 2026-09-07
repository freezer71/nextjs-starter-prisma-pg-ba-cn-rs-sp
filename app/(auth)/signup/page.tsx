import type { Metadata } from "next";
import Link from "next/link";

import { AuthCard } from "@/components/auth/auth-card";
import { SignupForm } from "@/components/auth/signup-form";
import { authConfig } from "@/config/auth";
import { redirectIfAuthenticated } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Créer un compte" };

export default async function SignupPage() {
  await redirectIfAuthenticated();
  return (
    <AuthCard
      title="Créer un compte"
      description="Un email de confirmation vous sera envoyé."
      footer={
        <p>
          Déjà un compte ?{" "}
          <Link href={authConfig.routes.login} className="text-foreground underline underline-offset-4">
            Se connecter
          </Link>
        </p>
      }
    >
      <SignupForm />
    </AuthCard>
  );
}
