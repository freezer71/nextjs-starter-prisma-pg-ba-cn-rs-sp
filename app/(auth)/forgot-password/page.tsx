import type { Metadata } from "next";
import Link from "next/link";

import { AuthCard } from "@/components/auth/auth-card";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { authConfig } from "@/config/auth";
import { redirectIfAuthenticated } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Mot de passe oublié" };

export default async function ForgotPasswordPage() {
  await redirectIfAuthenticated();
  return (
    <AuthCard
      title="Mot de passe oublié"
      description="Indiquez votre email pour recevoir un lien de réinitialisation."
      footer={
        <Link href={authConfig.routes.login} className="text-foreground underline underline-offset-4">
          Retour à la connexion
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
