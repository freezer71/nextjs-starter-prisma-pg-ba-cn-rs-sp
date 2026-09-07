import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthCard } from "@/components/auth/auth-card";
import { FormMessage } from "@/components/auth/form-message";
import { ResendVerificationForm } from "@/components/auth/resend-verification-form";
import { authConfig } from "@/config/auth";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Vérification de l'email" };

/**
 * Page atteinte :
 * - après l'inscription (`?email=`) : invite à consulter sa boîte mail ;
 * - après le clic sur le lien (succès) : la session est créée, on redirige vers l'application ;
 * - après un lien invalide/expiré (`?error=`) : permet de renvoyer un lien.
 */
export default async function VerifyEmailPage(props: PageProps<"/verify-email">) {
  const searchParams = await props.searchParams;
  const session = await getSession();

  if (session?.user.emailVerified) {
    redirect(authConfig.routes.afterLogin);
  }

  const error = typeof searchParams.error === "string" ? searchParams.error : undefined;
  const email = typeof searchParams.email === "string" ? searchParams.email : undefined;

  return (
    <AuthCard
      title={error ? "Lien invalide" : "Vérifiez votre boîte mail"}
      description={
        error
          ? "Ce lien de confirmation est invalide ou a expiré. Demandez-en un nouveau ci-dessous."
          : "Nous vous avons envoyé un lien de confirmation. Cliquez dessus pour activer votre compte."
      }
      footer={
        <Link href={authConfig.routes.login} className="text-foreground underline underline-offset-4">
          Retour à la connexion
        </Link>
      }
    >
      <div className="flex flex-col gap-6">
        {error ? <FormMessage variant="error" title="Le lien de confirmation n'a pas pu être validé." /> : null}
        <ResendVerificationForm defaultEmail={email} />
      </div>
    </AuthCard>
  );
}
