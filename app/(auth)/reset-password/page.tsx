import type { Metadata } from "next";
import Link from "next/link";

import { AuthCard } from "@/components/auth/auth-card";
import { FormMessage } from "@/components/auth/form-message";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { authConfig } from "@/config/auth";

export const metadata: Metadata = { title: "Nouveau mot de passe" };

/** Better Auth redirige ici avec `?token=` (valide) ou `?error=INVALID_TOKEN`. */
export default async function ResetPasswordPage(props: PageProps<"/reset-password">) {
  const searchParams = await props.searchParams;
  const token = typeof searchParams.token === "string" ? searchParams.token : undefined;
  const hasError = typeof searchParams.error === "string" || !token;

  return (
    <AuthCard
      title="Nouveau mot de passe"
      description={hasError ? undefined : "Choisissez un nouveau mot de passe pour votre compte."}
      footer={
        <Link href={authConfig.routes.login} className="text-foreground underline underline-offset-4">
          Retour à la connexion
        </Link>
      }
    >
      {hasError ? (
        <div className="flex flex-col gap-4">
          <FormMessage
            variant="error"
            title="Lien invalide ou expiré"
            description="Demandez un nouveau lien de réinitialisation."
          />
          <Link href={authConfig.routes.forgotPassword} className="text-sm underline underline-offset-4">
            Demander un nouveau lien
          </Link>
        </div>
      ) : (
        <ResetPasswordForm token={token} />
      )}
    </AuthCard>
  );
}
